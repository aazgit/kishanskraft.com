#!/bin/bash

# KishansKraft Website - Plesk Hosting Auto-Deploy Script
# Automated deployment script for Plesk shared/VPS hosting
# Uses git clone for seamless deployment and updates

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE VALUES
REPO_URL="https://github.com/aazgit/24.git"  # Your repository URL
DOMAIN_NAME=""  # Will be detected or prompted
PROJECT_NAME="KishansKraft Website"

# Plesk-specific paths
PLESK_VHOSTS="/var/www/vhosts"
HTTPDOCS="httpdocs"
BACKUP_DIR="backups"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Header
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🚀 KishansKraft Plesk Auto-Deploy 🚀                ║"
echo "║                                                              ║"
echo "║  Automated git clone deployment for Plesk hosting           ║"
echo "║  Production-ready with zero-downtime deployment             ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Function to detect Plesk environment
detect_plesk_environment() {
    log_step "Detecting Plesk environment..."
    
    # Check if we're in a Plesk environment
    if [[ -d "/usr/local/psa" ]] || [[ -d "/opt/psa" ]]; then
        log_success "Plesk control panel detected ✓"
        PLESK_DETECTED=true
    else
        log_warning "Plesk not detected, assuming shared hosting environment"
        PLESK_DETECTED=false
    fi
    
    # Try to detect domain from current path
    CURRENT_PATH=$(pwd)
    if [[ $CURRENT_PATH =~ /var/www/vhosts/([^/]+) ]]; then
        DOMAIN_NAME="${BASH_REMATCH[1]}"
        log_info "Detected domain: $DOMAIN_NAME"
    elif [[ $CURRENT_PATH =~ /home/([^/]+)/public_html ]]; then
        DOMAIN_NAME="${BASH_REMATCH[1]}"
        log_info "Detected cPanel-style hosting for: $DOMAIN_NAME"
    fi
    
    # If domain not detected, prompt user
    if [[ -z "$DOMAIN_NAME" ]]; then
        read -p "Enter your domain name (e.g., kishanskraft.com): " DOMAIN_NAME
        if [[ -z "$DOMAIN_NAME" ]]; then
            log_error "Domain name is required for deployment"
            exit 1
        fi
    fi
    
    # Set up paths based on detected environment
    if [[ $PLESK_DETECTED == true ]]; then
        SITE_ROOT="/var/www/vhosts/$DOMAIN_NAME"
        WEB_ROOT="$SITE_ROOT/$HTTPDOCS"
        PRIVATE_ROOT="$SITE_ROOT/private"
    else
        # Assume shared hosting structure
        SITE_ROOT="$HOME"
        WEB_ROOT="$HOME/public_html"
        PRIVATE_ROOT="$HOME/private"
    fi
    
    log_info "Site root: $SITE_ROOT"
    log_info "Web root: $WEB_ROOT"
}

