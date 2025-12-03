# Deployment Guide - Ubuntu Server with Apache2

This guide will help you deploy your Underground Design Intake Form to an Ubuntu server with Apache2.

---

## 📋 Prerequisites

On your Ubuntu server, you need:
- Ubuntu 20.04 or newer
- Apache2 installed
- Node.js 18+ installed
- sudo/root access

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Required Software on Ubuntu Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache2
sudo apt install apache2 -y

# Install Node.js 18.x (required for Next.js)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
node --version  # Should be v18.x or higher
npm --version
apache2 -v

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2
```

---

### Step 2: Transfer Your Project to the Server

**Option A: Using Git (Recommended)**

```bash
# On your server, navigate to web directory
cd /var/www

# Clone your repository (if you have it on GitHub)
sudo git clone https://github.com/your-username/UndergroundIntakeSite.git
sudo chown -R $USER:$USER /var/www/UndergroundIntakeSite
cd UndergroundIntakeSite
```

**Option B: Using SCP (if no Git repository)**

On your local machine:
```bash
# From your project directory
cd /Users/lucas/Desktop/UndergroundIntakeSite

# Compress the project (excluding node_modules)
tar -czf underground-intake.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='public/uploads' \
  .

# Copy to server (replace USER and SERVER_IP)
scp underground-intake.tar.gz user@your-server-ip:/home/user/

# On server, extract it
ssh user@your-server-ip
sudo mkdir -p /var/www/UndergroundIntakeSite
sudo tar -xzf underground-intake.tar.gz -C /var/www/UndergroundIntakeSite
sudo chown -R $USER:$USER /var/www/UndergroundIntakeSite
cd /var/www/UndergroundIntakeSite
```

---

### Step 3: Set Up Environment Variables

```bash
# On your server
cd /var/www/UndergroundIntakeSite

# Create .env file
nano .env
```

**Paste your environment variables:**
```env
# Zendesk Configuration
ZENDESK_SUBDOMAIN=undergroundmediaanddesign
ZENDESK_EMAIL=ittech@msu.mcmaster.ca
ZENDESK_API_TOKEN=your-actual-token-here

# Zendesk Custom Field IDs
ZENDESK_FIELD_SERVICE_TYPE=46477062161683
ZENDESK_FIELD_SELECTED_PACKAGE=46478565970195
ZENDESK_FIELD_SELECTED_ADDONS=46478558931219
ZENDESK_FIELD_TOTAL_PRICE=46478619908115

# Email Configuration (Optional)
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@undergrounddesign.ca

# Admin Authentication
ADMIN_PASSWORD=your-secure-password
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Install Dependencies and Build

```bash
# Install all dependencies
npm install

# Build the Next.js app for production
npm run build

# Test that it works
npm start
```

Visit `http://your-server-ip:3000` to verify it's working. Press `Ctrl+C` to stop.

---

### Step 5: Set Up PM2 (Keep App Running)

```bash
# Start the app with PM2
pm2 start npm --name "underground-intake" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on server boot
pm2 startup
# Follow the instructions it gives you (usually a sudo command to run)

# Check status
pm2 status
pm2 logs underground-intake
```

---

### Step 6: Configure Apache2 as Reverse Proxy

**Enable required Apache modules:**
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

**Create Apache virtual host configuration:**
```bash
sudo nano /etc/apache2/sites-available/underground-intake.conf
```

**Paste this configuration:**
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ServerAlias www.your-domain.com

    # Proxy settings
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support (if needed)
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/underground-intake-error.log
    CustomLog ${APACHE_LOG_DIR}/underground-intake-access.log combined

    # File upload size (increase if needed)
    LimitRequestBody 52428800
</VirtualHost>
```

**For IP-only access (no domain):**
```apache
<VirtualHost *:80>
    ServerName your-server-ip

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog ${APACHE_LOG_DIR}/underground-intake-error.log
    CustomLog ${APACHE_LOG_DIR}/underground-intake-access.log combined

    LimitRequestBody 52428800
</VirtualHost>
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

**Enable the site:**
```bash
# Disable default site (optional)
sudo a2dissite 000-default.conf

# Enable your site
sudo a2ensite underground-intake.conf

# Test Apache configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

---

### Step 7: Set Up File Uploads Directory

```bash
# Create uploads directory with proper permissions
cd /var/www/UndergroundIntakeSite
mkdir -p public/uploads
sudo chown -R www-data:www-data public/uploads
sudo chmod -R 755 public/uploads

