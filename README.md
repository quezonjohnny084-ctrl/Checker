# 🎮 ZIA CODM Web Dashboard v2.0

> **Full-stack web dashboard for CODM account checking with Telegram auth, admin panel, and APK support.**

---

## ⚡ Quick Start

### 1. Backend (Required)
```bash
cd backend
pip install -r requirements.txt
python app.py
# Server runs on http://localhost:5000
```

### 2. Frontend (Web)
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### 3. Telegram Bot
```bash
cd backend
python bot.py
# Set BOT_TOKEN in bot.py first!
```

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Flask Backend   │────▶│  Garena APIs    │
│  (Web/APK)       │     │  (Python)        │     │  (Your Checker) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │  Telegram Bot   │
         │              │  (Token Auth)   │
         │              └─────────────────┘
         │
    ┌────┴────┐
    │  Admin  │
    │  Panel  │
    └─────────┘
```

---

## 🔐 Authentication Flow

1. User messages `/start` to `@ZIA_CODM_Bot` on Telegram
2. Bot generates unique JWT token (`zia_xxxxxxxxxxxx`)
3. User enters token on web login page
4. Backend validates token and creates session
5. User accesses dashboard

### Admin Access
- Click "Admin Panel" on login page
- Enter secret key: `ZIA_ADMIN_2026` (change in `app.py`)
- Manage users, generate keys, view stats

---

## 📱 APK Build Instructions

### Prerequisites
- Node.js 18+
- Android Studio
- Java JDK 17

### Build APK
```bash
cd frontend
npm install
npm run build

# Initialize Capacitor
npx cap init ZIACODM com.zia.codm --web-dir build

# Add Android
npx cap add android

# Sync assets
npx cap sync

# Build APK
npx cap open android
# In Android Studio: Build > Build Bundle/APK > Build APK
```

**APK Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🌐 Deployment (Website)

### Option A: VPS (Recommended)
- **Server:** Ubuntu 22.04, 2GB RAM minimum
- **Cost:** ~$5/month (Contabo, Hetzner)
- **Domain:** Namecheap (~$10/year)
- **SSL:** Let's Encrypt (free)

### Option B: Free Hosting
- **Backend:** Railway.app, Render.com
- **Frontend:** Vercel, Netlify
- **Limitations:** Sleep after inactivity, slower

### Production Setup
See `DEPLOYMENT_GUIDE.md` for full Nginx, SSL, and systemd configuration.

---

## ⚙️ Configuration

### Backend (`backend/app.py`)
```python
ADMIN_SECRET_KEY = "ZIA_ADMIN_2026"  # CHANGE THIS!
TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"   # From @BotFather
```

### Telegram Bot Setup
1. Message `@BotFather` on Telegram
2. Send `/newbot` and follow instructions
3. Copy token to `app.py` and `bot.py`
4. Set webhook URL (if using webhooks)

---

## 🛡️ Security Notes

- **Change default admin key immediately**
- Use HTTPS in production
- Enable rate limiting (already configured)
- Store tokens securely (JWT with expiry)
- Don't commit `.env` files

---

## 📊 Features

| Feature | Status |
|---------|--------|
| Telegram Token Auth | ✅ |
| Admin Panel | ✅ |
| Combo Upload (.txt) | ✅ |
| Thread Control (1-100) | ✅ |
| Live Console Output | ✅ |
| Real-time Stats | ✅ |
| Results Cards | ✅ |
| Download Results (ZIP) | ✅ |
| APK Build Support | ✅ |
| Rate Limiting | ✅ |
| User Management | ✅ |

---

## 📝 Important: Hosting Required

**YES, you need hosting** for the backend API. The frontend (HTML/CSS/JS) can run locally, but the Python checker logic must run on a server.

**Why?**
- Your `upd.py` uses Python requests to call Garena APIs
- Browsers can't run Python code
- The backend handles authentication, checking, and data storage

**Minimum viable setup:**
- $5/month VPS
- Domain name
- SSL certificate

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Check `REACT_APP_API_URL` matches backend URL |
| Token invalid | Regenerate via Telegram bot |
| APK won't build | Install Android Studio + SDK |
| Backend won't start | `pip install -r requirements.txt` |

---

**Powered by ZIA_CODM**
