// Development Tools and Utilities
// Provides development helpers, debugging tools, and performance monitoring

class DevTools {
  constructor() {
    this.isEnabled = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.search.includes('debug=true');
    
    this.logs = [];
    this.performanceMarks = new Map();
    this.networkRequests = [];
    this.errorLog = [];
    
    if (this.isEnabled) {
      this.init();
    }
  }
  
  init() {
    this.createDevPanel();
    this.interceptNetworkRequests();
    this.addPerformanceMonitoring();
    this.addKeyboardShortcuts();
    this.monitorMemoryUsage();
    
    console.log('🛠️ Development Tools initialized');
    console.log('Press Ctrl+Shift+D to toggle dev panel');
  }
  
  // Create floating development panel
  createDevPanel() {
    const panel = document.createElement('div');
    panel.id = 'dev-panel';
    panel.innerHTML = `
      <div class="dev-panel-header">
        <h3>🛠️ Dev Tools</h3>
        <button class="dev-panel-close">&times;</button>
      </div>
      <div class="dev-panel-content">
        <div class="dev-tabs">
          <button class="dev-tab active" data-tab="console">Console</button>
          <button class="dev-tab" data-tab="network">Network</button>
          <button class="dev-tab" data-tab="performance">Performance</button>
          <button class="dev-tab" data-tab="storage">Storage</button>
          <button class="dev-tab" data-tab="tools">Tools</button>
        </div>
        
        <div class="dev-tab-content active" id="dev-console">
          <div class="dev-console-output"></div>
          <div class="dev-console-input">
            <input type="text" placeholder="Enter JavaScript command..." />
            <button>Run</button>
          </div>
        </div>
        
        <div class="dev-tab-content" id="dev-network">
          <div class="dev-network-list"></div>
          <button class="dev-clear-btn">Clear</button>
        </div>
        
        <div class="dev-tab-content" id="dev-performance">
          <div class="dev-performance-metrics"></div>
          <button class="dev-measure-btn">Start Measurement</button>
        </div>
        
        <div class="dev-tab-content" id="dev-storage">
          <div class="dev-storage-viewer"></div>
          <button class="dev-clear-storage-btn">Clear All Storage</button>
        </div>
        
        <div class="dev-tab-content" id="dev-tools">
          <div class="dev-tool-buttons">
            <button class="dev-tool-btn" data-action="reload-css">Reload CSS</button>
            <button class="dev-tool-btn" data-action="test-offline">Test Offline</button>
            <button class="dev-tool-btn" data-action="simulate-slow">Simulate Slow Connection</button>
            <button class="dev-tool-btn" data-action="grid-overlay">Toggle Grid</button>
            <button class="dev-tool-btn" data-action="accessibility-check">A11y Check</button>
            <button class="dev-tool-btn" data-action="pwa-test">PWA Test</button>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #dev-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        height: 500px;
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid #444;
        border-radius: 8px;
        color: #fff;
        font-family: 'Monaco', 'Consolas', monospace;
        font-size: 12px;
        z-index: 99999;
        display: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      
      .dev-panel-header {
        padding: 10px;
        border-bottom: 1px solid #444;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
      }
      
      .dev-panel-header h3 {
        margin: 0;
        font-size: 14px;
      }
      
      .dev-panel-close {
        background: none;
        border: none;
        color: #fff;
        cursor: pointer;
        font-size: 18px;
      }
      
      .dev-tabs {
        display: flex;
        background: #222;
      }
      
      .dev-tab {
        padding: 8px 12px;
        background: none;
        border: none;
        color: #ccc;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      
      .dev-tab.active {
        color: #4CAF50;
        border-bottom-color: #4CAF50;
      }
      
      .dev-tab-content {
        display: none;
        padding: 10px;
        height: 380px;
        overflow-y: auto;
      }
      
      .dev-tab-content.active {
        display: block;
      }
      
      .dev-console-output {
        height: 320px;
        overflow-y: auto;
        background: #111;
        padding: 5px;
        margin-bottom: 10px;
        border: 1px solid #333;
      }
      
      .dev-console-input {
        display: flex;
        gap: 5px;
      }
      
      .dev-console-input input {
        flex: 1;
        background: #222;
        border: 1px solid #444;
        color: #fff;
        padding: 5px;
      }
      
      .dev-console-input button,
      .dev-clear-btn,
      .dev-measure-btn,
      .dev-clear-storage-btn {
        background: #4CAF50;
        border: none;
        color: white;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 3px;
      }
      
      .dev-tool-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      
      .dev-tool-btn {
        background: #2196F3;
        border: none;
        color: white;
        padding: 10px;
        cursor: pointer;
        border-radius: 5px;
        font-size: 11px;
      }
      
      .dev-tool-btn:hover {
        background: #1976D2;
      }
      
      .dev-log-entry {
        padding: 2px 0;
        border-bottom: 1px solid #333;
        font-size: 11px;
      }
      
      .dev-log-error { color: #f44336; }
      .dev-log-warn { color: #ff9800; }
      .dev-log-info { color: #2196f3; }
      .dev-log-success { color: #4caf50; }
    `;
    
    document.head.appendChild(styles);
    document.body.appendChild(panel);
    
    this.setupPanelEvents(panel);
  }
  
