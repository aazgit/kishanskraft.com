#!/bin/bash

# KishansKraft Website - Production Installation Script
# Automated setup script for deploying the website in production
# Supports multiple hosting platforms and server configurations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="KishansKraft Website"
PROJECT_DIR="kishans-kraft-website"
NODE_MIN_VERSION="16"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"

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

# Progress bar function
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))
    local remaining=$((width - completed))
    
    printf "\r${CYAN}Progress: [${NC}"
    printf "%*s" $completed | tr ' ' '█'
    printf "%*s" $remaining | tr ' ' '░'
    printf "${CYAN}] %d%% (%d/%d)${NC}" $percentage $current $total
}

# Header
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║          🌟 KishansKraft Website Production Setup 🌟          ║"
echo "║                                                              ║"
echo "║  Automated installation script for production deployment     ║"
echo "║  Enterprise-ready with security, performance & monitoring    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_warning "This script is running as root. Consider using a non-root user for security."
   read -p "Continue anyway? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       exit 1
   fi
fi

# Function to check system requirements
check_system_requirements() {
    log_step "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_info "Detected Linux system ✓"
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        log_info "Detected macOS system ✓"
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        log_info "Detected Windows system ✓"
        OS="windows"
    else
        log_warning "Unknown OS: $OSTYPE"
        OS="unknown"
    fi
    
    # Check available disk space (need at least 100MB)
    available_space=$(df . | tail -1 | awk '{print $4}')
    required_space=100000  # 100MB in KB
    
    if [[ $available_space -lt $required_space ]]; then
        log_error "Insufficient disk space. Need at least 100MB free."
        exit 1
    fi
    
    log_success "System requirements check completed"
}

