# 🎮 ZIA CODM Web Dashboard

## Project Structure
```
zia-codm-web/
├── backend/              # Flask API Server
│   ├── app.py           # Main API
│   ├── requirements.txt # Python dependencies
│   └── data/            # JSON data storage
├── frontend/            # React Web App
│   ├── src/             # React source
│   ├── public/          # Static files
│   └── package.json     # Node dependencies
└── apk-build/           # Capacitor APK config
```

## 🚀 Deployment Options

### OPTION 1: Website (Recommended)
**Hosting Required:** YES

#### Step 1: Backend Deployment (VPS/Cloud)
```bash
# On your VPS (Ubuntu/Debian)
sudo apt update && sudo apt install python3-pip nginx

# Clone/upload project
cd /var/www/zia-codm-web/backend
pip3 install -r requirements.txt

# Run with Gunicorn (production)
gunicorn -w 4 -b 127.0.0.1:5000 app:app

# Or use systemd service
sudo nano /etc/systemd/system/zia-codm.service
```

**Systemd Service:**
```ini
[Unit]
Description=ZIA CODM Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/zia-codm-web/backend
ExecStart=/usr/local/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

#### Step 2: Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Upload build/ folder to your web server or use Vercel/Netlify
```

#### Step 3: Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/zia-codm-web/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Free Hosting Options:**
- **Backend:** Railway.app, Render.com, PythonAnywhere
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** Railway PostgreSQL (free tier)

---

### OPTION 2: Android APK
**No hosting needed** (runs locally with local backend)

#### Prerequisites
```bash
# Install Node.js, Java JDK 17, Android Studio
npm install -g @capacitor/cli
```

#### Build Steps
```bash
cd frontend
npm install
npm run build

# Initialize Capacitor
npx cap init ZIACODM com.zia.codm --web-dir build

# Add Android platform
npx cap add android

# Sync web assets
npx cap sync

# Open in Android Studio
npx cap open android

# Build APK (in Android Studio: Build > Build Bundle/APK > Build APK)
# OR command line:
cd android
./gradlew assembleDebug
# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

#### For Local Backend in APK
The APK needs the backend running somewhere:
1. **Option A:** Run backend on same device (Termux) - advanced
2. **Option B:** Host backend on VPS, APK connects to your API
3. **Option C:** Use the web version instead (recommended)

---

## 🔐 Telegram Bot Setup

1. Create bot with @BotFather on Telegram
2. Copy the token to `backend/app.py` → `TELEGRAM_BOT_TOKEN`
3. Set webhook: `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook`
4. Users message `/token` to get access keys

## ⚙️ Admin Panel Access
- Default admin key: `ZIA_ADMIN_2026` (CHANGE THIS!)
- Access via login page → "Admin Panel" button
- Generate keys, manage users, view stats

## 📝 Important Notes

**YES, you NEED hosting** for:
- The backend API (Python Flask server)
- Telegram bot webhook endpoint
- Database/storage
- Real-time checking functionality

**The frontend alone** (HTML/CSS/JS) can run locally but CANNOT perform checks without the backend.

### Recommended Stack:
- **VPS:** Contabo ($5/month) or Hetzner ($4/month)
- **Domain:** Namecheap ($10/year)
- **SSL:** Let's Encrypt (free)
- **Total cost:** ~$5-10/month

### Free Alternative:
- Railway.app (free tier with sleep)
- Vercel (frontend)
- But performance will be limited