  setupPanelEvents(panel) {
    // Tab switching
    panel.querySelectorAll('.dev-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = e.target.dataset.tab;
        
        // Update tab appearance
        panel.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
        panel.querySelectorAll('.dev-tab-content').forEach(t => t.classList.remove('active'));
        
        e.target.classList.add('active');
        panel.querySelector(`#dev-${targetTab}`).classList.add('active');
        
        // Update content based on active tab
        this.updateTabContent(targetTab);
      });
    });
    
    // Close panel
    panel.querySelector('.dev-panel-close').addEventListener('click', () => {
      this.togglePanel();
    });
    
    // Console input
    const consoleInput = panel.querySelector('.dev-console-input input');
    const consoleRun = panel.querySelector('.dev-console-input button');
    
    const runConsoleCommand = () => {
      const command = consoleInput.value.trim();
      if (command) {
        this.executeConsoleCommand(command);
        consoleInput.value = '';
      }
    };
    
    consoleRun.addEventListener('click', runConsoleCommand);
    consoleInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        runConsoleCommand();
      }
    });
    
    // Tool buttons
    panel.querySelectorAll('.dev-tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.executeTool(e.target.dataset.action);
      });
    });
    
    // Clear buttons
    panel.querySelector('.dev-clear-btn')?.addEventListener('click', () => {
      this.networkRequests = [];
      this.updateTabContent('network');
    });
    
    panel.querySelector('.dev-clear-storage-btn')?.addEventListener('click', () => {
      this.clearAllStorage();
    });
    
    // Make panel draggable
    this.makeDraggable(panel);
  }
  
  makeDraggable(element) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    const header = element.querySelector('.dev-panel-header');
    
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    }
    
    function dragMove(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        
        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    }
    
    function dragEnd() {
      isDragging = false;
    }
  }
  
  // Network request interception
  interceptNetworkRequests() {
    const originalFetch = window.fetch;
    
    window.fetch = (...args) => {
      const startTime = performance.now();
      const request = {
        url: args[0],
        method: args[1]?.method || 'GET',
        startTime: Date.now(),
        type: 'fetch'
      };
      
      return originalFetch.apply(this, args)
        .then(response => {
          request.endTime = Date.now();
          request.duration = performance.now() - startTime;
          request.status = response.status;
          request.success = response.ok;
          
          this.networkRequests.push(request);
          return response;
        })
        .catch(error => {
          request.endTime = Date.now();
          request.duration = performance.now() - startTime;
          request.error = error.message;
          request.success = false;
          
          this.networkRequests.push(request);
          throw error;
        });
    };
  }
  
  // Performance monitoring
  addPerformanceMonitoring() {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            this.log('performance', `Long task detected: ${entry.duration.toFixed(2)}ms`, 'warn');
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    }
    
    // Monitor memory usage
    setInterval(() => {
      if (performance.memory) {
        const memory = performance.memory;
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
        
        if (memoryInfo.used > memoryInfo.limit * 0.8) {
          this.log('memory', `High memory usage: ${memoryInfo.used}MB`, 'warn');
        }
      }
    }, 10000);
  }
  
  // Keyboard shortcuts
  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+D to toggle dev panel
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.togglePanel();
      }
      
      // Ctrl+Shift+R to reload CSS
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        this.reloadCSS();
      }
      
      // Ctrl+Shift+T to run PWA test
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.testPWA();
      }
    });
  }
  
  // Memory usage monitoring
  monitorMemoryUsage() {
    if (!performance.memory) return;
    
    setInterval(() => {
      const memory = performance.memory;
      const used = memory.usedJSHeapSize / 1024 / 1024;
      const total = memory.totalJSHeapSize / 1024 / 1024;
      
      this.performanceMarks.set('memory', {
        used: used.toFixed(2),
        total: total.toFixed(2),
        timestamp: Date.now()
      });
    }, 5000);
  }
  
  // Console command execution
  executeConsoleCommand(command) {
    try {
      // Use Function constructor instead of eval for better security
      const result = new Function('return ' + command)();
      this.log('console', `> ${command}`, 'info');
      this.log('console', `< ${result}`, 'success');
    } catch (error) {
      this.log('console', `> ${command}`, 'info');
      this.log('console', `< Error: ${error.message}`, 'error');
    }
  }
  
  // Tool execution
  executeTool(action) {
    switch (action) {
      case 'reload-css':
        this.reloadCSS();
        break;
      case 'test-offline':
        this.testOfflineMode();
        break;
      case 'simulate-slow':
        this.simulateSlowConnection();
        break;
      case 'grid-overlay':
        this.toggleGridOverlay();
        break;
      case 'accessibility-check':
        this.runAccessibilityCheck();
        break;
      case 'pwa-test':
        this.testPWA();
        break;
    }
  }
  
  reloadCSS() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.href;
      link.href = href + (href.includes('?') ? '&' : '?') + 'v=' + Date.now();
    });
    this.log('tools', 'CSS reloaded', 'success');
  }
  
  testOfflineMode() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SIMULATE_OFFLINE' });
      this.log('tools', 'Offline mode simulation started', 'info');
    } else {
      this.log('tools', 'No service worker available for offline testing', 'warn');
    }
  }
  
  simulateSlowConnection() {
    // Add artificial delay to network requests
    const originalFetch = window.fetch;
    let isSlowMode = window.devToolsSlowMode || false;
    
    if (!isSlowMode) {
      window.fetch = (...args) => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(originalFetch.apply(this, args));
          }, Math.random() * 2000 + 1000); // 1-3 second delay
        });
      };
      window.devToolsSlowMode = true;
      this.log('tools', 'Slow connection simulation enabled', 'info');
    } else {
      window.fetch = originalFetch;
      window.devToolsSlowMode = false;
      this.log('tools', 'Slow connection simulation disabled', 'info');
    }
  }
  
  toggleGridOverlay() {
    let overlay = document.getElementById('dev-grid-overlay');
    
    if (overlay) {
      overlay.remove();
      this.log('tools', 'Grid overlay hidden', 'info');
    } else {
      overlay = document.createElement('div');
      overlay.id = 'dev-grid-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 99998;
        background-image: 
          linear-gradient(rgba(255,0,0,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,0,0,0.3) 1px, transparent 1px);
        background-size: 20px 20px;
      `;
      document.body.appendChild(overlay);
      this.log('tools', 'Grid overlay shown', 'info');
    }
  }
  
  runAccessibilityCheck() {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
    inputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && input.type !== 'hidden') {
        issues.push(`Input missing label: ${input.type}`);
      }
    });
    
    // Check for proper heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.slice(1));
      if (level - lastLevel > 1) {
        issues.push(`Heading hierarchy skip: ${heading.tagName} after H${lastLevel}`);
      }
      lastLevel = level;
    });
    
    // Check color contrast (simplified)
    const elements = document.querySelectorAll('*');
    // This would require more complex color contrast calculation
    
    if (issues.length === 0) {
      this.log('a11y', 'No accessibility issues found', 'success');
    } else {
      issues.forEach(issue => {
        this.log('a11y', issue, 'warn');
      });
    }
  }
  
  testPWA() {
    const tests = [];
    
    // Service worker test
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          tests.push('✅ Service Worker registered');
        } else {
          tests.push('❌ Service Worker not registered');
        }
        
        // Manifest test
        const manifest = document.querySelector('link[rel="manifest"]');
        if (manifest) {
          tests.push('✅ Manifest linked');
          
          fetch(manifest.href)
            .then(response => response.json())
            .then(manifestData => {
              if (manifestData.name && manifestData.icons && manifestData.start_url) {
                tests.push('✅ Manifest valid');
              } else {
                tests.push('❌ Manifest incomplete');
              }
            })
            .catch(() => {
              tests.push('❌ Manifest load failed');
            });
        } else {
          tests.push('❌ Manifest not found');
        }
        
        // Display results
        tests.forEach(test => {
          const type = test.includes('✅') ? 'success' : 'error';
          this.log('pwa', test, type);
        });
      });
    } else {
      this.log('pwa', '❌ Service Worker not supported', 'error');
    }
  }
  
  clearAllStorage() {
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      indexedDB.databases().then(dbs => {
        dbs.forEach(db => {
          indexedDB.deleteDatabase(db.name);
        });
      });
    }
    
    // Clear cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    this.log('storage', 'All storage cleared', 'success');
  }
  
  // Update tab content
  updateTabContent(tab) {
    const panel = document.getElementById('dev-panel');
    
    switch (tab) {
      case 'console':
        this.updateConsoleTab(panel);
        break;
      case 'network':
        this.updateNetworkTab(panel);
        break;
      case 'performance':
        this.updatePerformanceTab(panel);
        break;
      case 'storage':
        this.updateStorageTab(panel);
        break;
    }
  }
  
  updateConsoleTab(panel) {
    const output = panel.querySelector('.dev-console-output');
    output.innerHTML = this.logs
      .filter(log => log.category === 'console' || log.category === 'tools' || log.category === 'a11y' || log.category === 'pwa')
      .map(log => `<div class="dev-log-entry dev-log-${log.type}">${log.message}</div>`)
      .join('');
    output.scrollTop = output.scrollHeight;
  }
  
  updateNetworkTab(panel) {
    const list = panel.querySelector('.dev-network-list');
    list.innerHTML = this.networkRequests
      .map(req => `
        <div class="dev-log-entry ${req.success ? 'dev-log-success' : 'dev-log-error'}">
          ${req.method} ${req.url} - ${req.status || 'Failed'} (${req.duration?.toFixed(2) || '?'}ms)
        </div>
      `)
      .join('');
  }
  
  updatePerformanceTab(panel) {
    const metrics = panel.querySelector('.dev-performance-metrics');
    const memoryData = this.performanceMarks.get('memory');
    
    let content = '<div class="dev-log-entry dev-log-info">Performance Metrics:</div>';
    
    if (memoryData) {
      content += `<div class="dev-log-entry">Memory: ${memoryData.used}MB / ${memoryData.total}MB</div>`;
    }
    
    if (performance.memory) {
      const memory = performance.memory;
      content += `<div class="dev-log-entry">Heap Limit: ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB</div>`;
    }
    
    metrics.innerHTML = content;
  }
  
  updateStorageTab(panel) {
    const viewer = panel.querySelector('.dev-storage-viewer');
    
    let content = '<div class="dev-log-entry dev-log-info">Storage Overview:</div>';
    
    content += `<div class="dev-log-entry">LocalStorage: ${localStorage.length} items</div>`;
    content += `<div class="dev-log-entry">SessionStorage: ${sessionStorage.length} items</div>`;
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          content += '<div class="dev-log-entry">Service Worker: Active</div>';
        }
      });
    }
    
    viewer.innerHTML = content;
  }
  
  // Logging system
  log(category, message, type = 'info') {
    const logEntry = {
      category,
      message,
      type,
      timestamp: Date.now()
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }
    
    // Update console tab if it's active
    const panel = document.getElementById('dev-panel');
    if (panel && panel.style.display !== 'none') {
      const activeTab = panel.querySelector('.dev-tab.active');
      if (activeTab && activeTab.dataset.tab === 'console') {
        this.updateConsoleTab(panel);
      }
    }
  }
  
  // Toggle dev panel visibility
  togglePanel() {
    const panel = document.getElementById('dev-panel');
    if (panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'block';
      this.updateTabContent('console');
    } else {
      panel.style.display = 'none';
    }
  }
  
  // Performance measurement
  startMeasure(name) {
    performance.mark(`${name}-start`);
    this.performanceMarks.set(name, { start: performance.now() });
  }
  
  endMeasure(name) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    this.performanceMarks.set(name, {
      ...this.performanceMarks.get(name),
      end: performance.now(),
      duration: measure.duration
    });
    
    this.log('performance', `${name}: ${measure.duration.toFixed(2)}ms`, 'info');
  }
  
  // Get development report
  getDevReport() {
    return {
      timestamp: Date.now(),
      logs: this.logs,
      networkRequests: this.networkRequests,
      performanceMarks: Array.from(this.performanceMarks.entries()),
      errorCount: this.errorLog.length,
      isEnabled: this.isEnabled
    };
  }
}

// Initialize dev tools if in development mode
if (window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('debug=true')) {
  window.devTools = new DevTools();
}

// Export for use in other modules
export { DevTools };