# Deployment Guide

## Database Setup

### Local Development (PostgreSQL with Docker)

1. **Start PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://underground:devpassword@localhost:5432/underground_intake"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Update Prisma schema** (should already be PostgreSQL):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set production environment variables on your server:**
   ```env
   DATABASE_URL="postgresql://username:password@your-server:5432/your_database"
   ```

3. **Run migrations on production:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   npm start
   ```

---

## Current Database Schema

Your database is configured for **PostgreSQL** in production.

### If You Want to Keep Using SQLite Locally:

**Pros:**
- ✅ No Docker required
- ✅ Faster setup
- ✅ Database file in your project

**Cons:**
- ❌ Different behavior than production
- ❌ Must remember to switch provider before deploying
- ❌ Some SQL differences between SQLite and PostgreSQL

### Switching Between SQLite and PostgreSQL

**For Local SQLite:**
1. Change `schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run: `npx prisma migrate dev`

**For Production PostgreSQL:**
1. Change `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env` (or use production env vars):
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. Run: `npx prisma migrate deploy`

---

## Recommended Approach

**Use PostgreSQL locally** (with Docker) to match your production environment. This prevents deployment surprises.

### Quick Start with Docker:

```bash
# Start database
docker-compose up -d

# Check if running
docker ps

# Stop database
docker-compose down

# Stop and remove data (reset database)
docker-compose down -v
```

### Managing Multiple Environments:

Create these files:
- `.env` - Your current local environment (git-ignored)
- `.env.local` - Local development template
- `.env.production` - Production environment variables (on server only)
- `.env.example` - Public template for other developers

---

## Pre-Deployment Checklist

Before deploying to your server:

- [ ] Prisma schema uses `provider = "postgresql"`
- [ ] Production `DATABASE_URL` is set correctly on server
- [ ] All migrations are committed to git
- [ ] Run `npx prisma migrate deploy` on production
- [ ] Test database connection on production
- [ ] Environment variables are set on production server
- [ ] Azure AD redirect URIs include production URL

---

## Troubleshooting

### Error: "URL must start with postgresql://"
- Check that your Prisma schema has `provider = "postgresql"`
- Verify `DATABASE_URL` in your environment variables

### Error: "Can't reach database server"
- If using Docker: Check `docker ps` to see if PostgreSQL is running
- If production: Check connection string, firewall rules, and database credentials

### Migrations not applying
- Run `npx prisma migrate deploy` (production)
- Run `npx prisma migrate dev` (local development)

---

# Digital Ocean Deployment with Nginx

Complete guide for deploying the Underground Intake Site to Digital Ocean with subdomain setup.

## Prerequisites

- Fresh Digital Ocean droplet (Ubuntu 22.04 or 24.04 recommended)
- Root or sudo access to the droplet
- Droplet's public IP address
- Domain: undergrounddesign.ca (managed via SiteGround DNS)

---

## Step 1: Initial Server Setup

SSH into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

Update system packages:
```bash
apt update && apt upgrade -y
```

Create a non-root user (optional but recommended):
```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## Step 2: Install Node.js

Install Node.js 20.x (LTS):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

---

## Step 3: Install Nginx

Install Nginx:
```bash
sudo apt install -y nginx
```

Enable and start Nginx:
```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

Configure firewall:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Step 4: Install PostgreSQL

Install PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
```

Start PostgreSQL:
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Create database and user:
```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:
```sql
CREATE DATABASE underground_intake;
CREATE USER underground WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE underground_intake TO underground;
\q
```

---

## Step 5: Install PM2 (Process Manager)

Install PM2 globally:
```bash
sudo npm install -g pm2
```

---

## Step 6: Deploy Your Application

Create application directory:
```bash
sudo mkdir -p /var/www/intake
sudo chown -R $USER:$USER /var/www/intake
cd /var/www/intake
```

Clone or upload your application:

**Option A: Clone from Git (recommended)**
```bash
git clone YOUR_REPO_URL .
```

**Option B: Upload files via SCP**

On your LOCAL machine, run:
```bash
cd /Users/lucas/Desktop/UndergroundIntakeSite
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ root@YOUR_DROPLET_IP:/var/www/intake/
```

Install dependencies:
```bash
cd /var/www/intake
npm install
```

---

## Step 7: Configure Environment Variables

Create production environment file:
```bash
nano /var/www/intake/.env.production
```