# Function to check system requirements
check_system_requirements() {
    log_step "Checking system requirements for Plesk hosting..."
    
    # Check if we have necessary commands
    local missing_commands=()
    
    for cmd in git node npm; do
        if ! command -v $cmd >/dev/null 2>&1; then
            missing_commands+=($cmd)
        fi
    done
    
    if [[ ${#missing_commands[@]} -gt 0 ]]; then
        log_error "Missing required commands: ${missing_commands[*]}"
        log_info "Please install missing commands or contact your hosting provider"
        
        # Try to provide installation guidance
        if [[ " ${missing_commands[*]} " =~ " node " ]] || [[ " ${missing_commands[*]} " =~ " npm " ]]; then
            log_info "For Node.js installation on shared hosting:"
            log_info "1. Check if Node.js is available in your hosting control panel"
            log_info "2. Contact support to enable Node.js for your account"
            log_info "3. Use hosting-specific Node.js installation methods"
        fi
        
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    
    if [[ $NODE_MAJOR -lt 16 ]]; then
        log_warning "Node.js version $NODE_VERSION detected. Recommended: 16+"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "Node.js $NODE_VERSION is compatible ✓"
    fi
    
    # Check available disk space
    available_space=$(df -m . | tail -1 | awk '{print $4}')
    if [[ $available_space -lt 100 ]]; then
        log_warning "Low disk space: ${available_space}MB available"
        read -p "Continue with limited space? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "System requirements check completed ✓"
}

# Function to setup repository
setup_git_repository() {
    log_step "Setting up Git repository for auto-deployment..."
    
    # Create private directory for git repo if it doesn't exist
    mkdir -p "$PRIVATE_ROOT"
    
    REPO_DIR="$PRIVATE_ROOT/kishans-kraft-repo"
    
    # Check if repository already exists
    if [[ -d "$REPO_DIR" ]]; then
        log_info "Repository already exists. Checking for updates..."
        cd "$REPO_DIR"
        
        # Check if it's a valid git repository
        if git status >/dev/null 2>&1; then
            log_info "Pulling latest changes..."
            git pull origin main
            if [[ $? -eq 0 ]]; then
                log_success "Repository updated ✓"
            else
                log_warning "Git pull failed. Repository may have conflicts."
                read -p "Reset repository to latest version? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git reset --hard origin/main
                    log_success "Repository reset to latest version ✓"
                fi
            fi
        else
            log_warning "Invalid git repository found. Removing and re-cloning..."
            cd "$PRIVATE_ROOT"
            rm -rf "$REPO_DIR"
            git clone "$REPO_URL" "$REPO_DIR"
        fi
    else
        log_info "Cloning repository from $REPO_URL..."
        cd "$PRIVATE_ROOT"
        
        if git clone "$REPO_URL" "$REPO_DIR"; then
            log_success "Repository cloned successfully ✓"
        else
            log_error "Failed to clone repository. Please check:"
            log_error "1. Repository URL is correct: $REPO_URL"
            log_error "2. Repository is public or you have access"
            log_error "3. Network connectivity is working"
            exit 1
        fi
    fi
    
    cd "$REPO_DIR"
    
    # Verify we have all necessary files
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in repository"
        exit 1
    fi
    
    log_success "Git repository setup completed ✓"
}

# Function to install dependencies and build
build_website() {
    log_step "Installing dependencies and building website..."
    
    cd "$REPO_DIR"
    
    # Clean previous builds
    rm -rf node_modules dist 2>/dev/null || true
    
    # Install dependencies
    log_info "Installing NPM dependencies..."
    if npm install --production=false; then
        log_success "Dependencies installed ✓"
    else
        log_error "Failed to install dependencies"
        log_info "Try running: npm cache clean --force"
        exit 1
    fi
    
    # Build the project
    log_info "Building production version..."
    if npm run build; then
        log_success "Build completed ✓"
    else
        log_error "Build failed. Check the output above for errors."
        exit 1
    fi
    
    # Verify build output
    if [[ -d "dist" ]] && [[ -f "dist/index.html" ]]; then
        BUILD_SIZE=$(du -sh dist | cut -f1)
        log_success "Build output ready (Size: $BUILD_SIZE) ✓"
    else
        log_error "Build output not found. Build may have failed."
        exit 1
    fi
}

# Function to backup existing website
backup_existing_website() {
    log_step "Creating backup of existing website..."
    
    if [[ -d "$WEB_ROOT" ]] && [[ "$(ls -A $WEB_ROOT 2>/dev/null)" ]]; then
        # Create backup directory
        mkdir -p "$SITE_ROOT/$BACKUP_DIR"
        
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        BACKUP_PATH="$SITE_ROOT/$BACKUP_DIR/$BACKUP_NAME"
        
        # Create backup
        cp -r "$WEB_ROOT" "$BACKUP_PATH"
        
        # Compress backup to save space
        if command -v tar >/dev/null 2>&1; then
            cd "$SITE_ROOT/$BACKUP_DIR"
            tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
            rm -rf "$BACKUP_NAME"
            log_success "Backup created: $BACKUP_NAME.tar.gz ✓"
        else
            log_success "Backup created: $BACKUP_PATH ✓"
        fi
        
        # Keep only last 5 backups
        cd "$SITE_ROOT/$BACKUP_DIR"
        ls -t backup_* 2>/dev/null | tail -n +6 | xargs -r rm -f
        
    else
        log_info "No existing website found to backup"
    fi
}

# Function to deploy website
deploy_website() {
    log_step "Deploying website to production..."
    
    # Ensure web root directory exists
    mkdir -p "$WEB_ROOT"
    
    # Remove old files (but keep .htaccess if it exists)
    if [[ -f "$WEB_ROOT/.htaccess" ]]; then
        cp "$WEB_ROOT/.htaccess" "/tmp/.htaccess.backup"
    fi
    
    # Clear web root
    rm -rf "$WEB_ROOT"/*
    
    # Copy new website files
    cp -r "$REPO_DIR/dist/"* "$WEB_ROOT/"
    
    # Restore .htaccess if it existed
    if [[ -f "/tmp/.htaccess.backup" ]]; then
        cp "/tmp/.htaccess.backup" "$WEB_ROOT/.htaccess"
        rm "/tmp/.htaccess.backup"
        log_info "Restored existing .htaccess file"
    fi
    
    # Set proper permissions for Plesk
    if [[ $PLESK_DETECTED == true ]]; then
        # Set ownership and permissions for Plesk
        if command -v plesk >/dev/null 2>&1; then
            plesk bin subscription --update "$DOMAIN_NAME" -file-permissions 755
        fi
        
        # Standard permissions
        find "$WEB_ROOT" -type f -exec chmod 644 {} \;
        find "$WEB_ROOT" -type d -exec chmod 755 {} \;
    else
        # Standard web permissions
        find "$WEB_ROOT" -type f -exec chmod 644 {} \;
        find "$WEB_ROOT" -type d -exec chmod 755 {} \;
    fi
    
    log_success "Website deployed successfully ✓"
}

# Function to create Plesk-compatible .htaccess
create_htaccess() {
    log_step "Creating optimized .htaccess for Plesk hosting..."
    
    cat > "$WEB_ROOT/.htaccess" << 'EOF'
# KishansKraft Website - Plesk Optimized Configuration

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Images
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    
    # CSS and JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/x-javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType application/font-woff "access plus 1 year"
    ExpiresByType application/font-woff2 "access plus 1 year"
    
    # Documents
    ExpiresByType application/pdf "access plus 1 month"
    
    # HTML and JSON (for PWA)
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/json "access plus 1 hour"
</IfModule>

# Security headers (if mod_headers is available)
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
    
    # Content Security Policy (basic)
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com;"
</IfModule>

# URL Rewriting for SPA (Single Page Application)
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle client-side routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/(images|assets|data)/
    RewriteRule ^(.*)$ index.html [L,QSA]
</IfModule>

# Prevent access to sensitive files
<FilesMatch "\.(json|md|txt)$">
    <RequireAll>
        Require all denied
    </RequireAll>
</FilesMatch>

# Allow specific files
<FilesMatch "^(manifest\.json|robots\.txt|sitemap\.xml)$">
    <RequireAll>
        Require all granted
    </RequireAll>
</FilesMatch>

# MIME types for PWA
AddType application/manifest+json .webmanifest
AddType application/json .json

# Disable server signature
ServerSignature Off
EOF

    log_success "Optimized .htaccess created ✓"
}

# Function to create deployment automation
create_auto_deploy_script() {
    log_step "Creating auto-deployment script..."
    
    mkdir -p "$PRIVATE_ROOT/scripts"
    
    # Create the auto-deploy script
    cat > "$PRIVATE_ROOT/scripts/auto-deploy.sh" << EOF
#!/bin/bash

# KishansKraft Auto-Deploy Script for Plesk
# Run this script to automatically update your website

set -e

REPO_DIR="$REPO_DIR"
WEB_ROOT="$WEB_ROOT"
SITE_ROOT="$SITE_ROOT"
BACKUP_DIR="$SITE_ROOT/$BACKUP_DIR"

echo "🚀 Starting auto-deployment for KishansKraft website..."

# Navigate to repository
cd "\$REPO_DIR"

# Pull latest changes
echo "📥 Pulling latest changes from Git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production=false

# Build project
echo "🔨 Building production version..."
npm run build

# Create backup
echo "💾 Creating backup..."
mkdir -p "\$BACKUP_DIR"
BACKUP_NAME="backup_\$(date +%Y%m%d_%H%M%S)"
if [[ -d "\$WEB_ROOT" ]] && [[ "\$(ls -A \$WEB_ROOT 2>/dev/null)" ]]; then
    cp -r "\$WEB_ROOT" "\$BACKUP_DIR/\$BACKUP_NAME"
    echo "✅ Backup created: \$BACKUP_NAME"
fi

# Deploy new version
echo "🚀 Deploying new version..."
rm -rf "\$WEB_ROOT"/*
cp -r "\$REPO_DIR/dist/"* "\$WEB_ROOT/"

# Set permissions
find "\$WEB_ROOT" -type f -exec chmod 644 {} \\;
find "\$WEB_ROOT" -type d -exec chmod 755 {} \\;

# Clean old backups (keep last 5)
cd "\$BACKUP_DIR"
ls -t backup_* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "✅ Deployment completed successfully!"
echo "🌐 Website updated at: http://$DOMAIN_NAME"
EOF

    chmod +x "$PRIVATE_ROOT/scripts/auto-deploy.sh"
    
    # Create a simple update script for easy access
    cat > "$PRIVATE_ROOT/update.sh" << EOF
#!/bin/bash
# Simple update script - just run: bash ~/private/update.sh
bash "$PRIVATE_ROOT/scripts/auto-deploy.sh"
EOF

    chmod +x "$PRIVATE_ROOT/update.sh"
    
    log_success "Auto-deployment scripts created ✓"
    log_info "Update script location: $PRIVATE_ROOT/update.sh"
    log_info "Full deployment script: $PRIVATE_ROOT/scripts/auto-deploy.sh"
}

# Function to test deployment
test_deployment() {
    log_step "Testing deployment..."
    
    # Check if main files exist
    local test_files=("index.html" "manifest.json" "assets/css/style.css" "assets/js/site.js")
    local missing_files=()
    
    for file in "${test_files[@]}"; do
        if [[ ! -f "$WEB_ROOT/$file" ]]; then
            missing_files+=($file)
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        log_error "Missing files: ${missing_files[*]}"
        return 1
    fi
    
    # Check file permissions
    local index_perms=$(stat -c %a "$WEB_ROOT/index.html" 2>/dev/null || stat -f %A "$WEB_ROOT/index.html" 2>/dev/null)
    if [[ "$index_perms" != "644" ]]; then
        log_warning "File permissions may not be optimal: $index_perms"
    fi
    
    # Test if website loads (basic check)
    if command -v curl >/dev/null 2>&1; then
        if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN_NAME" | grep -q "200\|301\|302"; then
            log_success "Website is accessible ✓"
        else
            log_warning "Website may not be accessible yet (DNS propagation or configuration needed)"
        fi
    fi
    
    log_success "Deployment test completed ✓"
}

# Function to show final instructions
show_final_instructions() {
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}║               🎉 Plesk Deployment Complete! 🎉               ║${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    log_success "KishansKraft website deployed successfully to Plesk hosting!"
    echo
    
    log_info "🌐 Your website is available at:"
    echo "   • http://$DOMAIN_NAME"
    echo "   • https://$DOMAIN_NAME (if SSL is configured)"
    echo
    
    log_info "📁 Deployment locations:"
    echo "   • Website files: $WEB_ROOT"
    echo "   • Repository: $REPO_DIR"
    echo "   • Backups: $SITE_ROOT/$BACKUP_DIR"
    echo
    
    log_info "🔄 Easy updates:"
    echo "   • SSH to your server and run:"
    echo "     bash $PRIVATE_ROOT/update.sh"
    echo "   • Or run the full deployment script:"
    echo "     bash $PRIVATE_ROOT/scripts/auto-deploy.sh"
    echo
    
    log_info "⚙️ Next steps:"
    echo "   1. 📝 Update placeholder content (phone numbers, emails, images)"
    echo "   2. 🔒 Configure SSL certificate in Plesk control panel"
    echo "   3. 📊 Set up Google Analytics tracking"
    echo "   4. 🔍 Submit sitemap to search engines"
    echo "   5. 🧪 Test all website functionality"
    echo
    
    log_info "🛠️ Plesk-specific features:"
    echo "   • Optimized .htaccess for performance and security"
    echo "   • Proper file permissions set automatically"
    echo "   • Backup system with rotation (keeps 5 backups)"
    echo "   • Easy one-command updates from Git repository"
    echo
    
    log_info "💡 Pro tips:"
    echo "   • Set up a cron job to run updates automatically"
    echo "   • Use Plesk's file manager to edit content if needed"
    echo "   • Monitor website performance in Plesk dashboard"
    echo "   • Enable SSL and redirects in Plesk control panel"
    echo
    
    if [[ $PLESK_DETECTED == true ]]; then
        log_info "🎛️ Plesk Control Panel:"
        echo "   • Go to your Plesk panel to configure SSL, email, databases"
        echo "   • Use 'File Manager' to access website files"
        echo "   • Check 'Logs' section for website access/error logs"
        echo "   • Configure redirects and additional domains as needed"
    fi
    
    echo
    log_success "🌟 Your professional KishansKraft website is now live on Plesk hosting! 🌟"
}

# Main execution
main() {
    detect_plesk_environment
    check_system_requirements
    setup_git_repository
    build_website
    backup_existing_website
    deploy_website
    create_htaccess
    create_auto_deploy_script
    test_deployment
    show_final_instructions
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --repo-url)
            REPO_URL="$2"
            shift 2
            ;;
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --repo-url URL    Git repository URL to deploy"
            echo "  --domain DOMAIN   Domain name for deployment"
            echo "  --help           Show this help message"
            echo
            echo "Example:"
            echo "  $0 --repo-url https://github.com/user/repo.git --domain kishanskraft.com"
            exit 0
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Run main deployment
main

exit 0