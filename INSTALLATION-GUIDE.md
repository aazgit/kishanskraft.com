# Installation Script Documentation

## 🚀 Automated Production Installation Scripts

The KishansKraft website comes with comprehensive installation scripts for seamless production deployment on any server platform.

### Available Scripts

#### 1. **Linux/macOS Installation** (`install.sh`)
- **Supports**: Ubuntu, Debian, CentOS, RHEL, Fedora, macOS
- **Web Servers**: Nginx, Apache
- **Features**: Full automation with SSL setup and monitoring

#### 2. **Windows Installation** (`install.bat`)
- **Supports**: Windows Server 2016+, Windows 10/11
- **Web Servers**: IIS (Internet Information Services)
- **Features**: GUI-friendly setup with batch scripts

---

## 📋 Quick Start Guide

### Linux/macOS Setup
```bash
# Download and run the installation script
curl -fsSL https://raw.githubusercontent.com/yourusername/kishans-kraft/main/install.sh | bash

# Or if you have the files locally:
chmod +x install.sh
sudo ./install.sh
```

### Windows Setup
```cmd
REM Download and run as Administrator
install.bat

REM Or with specific options
install.bat
```

---

## 🔧 Installation Features

### Automated System Setup
- ✅ **System Requirements Check** - Verifies OS compatibility and resources
- ✅ **Node.js Installation** - Installs latest LTS version if missing
- ✅ **Git Installation** - Sets up version control system
- ✅ **Dependencies** - Installs build tools and system packages

### Project Configuration
- ✅ **Source Code Setup** - Downloads or configures project files
- ✅ **NPM Dependencies** - Installs all required packages
- ✅ **Production Build** - Compiles optimized website files
- ✅ **Asset Optimization** - Minifies CSS/JS and optimizes images

### Web Server Setup
- ✅ **Nginx Configuration** - Complete server block with security headers
- ✅ **Apache Configuration** - Virtual host with performance optimizations
- ✅ **IIS Configuration** - Windows server setup with proper bindings
- ✅ **SSL Certificate** - Let's Encrypt integration for HTTPS

### Security & Performance
- ✅ **Security Headers** - CSP, HSTS, XSS protection, and more
- ✅ **Gzip Compression** - Reduces bandwidth usage
- ✅ **Caching Rules** - Optimizes static asset delivery
- ✅ **Rate Limiting** - Prevents abuse and attacks

### Monitoring & Maintenance
- ✅ **Automated Backups** - Daily backup scripts with rotation
- ✅ **Update Scripts** - One-command website updates
- ✅ **Health Checks** - Post-installation validation tests
- ✅ **Cron Jobs** - Scheduled maintenance tasks

---

## 📊 Installation Process

### Step-by-Step Breakdown

1. **System Validation** (5%)
   - OS detection and compatibility check
   - Resource availability verification
   - Permission validation

2. **Dependency Installation** (20%)
   - Node.js and NPM setup
   - Git installation
   - Build tools and system packages

3. **Project Setup** (25%)
   - Source code download/configuration
   - Directory structure creation
   - File permissions setup

4. **Build Process** (30%)
   - NPM dependency installation
   - Production build compilation
   - Asset optimization and minification

5. **Web Server Configuration** (45%)
   - Server installation and setup
   - Virtual host/site configuration
   - Security headers implementation

6. **SSL & Security** (65%)
   - Let's Encrypt certificate installation
   - Security policy configuration
   - Firewall rules setup

7. **Monitoring Setup** (80%)
   - Backup script creation
   - Update automation setup
   - Health check configuration

8. **Testing & Validation** (95%)
   - Functionality tests
   - Performance validation
   - Security verification

9. **Final Configuration** (100%)
   - Documentation generation
   - Final instructions display
   - Success confirmation

---

## 🎯 Supported Platforms

### Linux Distributions
| Distribution | Version | Web Server | Status |
|-------------|---------|------------|--------|
| Ubuntu | 18.04+ | Nginx/Apache | ✅ Fully Supported |
| Debian | 10+ | Nginx/Apache | ✅ Fully Supported |
| CentOS | 7+ | Nginx/Apache | ✅ Fully Supported |
| RHEL | 7+ | Nginx/Apache | ✅ Fully Supported |
| Fedora | 30+ | Nginx/Apache | ✅ Fully Supported |

### macOS
| Version | Compatibility | Notes |
|---------|---------------|-------|
| macOS 10.15+ | ✅ Supported | Requires Homebrew |
| macOS 11+ | ✅ Fully Supported | Recommended |

### Windows
| Version | Web Server | Status |
|---------|------------|--------|
| Windows Server 2016+ | IIS | ✅ Fully Supported |
| Windows 10/11 Pro | IIS | ✅ Supported |

---

## ⚙️ Configuration Options

### Command Line Arguments

