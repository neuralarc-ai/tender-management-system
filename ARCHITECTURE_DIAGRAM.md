# GCP Deployment Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           INTERNET                                   │
│                    (Users/Clients Access)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS/HTTP
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      GCP FIREWALL RULES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Port 80     │  │  Port 443    │  │  Port 22     │             │
│  │  (HTTP)      │  │  (HTTPS)     │  │  (SSH)       │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    GCP VM INSTANCE (Ubuntu 22.04)                    │
│  Machine Type: e2-medium (2 vCPU, 4 GB RAM)                         │
│  Region: us-central1 (configurable)                                 │
│  Static IP: xxx.xxx.xxx.xxx                                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                    UFW FIREWALL                                 ││
│  │  SSH (22), HTTP (80), HTTPS (443)                              ││
│  └─────────────────────────┬──────────────────────────────────────┘│
│                             ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                  NGINX (Reverse Proxy)                          ││
│  │  • Port 80/443 → Port 3000                                     ││
│  │  • SSL Termination (Let's Encrypt)                             ││
│  │  • Gzip Compression                                            ││
│  │  • Request Buffering                                           ││
│  │  • Timeout Configuration                                       ││
│  └─────────────────────────┬──────────────────────────────────────┘│
│                             │                                        │
│                             ↓ localhost:3000                         │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                      PM2 PROCESS MANAGER                        ││
│  │  • Auto-restart on crash                                       ││
│  │  • Log management                                              ││
│  │  • Zero-downtime reload                                        ││
│  │  • Startup script                                              ││
│  └─────────────────────────┬──────────────────────────────────────┘│
│                             │                                        │
│                             ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              NEXT.JS APPLICATION (Production)                   ││
│  │  Location: /var/www/tender-app                                 ││
│  │                                                                 ││
│  │  ┌─────────────────────────────────────────────────────────┐  ││
│  │  │  Client Portal       │  Admin Portal     │  API Routes  │  ││
│  │  │  /client            │  /admin          │  /api/*      │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  │                                                                 ││
│  │  Environment Variables (.env.local):                           ││
│  │  • SUPABASE_URL                                                ││
│  │  • SUPABASE_KEYS                                               ││
│  │  • AI_API_KEY                                                  ││
│  │  • AI_API_ENDPOINT                                             ││
│  └──────────────────┬─────────────────────┬─────────────────────┘│
│                      │                     │                       │
└──────────────────────┼─────────────────────┼───────────────────────┘
                       │                     │
                       ↓                     ↓
    ┌──────────────────────────┐  ┌──────────────────────────┐
    │   EXTERNAL SERVICES      │  │   EXTERNAL SERVICES      │
    │                          │  │                          │
    │   Supabase (Database)    │  │   Helium AI API         │
    │   • PostgreSQL           │  │   • Proposal Generation  │
    │   • Storage              │  │   • AI Analysis          │
    │   • Authentication       │  │   • Chat Functions       │
    │   • Real-time Updates    │  │                          │
    └──────────────────────────┘  └──────────────────────────┘
```

---

## Request Flow Diagram

### 1. HTTP/HTTPS Request Flow

```
User Browser
     │
     │ 1. Request: https://yourdomain.com/admin
     ↓
GCP Firewall
     │
     │ 2. Check: Port 443 allowed? ✓
     ↓
VM Instance (UFW)
     │
     │ 3. Check: Nginx Full allowed? ✓
     ↓
Nginx
     │
     │ 4. SSL Termination (if HTTPS)
     │ 5. Add proxy headers
     │ 6. Proxy to localhost:3000
     ↓
PM2
     │
     │ 7. Manage process
     │ 8. Handle crashes/restarts
     ↓
Next.js Application
     │
     │ 9. Route request
     │ 10. Process logic
     │ 11. Query Supabase (if needed)
     │ 12. Call AI API (if needed)
     ↓
Response
     │
     │ 13. Send back through chain
     │
     ↓
User Browser (Rendered page)
```

---

## File Storage Structure

```
/var/www/tender-app/
├── .next/                    # Built application
├── .env.local               # Environment variables
├── app/                     # Next.js app directory
│   ├── api/                # API routes
│   ├── admin/              # Admin portal
│   └── client/             # Client portal
├── components/              # React components
├── lib/                    # Utility libraries
├── public/                 # Static assets
├── data/                   # Data storage
│   └── uploads/            # User uploads
├── node_modules/           # Dependencies
└── package.json            # Dependencies list

/var/log/nginx/
├── access.log              # HTTP access logs
└── error.log               # Nginx error logs

~/.pm2/
├── logs/                   # PM2 logs
│   ├── tender-app-out.log  # Application output
│   └── tender-app-error.log # Application errors
└── pids/                   # Process IDs

~/backups/                  # Application backups
└── app_backup_YYYYMMDD.tar.gz
```

---

## Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL NETWORK                          │
│                  (Public Internet)                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ Static IP: xxx.xxx.xxx.xxx
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    GCP VPC NETWORK                           │
│                                                              │
│  Firewall Rules:                                            │
│  • allow-http:    0.0.0.0/0 → tcp:80                       │
│  • allow-https:   0.0.0.0/0 → tcp:443                      │
│  • allow-ssh:     0.0.0.0/0 → tcp:22                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  VM Instance: tender-app-vm                          │  │
│  │  Internal IP: 10.x.x.x                               │  │
│  │  External IP: Static (xxx.xxx.xxx.xxx)              │  │
│  │                                                       │  │
│  │  Services:                                           │  │
│  │  • :80   → Nginx (HTTP)                             │  │
│  │  • :443  → Nginx (HTTPS)                            │  │
│  │  • :3000 → Next.js (localhost only)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└───────────────────────┬─────────────┬────────────────────────┘
                        │             │
                        │ Outbound    │ Outbound
                        │             │
         ┌──────────────▼───┐    ┌───▼──────────────┐
         │   Supabase       │    │   Helium AI      │
         │   (External)     │    │   (External)     │
         └──────────────────┘    └──────────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: GCP Firewall (Cloud Level)                        │
│  • Only specific ports open                                 │
│  • Source IP filtering available                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 2: UFW Firewall (VM Level)                           │
│  • Additional port filtering                                │
│  • Rate limiting (with fail2ban)                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 3: Nginx (Application Level)                         │
│  • SSL/TLS encryption                                       │
│  • Request size limits                                      │
│  • Security headers                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Layer 4: Next.js Application                               │
│  • Input validation                                         │
│  • Authentication/Authorization                             │
│  • Environment variable isolation                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Process Management

```
System Boot
     │
     ↓
systemd (init system)
     │
     ├─→ Nginx Service
     │   └─→ nginx master process
     │       └─→ nginx worker processes
     │
     └─→ PM2 Startup Script
         └─→ PM2 Daemon
             └─→ tender-app (Node.js process)
                 └─→ Next.js server

If Application Crashes:
     │
     ↓
PM2 Detects Crash
     │
     ↓
PM2 Restarts Application (max 10 times)
     │
     ↓
Application Running Again
```

---

## Deployment Flow

```
Local Development
     │
     │ 1. Code changes
     │ 2. Test locally
     │ 3. Commit to Git
     ↓
Git Repository
     │
     │ 4. Push to remote
     ↓
GCP VM
     │
     │ 5. SSH into server
     │ 6. git pull
     │ 7. npm install
     │ 8. npm run build
     ↓
PM2
     │
     │ 9. pm2 reload (zero-downtime)
     ↓
Users
     │
     │ 10. Access updated application
     ↓
Success!
```

---

## Monitoring & Logging Flow

```
┌──────────────────────────────────────────────────────────┐
│  Application Events                                      │
│  • HTTP Requests                                         │
│  • Errors                                                │
│  • Performance metrics                                   │
└────────────┬─────────────────────────────────────────────┘
             │
             ├─→ Next.js Logs
             │   └─→ PM2 Logs
             │       └─→ ~/.pm2/logs/
             │
             ├─→ Nginx Access Logs
             │   └─→ /var/log/nginx/access.log
             │
             └─→ Nginx Error Logs
                 └─→ /var/log/nginx/error.log

View Logs:
• pm2 logs tender-app          (Real-time application logs)
• sudo tail -f /var/log/nginx/access.log  (HTTP requests)
• sudo tail -f /var/log/nginx/error.log   (Nginx errors)
• pm2 monit                    (Real-time monitoring)
```

---

## Backup & Recovery

```
┌──────────────────────────────────────────────────────────┐
│  Backup Schedule (Automated via cron)                    │
│  Daily at 2:00 AM                                        │
└────────────┬─────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│  Backup Script: ~/backup-app.sh                          │
│  • Compress /var/www/tender-app                          │
│  • Save to ~/backups/                                    │
│  • Keep last 7 backups                                   │
└────────────┬─────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│  Backup Storage: ~/backups/                              │
│  • app_backup_20240101.tar.gz                           │
│  • app_backup_20240102.tar.gz                           │
│  • ... (last 7 days)                                    │
└──────────────────────────────────────────────────────────┘

Recovery Process:
1. Stop application: pm2 stop tender-app
2. Restore backup: tar -xzf ~/backups/app_backup_YYYYMMDD.tar.gz
3. Restart: pm2 restart tender-app
```

---

## Scaling Options

### Vertical Scaling (Single VM - Easier)
```
Current: e2-medium (2 vCPU, 4 GB RAM)
    ↓
Upgrade to: e2-standard-2 (2 vCPU, 8 GB RAM)
    ↓
Further: e2-standard-4 (4 vCPU, 16 GB RAM)

Steps:
1. Stop VM
2. Edit machine type
3. Start VM
4. Verify application
```

### Horizontal Scaling (Multiple VMs - Advanced)
```
Load Balancer
    │
    ├─→ VM Instance 1
    ├─→ VM Instance 2
    └─→ VM Instance 3

Requirements:
• GCP Load Balancer
• Shared database (Supabase)
• Session management
• File storage solution
```

---

## Cost Breakdown

```
┌──────────────────────────────────────────────────────────┐
│  Monthly Costs (US Region)                               │
└──────────────────────────────────────────────────────────┘

VM Instance (e2-medium):
• 2 vCPU, 4 GB RAM
• 730 hours/month
• Cost: ~$30-35/month

Static IP Address:
• Reserved external IP
• Cost: ~$3/month

Persistent Disk:
• 20 GB balanced disk
• Cost: ~$2/month

Network Egress:
• First 1 GB: Free
• Additional: ~$0.12/GB
• Estimate: $5-10/month (depending on traffic)

SSL Certificate:
• Let's Encrypt: Free

Total Estimate: $40-50/month

Note: Actual costs may vary based on:
• Region selection
• Actual traffic
• Disk snapshots
• Additional services
```

---

## High Availability Setup (Optional/Advanced)

```
┌─────────────────────────────────────────────────────────┐
│  GCP Cloud Load Balancer (HTTPS)                        │
│  • SSL Termination                                      │
│  • Health Checks                                        │
│  • Traffic Distribution                                 │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┴────────┬────────────────┐
    │                 │                │
    ↓                 ↓                ↓
┌────────┐      ┌────────┐      ┌────────┐
│ VM 1   │      │ VM 2   │      │ VM 3   │
│ Active │      │ Active │      │ Standby│
└────────┘      └────────┘      └────────┘
    │                 │                │
    └────────┬────────┴────────────────┘
             │
             ↓
    ┌────────────────┐
    │   Supabase     │
    │   (Shared DB)  │
    └────────────────┘

Benefits:
• Zero downtime deployments
• Better fault tolerance
• Higher capacity
• Geographic distribution

Additional Costs: ~$100-200/month
```

---

This architecture provides a solid foundation for your Tender Management System with:
- ✅ Security (multiple layers)
- ✅ Reliability (auto-restart, monitoring)
- ✅ Scalability (vertical and horizontal options)
- ✅ Maintainability (clear structure, logging)
- ✅ Cost-effectiveness (optimized for small to medium traffic)

For questions or customizations, refer to the main deployment guide!

