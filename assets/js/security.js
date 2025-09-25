// Security Enhancements Module
// Provides security headers, content validation, and protection measures

class SecurityManager {
  constructor() {
    this.config = {
      enableCSRFProtection: true,
      enableClickjacking: true,
      enableContentValidation: true,
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      blockedDomains: [],
      allowedOrigins: [
        window.location.origin,
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com'
      ]
    };
    
    this.requestCounts = new Map();
    this.init();
  }
  
  init() {
    this.setSecurityHeaders();
    this.enableClickjackingProtection();
    this.enableContentValidation();
    this.enableFormProtection();
    this.enableRateLimiting();
    this.monitorConsoleAccess();
    
    console.log('Security Manager initialized');
  }
  
  // Set security headers via meta tags
  setSecurityHeaders() {
    const headers = [
      {
        'http-equiv': 'X-Content-Type-Options',
        content: 'nosniff'
      },
      {
        'http-equiv': 'X-Frame-Options',
        content: 'DENY'
      },
      {
        'http-equiv': 'X-XSS-Protection',
        content: '1; mode=block'
      },
      {
        'http-equiv': 'Referrer-Policy',
        content: 'strict-origin-when-cross-origin'
      },
      {
        'http-equiv': 'Permissions-Policy',
        content: 'camera=(), microphone=(), geolocation=()'
      }
    ];
    
    headers.forEach(header => {
      const meta = document.createElement('meta');
      if (header['http-equiv']) {
        meta.setAttribute('http-equiv', header['http-equiv']);
      } else {
        meta.name = header.name;
      }
      meta.content = header.content;
      document.head.appendChild(meta);
    });
  }
  
