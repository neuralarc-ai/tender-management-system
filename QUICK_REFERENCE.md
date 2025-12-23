# GCP Deployment Quick Reference

Quick command reference for managing your deployed application on GCP VM.

## 🚀 Quick Start Commands

### Connect to VM
```bash
# From GCP Console - easiest method
# Go to Compute Engine > VM Instances > Click "SSH"

# Or using gcloud CLI
gcloud compute ssh tender-app-vm --zone=us-central1-a

# Or using regular SSH (if configured)
ssh username@YOUR_VM_IP
```

---

## 📦 Application Management

### PM2 Commands
```bash
# View application status
pm2 status

# View real-time logs
pm2 logs tender-app

# View last 100 lines of logs
pm2 logs tender-app --lines 100

# View only errors
pm2 logs tender-app --err

# Restart application (with downtime)
pm2 restart tender-app

# Reload application (zero-downtime)
pm2 reload tender-app

# Stop application
pm2 stop tender-app

# Start application
pm2 start tender-app

# Monitor resources
pm2 monit

# Clear logs
pm2 flush

# Show detailed info
pm2 show tender-app

# List all processes
pm2 list
```

---

## 🔄 Update/Deploy New Version

### Via Git
```bash
# Navigate to app directory
cd /var/www/tender-app

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Reload with zero downtime
pm2 reload tender-app

# Verify deployment
pm2 logs tender-app --lines 50
```

### Via SCP (from local machine)
```bash
# Build locally first
npm run build

# Copy files to server
gcloud compute scp --recurse .next/ tender-app-vm:/var/www/tender-app/ --zone=us-central1-a

# Then SSH into server and restart
pm2 reload tender-app
```

---

## 🌐 Nginx Management

### Basic Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration (no downtime)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# View last 100 lines
sudo tail -n 100 /var/log/nginx/error.log
```

### Edit Configuration
```bash
# Edit main app config
sudo nano /etc/nginx/sites-available/tender-app

# After editing, always test before reloading
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate Management

### Certbot Commands
```bash
# Renew certificates manually
sudo certbot renew

# Renew with verbose output
sudo certbot renew --dry-run

# List all certificates
sudo certbot certificates

# Renew specific domain
sudo certbot renew --cert-name yourdomain.com

# Delete certificate
sudo certbot delete --cert-name yourdomain.com
```

---

## 🔥 Firewall Management

### UFW Commands
```bash
# Check firewall status
sudo ufw status

# Check verbose status
sudo ufw status verbose

# Enable firewall
sudo ufw enable

# Disable firewall
sudo ufw disable

# Allow port
sudo ufw allow 8080

# Deny port
sudo ufw deny 8080

# Delete rule
sudo ufw delete allow 8080

# Allow from specific IP
sudo ufw allow from 192.168.1.1

# Reset all rules
sudo ufw reset
```

---

## 📊 System Monitoring

### Resource Usage
```bash
# Interactive process viewer
htop

# If not installed
sudo apt install htop

# Check disk space
df -h

# Check disk usage by directory
du -sh /var/www/tender-app
du -sh /var/www/tender-app/*

# Check memory usage
free -h

# Check CPU usage
top

# Check system load
uptime

# Check running processes
ps aux | grep node
ps aux | grep nginx
```

### Log Viewing
```bash
# View system logs
sudo journalctl -f

# View logs for specific service
sudo journalctl -u nginx -f

# View last 100 lines
sudo journalctl -n 100

# Clear old logs (keep last 7 days)
sudo journalctl --vacuum-time=7d

# Check log disk usage
sudo journalctl --disk-usage
```

---

## 🔍 Troubleshooting

### Application Not Working
```bash
# 1. Check PM2 status
pm2 status

# 2. Check logs for errors
pm2 logs tender-app --err --lines 50

# 3. Restart application
pm2 restart tender-app

# 4. Check if port 3000 is listening
sudo lsof -i :3000

# 5. Test directly
curl http://localhost:3000
```

### Nginx Not Working
```bash
# 1. Check status
sudo systemctl status nginx

# 2. Test configuration
sudo nginx -t

# 3. Check error logs
sudo tail -f /var/log/nginx/error.log

# 4. Restart Nginx
sudo systemctl restart nginx

# 5. Check if ports are listening
sudo lsof -i :80
sudo lsof -i :443
```

### High Memory Usage
```bash
# Check memory
free -h

# Find memory hogs
ps aux --sort=-%mem | head

# Restart application
pm2 restart tender-app

# Clear cache
sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
```

### Disk Space Full
```bash
# Check disk space
df -h

# Find large directories
sudo du -sh /* | sort -hr | head

# Clean package cache
sudo apt autoremove
sudo apt autoclean

# Clear logs
sudo journalctl --vacuum-time=7d

# Clear old PM2 logs
pm2 flush
```

### Port Already in Use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 PROCESS_ID

