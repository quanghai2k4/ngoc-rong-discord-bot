import dotenv from 'dotenv';

dotenv.config();

/**
 * Validate environment variables khi khởi động bot
 */
export function validateEnv(): void {
  const required = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID',
    'DATABASE_URL'
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Thiếu environment variables bắt buộc:', missing);
    console.error('❌ Vui lòng kiểm tra file .env của bạn');
    process.exit(1);
  }

  // Validate format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith('postgresql://')) {
    console.error('❌ DATABASE_URL phải bắt đầu với postgresql://');
    process.exit(1);
  }

  // Validate webhook URL format (optional but recommended)
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (webhookUrl && !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.warn('⚠️ DISCORD_WEBHOOK_URL không đúng format, logs sẽ không được gửi qua Discord');
  }

  console.log('✅ Environment variables hợp lệ');
}