# Also set proper permissions for the user running PM2
sudo chown -R $USER:www-data public/uploads
```

---

### Step 8: Configure Firewall (if UFW is enabled)

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Apache Full'

# Check status
sudo ufw status
```

---

### Step 9: Test Your Deployment

1. **Visit your site:**
   - `http://your-server-ip` or `http://your-domain.com`

2. **Test the form:**
   - Fill out the form
   - Upload files
   - Submit
   - Check Zendesk for the ticket

3. **Check logs if issues:**
   ```bash
   # PM2 logs
   pm2 logs underground-intake

   # Apache logs
   sudo tail -f /var/log/apache2/underground-intake-error.log
   sudo tail -f /var/log/apache2/underground-intake-access.log
   ```

---

## 🔒 Step 10: Set Up SSL (HTTPS) - Recommended

**Using Let's Encrypt (Free SSL):**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Get SSL certificate (replace with your domain)
sudo certbot --apache -d your-domain.com -d www.your-domain.com

# Follow the prompts
# Certbot will automatically configure Apache for HTTPS
# Choose option 2 to redirect HTTP to HTTPS

# Test auto-renewal
sudo certbot renew --dry-run
```

**Your site will now be accessible at:**
- `https://your-domain.com` ✅

---

## 🔄 Updating Your App

When you need to update the app:

```bash
# Navigate to project
cd /var/www/UndergroundIntakeSite

# Pull latest changes (if using Git)
git pull

# Or upload new files via SCP

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart the app
pm2 restart underground-intake

# Check status
pm2 status
```

---

## 🛠️ Useful Commands

### PM2 Commands:
```bash
pm2 status                    # Check app status
pm2 logs underground-intake   # View logs
pm2 restart underground-intake # Restart app
pm2 stop underground-intake   # Stop app
pm2 start underground-intake  # Start app
pm2 delete underground-intake # Remove from PM2
```

### Apache Commands:
```bash
sudo systemctl status apache2  # Check Apache status
sudo systemctl restart apache2 # Restart Apache
sudo systemctl reload apache2  # Reload config
sudo apache2ctl configtest    # Test configuration
```

### Check Logs:
```bash
# Application logs
pm2 logs underground-intake

# Apache error logs
sudo tail -f /var/log/apache2/underground-intake-error.log

# Apache access logs
sudo tail -f /var/log/apache2/underground-intake-access.log
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 [PID]

# Or change the port in package.json
```

### Issue: "502 Bad Gateway" from Apache
```bash
# Check if Next.js is running
pm2 status

# Restart the app
pm2 restart underground-intake

# Check Apache is proxying correctly
sudo apache2ctl configtest
sudo systemctl restart apache2
```

### Issue: File uploads not working
```bash
# Check permissions
ls -la public/uploads

# Fix permissions
sudo chown -R $USER:www-data public/uploads
sudo chmod -R 755 public/uploads
```

### Issue: Environment variables not working
```bash
# Make sure .env file exists
cat /var/www/UndergroundIntakeSite/.env

# Restart the app
pm2 restart underground-intake
```

---

## 📊 Monitoring

### Set up automatic log rotation:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor server resources:
```bash
pm2 monit
```

---

## 🎯 Quick Deployment Checklist

- [ ] Ubuntu server is running
- [ ] Apache2 installed and running
- [ ] Node.js 18+ installed
- [ ] Project files uploaded to `/var/www/UndergroundIntakeSite`
- [ ] `.env` file created with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] App built (`npm run build`)
- [ ] PM2 running the app
- [ ] PM2 set to start on boot
- [ ] Apache virtual host configured
- [ ] Apache modules enabled (proxy, proxy_http)
- [ ] Site enabled in Apache
- [ ] Uploads directory has correct permissions
- [ ] Firewall allows HTTP/HTTPS
- [ ] SSL certificate installed (optional but recommended)
- [ ] Form tested and working
- [ ] Zendesk ticket creation tested

---

## 📞 Need Help?

If you run into issues during deployment:
1. Check the logs: `pm2 logs underground-intake`
2. Check Apache logs: `sudo tail -f /var/log/apache2/error.log`
3. Verify the app runs locally: `npm start`
4. Test Apache config: `sudo apache2ctl configtest`

---

Good luck with your deployment! 🚀
