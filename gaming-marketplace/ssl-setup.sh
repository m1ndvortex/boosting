#!/bin/bash

# SSL Setup with Let's Encrypt
# Run this after your domain is pointing to your VPS

set -e

echo "🔒 Setting up SSL with Let's Encrypt..."

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
echo "📋 Please enter your domain name (e.g., yourdomain.com):"
read DOMAIN

echo "🔐 Obtaining SSL certificate for $DOMAIN..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

# Set up auto-renewal
echo "⏰ Setting up automatic renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
echo "🧪 Testing certificate renewal..."
sudo certbot renew --dry-run

echo "✅ SSL setup complete!"
echo "🌐 Your site is now accessible at https://$DOMAIN"