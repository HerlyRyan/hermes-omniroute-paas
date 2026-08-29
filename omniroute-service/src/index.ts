import express from 'express';
import { Bot, webhookCallback } from 'grammy';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Inisialisasi Bot Telegram via Grammy
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (botToken) {
  const bot = new Bot(botToken);

  // Handler perintah /start
  bot.command('start', (ctx) => 
    ctx.reply('Halo! Hermes Agent siap menerima instruksi Anda via Webhook.')
  );

  // Handler untuk setiap pesan teks yang masuk
  bot.on('message:text', async (ctx) => {
    const userMessage = ctx.message.text;
    
    // Di sini nantinya logika Hermes Agent / pemanggilan LLM diproses
    const responseText = `Hermes (Integrated) menerima pesan: "${userMessage}"`;
    
    await ctx.reply(responseText);
  });

  // 2. Routing Endpoint khusus Webhook Telegram
  app.use('/telegram-webhook', webhookCallback(bot, 'express'));
} else {
  console.warn('TELEGRAM_BOT_TOKEN belum diset. Bot Telegram tidak aktif.');
}

// 3. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OmniRoute & Hermes Agent is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
