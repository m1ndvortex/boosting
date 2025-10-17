#!/bin/bash

# VPS Build and Deploy Script for Gaming Marketplace
# Use this when building directly on the VPS

set -e

echo "🚀 Starting VPS build and deployment..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Installing Node.js and npm..."
    
    # Install Node.js and npm
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    echo "✅ Node.js installed: $(node --version)"
    echo "✅ npm installed: $(npm --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "📦 Building application..."
npm run build

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt update
    sudo apt install nginx -y
fi

# Create web directory if it doesn't exist
sudo mkdir -p /var/www/gaming-marketplace

# Copy built files to web directory
echo "📁 Copying files to web directory..."
sudo cp -r dist/* /var/www/gaming-marketplace/

# Copy and configure Nginx
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/gaming-marketplace

# Enable the site
sudo ln -sf /etc/nginx/sites-available/gaming-marketplace /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data /var/www/gaming-marketplace
sudo chmod -R 755 /var/www/gaming-marketplace

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full' 2>/dev/null || true
sudo ufw allow OpenSSH 2>/dev/null || true

# Restart Nginx
echo "🔄 Starting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Test the deployment
echo "🧪 Testing deployment..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✅ Deployment successful!"
    echo "🌐 Your application is now live at:"
    echo "   http://$(curl -s ifconfig.me 2>/dev/null || echo 'your-server-ip')"
else
    echo "⚠️ Deployment completed but website test failed"
    echo "Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
fi

echo ""
echo "📋 Useful commands:"
echo "   sudo systemctl status nginx    # Check Nginx status"
echo "   sudo nginx -t                  # Test Nginx config"
echo "   sudo systemctl reload nginx   # Reload Nginx"