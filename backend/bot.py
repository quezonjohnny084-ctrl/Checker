#!/usr/bin/env python3
"""
ZIA CODM Telegram Bot
Run this separately or integrate into Flask app
"""
import os
import json
import secrets
import datetime
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"
ADMIN_ID = "8632939616"  # Your Telegram ID

# Simple JSON storage
USERS_FILE = "data/users.json"

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def generate_token():
    return "zia_" + secrets.token_hex(12)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Send welcome message with menu"""
    keyboard = [
        [InlineKeyboardButton("🔑 Get Access Token", callback_data='get_token')],
        [InlineKeyboardButton("📊 My Stats", callback_data='my_stats')],
        [InlineKeyboardButton("❓ How to Use", callback_data='how_to_use')],
    ]

    # Admin buttons
    user_id = str(update.effective_user.id)
    if user_id == ADMIN_ID:
        keyboard.append([InlineKeyboardButton("⚙️ Admin Panel", callback_data='admin_panel')])

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        f"👋 Welcome to *ZIA CODM Checker*!\n\n"
        f"🎮 Check Garena/CODM accounts\n"
        f"🔐 Get access to web dashboard\n"
        f"📈 Track your checking stats\n\n"
        f"Click below to get started:",
        parse_mode='Markdown',
        reply_markup=reply_markup
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button clicks"""
    query = update.callback_query
    await query.answer()

    user_id = str(update.effective_user.id)
    username = update.effective_user.username or f"user_{user_id}"

    if query.data == 'get_token':
        users = load_users()

        # Check if user already has active token
        if username in users and users[username].get('active', True):
            existing = users[username].get('token', 'N/A')
            await query.edit_message_text(
                f"🔑 *Your Access Token*\n\n"
                f"`{existing}`\n\n"
                f"✅ Already active!\n"
                f"🌐 Use it at: https://your-domain.com\n\n"
                f"⚠️ Don't share this token!",
                parse_mode='Markdown'
            )
        else:
            # Generate new token
            token = generate_token()
            users[username] = {
                'telegram_id': user_id,
                'username': username,
                'token': token,
                'created_at': datetime.datetime.utcnow().isoformat(),
                'expires_at': (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat(),
                'active': True,
                'checks_total': 0
            }
            save_users(users)

            await query.edit_message_text(
                f"✅ *Token Generated!*\n\n"
                f"`{token}`\n\n"
                f"📅 Valid for 30 days\n"
                f"🌐 Login at: https://your-domain.com\n\n"
                f"⚠️ Keep this token safe!",
                parse_mode='Markdown'
            )

    elif query.data == 'my_stats':
        users = load_users()
        user = users.get(username, {})

        await query.edit_message_text(
            f"📊 *Your Stats*\n\n"
            f"👤 User: @{username}\n"
            f"✅ Status: {'Active' if user.get('active') else 'Inactive'}\n"
            f"📅 Expires: {user.get('expires_at', 'N/A')[:10]}\n"
            f"🔍 Total Checks: {user.get('checks_total', 0)}\n\n"
            f"🔙 /start to go back",
            parse_mode='Markdown'
        )

    elif query.data == 'how_to_use':
        await query.edit_message_text(
            f"❓ *How to Use ZIA CODM*\n\n"
            f"1️⃣ Click 'Get Access Token'\n"
            f"2️⃣ Go to https://your-domain.com\n"
            f"3️⃣ Paste your token and login\n"
            f"4️⃣ Upload your combo list (.txt)\n"
            f"5️⃣ Set threads and click START\n"
            f"6️⃣ View results in real-time!\n\n"
            f"🔙 /start to go back",
            parse_mode='Markdown'
        )

    elif query.data == 'admin_panel':
        if user_id != ADMIN_ID:
            await query.edit_message_text("⛔ Access Denied")
            return

        keyboard = [
            [InlineKeyboardButton("👥 User List", callback_data='admin_users')],
            [InlineKeyboardButton("🔑 Generate Key", callback_data='admin_genkey')],
            [InlineKeyboardButton("📊 Server Stats", callback_data='admin_stats')],
        ]
        await query.edit_message_text(
            "⚙️ *Admin Panel*",
            parse_mode='Markdown',
            reply_markup=InlineKeyboardMarkup(keyboard)
        )

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Get server stats"""
    users = load_users()
    total = len(users)
    active = sum(1 for u in users.values() if u.get('active', True))

    await update.message.reply_text(
        f"📊 *Server Stats*\n\n"
        f"👥 Total Users: {total}\n"
        f"✅ Active: {active}\n"
        f"📅 Server Time: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')} UTC",
        parse_mode='Markdown'
    )

def main():
    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("stats", stats_command))
    application.add_handler(CallbackQueryHandler(button_handler))

    print("🤖 ZIA CODM Bot started!")
    application.run_polling()

if __name__ == "__main__":
    main()
