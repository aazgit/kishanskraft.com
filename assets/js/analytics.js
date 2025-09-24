// Analytics and Performance Tracking Module
// Provides comprehensive tracking for user behavior and site performance

class AnalyticsManager {
  constructor() {
    this.isEnabled = true;
    this.sessionStartTime = Date.now();
    this.pageViews = [];
    this.userInteractions = [];
    this.performanceData = {};
    
    this.init();
  }
  
  init() {
    if (!this.isEnabled) return;
    
    // Track page load performance
    this.trackPagePerformance();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track scroll depth
    this.trackScrollDepth();
    
    // Track time on page
    this.trackTimeOnPage();
    
    // Track PWA install events
    this.trackPWAEvents();
    
    console.log('Analytics Manager initialized');
  }
  
  // Core Web Vitals and Performance Tracking
  trackPagePerformance() {
    // Wait for page load
    window.addEventListener('load', () => {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        this.performanceData = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
          largestContentfulPaint: this.getLCP(),
          cumulativeLayoutShift: this.getCLS(),
          firstInputDelay: this.getFID()
        };
        
        this.sendEvent('page_performance', this.performanceData);
      }
    });
  }
  
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint');
    return fpEntry ? fpEntry.startTime : null;
  }
  
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : null;
  }
  
  getLCP() {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }
  
  getCLS() {
    return new Promise((resolve) => {
      let clsValue = 0;
      
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        resolve(clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    });
  }
  
  getFID() {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          resolve(entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
    });
  }
  
  // User Interaction Tracking
  trackUserInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button, .btn, .cta-button, .product-card');
      
      if (target) {
        const interaction = {
          type: 'click',
          element: target.tagName.toLowerCase(),
          text: target.textContent?.trim().substring(0, 50),
          href: target.href || null,
          className: target.className,
          timestamp: Date.now()
        };
        
        this.userInteractions.push(interaction);
        this.sendEvent('user_interaction', interaction);
      }
    });
    
    // Track form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      const interaction = {
        type: 'form_submit',
        formId: form.id || 'unknown',
        action: form.action || window.location.href,
        timestamp: Date.now()
      };
      
      this.sendEvent('form_submission', interaction);
    });
  }
  
  // Scroll Depth Tracking
  trackScrollDepth() {
    const milestones = [25, 50, 75, 90, 100];
    const reached = new Set();
    
    const checkScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          this.sendEvent('scroll_depth', {
            page: window.location.pathname,
            depth: milestone,
            timestamp: Date.now()
          });
        }
      });
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    });
  }
  
  // Time on Page Tracking
  trackTimeOnPage() {
    let startTime = Date.now();
    
    const sendTimeOnPage = () => {
      const timeSpent = Date.now() - startTime;
      this.sendEvent('time_on_page', {
        page: window.location.pathname,
        timeSpent: Math.round(timeSpent / 1000), // in seconds
        timestamp: Date.now()
      });
    };
    
    // Send on page unload
    window.addEventListener('beforeunload', sendTimeOnPage);
    
    // Send every 30 seconds for long sessions
    setInterval(sendTimeOnPage, 30000);
  }
  
  // PWA and Service Worker Event Tracking
  trackPWAEvents() {
    // Track service worker events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type) {
          this.sendEvent('pwa_event', {
            type: event.data.type,
            data: event.data,
            timestamp: Date.now()
          });
        }
      });
    }
    
    // Track PWA install events
    window.addEventListener('beforeinstallprompt', () => {
      this.sendEvent('pwa_install_prompt', {
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('appinstalled', () => {
      this.sendEvent('pwa_installed', {
        timestamp: Date.now()
      });
    });
    
    // Track online/offline events
    window.addEventListener('online', () => {
      this.sendEvent('connection_status', {
        status: 'online',
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('offline', () => {
      this.sendEvent('connection_status', {
        status: 'offline',
        timestamp: Date.now()
      });
    });
  }
  
  // Product-specific tracking
  trackProductView(productId, productName) {
    this.sendEvent('product_view', {
      product_id: productId,
      product_name: productName,
      page: window.location.pathname,
      timestamp: Date.now()
    });
  }
  
  trackAddToCart(productId, productName, price) {
    this.sendEvent('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price: price,
      timestamp: Date.now()
    });
  }
  
  // WhatsApp order tracking
  trackWhatsAppOrder(productInfo) {
    this.sendEvent('whatsapp_order', {
      product_info: productInfo,
      timestamp: Date.now()
    });
  }
  
  // Error tracking
  trackError(error, context = {}) {
    this.sendEvent('javascript_error', {
      message: error.message,
      stack: error.stack,
      context: context,
      url: window.location.href,
      timestamp: Date.now()
    });
  }
  
  // Send event to analytics service
  sendEvent(eventName, data) {
    if (!this.isEnabled) return;
    
    // Console log for development
    console.log(`Analytics Event: ${eventName}`, data);
    
    // Google Analytics 4 (if available)
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }
    
    // Custom analytics endpoint (replace with your service)
    /*
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event: eventName,
        data: data,
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.warn('Analytics send failed:', error);
    });
    */
  }
  
  // Session management
  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  
  // Get user data summary
  getUserSummary() {
    return {
      session_id: this.getSessionId(),
      session_duration: Date.now() - this.sessionStartTime,
      page_views: this.pageViews.length,
      interactions: this.userInteractions.length,
      performance: this.performanceData,
      user_agent: navigator.userAgent,
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
  
  // Enable/disable tracking
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('analytics_enabled', enabled);
  }
  
  isTrackingEnabled() {
    return this.isEnabled;
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  if (window.analyticsManager) {
    window.analyticsManager.trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (window.analyticsManager) {
    window.analyticsManager.trackError(event.reason, {
      type: 'unhandled_promise_rejection'
    });
  }
});

// Initialize analytics
window.analyticsManager = new AnalyticsManager();

// Export for use in other modules
export { AnalyticsManager };