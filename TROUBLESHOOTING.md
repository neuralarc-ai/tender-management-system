# GCP Deployment Troubleshooting Guide

Common issues you might encounter during deployment and their solutions.

## Table of Contents
1. [VM Instance Issues](#vm-instance-issues)
2. [SSH Connection Issues](#ssh-connection-issues)
3. [Installation Issues](#installation-issues)
4. [Application Issues](#application-issues)
5. [Nginx Issues](#nginx-issues)
6. [SSL Certificate Issues](#ssl-certificate-issues)
7. [Performance Issues](#performance-issues)
8. [Network Issues](#network-issues)

---

## VM Instance Issues

### Issue: Cannot create VM instance
**Symptoms:**
- Error when clicking "Create Instance"
- "Quota exceeded" error
- "Insufficient permissions" error

**Solutions:**
```bash
# 1. Check if Compute Engine API is enabled
# Go to: APIs & Services > Library > Search "Compute Engine"

# 2. Check billing account is active
# Go to: Billing > Overview

# 3. Check quotas
# Go to: IAM & Admin > Quotas
# Look for "CPUs" and "In-use IP addresses"

# 4. Try different region/zone
# Some zones may have limited capacity
```

### Issue: VM instance is slow to start
**Symptoms:**
- VM takes more than 5 minutes to start
- Status stuck at "Starting"

**Solutions:**
```bash
# 1. Wait 10 minutes - larger disk images take time

# 2. Check status in Cloud Console
# Compute Engine > VM Instances > Check status

# 3. Reset instance (if stuck for >15 minutes)
# Click 3 dots > Reset
```

---

## SSH Connection Issues

### Issue: Cannot connect via SSH
**Symptoms:**
- "Connection refused"
- "Permission denied"
- SSH window closes immediately

**Solutions:**
```bash
# 1. Check if VM is running
# Compute Engine > VM Instances > Status should be "Running" with green checkmark

# 2. Check firewall rules allow SSH (port 22)
# VPC Network > Firewall > Look for rule allowing tcp:22

# 3. Try browser SSH (easiest method)
# Click "SSH" button next to your VM in GCP Console

# 4. If using gcloud, update SDK
gcloud components update

# 5. Reset SSH keys
gcloud compute config-ssh --remove
gcloud compute config-ssh

# 6. Check your public IP is allowed
# VPC Network > Firewall > Edit SSH rule > Source IP ranges: 0.0.0.0/0
```

### Issue: SSH connection drops frequently
**Symptoms:**
- Connection closes after a few minutes of inactivity
- "broken pipe" error

**Solutions:**
```bash
# On your LOCAL machine, edit SSH config
nano ~/.ssh/config

# Add these lines:
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3

# This sends keepalive packets every 60 seconds
```

---

## Installation Issues

### Issue: Node.js installation fails
**Symptoms:**
- "Unable to locate package nodejs"
- Old Node.js version installed

**Solutions:**
```bash
# Remove old versions
sudo apt remove nodejs npm

# Clear cache
sudo apt autoremove
sudo apt autoclean

# Install from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should show v20.x.x
```

### Issue: npm install fails with permission errors
**Symptoms:**
- "EACCES: permission denied"
- "Cannot create directory"

**Solutions:**
```bash
# 1. Check directory ownership
ls -la /var/www/tender-app

# 2. Fix ownership
sudo chown -R $USER:$USER /var/www/tender-app

# 3. Never use sudo with npm install
# (except for global packages with -g flag)

# 4. Clear npm cache if issues persist
npm cache clean --force
```

### Issue: npm install is very slow
**Symptoms:**
- Taking more than 10 minutes
- Stuck on specific package

**Solutions:**
```bash
# 1. Check internet connection
ping -c 4 8.8.8.8

# 2. Use different npm registry
npm config set registry https://registry.npmjs.org/

# 3. Install with legacy peer deps
npm install --legacy-peer-deps

# 4. Increase npm timeout
npm config set fetch-timeout 600000
```

---

## Application Issues

### Issue: npm run build fails
**Symptoms:**
- Build process exits with error
- "Out of memory" error
- TypeScript errors

**Solutions:**
```bash
# 1. Check for TypeScript errors
npm run lint

# 2. Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build

# 3. Clear .next directory
rm -rf .next
npm run build

# 4. Check environment variables are set
cat .env.local

# 5. Install dependencies again
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Application doesn't start with PM2
**Symptoms:**
- PM2 shows status as "errored"
- Application restarts continuously
- "Error: listen EADDRINUSE"

**Solutions:**
```bash
# 1. Check PM2 logs
pm2 logs tender-app --err --lines 50

# 2. Check if port 3000 is already in use
sudo lsof -i :3000

# 3. Kill process using the port
sudo kill -9 PROCESS_ID

# 4. Delete PM2 process and restart
pm2 delete tender-app
pm2 start npm --name "tender-app" -- start

# 5. Check if built correctly
ls -la .next/

# 6. Try starting manually first
npm start
# If this works, then:
pm2 start npm --name "tender-app" -- start
```

### Issue: Environment variables not working
**Symptoms:**
- Application can't connect to Supabase
- AI features not working
- "undefined" errors in logs

**Solutions:**
```bash
# 1. Check .env.local exists
ls -la /var/www/tender-app/.env.local

# 2. Verify contents (be careful - don't expose keys!)
cat .env.local | grep -v "KEY"  # Shows structure without keys

# 3. Ensure file has correct permissions
chmod 600 .env.local

# 4. Restart application after changing env vars
pm2 restart tender-app

# 5. Check environment variables in PM2
pm2 show tender-app

# 6. For Next.js, NEXT_PUBLIC_ vars must be set before build
# If you change them, rebuild:
npm run build
pm2 restart tender-app
```

### Issue: File uploads not working
**Symptoms:**
- "413 Request Entity Too Large"
- Upload fails silently
- "ENOENT: no such file or directory"

**Solutions:**
```bash
# 1. Check Nginx client_max_body_size
sudo nano /etc/nginx/sites-available/tender-app
# Should have: client_max_body_size 10M;

# 2. Increase if needed
client_max_body_size 50M;

# 3. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 4. Check uploads directory exists
ls -la /var/www/tender-app/data/uploads

# 5. Create if missing
mkdir -p /var/www/tender-app/data/uploads

# 6. Check permissions
sudo chown -R $USER:$USER /var/www/tender-app/data
```

---

## Nginx Issues

### Issue: Nginx fails to start
**Symptoms:**
- "nginx: [emerg] bind() failed"
- "Address already in use"
- Configuration test fails

**Solutions:**
```bash
# 1. Test configuration
sudo nginx -t

# 2. Check what's using port 80
sudo lsof -i :80

# 3. Kill conflicting process
sudo systemctl stop apache2  # If Apache is installed
# Or kill specific process

# 4. Check for syntax errors in config
sudo nano /etc/nginx/sites-available/tender-app

# 5. Common mistakes:
# - Missing semicolons
# - Unmatched brackets
# - Wrong file paths

# 6. View error logs
sudo tail -n 50 /var/log/nginx/error.log

# 7. Start with clean config
sudo cp /etc/nginx/sites-available/tender-app /etc/nginx/sites-available/tender-app.backup
# Then fix the config
```

### Issue: 502 Bad Gateway
**Symptoms:**
- Nginx shows "502 Bad Gateway" error
- Application not accessible

**Solutions:**
```bash
# 1. Check if application is running
pm2 status

# 2. If stopped, start it
pm2 start tender-app

# 3. Check if app is listening on port 3000
sudo lsof -i :3000

# 4. Test direct connection
curl http://localhost:3000

# 5. Check Nginx proxy_pass is correct
sudo grep proxy_pass /etc/nginx/sites-available/tender-app
# Should be: proxy_pass http://localhost:3000;

# 6. Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# 7. Restart both
pm2 restart tender-app
sudo systemctl restart nginx
```

### Issue: 504 Gateway Timeout
**Symptoms:**
- Page loads for long time then shows "504 Gateway Timeout"
- Happens during AI generation

**Solutions:**
```bash
# 1. Increase Nginx timeouts
sudo nano /etc/nginx/sites-available/tender-app

# Add or increase these values in location block:
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
proxy_read_timeout 600s;

# 2. Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# 3. Check application isn't crashed
pm2 logs tender-app --lines 50

# 4. Monitor during long request
pm2 monit
```

---

## SSL Certificate Issues

### Issue: Certbot fails to obtain certificate
**Symptoms:**
- "Challenge failed"
- "Could not bind to IPv4"
- Domain validation error

**Solutions:**
```bash
# 1. Ensure domain points to your VM IP
nslookup yourdomain.com
# Should return your VM's IP address

# 2. Check Nginx is running on port 80
sudo systemctl status nginx
curl http://yourdomain.com

# 3. Temporarily stop Nginx and use standalone mode
sudo systemctl stop nginx
sudo certbot certonly --standalone -d yourdomain.com
sudo systemctl start nginx

# 4. If DNS is incorrect, wait for propagation
# Can take up to 48 hours

# 5. Check firewall allows port 80
sudo ufw status
# Should show: 80/tcp ALLOW Anywhere

# 6. Try with webroot method
sudo certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### Issue: Certificate expired
**Symptoms:**
- "Certificate has expired" error in browser
- HTTPS not working

**Solutions:**
```bash
# 1. Check certificate status
sudo certbot certificates

# 2. Renew manually
sudo certbot renew

# 3. Force renewal if not expired yet
sudo certbot renew --force-renewal

# 4. Check auto-renewal timer
sudo systemctl status certbot.timer

# 5. Enable auto-renewal if disabled
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 6. Test auto-renewal
sudo certbot renew --dry-run
```

---

## Performance Issues

### Issue: Application is slow
**Symptoms:**
- Pages take more than 5 seconds to load
- High CPU/memory usage
- Frequent timeouts

**Solutions:**
```bash
# 1. Check system resources
htop  # Press F10 to quit

# 2. Check memory usage
free -h

# 3. Check disk space
df -h

# 4. Check application logs for errors
pm2 logs tender-app --lines 100

# 5. Monitor application
pm2 monit

# 6. Restart application
pm2 restart tender-app

# 7. If memory is full, consider upgrading VM
# Compute Engine > VM Instances > Stop VM > Edit > Change machine type

# 8. Clear logs if disk is full
sudo journalctl --vacuum-time=7d
pm2 flush

# 9. Enable Nginx caching (add to server block)
sudo nano /etc/nginx/sites-available/tender-app

# Add:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g;
proxy_cache app_cache;
proxy_cache_valid 200 1h;
```

### Issue: Out of memory errors
**Symptoms:**
- Application crashes with "JavaScript heap out of memory"
- PM2 shows status as "errored"

**Solutions:**
```bash
# 1. Stop PM2 process
pm2 stop tender-app

# 2. Delete process
pm2 delete tender-app

# 3. Start with increased memory
pm2 start npm --name "tender-app" --node-args="--max-old-space-size=2048" -- start

# 4. Save configuration
pm2 save

# 5. If issues persist, upgrade VM
# Consider e2-standard-2 (8 GB RAM) instead of e2-medium (4 GB)
```

---

## Network Issues

### Issue: Cannot access application from internet
**Symptoms:**
- Can access via SSH
- curl localhost:3000 works on server
- Cannot access via browser using IP

**Solutions:**
```bash
# 1. Check firewall rules in GCP
# VPC Network > Firewall > Ensure HTTP/HTTPS rules exist

# 2. Check UFW firewall on VM
sudo ufw status
# Should allow Nginx Full (ports 80, 443)

# 3. Allow Nginx if not already
sudo ufw allow 'Nginx Full'

# 4. Check Nginx is listening on public interface
sudo netstat -tlnp | grep nginx
# Should show 0.0.0.0:80 and 0.0.0.0:443

# 5. Check application is accessible
curl http://localhost:3000

# 6. Test from outside
curl http://YOUR_VM_IP

# 7. Check GCP firewall tags
# Compute Engine > VM Instances > Edit > Network tags
# Should have tags that match firewall rules
```

### Issue: Intermittent connection timeouts
**Symptoms:**
- Sometimes works, sometimes times out
- Load balancer health checks failing

**Solutions:**
```bash
# 1. Check application isn't crashing
pm2 logs tender-app --lines 200

# 2. Monitor restarts
watch -n 2 pm2 status

# 3. Increase application stability
pm2 stop tender-app
pm2 delete tender-app
pm2 start npm --name "tender-app" --max-restarts 10 -- start

# 4. Check network connectivity
ping -c 10 8.8.8.8

# 5. Check Nginx keepalive
sudo nano /etc/nginx/nginx.conf

# Add in http block:
keepalive_timeout 65;
keepalive_requests 100;

# 6. Reload Nginx
sudo systemctl reload nginx
```

---

## Database Connection Issues

### Issue: Cannot connect to Supabase
**Symptoms:**
- "Failed to connect to database"
- API requests timeout
- Authentication errors

**Solutions:**
```bash
# 1. Check environment variables
cat /var/www/tender-app/.env.local | grep SUPABASE

# 2. Verify Supabase URL is correct
# Should be: https://xxxxx.supabase.co

# 3. Test connection from server
curl https://YOUR_SUPABASE_URL.supabase.co

# 4. Check Supabase dashboard
# Go to: https://app.supabase.com
# Project Settings > API > Verify keys

# 5. Check network allows outbound HTTPS
curl -I https://supabase.com

# 6. Restart application after env changes
pm2 restart tender-app

# 7. Check application logs
pm2 logs tender-app | grep -i supabase
```

---

## Emergency Recovery

### Complete Application Failure
```bash
# 1. Check everything is running
pm2 status
sudo systemctl status nginx

# 2. Restart application
pm2 restart tender-app

# 3. Restart Nginx
sudo systemctl restart nginx

# 4. If still failing, check logs
pm2 logs tender-app --err --lines 100
sudo tail -n 100 /var/log/nginx/error.log

# 5. Restore from backup
cd /var/www/tender-app
tar -xzf ~/backups/app_backup_YYYYMMDD.tar.gz

# 6. Rebuild and restart
npm install
npm run build
pm2 restart tender-app

# 7. As last resort, reboot VM
sudo reboot
```

### VM Completely Unresponsive
```bash
# From GCP Console:
# 1. Go to Compute Engine > VM Instances
# 2. Click 3 dots next to your VM
# 3. Select "Reset"
# 4. Wait 2-3 minutes for VM to restart
# 5. SSH in and check status:
pm2 status
sudo systemctl status nginx
```

---

## Getting More Help

### Collect Diagnostic Information
```bash
# Run this script to collect all relevant info
cat > ~/diagnostics.sh << 'EOF'
#!/bin/bash
echo "=== System Info ==="
uname -a
uptime
echo ""

echo "=== Disk Space ==="
df -h
echo ""

echo "=== Memory ==="
free -h
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== PM2 Logs (last 50 lines) ==="
pm2 logs tender-app --lines 50 --nostream
echo ""

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager
echo ""

echo "=== Nginx Error Logs (last 20 lines) ==="
sudo tail -n 20 /var/log/nginx/error.log
echo ""

echo "=== Listening Ports ==="
sudo netstat -tlnp | grep -E ':(80|443|3000)'
echo ""

echo "=== Firewall Status ==="
sudo ufw status
echo ""
EOF

chmod +x ~/diagnostics.sh
~/diagnostics.sh > ~/diagnostics.txt
cat ~/diagnostics.txt
```

### Share Logs Securely
```bash
# Never share files containing API keys or passwords!

# Download diagnostics to your local machine
gcloud compute scp tender-app-vm:~/diagnostics.txt ./ --zone=us-central1-a

# Or use GCP Console:
# Click "Download file" in SSH window
```

---

## Prevention Best Practices

1. **Always test in staging first** (if you have a staging environment)
2. **Backup before major changes**: `~/backup-app.sh`
3. **Monitor logs regularly**: `pm2 logs tender-app`
4. **Keep system updated**: `sudo apt update && sudo apt upgrade`
5. **Document changes**: Keep notes on what you modified
6. **Use version control**: Commit changes to git before deploying
7. **Test locally first**: Build and test on local machine
8. **Monitor resources**: Check `htop` regularly
9. **Setup alerts**: Use GCP monitoring
10. **Have rollback plan**: Keep recent backups

---

**Remember:** Most issues can be resolved by:
1. Checking logs (`pm2 logs` and `/var/log/nginx/error.log`)
2. Restarting services (`pm2 restart` and `sudo systemctl restart nginx`)
3. Verifying configuration (`sudo nginx -t` and `cat .env.local`)
4. Checking resources (`htop`, `df -h`, `free -h`)

**Still stuck?** Refer to the full deployment guide or reach out for help!

