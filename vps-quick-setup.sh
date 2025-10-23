#!/bin/bash
# Quick VPS setup - paste this entire script on your VPS

set -e
echo "🚀 Setting up your VPS..."

# Update
apt update -y && apt upgrade -y

# Install Nginx
apt install nginx -y
systemctl enable nginx
systemctl start nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Create directories
mkdir -p /var/www/gaming-marketplace/dist
mkdir -p /var/backups/gaming-marketplace
chown -R www-data:www-data /var/www/gaming-marketplace

# Configure Nginx
cat > /etc/nginx/sites-available/gaming-marketplace << 'ENDOFNGINX'
server {
    listen 80;
    server_name _;
    root /var/www/gaming-marketplace/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
ENDOFNGINX

ln -sf /etc/nginx/sites-available/gaming-marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
yes | ufw enable

# Generate SSH key
ssh-keygen -t ed25519 -C "github" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

echo ""
echo "=========================================="
echo "COPY THIS KEY TO GITHUB:"
echo "=========================================="
cat ~/.ssh/github_deploy
echo "=========================================="
echo "Done! Site will be at: http://46.101.85.249"
