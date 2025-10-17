#!/bin/bash

# Ubuntu VPS Setup Script for Gaming Marketplace
set -e

echo "🔧 Setting up Ubuntu VPS for Gaming Marketplace..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/gaming-marketplace
sudo chown -R $USER:$USER /var/www/gaming-marketplace

# Install and configure UFW firewall
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ VPS setup complete!"
echo "📋 Next steps:"
echo "1. Upload your deployment package to /var/www/gaming-marketplace"
echo "2. Extract and run the application setup"