# Function to check and install Node.js
check_nodejs() {
    log_step "Checking Node.js installation..."
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge $NODE_MIN_VERSION ]]; then
            log_success "Node.js $(node -v) is installed and meets requirements ✓"
            return 0
        else
            log_warning "Node.js version $(node -v) is too old. Need v${NODE_MIN_VERSION}+ "
        fi
    else
        log_warning "Node.js is not installed"
    fi
    
    # Install Node.js
    log_info "Installing Node.js..."
    
    if [[ "$OS" == "linux" ]]; then
        if command -v apt-get >/dev/null 2>&1; then
            # Ubuntu/Debian
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v yum >/dev/null 2>&1; then
            # CentOS/RHEL
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            sudo yum install -y nodejs npm
        elif command -v dnf >/dev/null 2>&1; then
            # Fedora
            sudo dnf install -y nodejs npm
        else
            log_error "Unsupported Linux distribution. Please install Node.js manually."
            exit 1
        fi
    elif [[ "$OS" == "macos" ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew install node
        else
            log_error "Homebrew not found. Please install Node.js manually from https://nodejs.org"
            exit 1
        fi
    else
        log_error "Please install Node.js manually from https://nodejs.org"
        exit 1
    fi
    
    # Verify installation
    if command -v node >/dev/null 2>&1; then
        log_success "Node.js $(node -v) installed successfully ✓"
    else
        log_error "Node.js installation failed"
        exit 1
    fi
}

# Function to check and install Git
check_git() {
    log_step "Checking Git installation..."
    
    if command -v git >/dev/null 2>&1; then
        log_success "Git $(git --version | cut -d' ' -f3) is installed ✓"
        return 0
    fi
    
    log_info "Installing Git..."
    
    if [[ "$OS" == "linux" ]]; then
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update && sudo apt-get install -y git
        elif command -v yum >/dev/null 2>&1; then
            sudo yum install -y git
        elif command -v dnf >/dev/null 2>&1; then
            sudo dnf install -y git
        fi
    elif [[ "$OS" == "macos" ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew install git
        else
            log_info "Git should be available via Xcode Command Line Tools"
            xcode-select --install
        fi
    fi
    
    if command -v git >/dev/null 2>&1; then
        log_success "Git installed successfully ✓"
    else
        log_error "Git installation failed"
        exit 1
    fi
}

# Function to install additional dependencies
install_dependencies() {
    log_step "Installing system dependencies..."
    
    if [[ "$OS" == "linux" ]]; then
        if command -v apt-get >/dev/null 2>&1; then
            # Ubuntu/Debian
            sudo apt-get update
            sudo apt-get install -y curl wget unzip build-essential
            
            # Install Nginx (optional)
            read -p "Install Nginx web server? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                sudo apt-get install -y nginx
                log_success "Nginx installed ✓"
            fi
            
        elif command -v yum >/dev/null 2>&1; then
            # CentOS/RHEL
            sudo yum update -y
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y curl wget unzip
            
        elif command -v dnf >/dev/null 2>&1; then
            # Fedora
            sudo dnf update -y
            sudo dnf groupinstall -y "Development Tools"
            sudo dnf install -y curl wget unzip
        fi
    elif [[ "$OS" == "macos" ]]; then
        if command -v brew >/dev/null 2>&1; then
            brew install curl wget
        fi
    fi
    
    log_success "System dependencies installed ✓"
}

# Function to setup project
setup_project() {
    log_step "Setting up KishansKraft website project..."
    
    # Create project directory
    if [[ -d "$PROJECT_DIR" ]]; then
        log_warning "Project directory already exists. Creating backup..."
        cp -r "$PROJECT_DIR" "$BACKUP_DIR"
        log_info "Backup created: $BACKUP_DIR"
        
        read -p "Remove existing directory and reinstall? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$PROJECT_DIR"
        else
            log_info "Installation cancelled"
            exit 0
        fi
    fi
    
    # Check if we're already in the project directory
    if [[ -f "package.json" ]] && grep -q "kishans-kraft-website" package.json 2>/dev/null; then
        log_info "Already in KishansKraft project directory"
        PROJECT_DIR="."
    else
        # Clone or copy project files
        if [[ -n "${REPO_URL:-}" ]]; then
            log_info "Cloning from repository: $REPO_URL"
            git clone "$REPO_URL" "$PROJECT_DIR"
        else
            log_info "Creating project structure from current directory..."
            mkdir -p "$PROJECT_DIR"
            
            # Copy all necessary files
            for item in *.html *.js *.json *.md *.txt assets data images partials; do
                if [[ -e "$item" ]]; then
                    cp -r "$item" "$PROJECT_DIR/"
                fi
            done
        fi
    fi
    
    cd "$PROJECT_DIR"
    log_success "Project setup completed ✓"
}

# Function to install npm dependencies
install_npm_dependencies() {
    log_step "Installing npm dependencies..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found. Make sure you're in the project directory."
        exit 1
    fi
    
    # Clean install
    rm -rf node_modules package-lock.json 2>/dev/null || true
    
    # Install dependencies with progress
    npm install --production=false
    
    log_success "NPM dependencies installed ✓"
}

# Function to build project
build_project() {
    log_step "Building project for production..."
    
    # Run build command
    if npm run build; then
        log_success "Project built successfully ✓"
    else
        log_error "Build failed. Check the output above for errors."
        exit 1
    fi
    
    # Verify build output
    if [[ -d "dist" ]] && [[ -f "dist/index.html" ]]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        log_success "Build output ready in dist/ folder (Size: $DIST_SIZE) ✓"
    else
        log_error "Build output not found. Build may have failed."
        exit 1
    fi
}

# Function to setup web server configuration
setup_web_server() {
    log_step "Configuring web server..."
    
    echo "Select your web server:"
    echo "1) Nginx"
    echo "2) Apache"
    echo "3) Skip web server configuration"
    read -p "Enter choice (1-3): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            setup_nginx
            ;;
        2)
            setup_apache
            ;;
        3)
            log_info "Skipping web server configuration"
            ;;
        *)
            log_warning "Invalid choice. Skipping web server configuration."
            ;;
    esac
}

# Function to setup Nginx
setup_nginx() {
    log_info "Setting up Nginx configuration..."
    
    # Get domain name
    read -p "Enter your domain name (e.g., kishanskraft.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        DOMAIN="localhost"
        log_warning "No domain specified. Using localhost."
    fi
    
    # Create Nginx config
    NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"
    
    sudo tee "$NGINX_CONFIG" > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $(pwd)/dist;
    index index.html;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Service worker
    location = /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }
    
    # Manifest
    location = /manifest.json {
        add_header Cache-Control "no-cache";
        expires 0;
    }
}
EOF
    
    # Enable site
    sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/"
    
    # Test and reload Nginx
    if sudo nginx -t; then
        sudo systemctl reload nginx
        log_success "Nginx configured successfully ✓"
        log_info "Site available at: http://$DOMAIN"
    else
        log_error "Nginx configuration error. Please check the config."
    fi
}

# Function to setup Apache
setup_apache() {
    log_info "Setting up Apache configuration..."
    
    read -p "Enter your domain name (e.g., kishanskraft.com): " DOMAIN
    if [[ -z "$DOMAIN" ]]; then
        DOMAIN="localhost"
    fi
    
    APACHE_CONFIG="/etc/apache2/sites-available/$DOMAIN.conf"
    
    sudo tee "$APACHE_CONFIG" > /dev/null << EOF
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $(pwd)/dist
    
    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
    </Location>
    
    # Cache static files
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
    
    # Handle client-side routing
    FallbackResource /index.html
    
    ErrorLog \${APACHE_LOG_DIR}/$DOMAIN_error.log
    CustomLog \${APACHE_LOG_DIR}/$DOMAIN_access.log combined
</VirtualHost>
EOF
    
    # Enable site and modules
    sudo a2enmod headers expires rewrite
    sudo a2ensite "$DOMAIN"
    sudo systemctl reload apache2
    
    log_success "Apache configured successfully ✓"
    log_info "Site available at: http://$DOMAIN"
}

