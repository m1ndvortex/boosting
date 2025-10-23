# 🚀 Quick Start - Auto Deployment

## 1️⃣ On Your VPS (One-time setup)

```bash
# Upload and run setup script
scp gaming-marketplace/setup-vps.sh user@your-vps-ip:~/
ssh user@your-vps-ip
sudo bash setup-vps.sh
```

**The script will display your SSH private key** - Copy it!

## 2️⃣ On GitHub (One-time setup)

Go to: **Your Repo → Settings → Secrets and variables → Actions → New repository secret**

Add these 4 secrets:

| Secret Name      | Value                          |
|------------------|--------------------------------|
| `VPS_HOST`       | Your VPS IP (e.g., 123.45.67.89) |
| `VPS_USERNAME`   | Your VPS username (e.g., ubuntu) |
| `VPS_SSH_KEY`    | The private key from step 1    |
| `VPS_PORT`       | 22 (or your SSH port)          |

## 3️⃣ Push Your Code

```bash
cd /home/crystalah/kiro/boosting
git add .
git commit -m "Add auto-deployment"
git push origin main
```

## ✅ Done!

- Go to **GitHub → Actions** to watch deployment
- Your site will be live at `http://your-vps-ip` in 2-5 minutes
- Every future push to `main` auto-deploys! 🎉

---

## 📝 Quick Commands

### Check deployment status
```bash
# On GitHub
GitHub → Your Repo → Actions tab

# On VPS
ssh user@your-vps-ip
ls -la /var/www/gaming-marketplace/dist
sudo systemctl status nginx
```

### View logs
```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Manual deployment (if needed)
```bash
cd gaming-marketplace
npm run build
tar -czf deploy.tar.gz dist/
scp deploy.tar.gz user@your-vps-ip:/tmp/
ssh user@your-vps-ip "sudo tar -xzf /tmp/deploy.tar.gz -C /var/www/gaming-marketplace && sudo systemctl reload nginx"
```

---

## 🔧 Troubleshooting

**Deployment fails?**
- Check GitHub Actions logs
- Verify secrets are correct
- Ensure VPS has enough disk space: `df -h`

**Site not updating?**
- Hard refresh browser: `Ctrl + Shift + R`
- Check Nginx logs
- Verify files deployed: `ls -la /var/www/gaming-marketplace/dist`

**Permission errors?**
```bash
sudo chown -R www-data:www-data /var/www/gaming-marketplace
sudo chmod -R 755 /var/www/gaming-marketplace
```

---

## 🎯 Workflow Summary

```
┌──────────────┐
│  Developer   │  git push origin main
│  Local Code  │ ────────────────────────┐
└──────────────┘                         │
                                         ▼
                              ┌─────────────────┐
                              │  GitHub Actions │
                              │  - Build        │
                              │  - Test         │
                              │  - Package      │
                              └────────┬────────┘
                                       │ SCP/SSH
                                       ▼
                              ┌─────────────────┐
                              │   VPS Server    │
                              │  - Extract      │
                              │  - Deploy       │
                              │  - Reload Nginx │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  Live Website   │
                              │  Updated! 🎉    │
                              └─────────────────┘
```

**Time:** 2-5 minutes per deployment
**Manual work:** Zero! Just push your code.
