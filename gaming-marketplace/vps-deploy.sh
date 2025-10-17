#!/bin/bash

# VPS Application Deployment Script
# Run this script on your VPS after uploading the deployment package

set -e

APP_DIR="/var/www/gaming-marketplace"
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo "🚀 Deploying Gaming Marketplace on VPS..."

# Navigate to application directory
cd $APP_DIR

# Copy Nginx configuration
echo "⚙️ Configuring Nginx..."
sudo cp nginx.conf $NGINX_SITES/gaming-marketplace

# Enable the site
sudo ln -sf $NGINX_SITES/gaming-marketplace $NGINX_ENABLED/

# Remove default Nginx site if it exists
sudo rm -f $NGINX_ENABLED/default

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data $APP_DIR/dist
sudo chmod -R 755 $APP_DIR/dist

# Check if everything is running
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "   http://your-server-ip"
echo ""
echo "📋 Next steps:"
echo "1. Point your domain to this server's IP"
echo "2. Update nginx.conf with your domain name"
echo "3. Set up SSL with Let's Encrypt (optional but recommended)"
echo ""
echo "🔧 Useful commands:"
echo "   sudo systemctl status nginx    # Check Nginx status"
echo "   sudo nginx -t                  # Test Nginx config"
echo "   sudo systemctl reload nginx   # Reload Nginx config"