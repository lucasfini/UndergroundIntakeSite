# Deployment Checklist

Use this checklist to ensure your deployment is complete and working.

---

## 📋 Pre-Deployment (On Your Mac)

- [ ] Test the app locally (`npm run dev`)
- [ ] Verify form submission works
- [ ] Verify files upload correctly
- [ ] Verify Zendesk ticket creation works
- [ ] Check all environment variables are in `.env`
- [ ] Run the deployment preparation script: `./prepare-deploy.sh`
- [ ] You have the `.tar.gz` file ready to upload

---

## 🖥️ Server Setup (One-Time)

- [ ] Ubuntu server is accessible via SSH
- [ ] You have sudo/root access
- [ ] Server has at least 1GB RAM
- [ ] Server has at least 10GB free disk space
- [ ] Apache2 installed: `sudo apt install apache2 -y`
- [ ] Node.js 18+ installed: `node --version`
- [ ] PM2 installed: `pm2 --version`
- [ ] Apache modules enabled: `sudo a2enmod proxy proxy_http rewrite headers`
- [ ] Firewall configured: `sudo ufw allow 'Apache Full'`

---

## 📂 Project Deployment

- [ ] Project uploaded to `/var/www/UndergroundIntakeSite`
- [ ] Correct ownership: `sudo chown -R $USER:$USER /var/www/UndergroundIntakeSite`
- [ ] `.env` file created with production values
- [ ] Dependencies installed: `npm install`
- [ ] Production build completed: `npm run build`
- [ ] No build errors in terminal
- [ ] Uploads directory created: `mkdir -p public/uploads`
- [ ] Uploads directory has correct permissions: `755`

---

## 🔄 PM2 Setup

- [ ] App started with PM2: `pm2 start npm --name "underground-intake" -- start`
- [ ] App shows as "online" in `pm2 status`
- [ ] No errors in `pm2 logs underground-intake`
- [ ] PM2 configuration saved: `pm2 save`
- [ ] PM2 startup enabled: `pm2 startup` (and ran the command it gave)
- [ ] Test PM2 restart: `pm2 restart underground-intake`

---

## 🌐 Apache2 Configuration

- [ ] Virtual host file created: `/etc/apache2/sites-available/underground-intake.conf`
- [ ] Virtual host configured with correct ServerName/IP
- [ ] ProxyPass pointing to `http://localhost:3000/`
- [ ] LimitRequestBody set to `52428800` (50MB)
- [ ] Apache config test passed: `sudo apache2ctl configtest`
- [ ] Site enabled: `sudo a2ensite underground-intake.conf`
- [ ] Default site disabled (optional): `sudo a2dissite 000-default.conf`
- [ ] Apache restarted: `sudo systemctl restart apache2`
- [ ] Apache shows as "active": `sudo systemctl status apache2`

---

## ✅ Testing

- [ ] Site accessible via browser: `http://your-server-ip`
- [ ] Homepage loads correctly
- [ ] Navigation works (all pages load)
- [ ] Form page displays correctly
- [ ] Service dropdown has all 21 MSU services
- [ ] Package selection works
- [ ] Add-ons selection works
- [ ] File upload works (try uploading logo and attachment)
- [ ] Review page shows all information correctly
- [ ] Form submission completes successfully
- [ ] Success page displays
- [ ] **Zendesk ticket created** ⭐
- [ ] Zendesk ticket has correct data:
  - [ ] Service Type field populated
  - [ ] Selected Package field populated
  - [ ] Selected Add-Ons field populated (one per line)
  - [ ] Total Price field populated
  - [ ] Requester name and email correct
  - [ ] All form data in ticket description
  - [ ] Files attached to ticket and downloadable
- [ ] No errors in browser console (F12)
- [ ] No errors in `pm2 logs`
- [ ] No errors in Apache logs

---

## 🔒 Security (Highly Recommended)

- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Site accessible via HTTPS: `https://your-domain.com`
- [ ] HTTP redirects to HTTPS
- [ ] Admin password is strong and secure
- [ ] `.env` file permissions are restrictive: `chmod 600 .env`
- [ ] Server firewall is configured (UFW)
- [ ] Only necessary ports are open (80, 443, 22)
- [ ] SSH key authentication enabled (password login disabled)
- [ ] Regular backups configured

---

## 📊 Monitoring

- [ ] PM2 monitoring working: `pm2 monit`
- [ ] Logs are accessible: `pm2 logs underground-intake`
- [ ] Log rotation configured: `pm2 install pm2-logrotate`
- [ ] Apache logs accessible:
  - [ ] Error log: `/var/log/apache2/underground-intake-error.log`
  - [ ] Access log: `/var/log/apache2/underground-intake-access.log`
- [ ] Disk space monitored: `df -h`
- [ ] Server monitoring set up (optional: Netdata, Grafana, etc.)

---

## 📝 Documentation

- [ ] Domain/IP address documented
- [ ] Server login credentials saved securely
- [ ] .env values backed up securely (not in Git!)
- [ ] Deployment date recorded
- [ ] Team notified about new intake form
- [ ] Old intake form redirected or disabled
- [ ] Instructions shared with team

---

## 🔄 Post-Deployment

- [ ] Send test request through form
- [ ] Verify email notifications work (if configured)
- [ ] Check upload directory size: `du -sh public/uploads`
- [ ] Set up automatic cleanup of old uploads (optional)
- [ ] Monitor server resources for 24-48 hours
- [ ] Gather feedback from team
- [ ] Make any necessary adjustments

---

## 🚨 Emergency Contacts

**If something breaks:**

1. **Check logs:**
   ```bash
   pm2 logs underground-intake
   sudo tail -f /var/log/apache2/underground-intake-error.log
   ```

2. **Restart services:**
   ```bash
   pm2 restart underground-intake
   sudo systemctl restart apache2
   ```

3. **Verify services are running:**
   ```bash
   pm2 status
   sudo systemctl status apache2
   ```

4. **Contact:**
   - IT Support: ittech@msu.mcmaster.ca
   - Server Admin: [your admin contact]

---

## ✨ Success Criteria

Your deployment is successful when:

✅ Users can access the form at your domain/IP
✅ Users can fill out and submit the form
✅ Files upload successfully
✅ Zendesk tickets are created automatically
✅ All custom fields are populated correctly
✅ Files are attached to Zendesk tickets
✅ No errors in logs
✅ SSL is working (HTTPS)
✅ App restarts automatically after server reboot

---

## 📅 Maintenance Schedule

**Daily:**
- [ ] Check `pm2 status`
- [ ] Monitor disk space

**Weekly:**
- [ ] Review error logs
- [ ] Clear old uploads (if needed)
- [ ] Check SSL certificate expiry

**Monthly:**
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review and optimize performance
- [ ] Backup environment variables

---

**Deployment Date:** _______________

**Deployed By:** _______________

**Production URL:** _______________

**Notes:**
_______________________________________
_______________________________________
_______________________________________

---

🎉 Congratulations on your deployment!
