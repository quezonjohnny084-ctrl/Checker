#!/bin/bash
# ZIA CODM Quick Start Script

echo "🎮 ZIA CODM Dashboard Launcher"
echo "================================"

if [ "$1" == "backend" ]; then
    echo "Starting backend server..."
    cd backend
    pip3 install -r requirements.txt
    python3 app.py
elif [ "$1" == "bot" ]; then
    echo "Starting Telegram bot..."
    cd backend
    pip3 install python-telegram-bot
    python3 bot.py
elif [ "$1" == "frontend" ]; then
    echo "Starting frontend dev server..."
    cd frontend
    npm install
    npm start
elif [ "$1" == "apk" ]; then
    echo "Building APK..."
    cd frontend
    npm install
    npm run build
    npx cap sync
    echo "Open Android Studio and build APK"
else
    echo "Usage: ./start.sh [backend|bot|frontend|apk]"
    echo ""
    echo "Commands:"
    echo "  backend  - Start Flask API server"
    echo "  bot      - Start Telegram bot"
    echo "  frontend - Start React dev server"
    echo "  apk      - Build Android APK"
fi
