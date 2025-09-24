// Footer injection and dynamic functionality
export async function loadFooter() {
  try {
    const response = await fetch('/partials/footer.html');
    if (!response.ok) throw new Error('Footer not found');
    
    const footerHTML = await response.text();
    const footerContainer = document.querySelector('footer[data-footer]');
    
    if (footerContainer) {
      footerContainer.innerHTML = footerHTML;
      initializeFooterFunctionality();
    }
  } catch (error) {
    console.warn('Could not load footer:', error);
    // Fallback - footer content should be in noscript or default HTML
  }
}

function initializeFooterFunctionality() {
  // Update current year
  updateCopyrightYear();
  
  // Initialize any footer-specific interactions
  setupFooterLinks();
}

function updateCopyrightYear() {
  const yearElement = document.querySelector('.current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function setupFooterLinks() {
  // Add analytics or tracking for footer links if needed
  const footerLinks = document.querySelectorAll('.footer-link');
  
  footerLinks.forEach(link => {
    // Ensure external links have proper attributes
    if (link.hostname && link.hostname !== window.location.hostname) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    }
  });
  
  // Social links tracking
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Add analytics tracking here if needed
      console.log(`Social link clicked: ${link.href}`);
    });
  });
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFooter);
} else {
  loadFooter();
}