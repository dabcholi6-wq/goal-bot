// ==========================================
// 📦 کتابخانه‌ها
// ==========================================
const { Telegraf } = require('telegraf');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// ==========================================
// 🔐 تنظیمات
// ==========================================
const TOKEN = '7980096496:AAEza-CUFjxG-e6u2Y-NJkgJUK4i73dg3iY';
const ADMIN_ID = 7744236569;
const bot = new Telegraf(TOKEN);

// ==========================================
// 📂 دیتابیس
// ==========================================
const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        diamonds INTEGER DEFAULT 100,
        has_received_bonus INTEGER DEFAULT 0
    )
`);

// ==========================================
// 🧠 توابع کمکی
// ==========================================
function getUser(userId, callback) {
    db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
        if (err) return callback(null);
        if (!row) {
            db.run('INSERT INTO users (user_id, diamonds) VALUES (?, 100)', [userId], () => {
                db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, newRow) => {
                    callback(newRow);
                });
            });
        } else {
            callback(row);
        }
    });
}

function updateUser(userId, data, callback) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    db.run(`UPDATE users SET ${setClause} WHERE user_id = ?`, [...values, userId], callback);
}

// ==========================================
// 🏠 /start
// ==========================================
bot.start((ctx) => {
    const userId = ctx.from.id;
    const name = ctx.from.first_name || 'کاربر';

    getUser(userId, (user) => {
        let message = `سلام ${name} عزیز! 👋\nبه ربات **Goal Challenge** خوش اومدی! 🏆\n\n`;

        if (!user.has_received_bonus) {
            updateUser(userId, { diamonds: user.diamonds + 100, has_received_bonus: 1 }, () => {
                getUser(userId, (updatedUser) => {
                    ctx.reply(
                        message +
                        `🎁 ۱۰۰ الماس هدیه گرفتی! 💎\n` +
                        `💰 الماس فعلی: ${updatedUser.diamonds}\n\n` +
                        `لطفاً یکی از گزینه‌ها رو انتخاب کن:`,
                        {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: '💎 خرید الماس', callback_data: 'buy' }],
                                    [{ text: '🎲 شرط‌بندی', callback_data: 'betting' }]
                                ]
                            }
                        }
                    );
                });
            });
        } else {
            ctx.reply(
                message +
                `💰 الماس فعلی: ${user.diamonds}\n\n` +
                `لطفاً یکی از گزینه‌ها رو انتخاب کن:`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💎 خرید الماس', callback_data: 'buy' }],
                            [{ text: '🎲 شرط‌بندی', callback_data: 'betting' }]
                        ]
                    }
                }
            );
        }
    });
});

// ==========================================
// 💎 خرید الماس
// ==========================================
bot.action('buy', (ctx) => {
    ctx.reply(
        '💎 **خرید الماس** 💎\n\n' +
        '💰 قیمت هر الماس: ۱,۰۰۰ تومان\n\n' +
        '💳 شماره کارت: `6219 8614 3997 6183`\n' +
        '👤 نام صاحب حساب: **کریم جاهدی**\n\n' +
        '📌 بعد از واریز، عکس رسید رو بفرست.'
    );
});

// ==========================================
// 🎲 شرط‌بندی
// ==========================================
bot.action('betting', (ctx) => {
    ctx.reply(
        '⚽️ **شرط‌بندی فوتبالی** 🔥\n\n' +
        'تمام شرط‌بندی‌ها فقط داخل گروه رسمی انجام میشه:\n' +
        '👉 [Goal Challenges | Chat](https://t.me/+6rdjXhUNLLY5Y2Q0)\n\n' +
        '📌 برای شرکت در شرط‌بندی، حتماً عضو گروه بشید و قوانین رو مطالعه کنید.\n\n' +
        '🎯 **بدو شرط‌بندی کن!**',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔗 پیوستن به گروه شرط‌بندی', url: 'https://t.me/+6rdjXhUNLLY5Y2Q0' }]
                ]
            }
        }
    );
});

// ==========================================
// ⏰ ارسال پیام هر ۵ دقیقه به مدیر (برای جلوگیری از خوابیدن)
// ==========================================
setInterval(() => {
    bot.telegram.sendMessage(ADMIN_ID, '🟢 ربات Goal Challenge فعال است!');
    console.log('✅ پیام سلامت به مدیر ارسال شد.');
}, 300000);

// ==========================================
// 🚀 روشن کردن ربات
// ==========================================
bot.launch();
console.log('🚀 ربات Goal Challenge روشن شد!');