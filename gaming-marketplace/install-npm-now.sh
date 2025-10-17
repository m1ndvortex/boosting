#!/bin/bash

# Quick npm installation for Ubuntu VPS
set -e

echo "🔧 Installing npm on Ubuntu VPS..."

# Update package list
sudo apt update

# Install curl if not present
sudo apt install -y curl

# Install Node.js and npm using NodeSource repository
echo "📦 Adding NodeSource repository..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

echo "📦 Installing Node.js and npm..."
sudo apt-get install -y nodejs

# Verify installation
echo ""
echo "✅ Installation complete!"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

echo ""
echo "🚀 Now you can run your deployment commands!"