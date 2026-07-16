#!/bin/bash
# ZIA CODM - Easy Website Deployment Script

echo "🎮 ZIA CODM Website Deployment"
echo "=============================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo "⚠️  Please run as root or with sudo"
   exit 1
fi

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
apt install -y python3 python3-pip python3-venv nodejs npm nginx git certbot python3-certbot-nginx

# Create app directory
mkdir -p /var/www/zia-codm
cd /var/www/zia-codm

# Clone or copy your project
echo "📁 Setting up project..."
# If you uploaded the zip:
# unzip /path/to/zia-codm-web-complete.zip -d .

# Setup Python backend
echo "🐍 Setting up Python backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Build frontend
echo "⚛️  Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Setup Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/zia-codm << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_HERE;

    # Frontend
    location / {
        root /var/www/zia-codm/frontend/build;
        try_files $uri /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support (for live updates)
    location /socket.io {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/zia-codm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Setup systemd service for backend
echo "⚙️  Creating backend service..."
cat > /etc/systemd/system/zia-codm.service << 'EOF'
[Unit]
Description=ZIA CODM Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/zia-codm/backend
Environment="PATH=/var/www/zia-codm/backend/venv/bin"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/var/www/zia-codm/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable zia-codm
systemctl start zia-codm

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo ""
echo "✅ Deployment Complete!"
echo "========================"
echo "🌐 Your website should be accessible at: http://YOUR_DOMAIN_HERE"
echo ""
echo "Next steps:"
echo "1. Replace YOUR_DOMAIN_HERE in /etc/nginx/sites-available/zia-codm"
echo "2. Run: certbot --nginx -d YOUR_DOMAIN_HERE (for HTTPS)"
echo "3. Edit backend/app.py and set your TELEGRAM_BOT_TOKEN"
echo "4. Restart: systemctl restart zia-codm"
echo ""
echo "Commands to manage:"
echo "  sudo systemctl status zia-codm    # Check backend status"
echo "  sudo systemctl restart zia-codm   # Restart backend"
echo "  sudo tail -f /var/log/nginx/error.log  # Check Nginx errors"
