// Header injection and navigation functionality
export async function loadHeader() {
  try {
    const response = await fetch('/partials/header.html');
    if (!response.ok) throw new Error('Header not found');
    
    const headerHTML = await response.text();
    const headerContainer = document.querySelector('header[data-header]');
    
    if (headerContainer) {
      headerContainer.innerHTML = headerHTML;
      initializeHeaderFunctionality();
    }
  } catch (error) {
    console.warn('Could not load header:', error);
    // Fallback - header content should be in noscript or default HTML
  }
}

function initializeHeaderFunctionality() {
  // Mobile menu toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.navbar-menu');
  
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      
      mobileMenu.classList.toggle('is-open', !isOpen);
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      
      // Animate hamburger lines
      const lines = mobileToggle.querySelectorAll('.hamburger-line');
      lines.forEach((line, index) => {
        if (!isOpen) {
          // Open state
          if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (index === 1) line.style.opacity = '0';
          if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
          // Closed state
          line.style.transform = 'none';
          line.style.opacity = '1';
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        
        // Reset hamburger lines
        const lines = mobileToggle.querySelectorAll('.hamburger-line');
        lines.forEach(line => {
          line.style.transform = 'none';
          line.style.opacity = '1';
        });
      }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        mobileMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.focus();
      }
    });
  }
  
  // Highlight active navigation
  highlightActiveNavigation();
}

function highlightActiveNavigation() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    const linkPath = new URL(link.href).pathname;
    
    // Handle home page
    if (currentPath === '/' || currentPath === '/index.html') {
      if (link.dataset.page === 'home' || linkPath === '/' || linkPath === '/index.html') {
        link.classList.add('active');
      }
    } else {
      // Handle other pages
      if (linkPath === currentPath) {
        link.classList.add('active');
      }
    }
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadHeader);
} else {
  loadHeader();
}