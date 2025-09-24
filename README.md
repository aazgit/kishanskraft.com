# KishansKraft Website

A modern, production-ready static website for KishansKraft - Premium Coldpress Mustard Oil from Bihar, India.

## Features

- ✨ **Modern Design**: Glassmorphism UI with warm mustard-accent palette
- 📱 **Fully Responsive**: Mobile-first design that works on all devices
- ⚡ **Performance Optimized**: Fast loading with lazy images and critical CSS
- ♿ **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- 🔍 **SEO Ready**: Structured data, Open Graph tags, and semantic HTML
- 🛠️ **Progressive Enhancement**: Works without JavaScript, enhanced with JS
- 📦 **Static Hosting Ready**: Deployable to Netlify, Vercel, GitHub Pages
- 🌐 **PWA Features**: Installable with offline capability

## Technology Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with variables, grid, and glassmorphism effects
- **Vanilla JavaScript**: ES modules, no frameworks
- **Node.js**: Build tools with esbuild for production optimization
- **JSON**: Product data management

## Project Structure

```
├── index.html              # Homepage
├── products.html           # Product listing page
├── product.html            # Dynamic product detail page
├── about.html              # About page
├── contact.html            # Contact page with form
├── partials/
│   ├── header.html         # Header partial template
│   └── footer.html         # Footer partial template
├── assets/
│   ├── css/
│   │   └── style.css       # Main stylesheet with CSS variables
│   └── js/
│       ├── site.js         # Main site functionality
│       ├── header.js       # Header injection and navigation
│       └── footer.js       # Footer injection
├── data/
│   └── products.json       # Product data and metadata
├── images/                 # Image placeholders (TODO: replace)
├── manifest.json           # PWA manifest
├── robots.txt              # Search engine instructions
├── sitemap.xml             # Site structure for SEO
├── package.json            # Dependencies and scripts
├── build.js                # Production build script
└── .gitignore              # Git ignore rules
```

## Quick Start

### 1. Installation

```bash
# Clone or download the project
# Navigate to project directory
cd kishans-kraft-website

# Install dependencies
npm install
```

### 2. Development

```bash
# Start local development server
npm run dev

# Open http://localhost:3000 in your browser
```

### 3. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 4. Deploy

The `dist/` folder contains the production-ready files. Upload to any static host:

- **Netlify**: Drag & drop the `dist` folder
- **Vercel**: Connect GitHub repo or upload folder
- **GitHub Pages**: Push `dist` contents to `gh-pages` branch
- **Any Web Host**: Upload `dist` folder contents via FTP

## Configuration & Customization

### 🔧 Essential Updates Required

Before going live, replace these placeholders:

#### Contact Information
- **Phone**: Replace `+91 99999 99999` with actual number in:
  - `partials/header.html` (WhatsApp CTA)
  - `partials/footer.html` 
  - `contact.html`
  - All WhatsApp links throughout site

- **Email**: Replace `hello@kishanskraft.com` with actual email in:
  - `partials/footer.html`
  - `contact.html`

#### Images
Replace placeholder images in `images/` folder:
- `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`
- `apple-touch-icon.png`
- `icon-192.png`, `icon-512.png` (PWA icons)
- Product images referenced in `data/products.json`
- Hero and Open Graph images

#### Domain & URLs
- Update `sitemap.xml` with your actual domain
- Replace `https://your-domain.com` in meta tags across all HTML files
- Update `robots.txt` sitemap URL

#### Product Data
Edit `data/products.json` to:
- Update prices, descriptions, and product details
- Add/remove products as needed
- Update image paths to your actual product photos

### 🎨 Design Customization

#### Colors
Modify CSS variables in `assets/css/style.css`:

```css
:root {
  --accent: #D97706;        /* Primary mustard color */
  --accent-2: #F59E0B;      /* Secondary accent */
  --accent-light: #FEF3E2;  /* Light background */
  --text: #1F2937;          /* Main text color */
  --text-muted: #6B7280;    /* Muted text */
  --bg: #FFFBF7;            /* Body background */
}
```

#### Fonts
Current fonts (Google Fonts):
- **Headings**: Playfair Display
- **Body**: Poppins

To change fonts, update the Google Fonts link in HTML files and CSS variables:

```css
--font-primary: 'Your-Font', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-secondary: 'Your-Display-Font', Georgia, serif;
```

#### Layout
- Adjust container max-width: `--container-max: 1200px;`
- Modify spacing scale: `--spacing-*` variables
- Update glassmorphism effects: `--glass-bg`, `--glass-border` variables

### 📱 Mobile Optimization

The site is mobile-first responsive. Key breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### 🔍 SEO Configuration

#### Meta Tags
Update meta descriptions, titles, and keywords in each HTML file's `<head>` section.

#### Structured Data
JSON-LD structured data is included for:
- Organization (homepage)
- Products (product pages)

Update the organization schema in `index.html` with your actual business details.

#### Sitemap
The `sitemap.xml` includes all pages. Update URLs and add new pages as needed.

## Performance Features

### Critical CSS
Above-the-fold styles are inlined in `<head>` for faster initial render.

### Lazy Loading  
Images use `loading="lazy"` attribute with JavaScript fallbacks for older browsers.

### Service Worker (Optional)
Basic service worker setup included for PWA functionality. Uncomment in HTML files to enable.

### Build Optimization
The build process:
- Minifies CSS and JavaScript
- Bundles modules
- Copies static assets
- Optimizes for production

## Browser Support

- **Modern browsers**: Full feature support
- **IE11**: Basic functionality (graceful degradation)
- **No JavaScript**: Core content accessible via `<noscript>` fallbacks

## Security Features

### Content Security Policy
Example CSP header included (commented) in HTML files. Implement on your server:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;">
```

### External Links
All external links use `rel="noopener noreferrer"` for security.

## Analytics & Tracking

Add your analytics tracking code before the closing `</body>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Deployment Guide

### Netlify
1. Connect GitHub repository or upload `dist` folder
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables if needed

### Vercel
1. Import project from GitHub
2. Framework preset: "Other" 
3. Build command: `npm run build`
4. Output directory: `dist`

### GitHub Pages
1. Build locally: `npm run build`
2. Push `dist` contents to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Traditional Web Hosting
1. Build locally: `npm run build`
2. Upload `dist` folder contents via FTP/SFTP
3. Ensure web server serves `index.html` for 404s (SPA routing)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (uses serve)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Folder Permissions

Ensure your web server can read all files. Recommended permissions:
- Folders: 755
- Files: 644

## Support & Maintenance

### Regular Updates
- Keep dependencies updated: `npm update`
- Monitor Google Core Web Vitals
- Test on multiple devices and browsers
- Update product information in `data/products.json`

### Backup Strategy
- Keep source code in version control (Git)
- Backup product images and data
- Document any customizations

## Troubleshooting

### Common Issues

1. **JavaScript not loading**: Check file paths are relative
2. **Images not displaying**: Verify image file paths in JSON and HTML
3. **WhatsApp links not working**: Ensure phone numbers are in international format
4. **CSS not applying**: Check for syntax errors in CSS file
5. **Build failing**: Ensure Node.js version compatibility

### Debug Mode
Add `console.log` statements in JavaScript files and check browser dev tools console.

## License

MIT License - feel free to customize for your business needs.

## Credits

Built with modern web standards and best practices for KishansKraft - Premium Coldpress Mustard Oil from Bihar, India.

---

**Need help?** Check browser developer tools for errors, or review this documentation for configuration steps.

**Ready to go live?** Update all TODO items marked in the code, test thoroughly, and deploy to your chosen platform.