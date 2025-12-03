# Quick Deployment Commands

Copy and paste these commands in order to deploy quickly.

---

## 🚀 On Your Ubuntu Server

### 1. Install Everything (One-time setup)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache2
sudo apt install apache2 -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Enable Apache modules
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2
```

---

### 2. Upload Your Project

**If you have the tar.gz file:**
```bash
# Upload from your Mac
scp underground-intake.tar.gz user@your-server-ip:/home/user/

# On server, extract
sudo mkdir -p /var/www/UndergroundIntakeSite
cd /home/user
sudo tar -xzf underground-intake.tar.gz -C /var/www/UndergroundIntakeSite
sudo chown -R $USER:$USER /var/www/UndergroundIntakeSite
```

---

### 3. Set Up the App
```bash
cd /var/www/UndergroundIntakeSite

# Create .env file
nano .env
# (Paste your environment variables, then Ctrl+X, Y, Enter)

# Install dependencies
npm install

# Build the app
npm run build

# Create uploads directory
mkdir -p public/uploads
sudo chown -R $USER:www-data public/uploads
sudo chmod -R 755 public/uploads
```

---

### 4. Start with PM2
```bash
cd /var/www/UndergroundIntakeSite

# Start the app
pm2 start npm --name "underground-intake" -- start

# Save PM2 config
pm2 save

# Enable on startup
pm2 startup
# (Run the command it tells you to run)

# Check it's running
pm2 status
```

---

### 5. Configure Apache

**Create config file:**
```bash
sudo nano /etc/apache2/sites-available/underground-intake.conf
```

**Paste this (replace your-domain.com or use your IP):**
```apache
<VirtualHost *:80>
    ServerName your-domain.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog ${APACHE_LOG_DIR}/underground-intake-error.log
    CustomLog ${APACHE_LOG_DIR}/underground-intake-access.log combined

    LimitRequestBody 52428800
</VirtualHost>
```
**Save:** Ctrl+X, Y, Enter

**Enable site:**
```bash
sudo a2ensite underground-intake.conf
sudo apache2ctl configtest
sudo systemctl restart apache2
```

---

### 6. Open Firewall
```bash
sudo ufw allow 'Apache Full'
sudo ufw status
```

---

### 7. Test
Visit: `http://your-server-ip` or `http://your-domain.com`

---

## 🔒 Add SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d your-domain.com -d www.your-domain.com
```

---

## 🔄 Update the App Later

```bash
cd /var/www/UndergroundIntakeSite
git pull  # or upload new files
npm install
npm run build
pm2 restart underground-intake
```

---

## 🛠️ Quick Commands

```bash
# View logs
pm2 logs underground-intake

# Restart app
pm2 restart underground-intake

# Restart Apache
sudo systemctl restart apache2

# Check status
pm2 status
sudo systemctl status apache2
```

---

## 📋 Your .env File Template

```env
ZENDESK_SUBDOMAIN=undergroundmediaanddesign
ZENDESK_EMAIL=ittech@msu.mcmaster.ca
ZENDESK_API_TOKEN=your-token-here

ZENDESK_FIELD_SERVICE_TYPE=46477062161683
ZENDESK_FIELD_SELECTED_PACKAGE=46478565970195
ZENDESK_FIELD_SELECTED_ADDONS=46478558931219
ZENDESK_FIELD_TOTAL_PRICE=46478619908115

EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@undergrounddesign.ca

ADMIN_PASSWORD=your-secure-password
```

---

That's it! 🎉