Add your environment variables:
```env
NODE_ENV=production

# Database
DATABASE_URL="postgresql://underground:your_secure_password@localhost:5432/underground_intake"

# NextAuth (update these with your production values)
NEXTAUTH_URL="https://intake.undergrounddesign.ca"
NEXTAUTH_SECRET="generate_a_random_secret_here"

# Azure AD (if using authentication)
AZURE_AD_CLIENT_ID="your_client_id"
AZURE_AD_CLIENT_SECRET="your_client_secret"
AZURE_AD_TENANT_ID="your_tenant_id"

# Email configuration
EMAIL_HOST="your_smtp_host"
EMAIL_PORT="587"
EMAIL_USER="your_email"
EMAIL_PASSWORD="your_email_password"
EMAIL_FROM="noreply@undergrounddesign.ca"

# Zendesk (if integrated)
ZENDESK_SUBDOMAIN="your_subdomain"
ZENDESK_EMAIL="your_zendesk_email"
ZENDESK_API_TOKEN="your_api_token"

# Add any other environment variables from your local .env file
```

To generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## Step 8: Run Database Migrations

Run Prisma migrations:
```bash
cd /var/www/intake
npx prisma migrate deploy
npx prisma generate
```

---

## Step 9: Build the Application

Build the Next.js application:
```bash
npm run build
```

---

## Step 10: Start Application with PM2

Start the app:
```bash
cd /var/www/intake
pm2 start npm --name "intake-site" -- start
```

Configure PM2 to start on boot:
```bash
pm2 startup systemd
# Copy and run the command that PM2 outputs
pm2 pm2 save
```

Check status:
```bash
pm2 status
pm2 logs intake-site
```

---

## Step 11: Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/intake
```

Add this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;

    server_name intake.undergrounddesign.ca;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase max upload size for file uploads
    client_max_body_size 50M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/intake /etc/nginx/sites-enabled/
```

Test Nginx configuration:
```bash
sudo nginx -t
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

---

## Step 12: Configure DNS (In SiteGround)

Go to your DNS Zone Editor (the screenshot you showed):

1. Click on "A" record type at the top
2. Fill in the form:
   - **Select Name**: intake.undergrounddesign.ca
   - **IPv4 address**: YOUR_DROPLET_IP (e.g., 164.92.xxx.xxx)
   - **Cache duration**: 24 hours (default)
3. Click **CREATE**

**To find your Digital Ocean droplet IP:**
```bash
# On your droplet, run:
curl -4 icanhazip.com
```

DNS propagation can take up to 72 hours, but usually completes within a few minutes to hours.

Check DNS propagation:
```bash
# On your local machine:
nslookup intake.undergrounddesign.ca
# or
dig intake.undergrounddesign.ca
```

---

## Step 13: Install SSL Certificate (Let's Encrypt)

Wait for DNS to propagate (check with `nslookup` above), then:

Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and install SSL certificate:
```bash
sudo certbot --nginx -d intake.undergrounddesign.ca
```

Follow the prompts:
- Enter your email address
- Agree to terms of service
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Test auto-renewal:
```bash
sudo certbot renew --dry-run
```

Certbot will automatically renew certificates before they expire.

---

## Step 14: Update Azure AD Redirect URIs (If Using Auth)

If you're using Azure AD authentication, add the production URL:

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Select your application
3. Go to Authentication → Add a platform or edit existing Web platform
4. Add redirect URIs:
   - `https://intake.undergrounddesign.ca/api/auth/callback/azure-ad`
5. Save changes

---

## Step 15: Verify Deployment

Check if the site is running locally:
```bash
curl http://localhost:3000
pm2 status
pm2 logs intake-site --lines 50
```

Check Nginx status:
```bash
sudo systemctl status nginx
```

Test the domain (after DNS propagates and SSL is configured):
```bash
curl https://intake.undergrounddesign.ca
```

Visit in browser: `https://intake.undergrounddesign.ca`

---

## Useful Management Commands

### PM2 Commands
```bash
pm2 list                          # List all processes
pm2 logs intake-site              # View logs (live)
pm2 logs intake-site --lines 100  # View last 100 lines
pm2 restart intake-site           # Restart app
pm2 stop intake-site              # Stop app
pm2 start intake-site             # Start app
pm2 delete intake-site            # Remove from PM2
pm2 monit                         # Monitor CPU and memory
```

### Nginx Commands
```bash
sudo systemctl status nginx       # Check status
sudo systemctl restart nginx      # Restart Nginx
sudo systemctl reload nginx       # Reload config (no downtime)
sudo nginx -t                     # Test configuration
sudo tail -f /var/log/nginx/error.log       # View error logs
sudo tail -f /var/log/nginx/access.log      # View access logs
```

### PostgreSQL Commands
```bash
sudo -u postgres psql             # Connect to PostgreSQL
sudo systemctl status postgresql  # Check status
sudo systemctl restart postgresql # Restart database
```

