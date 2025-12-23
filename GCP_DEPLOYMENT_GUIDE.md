# Complete GCP VM Deployment Guide

This guide will walk you through deploying the Tender Management System on a Google Cloud Platform (GCP) VM instance from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [GCP Account Setup](#gcp-account-setup)
3. [Create and Configure VM Instance](#create-and-configure-vm-instance)
4. [Server Setup and Configuration](#server-setup-and-configuration)
5. [Application Deployment](#application-deployment)
6. [Domain and SSL Setup](#domain-and-ssl-setup)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

Before starting, ensure you have:
- Google account
- Credit/debit card for GCP billing (free tier available)
- Domain name (optional, but recommended for production)
- Basic familiarity with terminal/command line

---

## 1. GCP Account Setup

### Step 1.1: Create GCP Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms of service
4. Add billing information (you get $300 free credits for 90 days)

### Step 1.2: Create a New Project
1. Click on the project dropdown at the top
2. Click "New Project"
3. Name it: `tender-management-system`
4. Click "Create"
5. Wait for project creation and select it

### Step 1.3: Enable Compute Engine API
1. In the GCP Console, go to "APIs & Services" > "Library"
2. Search for "Compute Engine API"
3. Click on it and press "Enable"

---

## 2. Create and Configure VM Instance

### Step 2.1: Create VM Instance

1. Navigate to **Compute Engine** > **VM Instances**
2. Click **"Create Instance"**
3. Configure the instance:

**Basic Configuration:**
```
Name: tender-app-vm
Region: us-central1 (or closest to your users)
Zone: us-central1-a (or any available zone)
```

**Machine Configuration:**
```
Series: E2
Machine type: e2-medium (2 vCPU, 4 GB memory)
- This is sufficient for production with moderate traffic
- For high traffic, consider e2-standard-2 (2 vCPU, 8 GB memory)
```

**Boot Disk:**
```
Operating System: Ubuntu
Version: Ubuntu 22.04 LTS
Boot disk type: Balanced persistent disk
Size: 20 GB (minimum recommended: 20 GB)
```

**Firewall:**
```
✅ Allow HTTP traffic
✅ Allow HTTPS traffic
```

4. Click **"Create"** button at the bottom
5. Wait 1-2 minutes for VM to be created

### Step 2.2: Configure Firewall Rules

1. Go to **VPC Network** > **Firewall**
2. Click **"Create Firewall Rule"**

**Rule 1: Allow HTTP**
```
Name: allow-http
Direction: Ingress
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:80
```

**Rule 2: Allow HTTPS**
```
Name: allow-https
Direction: Ingress
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:443
```

**Rule 3: Allow Next.js Port (for testing)**
```
Name: allow-nextjs
Direction: Ingress
Targets: All instances in the network
Source IP ranges: 0.0.0.0/0
Protocols and ports: tcp:3000
```

### Step 2.3: Reserve Static IP Address (Recommended)

1. Go to **VPC Network** > **IP Addresses**
2. Click **"Reserve External Static Address"**
3. Configure:
```
Name: tender-app-ip
Network Service Tier: Premium
IP Version: IPv4
Type: Regional
Region: us-central1 (same as your VM)
Attached to: tender-app-vm
```
4. Click **"Reserve"**
5. **Note down the IP address** - you'll need this for DNS setup

---

## 3. Server Setup and Configuration

### Step 3.1: Connect to Your VM

**Option A: Using GCP Console (Easiest)**
1. Go to **Compute Engine** > **VM Instances**
2. Click **"SSH"** button next to your VM instance
3. A new browser window will open with terminal access

**Option B: Using gcloud CLI (Advanced)**
```bash
# Install gcloud CLI first: https://cloud.google.com/sdk/docs/install
gcloud compute ssh tender-app-vm --zone=us-central1-a
```

### Step 3.2: Update System Packages

Once connected via SSH, run:

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 3.3: Install Node.js and npm

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x or higher
```

### Step 3.4: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

Test Nginx by visiting `http://YOUR_VM_IP` in browser - you should see Nginx welcome page.

### Step 3.5: Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 3.6: Setup Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/tender-app
sudo chown -R $USER:$USER /var/www/tender-app

# Navigate to directory
cd /var/www/tender-app
```

---

## 4. Application Deployment

### Step 4.1: Upload Application Files

**Option A: Using Git (Recommended)**

If your code is on GitHub/GitLab:

```bash
cd /var/www/tender-app

# Clone your repository
git clone https://github.com/yourusername/tender-management-system.git .

# If private repo, you'll need to setup SSH keys or use HTTPS with token
```

**Option B: Using SCP from Local Machine**

From your **local machine** (not VM):

```bash
# Navigate to your project directory
cd /Users/apple/Desktop/tender-management-system

# Copy files to VM (replace YOUR_VM_IP with actual IP)
gcloud compute scp --recurse ./* tender-app-vm:/var/www/tender-app --zone=us-central1-a

# Or if using regular SCP
scp -r ./* username@YOUR_VM_IP:/var/www/tender-app
```

**Option C: Manual Upload via SFTP**

Use FileZilla or similar SFTP client:
```
Host: YOUR_VM_IP
Port: 22
Username: your-gcp-username
```

### Step 4.2: Configure Environment Variables

```bash
cd /var/www/tender-app

# Create .env.local file
nano .env.local
```

Add your configuration (press Ctrl+X, then Y, then Enter to save):

```env
# Production Environment
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI API Configuration
AI_API_KEY=your_helium_api_key_here
AI_API_ENDPOINT=https://api.he2.site/api/v1/public

# Application URL (update with your domain or IP)
NEXT_PUBLIC_APP_URL=http://YOUR_VM_IP:3000
```

**Security Note:** Make sure .env.local has restricted permissions:
```bash
chmod 600 .env.local
```

### Step 4.3: Install Dependencies and Build

```bash
cd /var/www/tender-app

# Install dependencies
npm install

# Build the application
npm run build

# This will take 2-5 minutes
```

### Step 4.4: Test the Application

```bash
# Start the app manually first to test
npm start
```

Visit `http://YOUR_VM_IP:3000` in your browser. You should see your application running!

Press `Ctrl+C` to stop the test server.

### Step 4.5: Setup PM2 for Production

```bash
cd /var/www/tender-app

# Start application with PM2
pm2 start npm --name "tender-app" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd

# Copy and run the command PM2 outputs (it will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username
```

**Useful PM2 Commands:**
```bash
pm2 status              # Check app status
pm2 logs tender-app     # View logs
pm2 restart tender-app  # Restart app
pm2 stop tender-app     # Stop app
pm2 delete tender-app   # Remove from PM2
```

### Step 4.6: Configure Nginx as Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/tender-app
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name YOUR_VM_IP;  # Replace with your domain or IP

    # Increase client body size for file uploads
    client_max_body_size 10M;

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
        
        # Timeouts for AI operations
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

Save and exit (Ctrl+X, Y, Enter).

**Enable the site:**
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/tender-app /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

Now visit `http://YOUR_VM_IP` (without :3000) - your app should be accessible!

---

## 5. Domain and SSL Setup

### Step 5.1: Configure Domain DNS (Optional but Recommended)

If you have a domain (e.g., `tender-app.com`):

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Add an **A Record**:
```
Type: A
Name: @ (or www)
Value: YOUR_VM_STATIC_IP
TTL: 3600
```

3. Wait 5-60 minutes for DNS propagation
4. Test: `ping yourdomain.com` should return your VM IP

### Step 5.2: Install SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain SSL certificate
- Update Nginx configuration
- Setup auto-renewal

**Test auto-renewal:**
```bash
sudo certbot renew --dry-run
```

**Update environment variables:**
```bash
nano /var/www/tender-app/.env.local
```

Change:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Restart application:**
```bash
pm2 restart tender-app
```

---

## 6. Monitoring and Maintenance

### Step 6.1: Setup Monitoring

**View Application Logs:**
```bash
# Real-time logs
pm2 logs tender-app

# Last 100 lines
pm2 logs tender-app --lines 100

# Error logs only
pm2 logs tender-app --err
```

**View Nginx Logs:**
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

**System Resources:**
```bash
# Check memory and CPU
pm2 monit

# Or use htop
sudo apt install htop
htop
```

### Step 6.2: Backup Strategy

**Create Backup Script:**
```bash
nano ~/backup-app.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/$USER/backups"
APP_DIR="/var/www/tender-app"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 backups
cd $BACKUP_DIR
ls -t | tail -n +8 | xargs -r rm

echo "Backup completed: app_backup_$DATE.tar.gz"
```

Make executable and test:
```bash
chmod +x ~/backup-app.sh
~/backup-app.sh
```

**Setup Automatic Daily Backups:**
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /home/$USER/backup-app.sh >> /home/$USER/backup.log 2>&1
```

### Step 6.3: Update Application

When you have code updates:

```bash
cd /var/www/tender-app

# Pull latest changes (if using git)
git pull origin main

# Or upload new files via SCP

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Restart with zero-downtime
pm2 reload tender-app
```

### Step 6.4: Security Hardening

**Setup UFW Firewall:**
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow OpenSSH

# Allow HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**Automatic Security Updates:**
```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

**Fail2Ban (Prevent brute force):**
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### Step 6.5: Performance Optimization

**Enable Nginx Gzip Compression:**
```bash
sudo nano /etc/nginx/nginx.conf
```

Uncomment or add in `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

**Restart Nginx:**
```bash
sudo systemctl restart nginx
```

---

## 7. Troubleshooting

### Common Issues and Solutions

**Issue: Application not accessible**
```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs tender-app

# Restart app
pm2 restart tender-app
```

**Issue: Nginx error**
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

**Issue: Port already in use**
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 PROCESS_ID
```

**Issue: Out of memory**
```bash
# Check memory usage
free -h

# Restart app to free memory
pm2 restart tender-app

# Consider upgrading VM instance type
```

**Issue: Disk space full**
```bash
# Check disk usage
df -h

# Clean up
sudo apt autoremove
sudo apt autoclean

# Remove old logs
sudo journalctl --vacuum-time=7d
```

---

## 8. Quick Reference Commands

### Application Management
```bash
# View status
pm2 status

# Restart app
pm2 restart tender-app

# View logs
pm2 logs tender-app

# Stop app
pm2 stop tender-app

# Start app
pm2 start tender-app
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### System Management
```bash
# Check system resources
htop

# Check disk space
df -h

# Check memory
free -h

# Restart VM
sudo reboot
```

---

## 9. Cost Optimization

### GCP Free Tier
- e2-micro instance (0.25-2 vCPU, 1 GB memory) - **Free**
- 30 GB standard persistent disk - **Free**
- 1 GB network egress per month - **Free**

### Estimated Monthly Costs (US regions)

**Development/Low Traffic:**
- e2-small (2 vCPU, 2 GB): ~$15-20/month
- e2-medium (2 vCPU, 4 GB): ~$30-35/month

**Production/Moderate Traffic:**
- e2-standard-2 (2 vCPU, 8 GB): ~$60-70/month
- e2-standard-4 (4 vCPU, 16 GB): ~$120-140/month

**Cost Saving Tips:**
1. Use **committed use discounts** (57% discount for 1-year commitment)
2. Use **sustained use discounts** (automatic, up to 30% off)
3. Stop VM when not needed (dev/staging environments)
4. Use **preemptible VMs** for non-critical workloads (up to 80% discount)

---

## 10. Next Steps

After successful deployment:

1. ✅ Test all application features
2. ✅ Setup monitoring and alerts
3. ✅ Configure automated backups
4. ✅ Setup CI/CD pipeline (optional)
5. ✅ Configure CDN for static assets (optional)
6. ✅ Setup database backups (Supabase handles this)
7. ✅ Document your deployment process
8. ✅ Share access with team members

---

## Support and Resources

- **GCP Documentation:** https://cloud.google.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **PM2 Documentation:** https://pm2.keymetrics.io/docs
- **Nginx Documentation:** https://nginx.org/en/docs/

---

## Summary

You now have a production-ready deployment with:
- ✅ Next.js application running on GCP VM
- ✅ Nginx reverse proxy
- ✅ PM2 process management
- ✅ SSL certificate (optional)
- ✅ Automatic restarts and monitoring
- ✅ Backup strategy
- ✅ Security hardening

Your application is now accessible at:
- **HTTP:** http://YOUR_VM_IP
- **HTTPS:** https://yourdomain.com (if configured)

**Need help?** Check the Troubleshooting section or reach out for support.

