# 🎯 Complete Auto-Deployment Setup

## What You Get

✅ **Push to GitHub → Automatically deploy to VPS**
✅ **No manual uploading ever again**
✅ **2-5 minute deployment time**
✅ **Automatic backups before each deploy**
✅ **Rollback capability if something fails**

---

## 📋 Step-by-Step Guide

### Part 1: Setup Your VPS (Do Once)

#### 1. Upload the setup script to your VPS
```bash
# From your local machine (in gaming-marketplace folder)
scp setup-vps.sh your-username@your-vps-ip:~/
```

#### 2. Run the setup script on VPS
```bash
# SSH into your VPS
ssh your-username@your-vps-ip

# Run the setup script
sudo bash setup-vps.sh
```

**The script will:**
- ✅ Install Nginx
- ✅ Install Node.js  
- ✅ Create deployment directories
- ✅ Configure Nginx
- ✅ Setup firewall
- ✅ Generate SSH key for GitHub
- ✅ Display the SSH private key

#### 3. Copy the SSH Private Key
At the end of the script, you'll see something like:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUA...
(many lines of text)
...KjRUoHBQAAAA1naXRodWItYWN0aW9ucw==
-----END OPENSSH PRIVATE KEY-----
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy the ENTIRE key** including the `BEGIN` and `END` lines!

---

### Part 2: Configure GitHub (Do Once)

#### 1. Go to your GitHub repository
Navigate to: `https://github.com/YOUR-USERNAME/YOUR-REPO`

#### 2. Open Secrets settings
Click: **Settings** → **Secrets and variables** → **Actions**

#### 3. Add 4 secrets
Click **"New repository secret"** for each:

**Secret 1: VPS_HOST**
```
Name: VPS_HOST
Value: 123.45.67.89    (your actual VPS IP address)
```

**Secret 2: VPS_USERNAME**
```
Name: VPS_USERNAME  
Value: ubuntu          (or your actual SSH username)
```

**Secret 3: VPS_SSH_KEY**
```
Name: VPS_SSH_KEY
Value: (paste the entire private key you copied in Part 1, Step 3)
```

**Secret 4: VPS_PORT**
```
Name: VPS_PORT
Value: 22              (or your custom SSH port)
```

#### 4. Verify secrets are added
You should see 4 secrets listed:
- ✅ VPS_HOST
- ✅ VPS_USERNAME  
- ✅ VPS_SSH_KEY
- ✅ VPS_PORT

---

### Part 3: Push Your Code (Every Time You Want to Deploy)

```bash
# Make changes to your code
cd /home/crystalah/kiro/boosting

# Add all changes
git add .

# Commit with a message
git commit -m "Your changes description"

# Push to GitHub main branch (this triggers deployment!)
git push origin main
```

**That's it!** The deployment happens automatically.

---

## 🎬 Watch It Deploy

### On GitHub:
1. Go to your repository
2. Click **"Actions"** tab
3. You'll see the deployment running
4. It turns green ✅ when complete (2-5 minutes)

### On Your VPS:
```bash
# SSH into VPS
ssh your-username@your-vps-ip

# Watch the deployment directory
watch -n 1 "ls -lh /var/www/gaming-marketplace/dist"

# Or check Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

## 🌐 Access Your Live Site

After deployment completes:
- **Without domain:** `http://YOUR-VPS-IP`
- **With domain:** `http://yourdomain.com`

---

## 🔐 Optional: Add SSL Certificate (HTTPS)

On your VPS, run:
```bash
# Install Certbot (if not already done by setup-vps.sh)
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Your site will now be `https://yourdomain.com` 🔒

---