  // Clickjacking protection
  enableClickjackingProtection() {
    if (self !== top) {
      document.body.style.display = 'none';
      console.warn('Clickjacking attempt detected and blocked');
      
      // Optional: Redirect to main site
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 1000);
    }
  }
  
  // Content validation and sanitization
  enableContentValidation() {
    // Sanitize user inputs
    this.sanitizeInputs();
    
    // Monitor DOM changes for XSS attempts
    this.monitorDOMChanges();
    
    // Validate external resource loading
    this.validateExternalResources();
  }
  
  sanitizeInputs() {
    const inputs = document.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        const sanitized = this.sanitizeHTML(value);
        
        if (value !== sanitized) {
          e.target.value = sanitized;
          console.warn('Potentially malicious input sanitized');
        }
      });
    });
  }
  
  sanitizeHTML(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
  
  monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.validateElement(node);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  validateElement(element) {
    // Check for suspicious script tags
    if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-trusted')) {
      console.warn('Untrusted script element detected:', element);
      element.remove();
      return false;
    }
    
    // Check for suspicious event handlers
    const eventAttributes = ['onload', 'onerror', 'onclick', 'onmouseover'];
    eventAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        console.warn('Suspicious event handler detected:', attr, element);
        element.removeAttribute(attr);
      }
    });
    
    // Validate external links
    if (element.tagName === 'A' && element.href) {
      const url = new URL(element.href);
      if (this.config.blockedDomains.includes(url.hostname)) {
        console.warn('Blocked domain detected:', url.hostname);
        element.remove();
        return false;
      }
      
      // Add security attributes to external links
      if (url.origin !== window.location.origin) {
        element.setAttribute('rel', 'noopener noreferrer');
        element.setAttribute('target', '_blank');
      }
    }
    
    return true;
  }
  
  validateExternalResources() {
    // Monitor resource loading
    const originalFetch = window.fetch;
    const originalXMLHttpRequest = window.XMLHttpRequest;
    const securityManager = this;
    
    // Override fetch with proper context binding
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && !securityManager.isAllowedOrigin(url)) {
        console.warn('Blocked fetch request to:', url);
        return Promise.reject(new Error('Request blocked by security policy'));
      }
      return originalFetch.apply(window, args);
    };
    
    // Override XMLHttpRequest
    const openOriginal = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      const url = args[1];
      if (typeof url === 'string' && !window.securityManager.isAllowedOrigin(url)) {
        console.warn('Blocked XHR request to:', url);
        throw new Error('Request blocked by security policy');
      }
      return openOriginal.apply(this, args);
    };
  }
  
  isAllowedOrigin(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return this.config.allowedOrigins.includes(urlObj.origin) || 
             urlObj.origin === window.location.origin;
    } catch (e) {
      return false;
    }
  }
  
  // Form protection
  enableFormProtection() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      // Add CSRF token
      if (this.config.enableCSRFProtection) {
        this.addCSRFToken(form);
      }
      
      // Rate limiting for form submissions
      form.addEventListener('submit', (e) => {
        if (!this.checkRateLimit('form_submit')) {
          e.preventDefault();
          console.warn('Form submission rate limit exceeded');
          this.showSecurityMessage('Please wait before submitting again.');
        }
      });
      
      // Validate form data
      form.addEventListener('submit', (e) => {
        if (!this.validateFormData(form)) {
          e.preventDefault();
          console.warn('Form validation failed');
        }
      });
    });
  }
  
  addCSRFToken(form) {
    const csrfToken = this.generateCSRFToken();
    sessionStorage.setItem('csrf_token', csrfToken);
    
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_csrf_token';
    tokenInput.value = csrfToken;
    form.appendChild(tokenInput);
  }
  
  generateCSRFToken() {
    return 'csrf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
  }
  
  validateFormData(form) {
    const formData = new FormData(form);
    
    // Check CSRF token
    if (this.config.enableCSRFProtection) {
      const submittedToken = formData.get('_csrf_token');
      const storedToken = sessionStorage.getItem('csrf_token');
      
      if (!submittedToken || submittedToken !== storedToken) {
        console.warn('CSRF token validation failed');
        return false;
      }
    }
    
    // Validate input lengths and content
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        // Check for SQL injection patterns
        const sqlPatterns = [
          /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/i,
          /(\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b).*\btable\b/i,
          /(\bexec\b|\bexecute\b).*\b(sp_|xp_)/i
        ];
        
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/i,
          /on\w+\s*=/i
        ];
        
        const allPatterns = [...sqlPatterns, ...xssPatterns];
        
        if (allPatterns.some(pattern => pattern.test(value))) {
          console.warn('Malicious pattern detected in form data:', key);
          return false;
        }
        
        // Check for excessive length
        if (value.length > 10000) {
          console.warn('Form input too long:', key);
          return false;
        }
      }
    }
    
    return true;
  }
  
  // Rate limiting
  enableRateLimiting() {
    if (!this.config.enableRateLimiting) return;
    
    // Clean up old entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, requests] of this.requestCounts.entries()) {
        this.requestCounts.set(key, requests.filter(time => now - time < 60000));
        if (this.requestCounts.get(key).length === 0) {
          this.requestCounts.delete(key);
        }
      }
    }, 60000);
  }
  
  checkRateLimit(action) {
    const now = Date.now();
    const key = `${action}_${this.getClientIdentifier()}`;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }
    
    const requests = this.requestCounts.get(key);
    const recentRequests = requests.filter(time => now - time < 60000);
    
    if (recentRequests.length >= this.config.maxRequestsPerMinute) {
      return false;
    }
    
    recentRequests.push(now);
    this.requestCounts.set(key, recentRequests);
    return true;
  }
  
  getClientIdentifier() {
    return `${navigator.userAgent}_${screen.width}x${screen.height}`;
  }
  
  // Console access monitoring
  monitorConsoleAccess() {
    let consoleWarned = false;
    
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Override console methods to detect developer tools
    console.log = (...args) => {
      if (!consoleWarned) {
        consoleWarned = true;
        this.showDeveloperWarning();
      }
      originalLog.apply(console, args);
    };
    
    // Detect DevTools opening
    let devtools = {
      open: false,
      orientation: null
    };
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('Developer tools detected');
          this.showDeveloperWarning();
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }
  
  showDeveloperWarning() {
    const warning = `
    🔒 SECURITY WARNING 🔒
    
    This is a browser security feature. If someone told you to copy-paste something here, 
    it could be a scam to gain access to your account or personal information.
    
    Visit https://www.facebook.com/selfxss for more information.
    `;
    
    console.log('%c' + warning, 'color: red; font-size: 16px; font-weight: bold;');
  }
  
  showSecurityMessage(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(220, 53, 69, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      backdrop-filter: blur(10px);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // Content Security Policy helpers
  generateCSPHeader() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://www.google-analytics.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }
  
  // Get security report
  getSecurityReport() {
    return {
      timestamp: Date.now(),
      config: this.config,
      rateLimitStats: Array.from(this.requestCounts.entries()).map(([key, requests]) => ({
        action: key,
        requestCount: requests.length
      })),
      securityFeatures: {
        clickjackingProtection: true,
        contentValidation: this.config.enableContentValidation,
        csrfProtection: this.config.enableCSRFProtection,
        rateLimiting: this.config.enableRateLimiting
      }
    };
  }
  
  // Update security configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('Security configuration updated');
  }
}

// Initialize security manager
window.securityManager = new SecurityManager();

// Export for use in other modules
export { SecurityManager };