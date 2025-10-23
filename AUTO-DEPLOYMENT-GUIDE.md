# 🚀 Automatic Deployment Setup Guide

This guide will help you set up automatic deployment from GitHub to your VPS. Every time you push to the `main` branch, your project will automatically build and deploy to your VPS.

## Prerequisites

- A VPS with SSH access
- GitHub repository
- Domain name (optional, but recommended)

## Step 1: Prepare Your VPS

### 1.1 Connect to your VPS
```bash
ssh your-username@your-vps-ip
```

### 1.2 Install required software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Node.js (if needed for backend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
nginx -v
node --version
npm --version
```

### 1.3 Create deployment directory
```bash
sudo mkdir -p /var/www/gaming-marketplace
sudo chown -R www-data:www-data /var/www/gaming-marketplace
```

### 1.4 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/gaming-marketplace
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain or VPS IP
    
    root /var/www/gaming-marketplace/dist;
    index index.html;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    location / {
        try_files $uri $uri/ /index.html;
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
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/gaming-marketplace /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 1.5 Configure Firewall
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Step 2: Generate SSH Key for GitHub Actions

### 2.1 On your VPS, create a deployment SSH key
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

Press Enter for no passphrase (required for automation).

### 2.2 Add the public key to authorized_keys
```bash
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3 Display the private key (you'll need this for GitHub)
```bash
cat ~/.ssh/github_deploy
```

**Copy the entire private key** (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

## Step 3: Configure GitHub Repository Secrets

### 3.1 Go to your GitHub repository
Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 3.2 Add these secrets:

1. **VPS_HOST**
   - Value: Your VPS IP address (e.g., `123.45.67.89`)

2. **VPS_USERNAME**
   - Value: Your VPS username (e.g., `ubuntu` or `root`)

3. **VPS_SSH_KEY**
   - Value: The private key you copied in Step 2.3
   - Paste the entire key including headers

4. **VPS_PORT** (optional)
   - Value: SSH port (default is `22`)
   - Only add if you're using a non-standard port

## Step 4: Push GitHub Actions Workflow

The workflow file is already created at `.github/workflows/deploy.yml`. 

### 4.1 Commit and push the workflow
```bash
cd /home/crystalah/kiro/boosting
git add .github/workflows/deploy.yml
git add gaming-marketplace/  # Include your latest changes
git commit -m "Add automatic deployment workflow"
git push origin main
```

### 4.2 Verify deployment
Go to your GitHub repository → **Actions** tab. You should see the deployment workflow running.

## Step 5: Install SSL Certificate (Recommended)

### 5.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 5.2 Obtain SSL certificate
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically update your Nginx configuration.

### 5.3 Set up auto-renewal
```bash
sudo certbot renew --dry-run
```

## How It Works

1. **Developer pushes to `main` branch** → Triggers GitHub Actions
2. **GitHub Actions runs**:
   - Checks out code
   - Installs dependencies
   - Builds the project (`npm run build`)
   - Creates deployment package
   - Uploads to VPS via SCP
3. **VPS receives package**:
   - Extracts files to `/var/www/gaming-marketplace/dist`
   - Sets correct permissions
   - Reloads Nginx
4. **Website is live** with latest changes!

## Testing Your Setup

### Test 1: Make a small change
```bash
# Edit a file
echo "<!-- Build test -->" >> gaming-marketplace/index.html

# Commit and push
git add .
git commit -m "Test auto-deployment"
git push origin main
```

### Test 2: Check GitHub Actions
- Go to GitHub → Actions tab
- Watch the deployment run
- It should complete successfully in 2-5 minutes

### Test 3: Verify on VPS
```bash
ssh your-username@your-vps-ip
cat /var/www/gaming-marketplace/dist/index.html | grep "Build test"
```

## Monitoring & Logs

### Check deployment logs on GitHub
- Go to **Actions** tab in your repository
- Click on the latest workflow run
- Expand each step to see detailed logs

### Check Nginx logs on VPS
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Check deployment directory
```bash
ls -la /var/www/gaming-marketplace/dist
```

## Troubleshooting

### Issue: SSH connection fails
**Solution:** Verify SSH key is correctly added to GitHub secrets and VPS authorized_keys
```bash
# On VPS, check authorized_keys
cat ~/.ssh/authorized_keys

# Test SSH connection locally
ssh -i ~/.ssh/github_deploy your-username@your-vps-ip
```

### Issue: Permission denied errors
**Solution:** Fix directory permissions
```bash
sudo chown -R www-data:www-data /var/www/gaming-marketplace
sudo chmod -R 755 /var/www/gaming-marketplace
```

### Issue: Nginx shows old version
**Solution:** Clear browser cache or hard refresh (Ctrl+Shift+R)

### Issue: Build fails in GitHub Actions
**Solution:** Check the Actions logs and ensure:
- `package.json` has correct build script
- All dependencies are listed
- Node version matches (18.x)

## Advanced: Environment Variables

### On VPS, create environment file
```bash
sudo nano /var/www/gaming-marketplace/.env.production
```

Add your production variables:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Update GitHub Actions workflow to use secrets
In `.github/workflows/deploy.yml`, add environment variables:
```yaml
- name: Build project
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
    VITE_APP_ENV: production
  run: |
    cd gaming-marketplace
    npm run build
```

## Manual Deployment (Backup Method)

If automatic deployment fails, you can always deploy manually:

```bash
# On local machine
cd gaming-marketplace
npm run build
tar -czf deploy.tar.gz dist/ nginx.conf

# Upload to VPS
scp deploy.tar.gz your-username@your-vps-ip:/tmp/

# On VPS
ssh your-username@your-vps-ip
sudo tar -xzf /tmp/deploy.tar.gz -C /var/www/gaming-marketplace
sudo systemctl reload nginx
```

## Security Best Practices

1. **Never commit secrets to Git**
   - Use GitHub Secrets for sensitive data
   - Add `.env*` to `.gitignore`

2. **Use SSH keys instead of passwords**
   - Already configured in this setup

3. **Keep VPS updated**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Enable automatic security updates**
   ```bash
   sudo apt install unattended-upgrades -y
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

5. **Monitor failed login attempts**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

## Success! 🎉

Your project is now set up for automatic deployment. Every push to `main` will:
- ✅ Build your project
- ✅ Deploy to your VPS
- ✅ Update your live website
- ✅ Take only 2-5 minutes

**Access your site:** `http://your-vps-ip` or `https://your-domain.com` (if SSL configured)

Need help? Check the GitHub Actions logs or VPS logs for detailed error messages.