## 📊 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  YOU: Edit code locally                                 │
│  $ git push origin main                                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  GITHUB: Receives push to main branch                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS: Starts deployment workflow             │
│  ├─ Checkout code                                       │
│  ├─ Install Node.js 18                                  │
│  ├─ Install dependencies (npm ci)                       │
│  ├─ Build project (npm run build)                       │
│  ├─ Create deployment package (tar.gz)                  │
│  └─ Upload to VPS via SCP                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  VPS: Receives deployment package                       │
│  ├─ Create backup of current version                    │
│  ├─ Extract new files to /var/www/gaming-marketplace    │
│  ├─ Set proper permissions                              │
│  ├─ Test Nginx configuration                            │
│  └─ Reload Nginx (serves new version)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  LIVE WEBSITE: Your changes are now live! 🎉           │
│  http://your-vps-ip or https://yourdomain.com           │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Common Issues & Solutions

### Issue: "Host key verification failed"
**Solution:** SSH into your VPS manually once to add it to known_hosts
```bash
ssh your-username@your-vps-ip
# Type 'yes' when prompted
exit
```

### Issue: "Permission denied (publickey)"  
**Solution:** Verify the SSH key in GitHub secrets matches the one on VPS
```bash
# On VPS, display the private key again
cat ~/.ssh/github_deploy
```

### Issue: Deployment succeeds but site shows old version
**Solution:** Clear browser cache
- Hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or open in incognito/private window

### Issue: "Nginx configuration test failed"
**Solution:** Check Nginx config syntax
```bash
ssh your-username@your-vps-ip
sudo nginx -t
```

### Issue: Build fails with "not found" errors
**Solution:** Ensure all dependencies are in package.json
```bash
cd /home/crystalah/kiro/boosting/gaming-marketplace
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

---

## 🎓 Understanding the Files

### `.github/workflows/deploy.yml`
- **What:** GitHub Actions workflow configuration
- **When:** Runs automatically on every push to `main` branch
- **Does:** Builds your project and deploys it to VPS

### `setup-vps.sh`
- **What:** One-time VPS setup script
- **When:** Run once when setting up a new VPS
- **Does:** Installs Nginx, Node.js, creates directories, generates SSH key

### `vps-deploy-improved.sh`
- **What:** Deployment script that runs on VPS
- **When:** Called automatically by GitHub Actions
- **Does:** Extracts files, sets permissions, reloads Nginx

---

## 📈 Benefits of This Setup

| Before | After |
|--------|-------|
| Build locally | Build automatically on GitHub |
| Manually upload via SCP/FTP | Automatic upload |
| SSH into VPS to extract files | Automatic extraction |
| Manually reload Nginx | Automatic reload |
| Takes 10-15 minutes | Takes 2-5 minutes |
| Prone to human error | Consistent every time |
| No backup | Automatic backup before each deploy |
| No rollback capability | Automatic rollback on failure |

---

## 🚀 You're All Set!

From now on, deploying is as simple as:
```bash
git add .
git commit -m "New feature"
git push origin main
```

Wait 2-5 minutes, and your changes are LIVE! 🎉

Need help? Check:
1. **GitHub Actions logs:** See what went wrong in the build/deploy
2. **VPS logs:** `sudo tail -f /var/log/nginx/error.log`
3. **This guide:** Re-read the troubleshooting section

---

## 📞 Quick Reference Commands

```bash
# View deployment logs on VPS
ssh your-username@your-vps-ip
sudo tail -f /var/log/nginx/access.log

# Check deployment directory
ls -la /var/www/gaming-marketplace/dist

# Restart Nginx manually
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx

# View GitHub Actions logs
# Go to: https://github.com/YOUR-USERNAME/YOUR-REPO/actions

# Manual deployment (emergency)
cd gaming-marketplace
npm run build
tar -czf deploy.tar.gz dist/
scp deploy.tar.gz user@vps:/tmp/
ssh user@vps "sudo tar -xzf /tmp/deploy.tar.gz -C /var/www/gaming-marketplace && sudo systemctl reload nginx"
```

---

**Last Updated:** October 2025
**Author:** Auto-Deployment Setup Guide
**Version:** 1.0