### Update Deployment (When You Make Code Changes)
```bash
cd /var/www/intake
git pull                          # Pull latest changes (if using Git)
npm install                       # Install any new dependencies
npx prisma migrate deploy         # Run any new migrations
npm run build                     # Rebuild the application
pm2 restart intake-site           # Restart the app
```

### Quick Deployment Script

Create a deployment script for easy updates:
```bash
nano /var/www/intake/deploy.sh
```

Add this content:
```bash
#!/bin/bash
cd /var/www/intake
echo "Pulling latest changes..."
git pull
echo "Installing dependencies..."
npm install
echo "Running migrations..."
npx prisma migrate deploy
npx prisma generate
echo "Building application..."
npm run build
echo "Restarting PM2..."
pm2 restart intake-site
echo "Deployment complete!"
pm2 logs intake-site --lines 20
```

Make it executable:
```bash
chmod +x /var/www/intake/deploy.sh
```

Run it:
```bash
/var/www/intake/deploy.sh
```

---

## Monitoring and Maintenance

### Set Up Log Rotation

Create log rotation config:
```bash
sudo nano /etc/logrotate.d/intake
```

Add:
```
/var/www/intake/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitor Disk Space
```bash
df -h
```

### Monitor Memory and CPU
```bash
htop
# or
pm2 monit
```

### Check Application Health
```bash
pm2 status
pm2 logs intake-site --lines 20
```

---

## Troubleshooting

### Site not accessible from internet

1. Check PM2 is running:
```bash
pm2 status
```

2. Check Nginx is running:
```bash
sudo systemctl status nginx
```

3. Check firewall:
```bash
sudo ufw status
```

4. Check DNS propagation:
```bash
nslookup intake.undergrounddesign.ca
```

5. Check application logs:
```bash
pm2 logs intake-site --lines 50
```

6. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

### Port 3000 already in use
```bash
sudo lsof -i :3000
# Kill the process if needed
sudo kill -9 PID_NUMBER
# Or restart PM2
pm2 restart intake-site
```

### Database connection errors
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test database connection
sudo -u postgres psql -d underground_intake

# Check DATABASE_URL in .env.production
cat /var/www/intake/.env.production | grep DATABASE_URL
```

### Nginx configuration errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Application crashes/restarts repeatedly
```bash
# Check logs for errors
pm2 logs intake-site --lines 100

# Check if all environment variables are set
pm2 env intake-site

# Try running in development mode to see errors
cd /var/www/intake
NODE_ENV=development npm run dev
```

---

## Security Best Practices

### 1. Set up automatic security updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 2. Configure fail2ban (protects against brute force)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Disable root SSH login

Edit SSH config:
```bash
sudo nano /etc/ssh/sshd_config
```

Change:
```
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

### 4. Regular backups

#### Database backups:
```bash
# Create backup script
nano /var/www/intake/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/intake"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump underground_intake > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x /var/www/intake/backup.sh
crontab -e
# Add: 0 2 * * * /var/www/intake/backup.sh
```

#### Digital Ocean Snapshots:
- Go to your droplet in Digital Ocean dashboard
- Take regular snapshots (weekly recommended)

### 5. Monitor application

Set up email notifications for PM2:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Performance Optimization

### Enable Gzip compression in Nginx

Edit your intake config:
```bash
sudo nano /etc/nginx/sites-available/intake
```

Add inside server block:
```nginx
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

Reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Optimize PostgreSQL (for better performance)

Edit PostgreSQL config:
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Adjust based on your droplet size (example for 2GB RAM):
```conf
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
max_connections = 100
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Next Steps After Deployment

1. **Test all functionality** on the live site:
   - Form submissions
   - File uploads
   - Email notifications
   - Database operations

2. **Set up monitoring**:
   - Digital Ocean Monitoring (built-in)
   - Uptime monitoring (UptimeRobot, Pingdom)
   - Error tracking (Sentry)

3. **Configure backups**:
   - Enable automated database backups
   - Set up Digital Ocean droplet snapshots

4. **Set up CI/CD** (optional):
   - GitHub Actions for automatic deployments
   - GitLab CI/CD
   - Deploy on push to main branch

5. **Monitor logs regularly**:
```bash
pm2 logs intake-site
```

6. **Update dependencies regularly**:
```bash
npm outdated
npm update
```

---

## Quick Reference Card

```bash
# View site status
pm2 status
sudo systemctl status nginx

# View logs
pm2 logs intake-site
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart intake-site
sudo systemctl restart nginx

# Deploy updates
cd /var/www/intake && git pull && npm install && npm run build && pm2 restart intake-site

# Check SSL expiry
sudo certbot certificates

# Database backup
sudo -u postgres pg_dump underground_intake > backup.sql

# Your droplet IP
curl -4 icanhazip.com
```
