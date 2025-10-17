#!/bin/bash

# Simple monitoring script for Gaming Marketplace
set -e

echo "🔍 Gaming Marketplace Health Check"
echo "=================================="

# Check Nginx status
echo "📊 Nginx Status:"
if sudo systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
    sudo systemctl status nginx
fi

# Check disk usage
echo ""
echo "💾 Disk Usage:"
df -h /var/www/gaming-marketplace

# Check memory usage
echo ""
echo "🧠 Memory Usage:"
free -h

# Check recent Nginx access logs
echo ""
echo "📋 Recent Access (last 10 requests):"
sudo tail -n 10 /var/log/nginx/access.log

# Check for Nginx errors
echo ""
echo "⚠️ Recent Errors (if any):"
sudo tail -n 5 /var/log/nginx/error.log 2>/dev/null || echo "No recent errors"

# Test website response
echo ""
echo "🌐 Website Response Test:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✅ Website is responding (HTTP 200)"
else
    echo "❌ Website is not responding properly"
fi

echo ""
echo "✅ Health check completed"