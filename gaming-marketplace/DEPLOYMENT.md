# Gaming Marketplace Deployment Guide

## Quick Start

### 1. Build and Package (Local Machine)
```bash
cd gaming-marketplace
chmod +x deploy.sh
./deploy.sh
```

### 2. Upload to VPS
```bash
# Replace with your VPS details
scp gaming-marketplace-*.tar.gz user@your-vps-ip:/home/user/
```

### 3. Setup VPS (First Time Only)
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Run setup script
chmod +x server-setup.sh
./server-setup.sh
```

### 4. Deploy Application
```bash
# Extract deployment package
sudo tar -xzf gaming-marketplace-*.tar.gz -C /var/www/gaming-marketplace

# Deploy
cd /var/www/gaming-marketplace
chmod +x vps-deploy.sh
./vps-deploy.sh
```

## Production Optimizations

### Environment Variables
Create `.env.production` for production settings:
```
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Performance Monitoring
- Monitor with `htop` and `nginx status`
- Set up log rotation for Nginx logs
- Use `pm2 monit` if using Node.js backend

### Security Checklist
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication only
- [ ] Regular security updates
- [ ] SSL certificate installed
- [ ] Security headers configured

### Backup Strategy
```bash
# Create backup script
sudo crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Common Issues
1. **Permission denied**: Check file ownership with `ls -la`
2. **Nginx 502 error**: Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
3. **Build fails**: Ensure Node.js version compatibility

### Useful Commands
```bash
# Check application status
sudo systemctl status nginx
sudo nginx -t

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
```