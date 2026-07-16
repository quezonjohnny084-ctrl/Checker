# 🚀 ZIA CODM - Website Deployment Guide

## ⚡ EASIEST METHOD: Docker (Recommended)

### Step 1: Get a VPS
- **Recommended:** [Contabo](https://contabo.com) ($5.50/month, 4GB RAM)
- **Alternative:** [Hetzner](https://hetzner.com) ($4.51/month)
- **Specs needed:** 1 CPU, 2GB RAM, 20GB SSD minimum
- **OS:** Ubuntu 22.04 LTS

### Step 2: Connect to your VPS
```bash
# Windows: Use PuTTY or Windows Terminal
# Mac/Linux:
ssh root@YOUR_SERVER_IP
```

### Step 3: Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 4: Upload Your Project
```bash
# On your computer, zip the project:
zip -r zia-codm.zip zia-codm-web/

# Upload to server (on your computer):
scp zia-codm.zip root@YOUR_SERVER_IP:/root/

# On server, extract:
ssh root@YOUR_SERVER_IP
apt update && apt install -y unzip
unzip zia-codm.zip
cd zia-codm-web
```

### Step 5: Configure
```bash
# Edit the .env file
nano .env

# Fill in:
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ADMIN_KEY=make_up_a_strong_password
SECRET_KEY=random_long_string_here
```

### Step 6: Deploy!
```bash
docker-compose up -d
```

**That's it!** Your website is live at `http://YOUR_SERVER_IP`

### Step 7: Add Domain + HTTPS (Optional but recommended)
```bash
# Buy domain from Namecheap (~$10/year)
# Point A record to your server IP

# Then run:
docker-compose down

# Edit docker-compose.yml, change nginx ports to:
# - "80:80"
# - "443:443"

# Install certbot and get SSL:
apt install certbot
# Follow certbot instructions for your domain

docker-compose up -d
```

---

## 🖥️ METHOD 2: Manual VPS Setup (More Control)

### Step 1: Get VPS (same as above)

### Step 2: Run the deploy script
```bash
# Upload your project to /root/
# Then:
cd /root/zia-codm-web
chmod +x deploy.sh
sudo ./deploy.sh
```

### Step 3: Configure domain
```bash
# Edit Nginx config
nano /etc/nginx/sites-available/zia-codm

# Change YOUR_DOMAIN_HERE to your actual domain
# Example: server_name zia-codm.yourdomain.com;

# Restart nginx
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d zia-codm.yourdomain.com
```

### Step 4: Set environment variables
```bash
nano /var/www/zia-codm/backend/.env

# Add:
TELEGRAM_BOT_TOKEN=your_token
ADMIN_KEY=your_admin_key
```

### Step 5: Start everything
```bash
systemctl restart zia-codm
systemctl status zia-codm  # Check if running
```

---

## 🆓 FREE HOSTING (Limited)

### Option A: Railway.app (Backend)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Deploy the backend folder
4. Get the URL (e.g., `https://zia-api.up.railway.app`)

### Option B: Vercel (Frontend)
1. Go to [vercel.com](https://vercel.com)
2. Import your frontend folder
3. Set environment variable: `REACT_APP_API_URL=https://zia-api.up.railway.app/api`
4. Deploy

**⚠️ Limitations:**
- Railway free tier sleeps after inactivity (slow first load)
- Vercel has bandwidth limits
- Not suitable for production use

---

## 🔧 MANAGING YOUR WEBSITE

### Check if backend is running:
```bash
sudo systemctl status zia-codm
```

### Restart backend:
```bash
sudo systemctl restart zia-codm
```

### View logs:
```bash
# Backend logs
sudo journalctl -u zia-codm -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Update website:
```bash
cd /var/www/zia-codm
# Pull new code or upload new files
cd frontend && npm run build
cd ../backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart zia-codm
```

---

## 📋 CHECKLIST

Before going live:
- [ ] Changed `ADMIN_SECRET_KEY` from default
- [ ] Set `TELEGRAM_BOT_TOKEN` in backend
- [ ] Set up Telegram bot webhook
- [ ] Added your Telegram ID as admin
- [ ] Configured domain (optional)
- [ ] Enabled HTTPS with SSL
- [ ] Tested login with token
- [ ] Tested admin panel access

---

## 💰 COST BREAKDOWN

| Item | Cost |
|------|------|
| VPS (Contabo) | $5.50/month |
| Domain (Namecheap) | $10/year |
| SSL Certificate | Free (Let's Encrypt) |
| **Total First Year** | **~$76** |
| **Monthly After** | **~$5.50** |

---

## 🆘 TROUBLESHOOTING

### "Connection refused" error
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If not running:
sudo systemctl restart zia-codm
```

### "502 Bad Gateway"
```bash
# Nginx can't reach backend
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl restart zia-codm
```

### Frontend shows blank page
```bash
# Rebuild frontend
cd /var/www/zia-codm/frontend
npm run build
```

### Can't login with token
```bash
# Check Telegram bot is running
# Verify token in database
cd /var/www/zia-codm/backend
cat data/users.json
```

---

## 📞 SUPPORT

If you get stuck:
1. Check logs: `sudo journalctl -u zia-codm -n 50`
2. Test backend: `curl http://localhost:5000/api/health`
3. Test frontend: Open browser dev tools (F12) → Network tab
4. Common issues are usually Nginx config or firewall

---

**Ready to deploy? Start with Method 1 (Docker) - it's the easiest!**
