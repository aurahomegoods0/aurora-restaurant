// Registers the reservation webhook with Telegram.
// Usage: npm run telegram:webhook -- https://your-domain.com
// Needs TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET (loaded from .env.local).

const baseUrl = process.argv[2]?.replace(/\/+$/, '');
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!baseUrl || !baseUrl.startsWith('https://')) {
  console.error('Pass your public HTTPS URL, e.g. https://aurora.uz');
  process.exit(1);
}

if (!token || !secret) {
  console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET must be set.');
  process.exit(1);
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: `${baseUrl}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ['callback_query'],
    drop_pending_updates: true,
  }),
});

const result = await response.json();
console.log(result.ok ? `Webhook set: ${baseUrl}/api/telegram/webhook` : result);
process.exit(result.ok ? 0 : 1);
