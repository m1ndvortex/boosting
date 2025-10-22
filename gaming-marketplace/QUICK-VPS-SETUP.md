# 🚀 Quick VPS Setup for Gaming Marketplace

## If npm is not installed on your VPS

### Step 1: Connect to your VPS
```bash
ssh user@your-vps-ip
```

### Step 2: Upload and run the setup script
```bash
# Upload the setup script (from your local machine)
scp gaming-marketplace/server-setup.sh user@your-vps-ip:/home/user/

# On VPS: Make executable and run
chmod +x server-setup.sh
./server-setup.sh
```

### Step 3: If npm is still missing, run the fix script
```bash
# Upload the fix script (from your local machine)
scp gaming-marketplace/fix-npm.sh user@your-vps-ip:/home/user/

# On VPS: Make executable and run
chmod +x fix-npm.sh
./fix-npm.sh
```

### Step 4: Verify installation
```bash
node --version
npm --version
```

## Alternative: Manual npm installation

If the scripts don't work, install manually:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

## Alternative: Using snap
```bash
sudo snap install node --classic
```

## Alternative: Download and install manually
```bash
# Download Node.js
wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz

# Extract
tar -xf node-v18.17.0-linux-x64.tar.xz

# Move to system directory
sudo mv node-v18.17.0-linux-x64 /opt/nodejs

# Create symlinks
sudo ln -s /opt/nodejs/bin/node /usr/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm

# Verify
node --version
npm --version
```

## Once npm is working, continue with deployment:

```bash
# Upload your deployment package
scp gaming-marketplace-*.tar.gz user@your-vps-ip:/home/user/

# Extract to web directory
sudo mkdir -p /var/www/gaming-marketplace
sudo tar -xzf gaming-marketplace-*.tar.gz -C /var/www/gaming-marketplace

# Run deployment
cd /var/www/gaming-marketplace
chmod +x vps-deploy.sh
./vps-deploy.sh
```

Your app will be live at `http://your-vps-ip` 🎮