# 🚂 Deploy ZIA CODM on Railway.app

## ⚠️ Important: Railway Free Tier Limits

| Limit | Value |
|-------|-------|
| **Execution time** | 500 hours/month (~16 hours/day) |
| **Sleep after idle** | ~5 minutes of no requests |
| **Disk** | Ephemeral (resets on deploy) |
| **RAM** | 512MB - 1GB (shared) |
| **CPU** | Shared |
| **Custom domains** | ✅ Supported |
| **Environment variables** | ✅ Unlimited |

**⚠️ Your data will be LOST when the container restarts.**
Use an external database (Railway PostgreSQL) for persistence.

---

## 🚀 Method 1: Deploy from GitHub (Recommended)

### Step 1: Push to GitHub
```bash
# Create a new repo on GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zia-codm.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) and login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `zia-codm` repo
4. Railway will auto-detect Python and install dependencies

### Step 3: Add Environment Variables
Go to your project → **Variables** tab, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `SECRET_KEY` | `random-long-string-32-chars` | JWT secret |
| `ADMIN_KEY` | `your-admin-password` | Admin panel access |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC-DEF...` | From @BotFather |
| `PORT` | `5000` | Railway sets this auto |
| `PYTHONUNBUFFERED` | `1` | Required |

### Step 4: Generate Domain
1. Go to **Settings** → **Public Networking**
2. Click **Generate Domain**
3. Your API URL will be: `https://your-project.up.railway.app`

### Step 5: Set Telegram Webhook
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook"   -H "Content-Type: application/json"   -d '{"url": "https://your-project.up.railway.app/api/telegram/webhook"}'
```

---

## 🚀 Method 2: Deploy via Railway CLI

### Install CLI
```bash
npm install -g @railway/cli
railway login
```

### Deploy
```bash
cd zia-codm-web/backend
railway init
railway link
railway up
```

### Set variables
```bash
railway variables set SECRET_KEY="your-secret"
railway variables set ADMIN_KEY="your-admin-key"
railway variables set TELEGRAM_BOT_TOKEN="your-bot-token"
```

### Open in browser
```bash
railway open
```

---

## 🚀 Method 3: Deploy from Docker Image

If the auto-detect fails, Railway can build from Dockerfile:

1. Make sure `backend/Dockerfile` exists (it does in this project)
2. In Railway dashboard, set **Builder** to `Dockerfile`
3. Deploy

---

## ⚛️ Frontend Deployment (Vercel)

Railway only hosts the backend. For the frontend:

### Step 1: Update API URL
Edit `frontend/src/contexts/AuthContext.js`:
```javascript
const API_URL = 'https://your-railway-domain.up.railway.app/api';
```

### Step 2: Deploy to Vercel
```bash
cd frontend
npm install
npm run build

# Install Vercel CLI
npm install -g vercel
vercel --prod
```

Or use GitHub integration:
1. Push frontend folder to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set environment variable: `REACT_APP_API_URL=https://your-railway-app.up.railway.app/api`
4. Deploy

---

## 🔗 Connect Frontend + Backend

### CORS Setup
Your Railway backend URL must be in the allowed origins.

In `backend/app.py`, update CORS:
```python
CORS(app, origins=[
    "https://your-vercel-domain.vercel.app",
    "http://localhost:3000"
])
```

### Environment Variables on Vercel
| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-railway.up.railway.app/api` |

---

## 📊 Railway Pricing (2026)

| Plan | Price | Features |
|------|-------|----------|
| **Hobby** | $5/month | 2GB RAM, no sleep, 100GB egress |
| **Pro** | $20/month | 8GB RAM, priority support |
| **Enterprise** | Custom | Dedicated resources |

**Free tier:** $5 credit/month (enough for hobby plan)

---

## 🛠️ Troubleshooting Railway

### "Application failed to start"
```bash
# Check logs in Railway dashboard → Deployments → Logs
# Common fixes:
# 1. Missing environment variables
# 2. Wrong start command
# 3. Missing requirements.txt
```

### "Cannot connect to backend from frontend"
```bash
# 1. Check CORS is configured
# 2. Verify REACT_APP_API_URL is correct
# 3. Check Railway domain is public (Settings → Public Networking)
```

### "Data lost after restart"
```bash
# Railway free tier has ephemeral disk
# Solution: Add Railway PostgreSQL addon
# 1. Railway dashboard → New → Database → Add PostgreSQL
# 2. Copy DATABASE_URL to environment variables
# 3. Update backend to use PostgreSQL instead of JSON files
```

### "Telegram webhook not working"
```bash
# 1. Check webhook URL is correct
# 2. Verify domain is public (not localhost)
# 3. Test webhook manually:
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

---

## 🔄 Updating Your App

### Method 1: Git Push (Auto-deploy)
```bash
git add .
git commit -m "Update"
git push origin main
# Railway auto-deploys!
```

### Method 2: Railway CLI
```bash
railway up
```

---

## 📋 Railway Deployment Checklist

- [ ] GitHub repo created and pushed
- [ ] Railway project linked to repo
- [ ] Environment variables set (SECRET_KEY, ADMIN_KEY, TELEGRAM_BOT_TOKEN)
- [ ] Domain generated and working
- [ ] Telegram webhook set to Railway domain
- [ ] Frontend deployed to Vercel
- [ ] CORS configured with Vercel domain
- [ ] REACT_APP_API_URL points to Railway
- [ ] Test login with Telegram token
- [ ] Test admin panel access

---

## 💡 Pro Tips

1. **Use Railway + Vercel together** - Backend on Railway, frontend on Vercel (both free)
2. **Add a database** - Use Railway PostgreSQL ($0-5/month) to persist user data
3. **Set up monitoring** - Railway has built-in logs and metrics
4. **Use custom domain** - Railway supports custom domains on free tier
5. **Auto-deploy from GitHub** - Push to main branch = instant deploy

---

**Ready? Go to [railway.app](https://railway.app) and deploy!**
