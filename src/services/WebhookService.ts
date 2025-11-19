import axios from 'axios';

/**
 * Discord Webhook Service - Gửi logs qua Discord webhook
 */
class WebhookService {
  private webhookUrl: string | undefined;
  private isEnabled: boolean;
  private queue: any[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly RATE_LIMIT_MS = 2000; // 2 giây giữa mỗi message

  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.isEnabled = !!this.webhookUrl && this.webhookUrl.startsWith('https://discord.com/api/webhooks/');
    
    if (!this.isEnabled && this.webhookUrl) {
      console.warn('⚠️ DISCORD_WEBHOOK_URL không hợp lệ, webhook logging bị tắt');
    }
  }

  /**
   * Gửi log message qua webhook
   */
  async sendLog(
    level: 'ERROR' | 'WARN' | 'INFO' | 'SUCCESS',
    message: string,
    error?: any
  ): Promise<void> {
    if (!this.isEnabled) return;

    const embed = this.createEmbed(level, message, error);
    await this.queueMessage({ embeds: [embed] });
  }

  /**
   * Gửi error với stack trace
   */
  async sendError(message: string, error: any): Promise<void> {
    if (!this.isEnabled) return;

    const embed = this.createEmbed('ERROR', message, error);
    
    // Add stack trace nếu có
    if (error?.stack) {
      const stackLines = error.stack.split('\n').slice(0, 10); // Lấy 10 dòng đầu
      embed.fields = embed.fields || [];
      embed.fields.push({
        name: '📜 Stack Trace',
        value: `\`\`\`\n${stackLines.join('\n').substring(0, 1000)}\n\`\`\``,
        inline: false
      });
    }

    await this.queueMessage({ embeds: [embed] });
  }

  /**
   * Gửi thông báo job completion/failure
   */
  async sendJobNotification(
    jobType: string,
    jobId: string,
    status: 'completed' | 'failed',
    duration?: number,
    error?: any
  ): Promise<void> {
    if (!this.isEnabled) return;

    const isSuccess = status === 'completed';
    const embed = {
      title: `${isSuccess ? '✅' : '❌'} Background Job ${isSuccess ? 'Completed' : 'Failed'}`,
      color: isSuccess ? 0x00FF00 : 0xFF0000,
      fields: [
        { name: '📦 Job Type', value: jobType, inline: true },
        { name: '🆔 Job ID', value: jobId, inline: true },
        { name: '📊 Status', value: status.toUpperCase(), inline: true },
      ],
      timestamp: new Date().toISOString()
    };

    if (duration !== undefined) {
      embed.fields.push({ 
        name: '⏱️ Duration', 
        value: `${duration}ms`, 
        inline: true 
      });
    }

    if (error) {
      embed.fields.push({ 
        name: '❌ Error', 
        value: `\`\`\`\n${String(error).substring(0, 500)}\n\`\`\``, 
        inline: false 
      });
    }

    await this.queueMessage({ embeds: [embed] });
  }

  /**
   * Gửi system notification (bot start, stop, etc.)
   */
  async sendSystemNotification(
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    if (!this.isEnabled) return;

    const colors = {
      info: 0x3498DB,
      success: 0x00FF00,
      warning: 0xFFAA00,
      error: 0xFF0000
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const embed = {
      title: `${icons[type]} ${title}`,
      description,
      color: colors[type],
      timestamp: new Date().toISOString()
    };

    await this.queueMessage({ embeds: [embed] });
  }

  /**
   * Tạo embed cho log message
   */
  private createEmbed(
    level: 'ERROR' | 'WARN' | 'INFO' | 'SUCCESS',
    message: string,
    error?: any
  ): any {
    const colors = {
      ERROR: 0xFF0000,
      WARN: 0xFFAA00,
      INFO: 0x3498DB,
      SUCCESS: 0x00FF00
    };

    const icons = {
      ERROR: '❌',
      WARN: '⚠️',
      INFO: 'ℹ️',
      SUCCESS: '✅'
    };

    const embed: any = {
      title: `${icons[level]} ${level}`,
      description: message.substring(0, 2000),
      color: colors[level],
      timestamp: new Date().toISOString(),
      footer: {
        text: `ngoc-rong-discord-bot | ${process.env.NODE_ENV || 'development'}`
      }
    };

    // Add error details nếu có
    if (error) {
      embed.fields = [];
      
      if (error.message) {
        embed.fields.push({
          name: '💬 Error Message',
          value: `\`\`\`\n${String(error.message).substring(0, 1000)}\n\`\`\``,
          inline: false
        });
      }

      if (error.code) {
        embed.fields.push({
          name: '🔢 Error Code',
          value: String(error.code),
          inline: true
        });
      }

      // Add thêm metadata nếu có
      if (error.query) {
        embed.fields.push({
          name: '📝 Database Query',
          value: `\`\`\`sql\n${String(error.query).substring(0, 500)}\n\`\`\``,
          inline: false
        });
      }
    }

    return embed;
  }

  /**
   * Queue message để tránh rate limit
   */
  private async queueMessage(payload: any): Promise<void> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      console.warn('⚠️ Webhook queue đầy, bỏ qua message');
      return;
    }

    this.queue.push(payload);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process message queue với rate limiting
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const payload = this.queue.shift();

      try {
        await this.sendToWebhook(payload);
        // Wait để tránh rate limit (Discord webhook limit: ~5 requests/2 seconds)
        await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT_MS));
      } catch (error) {
        console.error('Failed to send webhook:', error);
        // Không retry để tránh infinite loop
      }
    }

    this.isProcessing = false;
  }

  /**
   * Gửi message tới Discord webhook
   */
  private async sendToWebhook(payload: any): Promise<void> {
    if (!this.webhookUrl) return;

    try {
      await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
    } catch (error: any) {
      if (error.response?.status === 429) {
        // Rate limited - đợi thêm
        const retryAfter = error.response.data?.retry_after || 2;
        console.warn(`⚠️ Webhook rate limited, retry after ${retryAfter}s`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        // Retry once
        await axios.post(this.webhookUrl!, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Check if webhook is enabled
   */
  isWebhookEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton
export const webhookService = new WebhookService();