# Function to setup SSL certificate
setup_ssl() {
    read -p "Setup SSL certificate with Let's Encrypt? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_step "Setting up SSL certificate..."
        
        # Install Certbot
        if [[ "$OS" == "linux" ]]; then
            if command -v apt-get >/dev/null 2>&1; then
                sudo apt-get install -y certbot python3-certbot-nginx
            elif command -v yum >/dev/null 2>&1; then
                sudo yum install -y certbot python3-certbot-nginx
            fi
        fi
        
        if command -v certbot >/dev/null 2>&1; then
            read -p "Enter your email for Let's Encrypt: " EMAIL
            read -p "Enter your domain: " DOMAIN
            
            if [[ -n "$EMAIL" ]] && [[ -n "$DOMAIN" ]]; then
                sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --no-eff-email
                log_success "SSL certificate installed ✓"
            else
                log_warning "Email or domain not provided. Skipping SSL setup."
            fi
        else
            log_warning "Certbot not available. Please install SSL manually."
        fi
    fi
}

# Function to setup monitoring
setup_monitoring() {
    log_step "Setting up monitoring and maintenance..."
    
    # Create maintenance scripts directory
    mkdir -p scripts
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script for KishansKraft website

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_$DATE"
PROJECT_DIR="$(dirname "$0")/.."

mkdir -p "$BACKUP_DIR"

# Backup website files
cp -r "$PROJECT_DIR/dist" "$BACKUP_DIR/"
cp -r "$PROJECT_DIR/data" "$BACKUP_DIR/"
cp "$PROJECT_DIR/package.json" "$BACKUP_DIR/"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "backups" "backup_$DATE"
rm -rf "$BACKUP_DIR"

echo "Backup created: $BACKUP_DIR.tar.gz"

# Keep only last 7 backups
cd backups
ls -t *.tar.gz | tail -n +8 | xargs -r rm --
EOF
    
    chmod +x scripts/backup.sh
    
    # Create update script
    cat > scripts/update.sh << 'EOF'
#!/bin/bash
# Automated update script for KishansKraft website

PROJECT_DIR="$(dirname "$0")/.."
cd "$PROJECT_DIR"

echo "Updating KishansKraft website..."

# Create backup before update
./scripts/backup.sh

# Pull latest changes (if using git)
if [[ -d ".git" ]]; then
    git pull origin main
fi

# Update dependencies
npm install

# Rebuild project
npm run build

# Restart web server (if using systemd)
if command -v systemctl >/dev/null 2>&1; then
    sudo systemctl reload nginx 2>/dev/null || sudo systemctl reload apache2 2>/dev/null || true
fi

echo "Update completed successfully!"
EOF
    
    chmod +x scripts/update.sh
    
    # Setup cron job for automated backups
    read -p "Setup automated daily backups? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/backup.sh") | crontab -
        log_success "Daily backup cron job created ✓"
    fi
    
    log_success "Monitoring and maintenance setup completed ✓"
}

# Function to run post-installation tests
run_tests() {
    log_step "Running post-installation tests..."
    
    local test_count=0
    local passed_tests=0
    
    # Test 1: Check if dist directory exists
    ((test_count++))
    if [[ -d "dist" ]]; then
        ((passed_tests++))
        log_success "✓ Build output directory exists"
    else
        log_error "✗ Build output directory missing"
    fi
    
    # Test 2: Check if main HTML files exist
    ((test_count++))
    if [[ -f "dist/index.html" ]]; then
        ((passed_tests++))
        log_success "✓ Main HTML files exist"
    else
        log_error "✗ Main HTML files missing"
    fi
    
    # Test 3: Check if assets are built
    ((test_count++))
    if [[ -f "dist/assets/css/style.css" ]] && [[ -f "dist/assets/js/site.js" ]]; then
        ((passed_tests++))
        log_success "✓ CSS and JavaScript assets built"
    else
        log_error "✗ CSS and JavaScript assets missing"
    fi
    
    # Test 4: Check if PWA files exist
    ((test_count++))
    if [[ -f "dist/manifest.json" ]] && [[ -f "dist/sw.js" ]]; then
        ((passed_tests++))
        log_success "✓ PWA files present"
    else
        log_error "✗ PWA files missing"
    fi
    
    # Test 5: Check if Node.js and npm work
    ((test_count++))
    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        ((passed_tests++))
        log_success "✓ Node.js and npm working"
    else
        log_error "✗ Node.js or npm not working"
    fi
    
    # Test 6: Test basic HTTP server
    ((test_count++))
    if command -v python3 >/dev/null 2>&1; then
        cd dist
        python3 -m http.server 8888 > /dev/null 2>&1 &
        SERVER_PID=$!
        sleep 2
        
        if curl -s http://localhost:8888 > /dev/null 2>&1; then
            ((passed_tests++))
            log_success "✓ Website serves correctly on HTTP"
        else
            log_error "✗ Website not serving correctly"
        fi
        
        kill $SERVER_PID 2>/dev/null || true
        cd ..
    else
        log_warning "Python3 not available for HTTP test"
    fi
    
    # Display test results
    echo
    log_info "Test Results: $passed_tests/$test_count tests passed"
    
    if [[ $passed_tests -eq $test_count ]]; then
        log_success "All tests passed! ✅"
        return 0
    else
        log_warning "Some tests failed. Please review the installation."
        return 1
    fi
}

