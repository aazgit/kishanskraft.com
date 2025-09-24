// Site-wide utilities and functionality
import { loadHeader } from './header.js';
import { loadFooter } from './footer.js';

// Import additional modules for enhanced functionality
import './analytics.js';
import './security.js';
import './devtools.js';

// Initialize all site functionality
export function initializeSite() {
  // Load dynamic components
  loadHeader();
  loadFooter();
  
  // Initialize utilities
  initializeLazyLoading();
  initializeAccessibilityHelpers();
  initializeAnimations();
  initializeOfflineSupport();
  
  console.log('KishansKraft website initialized');
}

// Lazy loading for images
export function initializeLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Load the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Add loaded class for fade-in effect
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
          
          observer.unobserve(img);
        }
      });
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Accessibility helpers
export function initializeAccessibilityHelpers() {
  // Enhanced keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Escape key functionality
    if (e.key === 'Escape') {
      // Close any open modals or menus
      const openMenus = document.querySelectorAll('.navbar-menu.is-open');
      openMenus.forEach(menu => menu.classList.remove('is-open'));
      
      // Reset mobile toggle state
      const mobileToggle = document.querySelector('.mobile-menu-toggle');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });
  
  // Skip link functionality
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector('#main-content');
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  
  // Focus management for better UX
  manageFocusTraps();
}

function manageFocusTraps() {
  // Focus trap for mobile menu
  const mobileMenu = document.querySelector('.navbar-menu');
  if (mobileMenu) {
    const focusableElements = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
    
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && mobileMenu.classList.contains('is-open')) {
        const focusables = mobileMenu.querySelectorAll(focusableElements);
        const firstFocusable = focusables[0];
        const lastFocusable = focusables[focusables.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    });
  }
}

// Animation helpers
export function initializeAnimations() {
  // Intersection Observer for fade-in animations
  if ('IntersectionObserver' in window) {
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          animationObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe elements that should animate in
    document.querySelectorAll('.feature-card, .product-card').forEach(el => {
      animationObserver.observe(el);
    });
  }
}

// Utility functions
export function formatPrice(price, currency = '₹') {
  return `${currency} ${price}`;
}

export function generateWhatsAppLink(phone, message) {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Form helpers
export function setupContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Create WhatsApp message
    const whatsappMessage = `Hi! I'm ${name} (${email}). ${message}`;
    const whatsappUrl = generateWhatsAppLink('919999999999', whatsappMessage);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    showNotification('Message prepared! Opening WhatsApp...', 'success');
    
    // Reset form
    form.reset();
  });
}

// Notification system
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    background: ${type === 'success' ? '#10B981' : '#3B82F6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 500;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Product utilities for dynamic pages
export async function loadProducts() {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error('Products data not found');
    return await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
    return { products: [] };
  }
}

export function findProductById(products, id) {
  return products.find(product => product.id === id);
}

export function renderProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-image">
        ${product.images && product.images[0] 
          ? `<img src="${product.images[0]}" alt="${product.name}" loading="lazy" />`
          : `<div class="placeholder-image">Product Image</div>`
        }
      </div>
      <div class="product-content">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">${formatPrice(product.price)}</div>
        <p class="product-description">${product.shortDescription}</p>
        <a href="/product.html?id=${product.id}" class="btn btn-primary">
          View Details
        </a>
      </div>
    </article>
  `;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSite);
} else {
  initializeSite();
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Offline support and PWA functionality
export function initializeOfflineSupport() {
  // Check online/offline status
  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      showNotification('You are currently offline. Some features may not work.', 'info');
    }
    
    // Add offline indicator to body
    document.body.classList.toggle('offline', !isOnline);
  }
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    showNotification('Connection restored!', 'success');
    document.body.classList.remove('offline');
  });
  
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
  
  // Add offline styles
  if (!document.getElementById('offline-styles')) {
    const offlineStyles = document.createElement('style');
    offlineStyles.id = 'offline-styles';
    offlineStyles.textContent = `
      .offline::before {
        content: "⚠️ Offline Mode";
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #FEF3E2;
        color: #D97706;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        z-index: 1001;
        border: 1px solid #F59E0B;
      }
      
      .offline img[data-src] {
        background: var(--accent-light);
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        font-size: 0.875rem;
      }
      
      .offline img[data-src]::before {
        content: "Image unavailable offline";
      }
    `;
    document.head.appendChild(offlineStyles);
  }
}