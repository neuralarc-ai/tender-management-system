#!/bin/bash

###############################################################################
# GCP VM Deployment Script for Tender Management System
# 
# This script automates the deployment process on a GCP VM
# Run this on your GCP VM after SSH connection
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo ""
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

print_header "GCP VM Deployment Script"
print_info "This script will setup your tender management system"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled"
    exit 1
fi

###############################################################################
# Step 1: Update System
###############################################################################
print_header "Step 1: Updating System Packages"

sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

print_success "System packages updated"

###############################################################################
# Step 2: Install Node.js
###############################################################################
print_header "Step 2: Installing Node.js 20.x"

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_info "Node.js is already installed: $NODE_VERSION"
    read -p "Do you want to reinstall? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

print_success "Node.js installed: $(node -v)"
print_success "npm installed: $(npm -v)"

###############################################################################
# Step 3: Install PM2
###############################################################################
print_header "Step 3: Installing PM2 Process Manager"

sudo npm install -g pm2

print_success "PM2 installed: $(pm2 -v)"

###############################################################################
# Step 4: Install and Configure Nginx
###############################################################################
print_header "Step 4: Installing and Configuring Nginx"

sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_success "Nginx installed and started"

###############################################################################
# Step 5: Setup Application Directory
###############################################################################
print_header "Step 5: Setting up Application Directory"

APP_DIR="/var/www/tender-app"

if [ -d "$APP_DIR" ]; then
    print_info "Application directory already exists"
    read -p "Do you want to remove it and start fresh? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo rm -rf "$APP_DIR"
        sudo mkdir -p "$APP_DIR"
    fi
else
    sudo mkdir -p "$APP_DIR"
fi

sudo chown -R $USER:$USER "$APP_DIR"

print_success "Application directory ready: $APP_DIR"

###############################################################################
# Step 6: Clone or Setup Application
###############################################################################
print_header "Step 6: Application Setup"

echo "How would you like to setup the application?"
echo "1) Clone from Git repository"
echo "2) Manual upload (I'll upload files via SCP later)"
echo ""
read -p "Enter choice (1 or 2): " SETUP_CHOICE

if [ "$SETUP_CHOICE" == "1" ]; then
    read -p "Enter Git repository URL: " GIT_REPO
    
    cd "$APP_DIR"
    
    # Check if directory is empty
    if [ "$(ls -A $APP_DIR)" ]; then
        print_info "Directory not empty, pulling latest changes"
        git pull
    else
        git clone "$GIT_REPO" .
    fi
    
    print_success "Application code downloaded"
    
    # Ask for environment variables
    print_header "Environment Variables Setup"
    
    read -p "Enter Supabase URL: " SUPABASE_URL
    read -p "Enter Supabase Anon Key: " SUPABASE_ANON_KEY
    read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_KEY
    read -p "Enter AI API Key: " AI_API_KEY
    read -p "Enter Application URL (e.g., http://your-vm-ip): " APP_URL
    
    cat > "$APP_DIR/.env.local" <<EOF
# Production Environment
NODE_ENV=production

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# AI API Configuration
AI_API_KEY=$AI_API_KEY
AI_API_ENDPOINT=https://api.he2.site/api/v1/public

# Application URL
NEXT_PUBLIC_APP_URL=$APP_URL
EOF

    chmod 600 "$APP_DIR/.env.local"
    print_success "Environment variables configured"
    
    # Install dependencies and build
    print_header "Installing Dependencies and Building"
    
    cd "$APP_DIR"
    npm install
    npm run build
    
    print_success "Application built successfully"
    
    # Setup PM2
    print_header "Starting Application with PM2"
    
    pm2 stop tender-app 2>/dev/null || true
    pm2 delete tender-app 2>/dev/null || true
    pm2 start npm --name "tender-app" -- start
    pm2 save
    
    print_success "Application started with PM2"
    
elif [ "$SETUP_CHOICE" == "2" ]; then
    print_info "Application directory ready at: $APP_DIR"
    print_info "Please upload your files using SCP:"
    print_info "From your local machine, run:"
    print_info "scp -r /path/to/your/app/* $USER@$(curl -s ifconfig.me):$APP_DIR"
    echo ""
    print_info "After uploading, run this script again or continue manually"
    exit 0
else
    print_error "Invalid choice"
    exit 1
fi

###############################################################################
# Step 7: Configure Nginx
###############################################################################
print_header "Step 7: Configuring Nginx Reverse Proxy"

VM_IP=$(curl -s ifconfig.me)
read -p "Enter your domain name (or press Enter to use IP: $VM_IP): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    DOMAIN_NAME=$VM_IP
fi

NGINX_CONF="/etc/nginx/sites-available/tender-app"

sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Increase client body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts for AI operations
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
EOF

# Enable site
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

print_success "Nginx configured and reloaded"

###############################################################################
# Step 8: Setup PM2 Startup
###############################################################################
print_header "Step 8: Configuring PM2 Startup"

pm2 startup systemd -u $USER --hp /home/$USER | grep "sudo" | bash

print_success "PM2 startup configured"

###############################################################################
# Step 9: Setup Firewall (UFW)
###############################################################################
print_header "Step 9: Configuring Firewall"

sudo apt install -y ufw

# Configure firewall rules
sudo ufw --force disable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'

read -p "Do you want to enable the firewall now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo ufw --force enable
    print_success "Firewall enabled"
else
    print_info "Firewall configured but not enabled"
fi

###############################################################################
# Step 10: Setup SSL (Optional)
###############################################################################
print_header "Step 10: SSL Certificate Setup (Optional)"

if [ "$DOMAIN_NAME" != "$VM_IP" ]; then
    read -p "Do you want to setup SSL certificate with Let's Encrypt? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d "$DOMAIN_NAME" --non-interactive --agree-tos --email admin@$DOMAIN_NAME || print_error "SSL setup failed. You can run 'sudo certbot --nginx' manually later"
        print_success "SSL certificate installed"
    fi
else
    print_info "Skipping SSL setup (using IP address)"
fi

###############################################################################
# Deployment Complete
###############################################################################
print_header "Deployment Complete! 🎉"

echo ""
print_success "Your application is now running!"
echo ""
echo "Access your application at:"
if [ "$DOMAIN_NAME" != "$VM_IP" ]; then
    echo "  🌐 https://$DOMAIN_NAME (if SSL was configured)"
fi
echo "  🌐 http://$DOMAIN_NAME"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs tender-app     - View application logs"
echo "  pm2 restart tender-app  - Restart application"
echo "  sudo systemctl status nginx - Check Nginx status"
echo ""
print_info "For more details, check GCP_DEPLOYMENT_GUIDE.md"
echo ""

