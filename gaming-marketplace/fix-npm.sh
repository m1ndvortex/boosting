#!/bin/bash

# Fix npm installation on Ubuntu VPS
set -e

echo "🔧 Fixing npm installation..."

# Check if npm exists
if command -v npm &> /dev/null; then
    echo "✅ npm is already installed: $(npm --version)"
    exit 0
fi

echo "❌ npm not found, installing..."

# Method 1: Try installing npm separately
echo "📦 Installing npm package..."
sudo apt update
sudo apt install -y npm

# Verify installation
if command -v npm &> /dev/null; then
    echo "✅ npm installed successfully: $(npm --version)"
    
    # Update to latest version
    echo "📦 Updating npm to latest version..."
    sudo npm install -g npm@latest
    echo "✅ npm updated to: $(npm --version)"
    exit 0
fi

# Method 2: Reinstall Node.js with npm
echo "🔄 Reinstalling Node.js with npm..."

# Remove existing nodejs if any
sudo apt remove -y nodejs npm

# Install using snap (alternative method)
echo "📦 Installing Node.js via snap..."
sudo snap install node --classic

# Verify installation
if command -v npm &> /dev/null; then
    echo "✅ npm installed via snap: $(npm --version)"
    exit 0
fi

# Method 3: Manual installation using NodeSource
echo "🔄 Using NodeSource repository..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Final verification
if command -v npm &> /dev/null; then
    echo "✅ npm finally installed: $(npm --version)"
    echo "✅ Node.js version: $(node --version)"
else
    echo "❌ Failed to install npm. Please try manual installation:"
    echo "   1. wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz"
    echo "   2. tar -xf node-v18.17.0-linux-x64.tar.xz"
    echo "   3. sudo mv node-v18.17.0-linux-x64 /opt/nodejs"
    echo "   4. sudo ln -s /opt/nodejs/bin/node /usr/bin/node"
    echo "   5. sudo ln -s /opt/nodejs/bin/npm /usr/bin/npm"
    exit 1
fi