#### Linux/macOS (`install.sh`)
```bash
# Clone from specific repository
./install.sh --repo-url https://github.com/user/repo.git

# Set domain name
./install.sh --domain kishanskraft.com

# Show help
./install.sh --help
```

#### Environment Variables
```bash
# Set custom configuration
export DOMAIN="kishanskraft.com"
export EMAIL="admin@kishanskraft.com"
export WEB_SERVER="nginx"  # or "apache"
./install.sh
```

### Interactive Configuration
The installation script will prompt for:
- Domain name configuration
- SSL certificate setup
- Web server choice (Nginx/Apache/IIS)
- Automated backup setup
- Monitoring configuration

---

## 🔒 Security Features

### Implemented Security Measures
- **Content Security Policy (CSP)** - Prevents XSS attacks
- **HTTP Strict Transport Security (HSTS)** - Enforces HTTPS
- **X-Frame-Options** - Prevents clickjacking
- **X-Content-Type-Options** - Prevents MIME sniffing
- **Referrer Policy** - Controls referrer information
- **Permissions Policy** - Restricts browser features

### SSL/TLS Configuration
- **Let's Encrypt Integration** - Free SSL certificates
- **Automatic Renewal** - Certificates auto-renew before expiry
- **Strong Cipher Suites** - Modern encryption standards
- **Perfect Forward Secrecy** - Enhanced security

---

## 📈 Performance Optimizations

### Web Server Optimizations
- **Gzip Compression** - Reduces file sizes by 70-80%
- **Browser Caching** - Optimizes repeat visitor experience
- **Static Asset Caching** - Long-term caching for images/CSS/JS
- **HTTP/2 Support** - Modern protocol benefits

### Application Optimizations
- **Minified Assets** - Compressed CSS and JavaScript
- **Optimized Images** - Responsive images with proper formats
- **Critical CSS Inlining** - Faster initial page render
- **Lazy Loading** - Improved page load performance

---

## 🛠️ Maintenance Scripts

### Automated Backup (`scripts/backup.sh` or `scripts/backup.bat`)
```bash
# Linux/macOS
./scripts/backup.sh

# Windows
scripts\backup.bat
```

**Features:**
- Creates timestamped backups
- Includes website files and data
- Compresses archives to save space
- Rotates old backups (keeps last 7)

### Website Updates (`scripts/update.sh` or `scripts/update.bat`)
```bash
# Linux/macOS
./scripts/update.sh

# Windows
scripts\update.bat
```

**Features:**
- Creates backup before update
- Pulls latest changes from Git
- Updates NPM dependencies
- Rebuilds production files
- Restarts web server

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **Permission Errors**
```bash
# Solution: Run with appropriate permissions
sudo ./install.sh
# or
chmod +x install.sh
```

#### 2. **Node.js Version Issues**
```bash
# Check version
node -v

# Update Node.js (Linux)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. **Build Failures**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 4. **Web Server Issues**
```bash
# Check Nginx status
sudo systemctl status nginx

# Check Apache status
sudo systemctl status apache2

# Check configuration
sudo nginx -t
sudo apache2ctl configtest
```

### Log Locations

#### Linux
- **Nginx**: `/var/log/nginx/`
- **Apache**: `/var/log/apache2/`
- **System**: `/var/log/syslog`

#### Windows
- **IIS**: `C:\inetpub\logs\LogFiles`
- **System**: Event Viewer

---

## 📞 Support & Help

### Pre-Installation Checklist
- [ ] Server meets minimum requirements (1GB RAM, 10GB disk space)
- [ ] Administrative/root access available
- [ ] Internet connection for downloading dependencies
- [ ] Domain name configured (if using custom domain)

### Post-Installation Verification
- [ ] Website loads at configured domain/IP
- [ ] All pages navigate correctly
- [ ] Forms submit properly
- [ ] PWA features work (offline mode, install prompt)
- [ ] SSL certificate is valid and active
- [ ] Performance scores are acceptable (Lighthouse 90+)

### Getting Help
1. **Check logs** for specific error messages
2. **Review documentation** in README.md and DEVELOPMENT.md
3. **Run diagnostic tests** included in installation script
4. **Verify system requirements** and dependencies

---

## 🎉 Success Metrics

After successful installation, you should have:

✅ **Fully functional website** running on production server  
✅ **SSL certificate** installed and configured  
✅ **Performance optimized** with 90+ Lighthouse scores  
✅ **Security hardened** with comprehensive headers  
✅ **Monitoring setup** with automated backups  
✅ **Maintenance scripts** for easy updates  
✅ **Documentation** for ongoing management  

**Total installation time**: 10-15 minutes on most systems  
**Zero-downtime updates**: Supported through update scripts  
**Enterprise-ready**: Production-grade configuration out of the box  

---

*The installation scripts provide a complete, automated solution for deploying the KishansKraft website in any production environment with professional-grade configuration and security.*