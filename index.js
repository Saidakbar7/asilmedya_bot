import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN);

// Kanallar (1 ochiq, 1 yopiq bo‘lishi mumkin)
const REQUIRED_CHANNELS = [
    '@fragrance_company',
    '@uz_asilmedia'
];

const INSTAGRAM_URL = 'https://www.instagram.com/asilmedia_uzb?igsh=Z2F3NXlzeHhjdjU2';

// Kino bazasi
const moviesDatabase = {
    "1": {
        title: "Martin (2024)",
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
        title: "Oqdan tez~",
        fileId: "BAACAgEAAxkBAAMnai8pChNcg47avaKU22EVlU4kEXEAAikKAAKT6XlFqSRqadewPYc8BA",
        views: 0,
        ratings: []
    },
};

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

bot.hears('📝 Nomi bilan izlash', (ctx) => {
    userStates[ctx.from.id] = 'NAME';
    ctx.reply('Kino nomini kiriting:');
});

bot.hears('🎲 Random kino', async (ctx) => {
    const list = Object.values(moviesDatabase);
    const movie = list[Math.floor(Math.random() * list.length)];

    movie.views++;
    return sendMovie(ctx, movie);
});

// ================= TEXT HANDLER =================
bot.on('text', async (ctx) => {
    const text = ctx.message.text.trim();
    const state = userStates[ctx.from.id];

    if (state === 'CODE') {
        const movie = moviesDatabase[text];

        if (!movie) return ctx.reply('❌ Kino topilmadi');

        movie.views++;
        delete userStates[ctx.from.id];

        return sendMovie(ctx, movie);
    }

    if (state === 'NAME') {
        const movie = Object.values(moviesDatabase).find(m =>
            m.title.toLowerCase().includes(text.toLowerCase())
        );

        if (!movie) return ctx.reply('❌ Kino topilmadi');

        movie.views++;
        delete userStates[ctx.from.id];

        return sendMovie(ctx, movie);
    }

    ctx.reply('📌 Tugmalardan foydalaning', mainMenu);
});

// ================= SEND MOVIE (PROTECTED) =================
async function sendMovie(ctx, movie) {
    const avg =
        movie.ratings.length > 0
            ? (movie.ratings.reduce((a, b) => a + b, 0) / movie.ratings.length).toFixed(1)
            : '0';

    // 🔥 VIDEO (PROTECTED)
    await ctx.replyWithVideo(movie.fileId, {
        caption:
            `🎬 ${movie.title}
👁 Ko‘rishlar: ${movie.views}


⚠️ AsilMedia`
        ,
        protect_content: true   // 🔥 SHU MUHIM QISM
    });

}

// ================= RATING =================
bot.action(/rate_(\d+)/, async (ctx) => {
    const rate = Number(ctx.match[1]);

    const movies = Object.values(moviesDatabase);
    const movie = movies[movies.length - 1]; // oxirgi film

    movie.ratings.push(rate);


});

// ================= LAUNCH =================
bot.launch().then(() => {
    console.log('🚀 Bot ishga tushdi');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));