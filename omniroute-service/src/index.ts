import express from "express";
import { Bot, webhookCallback } from "grammy";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (botToken) {
  const bot = new Bot(botToken);

  bot.command("start", (ctx) =>
    ctx.reply("Halo! OmniRoute & Hermes Agent aktif dan siap melayani."),
  );

  bot.on("message:text", async (ctx) => {
    const userMessage = ctx.message.text;

    await ctx.replyWithChatAction("typing");

    try {
      // Panggil router LLM lokal (atau ganti endpoint sesuai logika OmniRoute kamu)
      // Jika OmniRoute berjalan di endpoint internal /v1/chat/completions:
      const response = await fetch(
        `http://localhost:${PORT}/v1/chat/completions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: process.env.DEFAULT_MODEL || "default",
            messages: [{ role: "user", content: userMessage }],
          }),
        },
      );

      const data = (await response.json()) as any;
      const replyText =
        data.choices?.[0]?.message?.content ||
        data.response ||
        "Pesan diproses oleh sistem.";

      await ctx.reply(replyText);
    } catch (error) {
      console.error("Error:", error);
      // Fallback jika router lokal belum merespons format JSON di atas
      await ctx.reply(
        `Hermes menerima: "${userMessage}" (Menunggu routing aktif)`,
      );
    }
  });

  app.use("/telegram-webhook", webhookCallback(bot, "express"));
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "Running smoothly" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