# Or restart PM2
pm2 restart tender-app
```

---

## 💾 Backup & Restore

### Create Backup
```bash
# Manual backup
cd /var/www/tender-app
tar -czf ~/tender-app-backup-$(date +%Y%m%d).tar.gz .

# Or use backup script
~/backup-app.sh
```

### Restore Backup
```bash
# Stop application
pm2 stop tender-app

# Navigate to app directory
cd /var/www/tender-app

# Extract backup
tar -xzf ~/tender-app-backup-20240101.tar.gz

# Restart application
pm2 restart tender-app
```

---

## 🔄 Database (Supabase)

### Check Connection
```bash
cd /var/www/tender-app

# View environment variables (be careful!)
cat .env.local

# Test connection (if you have test script)
npm run test:db
```

### Update Environment Variables
```bash
# Edit environment file
nano /var/www/tender-app/.env.local

# After changes, restart app
pm2 restart tender-app
```

---

## 🛠 Maintenance Commands

### System Updates
```bash
# Update package lists
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Reboot if needed
sudo reboot
```

### Restart Everything
```bash
# Restart application
pm2 restart tender-app

# Restart Nginx
sudo systemctl restart nginx

# Restart entire VM (use with caution)
sudo reboot
```

### Clean Up
```bash
# Remove unused packages
sudo apt autoremove

# Clean package cache
sudo apt autoclean

# Clear old logs
sudo journalctl --vacuum-time=7d

# Clear PM2 logs
pm2 flush
```

---

## 📈 Performance Optimization

### Check Performance
```bash
# Real-time monitoring
pm2 monit

# System resources
htop

# Network connections
sudo netstat -tlnp

# Check response time
curl -w "@-" -o /dev/null -s http://localhost:3000 <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
      time_redirect:  %{time_redirect}\n
   time_pretransfer:  %{time_pretransfer}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

---

## 🔐 Security Commands

### Check Security Status
```bash
# Check firewall
sudo ufw status

# Check fail2ban (if installed)
sudo fail2ban-client status

# Check SSL certificate
sudo certbot certificates

# Check for security updates
sudo apt list --upgradable
```

### Security Hardening
```bash
# Enable automatic security updates
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## 🆘 Emergency Commands

### Application Crashed
```bash
# Restart immediately
pm2 restart tender-app

# Check what went wrong
pm2 logs tender-app --err --lines 100
```

### Server Unresponsive
```bash
# From GCP Console:
# Compute Engine > VM Instances > Click 3 dots > Reset

# Or from gcloud
gcloud compute instances reset tender-app-vm --zone=us-central1-a
```

### Quick Health Check
```bash
# Run this single command to check everything
echo "=== PM2 Status ===" && pm2 status && \
echo "=== Nginx Status ===" && sudo systemctl status nginx --no-pager && \
echo "=== Disk Space ===" && df -h && \
echo "=== Memory ===" && free -h && \
echo "=== Listening Ports ===" && sudo netstat -tlnp | grep -E ':(80|443|3000)'
```

---

## 📝 Useful File Paths

```
Application Directory:     /var/www/tender-app
Environment Variables:     /var/www/tender-app/.env.local
Nginx Config:              /etc/nginx/sites-available/tender-app
Nginx Logs:                /var/log/nginx/
PM2 Logs:                  ~/.pm2/logs/
SSL Certificates:          /etc/letsencrypt/live/yourdomain.com/
Backups:                   ~/backups/
```

---

## 🔗 Important URLs

```
Application:               http://YOUR_VM_IP or https://yourdomain.com
Client Portal:             /client
Admin Portal:              /admin
GCP Console:               https://console.cloud.google.com
Supabase Dashboard:        https://app.supabase.com
```

---

## 📞 Getting Help

### Check Documentation
```bash
# PM2 help
pm2 --help

# Nginx help
nginx -h

# Certbot help
certbot --help
```

### View Full Deployment Guide
```bash
cat /var/www/tender-app/GCP_DEPLOYMENT_GUIDE.md
```

### Check Logs for Errors
```bash
# Application logs
pm2 logs tender-app --err --lines 100

# Nginx error logs
sudo tail -n 100 /var/log/nginx/error.log

# System logs
sudo journalctl -n 100
```

---

## 💡 Pro Tips

1. **Always test Nginx config before reloading:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

2. **Use zero-downtime reload:**
   ```bash
   pm2 reload tender-app  # instead of restart
   ```

3. **Monitor logs in real-time during deployment:**
   ```bash
   pm2 logs tender-app --lines 0
   ```

4. **Create aliases for common commands:**
   ```bash
   echo "alias app-logs='pm2 logs tender-app'" >> ~/.bashrc
   echo "alias app-status='pm2 status'" >> ~/.bashrc
   source ~/.bashrc
   ```

5. **Setup monitoring script:**
   ```bash
   watch -n 5 'pm2 status && free -h'
   ```

---

**Keep this file handy for quick reference during operations!**

For detailed explanations, refer to `GCP_DEPLOYMENT_GUIDE.md`