# Function to display final instructions
show_final_instructions() {
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}║               🎉 Installation Completed! 🎉                  ║${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    log_success "KishansKraft website has been successfully installed!"
    echo
    
    log_info "Next Steps:"
    echo "1. 📝 Update placeholder content:"
    echo "   - Replace phone numbers (+91 99999 99999) with actual numbers"
    echo "   - Update email addresses (hello@kishanskraft.com)"
    echo "   - Add real product images to images/ folder"
    echo "   - Update business information in HTML files"
    echo
    
    echo "2. 🔧 Configure your domain:"
    echo "   - Point your domain to this server"
    echo "   - Update sitemap.xml with your domain"
    echo "   - Set up SSL certificate for HTTPS"
    echo
    
    echo "3. 📊 Set up analytics:"
    echo "   - Add Google Analytics tracking ID"
    echo "   - Configure Google Search Console"
    echo "   - Set up monitoring and alerts"
    echo
    
    echo "4. 🚀 Go live:"
    echo "   - Test all functionality thoroughly"
    echo "   - Run Lighthouse performance test"
    echo "   - Submit sitemap to search engines"
    echo
    
    log_info "Useful Commands:"
    echo "• Update website: ./scripts/update.sh"
    echo "• Create backup: ./scripts/backup.sh"
    echo "• Rebuild project: npm run build"
    echo "• Start dev server: npm run dev"
    echo
    
    log_info "Important Files:"
    echo "• Website files: dist/ folder"
    echo "• Source code: Current directory"
    echo "• Documentation: README.md, DEVELOPMENT.md"
    echo "• Deployment guide: DEPLOYMENT-CHECKLIST.md"
    echo
    
    if [[ -n "$DOMAIN" ]]; then
        log_success "Your website is available at: http://$DOMAIN"
    else
        log_info "Test locally with: npm run preview"
    fi
    
    echo
    log_success "🌟 KishansKraft website is ready for production! 🌟"
}

# Main installation process
main() {
    local total_steps=10
    local current_step=0
    
    echo -e "${BLUE}Starting automated installation...${NC}"
    echo
    
    # Step 1: System requirements
    ((current_step++))
    show_progress $current_step $total_steps
    check_system_requirements
    echo
    
    # Step 2: Node.js
    ((current_step++))
    show_progress $current_step $total_steps
    check_nodejs
    echo
    
    # Step 3: Git
    ((current_step++))
    show_progress $current_step $total_steps
    check_git
    echo
    
    # Step 4: Dependencies
    ((current_step++))
    show_progress $current_step $total_steps
    install_dependencies
    echo
    
    # Step 5: Project setup
    ((current_step++))
    show_progress $current_step $total_steps
    setup_project
    echo
    
    # Step 6: NPM dependencies
    ((current_step++))
    show_progress $current_step $total_steps
    install_npm_dependencies
    echo
    
    # Step 7: Build project
    ((current_step++))
    show_progress $current_step $total_steps
    build_project
    echo
    
    # Step 8: Web server
    ((current_step++))
    show_progress $current_step $total_steps
    setup_web_server
    echo
    
    # Step 9: SSL and monitoring
    ((current_step++))
    show_progress $current_step $total_steps
    setup_ssl
    setup_monitoring
    echo
    
    # Step 10: Tests and final instructions
    ((current_step++))
    show_progress $current_step $total_steps
    echo
    run_tests
    show_final_instructions
}

# Handle script interruption
trap 'echo -e "\n${RED}Installation interrupted by user${NC}"; exit 1' INT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --repo-url)
            REPO_URL="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --repo-url URL    Clone from specified repository URL"
            echo "  --domain DOMAIN   Set domain name for web server"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            log_warning "Unknown option: $1"
            shift
            ;;
    esac
done

# Run main installation
main

exit 0