# ✅ Auto-Deployment Setup Checklist

Copy this checklist and mark items as you complete them!

---

## 🎯 Phase 1: VPS Setup (15 minutes)

- [ ] **1.1** Connect to VPS: `ssh your-username@your-vps-ip`
- [ ] **1.2** Upload setup script: `scp setup-vps.sh user@vps:~/`
- [ ] **1.3** Run setup script: `sudo bash setup-vps.sh`
- [ ] **1.4** Copy the SSH private key displayed at the end (entire key including BEGIN/END lines)
- [ ] **1.5** Note your VPS IP address: ________________
- [ ] **1.6** Note your VPS username: ________________

---

## 🎯 Phase 2: GitHub Configuration (5 minutes)

- [ ] **2.1** Go to GitHub repository: `Settings → Secrets and variables → Actions`
- [ ] **2.2** Click "New repository secret"
- [ ] **2.3** Add `VPS_HOST` secret (your VPS IP)
- [ ] **2.4** Add `VPS_USERNAME` secret (your SSH username)
- [ ] **2.5** Add `VPS_SSH_KEY` secret (paste the entire private key)
- [ ] **2.6** Add `VPS_PORT` secret (usually `22`)
- [ ] **2.7** Verify all 4 secrets are listed in GitHub

---

## 🎯 Phase 3: First Deployment (5 minutes)

- [ ] **3.1** Go to local project: `cd /home/crystalah/kiro/boosting`
- [ ] **3.2** Check current branch: `git branch` (should be on `main`)
- [ ] **3.3** Add workflow file: `git add .github/workflows/deploy.yml`
- [ ] **3.4** Add setup scripts: `git add gaming-marketplace/*.sh`
- [ ] **3.5** Add documentation: `git add *.md`
- [ ] **3.6** Commit changes: `git commit -m "Add auto-deployment setup"`
- [ ] **3.7** Push to GitHub: `git push origin main`
- [ ] **3.8** Go to GitHub → Actions tab
- [ ] **3.9** Watch deployment run (should complete in 2-5 minutes)
- [ ] **3.10** Deployment shows green checkmark ✅

---

## 🎯 Phase 4: Verification (5 minutes)

- [ ] **4.1** Open browser and visit: `http://YOUR-VPS-IP`
- [ ] **4.2** Website loads correctly
- [ ] **4.3** SSH into VPS: `ssh your-username@your-vps-ip`
- [ ] **4.4** Check files exist: `ls -la /var/www/gaming-marketplace/dist`
- [ ] **4.5** Check Nginx status: `sudo systemctl status nginx`
- [ ] **4.6** View access logs: `sudo tail /var/log/nginx/access.log`
- [ ] **4.7** Exit VPS: `exit`

---

## 🎯 Phase 5: SSL Certificate (Optional, 10 minutes)

- [ ] **5.1** Have a domain name pointed to your VPS IP
- [ ] **5.2** SSH into VPS
- [ ] **5.3** Install Certbot: `sudo apt install certbot python3-certbot-nginx -y`
- [ ] **5.4** Get certificate: `sudo certbot --nginx -d yourdomain.com`
- [ ] **5.5** Follow Certbot prompts
- [ ] **5.6** Visit `https://yourdomain.com` (should show 🔒)
- [ ] **5.7** Test auto-renewal: `sudo certbot renew --dry-run`

---

## 🎯 Phase 6: Test Auto-Deployment (5 minutes)

- [ ] **6.1** Make a small change to your code locally
- [ ] **6.2** Commit: `git commit -am "Test auto-deployment"`
- [ ] **6.3** Push: `git push origin main`
- [ ] **6.4** Go to GitHub Actions and watch it deploy
- [ ] **6.5** Wait for green checkmark ✅
- [ ] **6.6** Refresh your website (Ctrl+Shift+R)
- [ ] **6.7** Verify your change appears on the live site

---

## ✅ Success Criteria

You're all set when:
- ✅ GitHub Actions shows green checkmark after pushing
- ✅ Website loads at `http://your-vps-ip`
- ✅ Changes you push appear on the site within 5 minutes
- ✅ No errors in GitHub Actions logs
- ✅ No errors in Nginx logs on VPS

---

## 📋 Your Configuration

Record your setup details here for future reference:

```
VPS IP Address: ________________
VPS Username: ________________
VPS SSH Port: ________________
Domain Name (if any): ________________
GitHub Repository: ________________
Deployment Branch: main
Deployment Directory: /var/www/gaming-marketplace
```

---

## 🚨 Troubleshooting Quick Links

If something goes wrong, check:

1. **GitHub Actions Logs**
   - Go to: GitHub → Actions → Click on failed run
   - Read the error messages

2. **VPS Nginx Logs**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **VPS Deployment Directory**
   ```bash
   ls -la /var/www/gaming-marketplace/dist
   sudo chown -R www-data:www-data /var/www/gaming-marketplace
   ```

4. **GitHub Secrets**
   - Verify all 4 secrets are correctly set
   - Re-paste SSH key if needed

5. **SSH Connection**
   ```bash
   ssh -i ~/.ssh/github_deploy your-username@your-vps-ip
   ```

---

## 🎉 After Completion

From now on, deploying is just:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Wait 2-5 minutes → Your site updates automatically! 🚀

---

**Need Help?** Read the full guides:
- `DEPLOYMENT-COMPLETE-GUIDE.md` - Detailed step-by-step guide
- `QUICK-START.md` - Quick reference
- `AUTO-DEPLOYMENT-GUIDE.md` - Technical details

**Total Setup Time:** ~40 minutes (one time only)
**Future Deployment Time:** 2-5 minutes (automatic!)

---

Date Completed: ________________
Notes: ________________________________________________
