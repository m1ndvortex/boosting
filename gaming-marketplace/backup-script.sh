#!/bin/bash

# Backup script for Gaming Marketplace
set -e

BACKUP_DIR="/var/backups/gaming-marketplace"
APP_DIR="/var/www/gaming-marketplace"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting backup process..."

# Create backup directory if it doesn't exist
sudo mkdir -p $BACKUP_DIR

# Backup application files
echo "📦 Backing up application files..."
sudo tar -czf "$BACKUP_DIR/app-backup-$DATE.tar.gz" -C $APP_DIR .

# Backup Nginx configuration
echo "⚙️ Backing up Nginx configuration..."
sudo cp /etc/nginx/sites-available/gaming-marketplace "$BACKUP_DIR/nginx-config-$DATE.conf"

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
sudo find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
sudo find $BACKUP_DIR -name "*.conf" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/app-backup-$DATE.tar.gz"