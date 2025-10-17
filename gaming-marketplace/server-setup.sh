#!/bin/bash

# Ubuntu VPS Setup Script for Gaming Marketplace
set -e

echo "🔧 Setting up Ubuntu VPS for Gaming Marketplace..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential build tools
echo "📦 Installing build essentials..."
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates

# Install Node.js and npm (using NodeSource repository for latest LTS)
echo "📦 Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation
echo "�  Verifying installations..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Update npm to latest version
echo "📦 Updating npm to latest version..."
sudo npm install -g npm@latest

# Install Nginx
echo "� Instialling Nginx..."
sudo apt install nginx -y

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Verify PM2 installation
echo "PM2 version: $(pm2 --version)"

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/gaming-marketplace
sudo chown -R $USER:$USER /var/www/gaming-marketplace

# Install and configure UFW firewall
echo "🔒 Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create a simple test to verify everything works
echo "🧪 Creating verification test..."
cat > /tmp/test-setup.js << 'EOF'
console.log('✅ Node.js is working!');
console.log('Node version:', process.version);
console.log('npm available:', typeof require !== 'undefined');
EOF

node /tmp/test-setup.js
rm /tmp/test-setup.js

echo ""
echo "✅ VPS setup complete!"
echo "📊 Installation Summary:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo "   - Nginx: $(nginx -v 2>&1)"
echo ""
echo "📋 Next steps:"
echo "1. Upload your deployment package to /var/www/gaming-marketplace"
echo "2. Extract and run the application setup"