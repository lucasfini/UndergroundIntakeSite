#!/bin/bash

# Underground Design Intake Form - Deployment Preparation Script
# This script prepares your project for deployment to Ubuntu server

echo "🚀 Preparing Underground Design Intake Form for deployment..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Create deployment package name
PACKAGE_NAME="underground-intake-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "📦 Creating deployment package: $PACKAGE_NAME"
echo ""

# Create the tar.gz excluding unnecessary files
tar -czf "$PACKAGE_NAME" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='public/uploads' \
  --exclude='.env' \
  --exclude='*.tar.gz' \
  --exclude='.DS_Store' \
  .

# Check if tar was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment package created successfully!"
    echo ""
    echo "📋 Package details:"
    ls -lh "$PACKAGE_NAME"
    echo ""
    echo "📤 Next steps:"
    echo "1. Upload to your server:"
    echo "   scp $PACKAGE_NAME user@your-server-ip:/home/user/"
    echo ""
    echo "2. On your server, extract:"
    echo "   sudo mkdir -p /var/www/UndergroundIntakeSite"
    echo "   sudo tar -xzf $PACKAGE_NAME -C /var/www/UndergroundIntakeSite"
    echo ""
    echo "3. Follow the DEPLOYMENT_GUIDE.md for complete setup instructions"
    echo ""
    echo "⚠️  Don't forget to:"
    echo "   - Create .env file on the server with your credentials"
    echo "   - Run 'npm install' on the server"
    echo "   - Run 'npm run build' on the server"
    echo ""
else
    echo "❌ Error creating deployment package"
    exit 1
fi
