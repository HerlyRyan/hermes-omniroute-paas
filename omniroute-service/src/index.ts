import express from 'express';
import { Bot, webhookCallback } from 'grammy';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Endpoint Dummy OmniRoute (Router AI Lokal)
// Ini menangani request dari bot Telegram dan memberikan balasan sementara
app.post('/v1/chat/completions', (req, res) => {
  const { messages } = req.body;
  const lastMessage = messages?.[messages.length - 1]?.content || 'Halo';

  // Simulasi respons AI dari router lokal
  res.json({
    choices: [
      {
        message: {
          content: `OmniRoute memproses pesan Anda: "${lastMessage}". Sistem berjalan normal!`
        }
      }
    ]
  });
});

// 2. Inisialisasi Bot Telegram
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (botToken) {
  const bot = new Bot(botToken);

  bot.command('start', (ctx) => 
    ctx.reply('Halo! OmniRoute & Hermes Agent siap melayani.')
  );

  bot.on('message:text', async (ctx) => {
    const userMessage = ctx.message.text;
    
    await ctx.replyWithChatAction('typing');

    try {
      // Menembak endpoint router lokal yang ada di atas
      const response = await fetch(`http://localhost:${PORT}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'default',
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      const data = await response.json() as any;
      const replyText = data.choices?.[0]?.message?.content || 'Pesan diproses.';

      await ctx.reply(replyText);
    } catch (error) {
      console.error('Error:', error);
      await ctx.reply(`Terjadi kendala koneksi internal.`);
    }
  });

  app.use('/telegram-webhook', webhookCallback(bot, 'express'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});