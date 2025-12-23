# GCP Deployment Checklist

Use this checklist to ensure all steps are completed for a successful deployment.

## Pre-Deployment

### GCP Setup
- [ ] GCP account created
- [ ] Billing information added
- [ ] Project created: `tender-management-system`
- [ ] Compute Engine API enabled

### VM Instance
- [ ] VM instance created
  - [ ] Name: `tender-app-vm`
  - [ ] Region selected (closest to users)
  - [ ] Machine type: `e2-medium` or higher
  - [ ] Boot disk: Ubuntu 22.04 LTS, 20+ GB
  - [ ] HTTP traffic allowed
  - [ ] HTTPS traffic allowed
- [ ] Static IP address reserved
- [ ] Firewall rules configured
  - [ ] HTTP (port 80)
  - [ ] HTTPS (port 443)
  - [ ] Port 3000 (for testing)

### Domain Setup (Optional)
- [ ] Domain name purchased
- [ ] DNS A record configured pointing to VM IP
- [ ] DNS propagation verified (test with `ping yourdomain.com`)

## Server Setup

### System Configuration
- [ ] SSH connection to VM established
- [ ] System packages updated (`sudo apt update && sudo apt upgrade`)
- [ ] Essential tools installed (`curl`, `wget`, `git`, `build-essential`)

### Software Installation
- [ ] Node.js 20.x installed
  - [ ] Version verified: `node --version`
  - [ ] npm verified: `npm --version`
- [ ] PM2 installed globally
  - [ ] Version verified: `pm2 --version`
- [ ] Nginx installed and running
  - [ ] Status checked: `sudo systemctl status nginx`
  - [ ] Welcome page accessible at `http://VM_IP`

### Directory Setup
- [ ] Application directory created: `/var/www/tender-app`
- [ ] Correct permissions set: `sudo chown -R $USER:$USER /var/www/tender-app`

## Application Deployment

### Code Upload
- [ ] Application code uploaded to VM
  - [ ] Method used: Git / SCP / SFTP
  - [ ] All files transferred successfully
  - [ ] `.git` folder included (if using Git)

### Environment Configuration
- [ ] `.env.local` file created in `/var/www/tender-app/`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV=production`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `AI_API_KEY`
  - [ ] `AI_API_ENDPOINT`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] File permissions set: `chmod 600 .env.local`

### Build and Test
- [ ] Dependencies installed: `npm install`
- [ ] Application built successfully: `npm run build`
- [ ] Manual test run successful: `npm start`
- [ ] Application accessible at `http://VM_IP:3000`
- [ ] All features working correctly

### PM2 Setup
- [ ] Application started with PM2: `pm2 start npm --name "tender-app" -- start`
- [ ] PM2 configuration saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup systemd`
- [ ] Startup command executed
- [ ] PM2 status verified: `pm2 status`

### Nginx Configuration
- [ ] Nginx configuration file created: `/etc/nginx/sites-available/tender-app`
- [ ] Configuration includes:
  - [ ] Correct server_name (domain or IP)
  - [ ] Proxy to localhost:3000
  - [ ] Increased client_max_body_size (10M)
  - [ ] Proper proxy headers
  - [ ] Timeout settings for AI operations
- [ ] Symbolic link created: `/etc/nginx/sites-enabled/tender-app`
- [ ] Default site disabled
- [ ] Nginx configuration tested: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`
- [ ] Application accessible at `http://VM_IP` (without :3000)

## Security Setup

### Firewall Configuration
- [ ] UFW installed: `sudo apt install ufw`
- [ ] SSH allowed: `sudo ufw allow OpenSSH`
- [ ] HTTP/HTTPS allowed: `sudo ufw allow 'Nginx Full'`
- [ ] Firewall enabled: `sudo ufw enable`
- [ ] Firewall status checked: `sudo ufw status`

### SSL Certificate (If using domain)
- [ ] Certbot installed: `sudo apt install certbot python3-certbot-nginx`
- [ ] SSL certificate obtained: `sudo certbot --nginx -d yourdomain.com`
- [ ] HTTPS working: `https://yourdomain.com`
- [ ] Auto-renewal tested: `sudo certbot renew --dry-run`
- [ ] `.env.local` updated with HTTPS URL

