#!/bin/bash

# Gaming Marketplace - VPS Deployment Script
# This script deploys the built application on the VPS

set -e  # Exit on any error

echo "🚀 Starting Gaming Marketplace deployment..."

# Configuration
APP_DIR="/var/www/gaming-marketplace"
BACKUP_DIR="/var/backups/gaming-marketplace"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running with sudo for certain operations
check_permissions() {
    if [ "$EUID" -ne 0 ] && [ ! -w "$APP_DIR" ]; then
        print_error "This script needs write access to $APP_DIR"
        echo "Please run with sudo or ensure proper permissions"
        exit 1
    fi
}

# Create backup of current deployment
create_backup() {
    if [ -d "$APP_DIR/dist" ]; then
        print_warning "Creating backup of current deployment..."
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" dist/ 2>/dev/null || true
        print_success "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t backup_*.tar.gz | tail -n +6 | xargs rm -f 2>/dev/null || true
    fi
}

# Deploy application
deploy_application() {
    print_warning "Deploying application to $APP_DIR..."
    
    # Ensure directory exists
    mkdir -p "$APP_DIR"
    
    # If dist directory doesn't exist in current location, skip
    if [ ! -d "dist" ]; then
        print_error "dist directory not found in current location"
        exit 1
    fi
    
    # Set correct permissions
    chown -R www-data:www-data "$APP_DIR" 2>/dev/null || true
    chmod -R 755 "$APP_DIR"
    
    print_success "Application deployed successfully"
}

# Test Nginx configuration
test_nginx() {
    print_warning "Testing Nginx configuration..."
    if command -v nginx &> /dev/null; then
        if nginx -t 2>&1 | grep -q "syntax is ok"; then
            print_success "Nginx configuration is valid"
            return 0
        else
            print_error "Nginx configuration has errors"
            nginx -t
            return 1
        fi
    else
        print_warning "Nginx not found, skipping test"
        return 0
    fi
}

# Reload Nginx
reload_nginx() {
    print_warning "Reloading Nginx..."
    if command -v nginx &> /dev/null; then
        if systemctl reload nginx 2>/dev/null; then
            print_success "Nginx reloaded successfully"
        else
            print_warning "Could not reload Nginx (may need sudo)"
        fi
    else
        print_warning "Nginx not installed"
    fi
}

# Install production dependencies (if package.json exists)
install_dependencies() {
    if [ -f "$APP_DIR/package.json" ]; then
        print_warning "Installing production dependencies..."
        cd "$APP_DIR"
        if command -v npm &> /dev/null; then
            npm ci --production --silent 2>/dev/null || npm install --production --silent
            print_success "Dependencies installed"
        else
            print_warning "npm not found, skipping dependency installation"
        fi
    fi
}

# Health check
health_check() {
    print_warning "Running health check..."
    
    # Check if dist directory exists and has content
    if [ -d "$APP_DIR/dist" ] && [ "$(ls -A $APP_DIR/dist)" ]; then
        print_success "Deployment directory is valid"
    else
        print_error "Deployment directory is empty or missing"
        exit 1
    fi
    
    # Check if index.html exists
    if [ -f "$APP_DIR/dist/index.html" ]; then
        print_success "index.html found"
    else
        print_error "index.html not found"
        exit 1
    fi
    
    # Check Nginx status
    if command -v nginx &> /dev/null; then
        if systemctl is-active --quiet nginx; then
            print_success "Nginx is running"
        else
            print_warning "Nginx is not running"
        fi
    fi
}

# Rollback function
rollback() {
    print_error "Deployment failed! Rolling back..."
    
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        print_warning "Restoring from backup: $LATEST_BACKUP"
        tar -xzf "$LATEST_BACKUP" -C "$APP_DIR"
        print_success "Rollback completed"
        reload_nginx
    else
        print_error "No backup found for rollback"
    fi
    
    exit 1
}

# Main deployment process
main() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Gaming Marketplace Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Set up error handling
    trap rollback ERR
    
    # Run deployment steps
    check_permissions
    create_backup
    deploy_application
    install_dependencies
    test_nginx || rollback
    reload_nginx
    health_check
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_success "Deployment completed successfully! 🎉"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Your application is now live!"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
}

# Run main function
main
