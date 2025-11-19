/**
 * Logger Service - Centralized logging với levels và Discord webhook integration
 */

import { webhookService } from '../services/WebhookService';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private level: LogLevel;
  private enableWebhook: boolean;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    this.level = envLevel === 'DEBUG' ? LogLevel.DEBUG
      : envLevel === 'WARN' ? LogLevel.WARN
      : envLevel === 'ERROR' ? LogLevel.ERROR
      : LogLevel.INFO;
    
    // Enable webhook cho production hoặc khi được cấu hình
    this.enableWebhook = process.env.NODE_ENV === 'production' || 
                         process.env.DISCORD_WEBHOOK_URL !== undefined;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`ℹ️  [INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`⚠️  [WARN] ${message}`, ...args);
      
      // Gửi warnings qua webhook trong production
      if (this.enableWebhook && process.env.NODE_ENV === 'production') {
        webhookService.sendLog('WARN', message, args[0]).catch(err => 
          console.error('Failed to send webhook:', err)
        );
      }
    }
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`❌ [ERROR] ${message}`, error, ...args);
      
      // Gửi errors qua webhook
      if (this.enableWebhook) {
        webhookService.sendError(message, error).catch(err => 
          console.error('Failed to send webhook:', err)
        );
      }
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  }

  cache(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`💾 [CACHE] ${message}`, ...args);
    }
  }

  db(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`🗄️  [DB] ${message}`, ...args);
    }
  }

  /**
   * Log system events (bot start, stop, etc.)
   */
  system(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    console.log(`${icons[type]} [SYSTEM] ${message}`);
    
    if (this.enableWebhook) {
      webhookService.sendSystemNotification('System Event', message, type).catch(err => 
        console.error('Failed to send webhook:', err)
      );
    }
  }
}

export const logger = new Logger();