### Additional Security
- [ ] Automatic security updates enabled: `sudo dpkg-reconfigure unattended-upgrades`
- [ ] Fail2Ban installed (optional): `sudo apt install fail2ban`
- [ ] Non-default SSH port configured (optional)
- [ ] Root login disabled (optional)

## Monitoring & Maintenance

### Backup Setup
- [ ] Backup script created: `~/backup-app.sh`
- [ ] Script tested manually: `~/backup-app.sh`
- [ ] Cron job configured for daily backups
- [ ] Backup directory verified: `~/backups/`

### Monitoring
- [ ] PM2 logs accessible: `pm2 logs tender-app`
- [ ] Nginx logs accessible: `sudo tail -f /var/log/nginx/access.log`
- [ ] System monitoring installed (optional): `htop`

### Performance Optimization
- [ ] Nginx gzip compression enabled
- [ ] Nginx configuration optimized
- [ ] Application performance tested under load

## Testing & Verification

### Functionality Tests
- [ ] Landing page loads correctly
- [ ] Client portal accessible: `/client`
- [ ] Admin portal accessible: `/admin`
- [ ] PIN authentication working
- [ ] File upload working
- [ ] Tender submission successful
- [ ] AI analysis generating (check logs)
- [ ] Proposal generation working
- [ ] Notifications displaying
- [ ] All API endpoints responding

### Performance Tests
- [ ] Page load time acceptable (< 3 seconds)
- [ ] File upload speed reasonable
- [ ] AI generation completing successfully
- [ ] No memory leaks observed
- [ ] CPU usage normal

### Security Tests
- [ ] HTTPS working (if configured)
- [ ] HTTP redirects to HTTPS (if configured)
- [ ] Environment variables not exposed
- [ ] API endpoints require authentication
- [ ] File uploads restricted to allowed types
- [ ] XSS protection working
- [ ] CSRF protection enabled

## Post-Deployment

### Documentation
- [ ] Deployment documented (date, configuration, issues)
- [ ] Access credentials stored securely
- [ ] VM IP address documented
- [ ] Domain configuration documented
- [ ] Environment variables backed up securely

### Team Access
- [ ] SSH keys added for team members (if needed)
- [ ] Access credentials shared securely
- [ ] Deployment guide shared with team

### Monitoring & Alerts
- [ ] GCP monitoring enabled
- [ ] Log aggregation setup (optional)
- [ ] Alert notifications configured (optional)
- [ ] Uptime monitoring setup (optional)

### Maintenance Plan
- [ ] Update schedule defined
- [ ] Backup verification schedule set
- [ ] Security patch policy defined
- [ ] Incident response plan created

## Known Issues & Notes

Record any issues encountered during deployment:

```
Date: _______________
Issue: 
Solution:
Notes:
```

## Verification Commands

Run these commands to verify everything is working:

```bash
# Check Node.js
node --version
npm --version

# Check PM2
pm2 status
pm2 logs tender-app --lines 50

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check Firewall
sudo ufw status

# Check SSL (if configured)
sudo certbot certificates

# Check disk space
df -h

# Check memory
free -h

# Test application
curl http://localhost:3000
curl http://YOUR_VM_IP

# Check listening ports
sudo netstat -tlnp | grep -E ':(80|443|3000)'
```

## Rollback Plan

In case of deployment failure:

1. [ ] Stop PM2 application: `pm2 stop tender-app`
2. [ ] Restore previous version from backup
3. [ ] Rebuild application: `npm run build`
4. [ ] Restart PM2: `pm2 restart tender-app`
5. [ ] Verify application working
6. [ ] Document incident and lessons learned

## Success Criteria

Deployment is successful when:

- [x] Application accessible via HTTP/HTTPS
- [x] All features working as expected
- [x] No errors in logs
- [x] Performance meets requirements
- [x] Security measures in place
- [x] Backups configured
- [x] Monitoring active
- [x] Team can access and use the system

## Sign-off

Deployment completed by: _______________
Date: _______________
Signature: _______________

Verified by: _______________
Date: _______________
Signature: _______________

---

**Notes:**
- Keep this checklist updated with any additional steps specific to your deployment
- Use this as a template for future deployments
- Document any deviations from the standard process

