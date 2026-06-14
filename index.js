const { Telegraf, Markup } = require('telegraf');

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Kanallar (1 ochiq, 1 yopiq bo‘lishi mumkin)
const REQUIRED_CHANNELS = [
    '@fragrance_company',
    '@uz_asilmedia'
];

const INSTAGRAM_URL = 'https://www.instagram.com/asilmedia_uzb?igsh=Z2F3NXlzeHhjdjU2';
const INSTAGRAM_URL1 = 'https://www.instagram.com/asilmedi_uz?igsh=M2ZkazVvZXZzajVn&utm_source=qr';

// Kino bazasi
const moviesDatabase = {
    "1": {
        title: "Martin",
        fileId: "BAACAgIAAxkBAAMbai6tTDBabgm5EjR7bJQgk1WVg6gAAhmqAAIVzXhJAAHsXjNW9l2lPAQ",
        views: 0,
        ratings: []
    },
    "2": {
        title: "Be hato otilgan oq",
        fileId: "BAACAgIAAxkBAAMdai6yIwa2GI37pof2HtgOSJFXXbkAAiCqAAIVzXhJUpPTYnZM3jI8BA",
        views: 0,
        ratings: []
    },
    "3": {
        title: "Olim mashinasi",
        fileId: "BAACAgIAAxkBAAMfai67fXC5Wp2gwwnNLypBmXV0wIIAAl-RAAKbryFKAbO0nfK2tBE8BA",
        views: 0,
        ratings: []
    },
    "4": {
        title: "Qutqaruv opsratsiyasi 2",
        fileId: "BAACAgEAAxkBAAMhai7fYv0ZBMPifh7jlU519PS8G7wAAvEJAAKT6XlFCHgYCSVwC_M8BA",
        views: 0,
        ratings: []
    },
    "5": {
        title: "Oqdan tez",
        fileId: "BAACAgEAAxkBAAMnai8pChNcg47avaKU22EVlU4kEXEAAikKAAKT6XlFqSRqadewPYc8BA",
        views: 0,
        ratings: []
    },
    "6": {
        title: "Agent 47",
        fileId: "BAACAgQAAxkBAAMpai8vayCK4mEDylqfidmij6SOhjIAAs4hAAI9hAFQFd580eUWpfc8BA",
        views: 0,
        ratings: []
    },
    "7": {
        title: "Lucy",
        fileId: "BAACAgQAAxkBAAMrai8vy9rgS-bUnovuJBgW0DBlTDIAAnMSAAJeQCBTVfHE6jA6R0Y8BA",
        views: 0,
        ratings: []
    } // <-- Mana shu yerda ortiqcha vergul olib tashlandi!
};

// Railway o'chib qolmasligi uchun kichik HTTP server
const http = require('http');
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running...');
});
server.listen(PORT);

// Botni ishga tushirish qismi (Siz tashlagan qolgan kodlar shu yerga yoziladi)
// ... (Kodingizning qolgan qismi: bot.on, bot.action va h.k.)

const userStates = {};

// MENU
const mainMenu = Markup.keyboard([
    ['🔍 Kod bilan izlash'],
    ['📝 Nomi bilan izlash'],
    ['🎲 Random kino']
]).resize();

// ================= SUB CHECK =================
async function checkSubscription(ctx) {
    try {
        for (const ch of REQUIRED_CHANNELS) {
            const res = await ctx.telegram.getChatMember(ch, ctx.from.id);

            if (!['member', 'administrator', 'creator'].includes(res.status)) {
                return false;
            }
        }
        return true;
    } catch (e) {
        return false;
    }
}

// ================= START =================
bot.start(async (ctx) => {
    const ok = await checkSubscription(ctx);

    if (!ok) {
        return ctx.reply(
            '📢 Botdan foydalanish uchun kanallarga obuna bo‘ling:',
            Markup.inlineKeyboard([
                [Markup.button.url('📢 Kanal 1', 'https://t.me/fragrance_company')],
                [Markup.button.url('📢 Kanal 2', 'https://t.me/uz_asilmedia')],
                [Markup.button.url('📷 Instagram', INSTAGRAM_URL)],
                [Markup.button.url('📷 Instagram', INSTAGRAM_URL1)],
                [Markup.button.callback('✅ Tekshirish', 'check_sub')]
            ])
        );
    }

    ctx.reply('🎬 Xush kelibsiz!', mainMenu);
});

// ================= CHECK BUTTON =================
bot.action('check_sub', async (ctx) => {
    const ok = await checkSubscription(ctx);

    if (!ok) {
        return ctx.answerCbQuery('❌ Obuna bo‘lmadingiz!', { show_alert: true });
    }

    await ctx.answerCbQuery('✅ Tasdiqlandi');
    await ctx.reply('🎬 Endi foydalanishingiz mumkin!', mainMenu);
});

// ================= SEARCH MODES =================
bot.hears('🔍 Kod bilan izlash', (ctx) => {
    userStates[ctx.from.id] = 'CODE';
    ctx.reply('Kino kodini kiriting:');
});
