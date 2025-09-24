# Development and Deployment Guide

## KishansKraft Website - Complete Development Guide

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📁 Project Structure

```
/
├── index.html              # Homepage
├── products.html           # Product listing page  
├── product.html            # Individual product page
├── about.html             # About us page
├── contact.html           # Contact page
├── 404.html               # Error page
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── build.js               # Build configuration
├── package.json           # Dependencies
├── assets/
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   └── js/
│       ├── site.js        # Main functionality
│       ├── header.js      # Header component
│       ├── footer.js      # Footer component
│       ├── analytics.js   # Analytics & tracking
│       ├── security.js    # Security features
│       └── devtools.js    # Development tools
├── data/
│   └── products.json      # Product data
├── images/                # Image assets
└── partials/
    ├── header.html        # Header partial
    └── footer.html        # Footer partial
```

### 🛠️ Development Tools

#### Built-in Development Panel
- **Access**: Press `Ctrl+Shift+D` or add `?debug=true` to URL
- **Features**:
  - Console with command execution
  - Network request monitoring  
  - Performance metrics
  - Storage viewer
  - Accessibility checker
  - PWA tester

#### Keyboard Shortcuts (Development Mode)
- `Ctrl+Shift+D` - Toggle dev panel
- `Ctrl+Shift+R` - Reload CSS
- `Ctrl+Shift+T` - Run PWA test

### 📊 Analytics Integration

The site includes comprehensive analytics tracking:

```javascript
// Track custom events
window.analyticsManager.trackProductView(productId, productName);
window.analyticsManager.trackWhatsAppOrder(productInfo);
window.analyticsManager.trackError(error, context);
```

#### Google Analytics 4 Setup
1. Add your GA4 tracking code to each HTML page:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

2. Analytics will automatically start tracking:
   - Page views and time on page
   - Product views and interactions  
   - Form submissions
   - Scroll depth
   - Core Web Vitals
   - PWA install events

### 🔒 Security Features

The site includes enterprise-level security:

- **Content Security Policy** - Prevents XSS attacks
- **Clickjacking Protection** - Blocks iframe embedding
- **Input Sanitization** - Cleans user inputs
- **CSRF Protection** - Prevents cross-site request forgery
- **Rate Limiting** - Prevents abuse
- **Security Headers** - See `security-headers.md`

### 🎨 Styling & Design

#### CSS Variables (Customization)
```css
:root {
  --primary-color: #2E7D32;     /* Main green */
  --secondary-color: #FFC107;    /* Golden yellow */
  --accent-color: #FF5722;       /* Orange accent */
  --text-dark: #1B2631;         /* Dark text */
  --text-light: #566573;        /* Light text */
  --background: #F8F9FA;        /* Background */
}
```

#### Glassmorphism Effects
The site uses modern glassmorphism design with:
- Backdrop blur effects
- Semi-transparent backgrounds  
- Subtle shadows and borders
- Smooth transitions

### 📱 Progressive Web App (PWA)

#### Features
- **Installable** - Users can install like a native app
- **Offline Support** - Works without internet connection
- **Background Sync** - Queues actions when offline
- **Push Notifications** - Ready for notification setup

#### PWA Testing
```javascript
// Test PWA features
window.devTools?.testPWA();

// Check service worker status
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg ? 'Active' : 'Not registered');
});
```

### 🚀 Deployment Options

#### 1. Netlify (Recommended)
```bash
# Build and deploy
npm run build
# Drag dist folder to netlify.com

# Or use Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### 2. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### 3. GitHub Pages
```bash
# Build for production
npm run build

# Push dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

#### 4. Traditional Web Hosting
1. Run `npm run build`
2. Upload contents of `dist/` folder to web server
3. Configure server headers (see `security-headers.md`)

### 🧪 Testing

#### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works on all devices
- [ ] Forms submit properly
- [ ] Images have proper alt text
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] Performance is good (Lighthouse score >90)

#### Automated Testing
```bash
# Install testing tools
npm install -D lighthouse puppeteer

# Run basic performance test
npx lighthouse http://localhost:3000 --output=html --output-path=lighthouse-report.html
```

### 🔧 Customization Guide

#### Adding New Products
1. Edit `data/products.json`
2. Add product images to `images/` folder
3. Products will automatically appear on products page

#### Adding New Pages
1. Create new HTML file in root
2. Copy structure from existing pages
3. Update navigation in `partials/header.html`

#### Customizing Colors
Edit CSS variables in `assets/css/style.css`:
```css
:root {
  --primary-color: #YourColor;
  /* ... other variables */
}
```

#### Adding Analytics Events
```javascript
// Track custom user actions
window.analyticsManager.sendEvent('custom_event', {
  category: 'user_interaction',
  action: 'button_click',
  label: 'header_cta'
});
```

### 🐛 Troubleshooting

#### Common Issues

1. **Service Worker Not Updating**
   ```javascript
   // Force service worker update
   navigator.serviceWorker.getRegistration().then(reg => {
     reg.update();
   });
   ```

2. **Images Not Loading**
   - Check image paths in HTML
   - Ensure images are in `images/` folder
   - Verify build process includes images

3. **CSS Not Loading**
   - Clear browser cache
   - Check CSS file paths
   - Verify build output

4. **PWA Not Installing**  
   - Ensure HTTPS (required for PWA)
   - Check manifest.json is accessible
   - Verify service worker registration

#### Debug Mode
Add `?debug=true` to any URL to:
- Enable development tools
- Show detailed console logs
- Access performance monitoring
- Test PWA features

### 📈 Performance Optimization

#### Built-in Optimizations
- **Lazy Loading** - Images load as needed
- **Asset Minification** - CSS/JS compressed
- **Caching** - Service worker caches resources
- **Image Optimization** - Responsive images

#### Performance Monitoring
The site automatically tracks:
- Page load times
- Core Web Vitals (LCP, FID, CLS)
- Memory usage
- Network requests

#### Optimization Tips
1. **Images**: Use WebP format when possible
2. **Fonts**: Preload critical font files  
3. **CSS**: Remove unused styles
4. **JavaScript**: Split code for better caching

### 🔄 Updates and Maintenance

#### Updating Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update to latest versions
npx npm-check-updates -u
npm install
```

#### Content Updates
- **Products**: Edit `data/products.json`
- **Images**: Replace files in `images/` folder
- **Content**: Edit HTML files directly
- **Styling**: Modify CSS variables or styles

#### Version Control
```bash
# Commit changes
git add .
git commit -m "Update: description of changes"
git push origin main

# Tag releases
git tag -a v1.0.1 -m "Version 1.0.1"
git push origin v1.0.1
```

### 📞 Support

For technical support or customization requests:
- Check the development console for errors
- Use the built-in dev tools (`Ctrl+Shift+D`)
- Review this documentation
- Check browser compatibility requirements

### 🌟 Features Summary

✅ **Complete Multi-Page Website**
✅ **Progressive Web App (PWA)**  
✅ **Mobile-First Responsive Design**
✅ **Modern Glassmorphism UI**
✅ **Performance Optimized**
✅ **SEO Optimized**
✅ **Analytics Ready**
✅ **Security Enhanced**
✅ **Developer Tools**
✅ **Production Ready**

---

*This website is built with modern web standards and best practices for optimal performance, security, and user experience.*