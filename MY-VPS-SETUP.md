# 🚀 Your VPS Setup Guide

## Your VPS Details
```
IP: 46.101.85.249
Username: root
Password: $c3%RjXA)DF+STB
```

---

## Step 1: Connect to Your VPS

```bash
ssh root@46.101.85.249
# When prompted for password, enter: $c3%RjXA)DF+STB
```

---

## Step 2: Run This Setup Script on VPS

After connecting, copy and paste this ENTIRE script:

```bash
#!/bin/bash
# One-command VPS setup

echo "🚀 Setting up Gaming Marketplace VPS..."

# Update system
apt update && apt upgrade -y

# Install Nginx
apt install nginx -y
systemctl enable nginx
systemctl start nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Create directories
mkdir -p /var/www/gaming-marketplace/dist
mkdir -p /var/backups/gaming-marketplace
chown -R www-data:www-data /var/www/gaming-marketplace
chmod -R 755 /var/www/gaming-marketplace

# Configure Nginx
cat > /etc/nginx/sites-available/gaming-marketplace << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /var/www/gaming-marketplace/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/gaming-marketplace /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Configure firewall
ufw allow 'Nginx Full'
ufw allow OpenSSH
echo "y" | ufw enable

# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f /root/.ssh/github_deploy -N ""
cat /root/.ssh/github_deploy.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy this SSH PRIVATE KEY for GitHub:"
echo ""
cat /root/.ssh/github_deploy
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your site will be at: http://46.101.85.249"
```

After pasting, press Enter to run it. **Copy the SSH key it displays!**

---

## Step 3: Add Secrets to GitHub

1. Go to: https://github.com/m1ndvortex/boosting/settings/secrets/actions

2. Click "New repository secret" and add these **4 secrets**:

### Secret 1: VPS_HOST
```
Name: VPS_HOST
Value: 46.101.85.249
```

### Secret 2: VPS_USERNAME
```
Name: VPS_USERNAME
Value: root
```

### Secret 3: VPS_SSH_KEY
```
Name: VPS_SSH_KEY
Value: [Paste the ENTIRE private key from Step 2, including BEGIN/END lines]
```

### Secret 4: VPS_PORT
```
Name: VPS_PORT
Value: 22
```

---

## Step 4: Push Your Code

```bash
cd /home/crystalah/kiro/boosting
git add .
git commit -m "Setup auto-deployment"
git push origin main
```

---

## Step 5: Watch It Deploy

1. Go to: https://github.com/m1ndvortex/boosting/actions
2. You'll see the deployment running
3. Wait 3-5 minutes for green checkmark ✅
4. Visit: **http://46.101.85.249**

Your site is LIVE! 🎉

---

## Future Deployments (After Setup)

Just push your code:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Your site updates automatically in 3-5 minutes!

---

## Quick Commands

### Check if site is working
```bash
curl http://46.101.85.249
```

### View logs on VPS
```bash
ssh root@46.101.85.249
tail -f /var/log/nginx/access.log
```

### Check deployed files
```bash
ssh root@46.101.85.249
ls -la /var/www/gaming-marketplace/dist
```

---

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs at: https://github.com/m1ndvortex/boosting/actions
2. Verify all 4 secrets are correctly added
3. Make sure the SSH key is complete (including BEGIN/END lines)

### If site doesn't load:
```bash
ssh root@46.101.85.249
systemctl status nginx
nginx -t
```

### Need to redeploy manually:
```bash
# On local machine
cd /home/crystalah/kiro/boosting/gaming-marketplace
npm run build
tar -czf deploy.tar.gz dist/

# Upload to VPS
scp deploy.tar.gz root@46.101.85.249:/tmp/

# On VPS
ssh root@46.101.85.249
tar -xzf /tmp/deploy.tar.gz -C /var/www/gaming-marketplace
systemctl reload nginx
```

---

## Summary

**Setup time:** ~15 minutes (one time)
**Future deployments:** Automatic! Just `git push`
**Your live site:** http://46.101.85.249

---

**Questions?** 
- Check if Nginx is running: `systemctl status nginx`
- Check deployment folder: `ls /var/www/gaming-marketplace/dist`
- View errors: `tail /var/log/nginx/error.log`
