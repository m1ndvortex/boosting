#!/bin/bash

# Quick Setup Script for VPS
# Run this on your VPS to prepare for automatic deployments

set -e

echo "🚀 Gaming Marketplace VPS Setup"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo: sudo bash setup-vps.sh"
    exit 1
fi

# Update system
echo "Step 1: Updating system..."
apt update && apt upgrade -y
print_success "System updated"

# Install Nginx
echo ""
echo "Step 2: Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx installed and started"
else
    print_warning "Nginx already installed"
fi

# Install Node.js (optional, for backend or build tools)
echo ""
echo "Step 3: Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    print_success "Node.js installed: $(node --version)"
else
    print_warning "Node.js already installed: $(node --version)"
fi

# Create deployment directory
echo ""
echo "Step 4: Creating deployment directory..."
mkdir -p /var/www/gaming-marketplace/dist
mkdir -p /var/backups/gaming-marketplace
chown -R www-data:www-data /var/www/gaming-marketplace
chmod -R 755 /var/www/gaming-marketplace
print_success "Directories created"

# Configure Nginx
echo ""
echo "Step 5: Configuring Nginx..."
read -p "Enter your domain name (or press Enter to use server IP): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="_"  # Default server
fi

cat > /etc/nginx/sites-available/gaming-marketplace << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root /var/www/gaming-marketplace/dist;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/gaming-marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default  # Remove default site
nginx -t
systemctl reload nginx
print_success "Nginx configured"

# Configure firewall
echo ""
echo "Step 6: Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    echo "y" | ufw enable || true
    print_success "Firewall configured"
else
    print_warning "UFW not installed, skipping firewall setup"
fi

# Generate SSH key for GitHub Actions
echo ""
echo "Step 7: Generating SSH key for GitHub Actions..."
read -p "Enter username for SSH key (default: current user): " SSH_USER
SSH_USER=${SSH_USER:-$SUDO_USER}

if [ ! -f "/home/$SSH_USER/.ssh/github_deploy" ]; then
    sudo -u $SSH_USER ssh-keygen -t ed25519 -C "github-actions-deploy" -f "/home/$SSH_USER/.ssh/github_deploy" -N ""
    cat "/home/$SSH_USER/.ssh/github_deploy.pub" >> "/home/$SSH_USER/.ssh/authorized_keys"
    chmod 600 "/home/$SSH_USER/.ssh/authorized_keys"
    chown $SSH_USER:$SSH_USER "/home/$SSH_USER/.ssh/authorized_keys"
    print_success "SSH key generated"
else
    print_warning "SSH key already exists"
fi

# Install Certbot (for SSL)
echo ""
read -p "Do you want to install SSL certificate? (y/n): " INSTALL_SSL
if [ "$INSTALL_SSL" = "y" ] || [ "$INSTALL_SSL" = "Y" ]; then
    if [ "$DOMAIN" != "_" ]; then
        apt install certbot python3-certbot-nginx -y
        print_success "Certbot installed"
        echo ""
        print_warning "Run this command to get SSL certificate:"
        echo "sudo certbot --nginx -d $DOMAIN"
    else
        print_warning "Cannot install SSL without a domain name"
    fi
fi

# Display SSH private key
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Setup completed successfully! 🎉"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo ""
echo "1. Copy the SSH PRIVATE KEY below and add it to GitHub:"
echo "   GitHub → Settings → Secrets → New secret"
echo "   Name: VPS_SSH_KEY"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "/home/$SSH_USER/.ssh/github_deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2. Also add these GitHub Secrets:"
echo "   VPS_HOST: $(curl -s ifconfig.me)"
echo "   VPS_USERNAME: $SSH_USER"
echo "   VPS_PORT: 22"
echo ""
echo "3. Push your code to GitHub main branch"
echo ""
echo "Your site will be available at:"
if [ "$DOMAIN" != "_" ]; then
    echo "   http://$DOMAIN"
else
    echo "   http://$(curl -s ifconfig.me)"
fi
echo ""
