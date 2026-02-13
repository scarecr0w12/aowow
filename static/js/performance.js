/**
 * Performance Optimization Module
 * Handles lazy loading, debouncing, throttling, and other performance enhancements
 */

const Performance = (() => {
  'use strict';

  // ========== Debounce Function ==========
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // ========== Throttle Function ==========
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // ========== Lazy Load Images ==========
  const lazyLoadImages = () => {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px'
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    }
  };

  // ========== Lazy Load Iframes ==========
  const lazyLoadIframes = () => {
    if ('IntersectionObserver' in window) {
      const iframes = document.querySelectorAll('iframe[data-src]');

      const iframeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
            observer.unobserve(iframe);
          }
        });
      }, {
        rootMargin: '50px'
      });

      iframes.forEach(iframe => iframeObserver.observe(iframe));
    }
  };

  // ========== Request Animation Frame Polyfill ==========
  const requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback) {
        return setTimeout(callback, 1000 / 60);
      };
  })();

  // ========== Smooth Scroll Performance ==========
  const smoothScroll = (element, duration = 300) => {
    const startPosition = window.scrollY;
    const targetPosition = element.offsetTop;
    const distance = targetPosition - startPosition;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimFrame(animation);
      }
    };

    const ease = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    };

    requestAnimFrame(animation);
  };

  // ========== Resource Hints ==========
  const addResourceHints = () => {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });

    // DNS prefetch for analytics
    const dnsPrefetchDomains = [
      'https://www.google-analytics.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  };

  // ========== Defer Non-Critical Scripts ==========
  const deferNonCriticalScripts = () => {
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.src = script.src;
      newScript.async = true;
      document.body.appendChild(newScript);
      script.remove();
    });
  };

  // ========== Monitor Performance ==========
  const monitorPerformance = () => {
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Long Tasks
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('Long task detected:', entry.duration);
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long Task API not supported
      }

      // Monitor Core Web Vitals
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      try {
        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              console.log('CLS:', entry.value);
            }
          }
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }
  };

  // ========== Cache Management ==========
  const cacheManager = {
    set: (key, value, ttl = 3600000) => {
      const item = {
        value: value,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    },

    get: (key) => {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    },

    remove: (key) => {
      localStorage.removeItem(key);
    },

    clear: () => {
      localStorage.clear();
    }
  };

  // ========== Scroll Performance ==========
  const optimizeScrollPerformance = () => {
    let scrolling = false;

    const handleScroll = throttle(() => {
      scrolling = true;
      document.body.classList.add('is-scrolling');

      setTimeout(() => {
        scrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 150);
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
  };

  // ========== Reduce Motion Support ==========
  const respectReducedMotion = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.documentElement.style.scrollBehavior = 'auto';
      document.querySelectorAll('[style*="transition"]').forEach(el => {
        el.style.transition = 'none';
      });
    }
  };

  // ========== Network Information ==========
  const checkNetworkSpeed = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType;

      if (effectiveType === '4g') {
        // Load high-quality assets
        document.documentElement.dataset.networkSpeed = 'fast';
      } else if (effectiveType === '3g') {
        // Load medium-quality assets
        document.documentElement.dataset.networkSpeed = 'medium';
      } else {
        // Load low-quality assets
        document.documentElement.dataset.networkSpeed = 'slow';
      }

      // Listen for network changes
      connection.addEventListener('change', () => {
        checkNetworkSpeed();
      });
    }
  };

  // ========== Initialize All ==========
  const init = () => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  };

  const initAll = () => {
    lazyLoadImages();
    lazyLoadIframes();
    addResourceHints();
    deferNonCriticalScripts();
    monitorPerformance();
    optimizeScrollPerformance();
    respectReducedMotion();
    checkNetworkSpeed();
  };

  // Public API
  return {
    init,
    debounce,
    throttle,
    cacheManager,
    smoothScroll
  };
})();

// Initialize on page load
Performance.init();
