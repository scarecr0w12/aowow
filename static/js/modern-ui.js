/**
 * Modern UI Components
 * Handles interactive elements for modernized AoWoW interface
 */

const ModernUI = (() => {
  'use strict';

  // ========== Header Navigation ==========
  const initHeaderMenus = () => {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.header-mobile-toggle');
    const mobileMenu = document.querySelector('.header-mobile-menu');

    if (mobileToggle) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu?.classList.toggle('active');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-mobile-menu') && !e.target.closest('.header-mobile-toggle')) {
        mobileMenu?.classList.remove('active');
      }
    });

    // User menu toggle
    const userMenuToggles = document.querySelectorAll('.header-user-menu-toggle');
    userMenuToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = toggle.closest('.header-user-menu');
        menu?.classList.toggle('active');
      });
    });

    // Prevent default on nav dropdown links that point to "#"
    document.querySelectorAll('.header-nav-link-has-dropdown[href="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
      });
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header-user-menu')) {
        document.querySelectorAll('.header-user-menu.active').forEach(menu => {
          menu.classList.remove('active');
        });
      }
    });
  };

  // ========== List Page Controls ==========
  const initListPageControls = () => {
    // View toggle (grid/table)
    const viewToggleButtons = document.querySelectorAll('.list-view-toggle button');
    viewToggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        viewToggleButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const view = btn.dataset.view;
        const grid = document.getElementById('items-grid');
        const table = document.getElementById('items-table');

        if (view === 'table') {
          grid?.style.display = 'none';
          table?.style.display = 'table';
        } else {
          grid?.style.display = 'grid';
          table?.style.display = 'none';
        }
      });
    });

    // Sort select
    const sortSelect = document.querySelector('.list-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        // Trigger sort action
        const sortValue = e.target.value;
        console.log('Sorting by:', sortValue);
        // Would implement actual sorting here
      });
    }

    // Level range sliders
    const levelMin = document.getElementById('level-min');
    const levelMax = document.getElementById('level-max');
    const levelMinDisplay = document.getElementById('level-min-display');
    const levelMaxDisplay = document.getElementById('level-max-display');

    if (levelMin && levelMinDisplay) {
      levelMin.addEventListener('input', function() {
        levelMinDisplay.textContent = this.value;
      });
    }

    if (levelMax && levelMaxDisplay) {
      levelMax.addEventListener('input', function() {
        levelMaxDisplay.textContent = this.value;
      });
    }
  };

  // ========== Filter Panel ==========
  const initFilterPanel = () => {
    const filterApply = document.querySelector('.filter-apply');
    const filterReset = document.querySelector('.filter-reset');

    if (filterApply) {
      filterApply.addEventListener('click', () => {
        const filters = getActiveFilters();
        console.log('Applying filters:', filters);
        // Would implement actual filtering here
      });
    }

    if (filterReset) {
      filterReset.addEventListener('click', () => {
        document.querySelectorAll('.filter-option input').forEach(input => {
          input.checked = false;
        });
        document.getElementById('level-min')?.setAttribute('value', '1');
        document.getElementById('level-max')?.setAttribute('value', '80');
        console.log('Filters reset');
      });
    }
  };

  const getActiveFilters = () => {
    const filters = {
      quality: [],
      type: [],
      levelMin: document.getElementById('level-min')?.value || 1,
      levelMax: document.getElementById('level-max')?.value || 80
    };

    document.querySelectorAll('.filter-option input:checked').forEach(input => {
      if (input.name === 'quality') {
        filters.quality.push(input.value);
      } else if (input.name === 'type') {
        filters.type.push(input.value);
      }
    });

    return filters;
  };

  // ========== Modal Dialogs ==========
  const initModals = () => {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          modal.classList.remove('active');
        });
      }

      // Close modal when clicking outside content
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  };

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // ========== Tabs ==========
  const initTabs = () => {
    const tabButtons = document.querySelectorAll('.tab-button');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabGroup = button.closest('.tabs');
        const tabName = button.dataset.tab;

        // Deactivate all tabs in group
        tabGroup?.querySelectorAll('.tab-button').forEach(btn => {
          btn.classList.remove('active');
        });
        tabGroup?.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });

        // Activate selected tab
        button.classList.add('active');
        const content = document.getElementById(tabName);
        if (content) {
          content.classList.add('active');
        }
      });
    });
  };

  // ========== Dropdowns ==========
  const initDropdowns = () => {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');

      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('active');
        });
      }

      const items = dropdown.querySelectorAll('.dropdown-item');
      items.forEach(item => {
        item.addEventListener('click', () => {
          dropdown.classList.remove('active');
        });
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
  };

  // ========== Tooltips ==========
  const initTooltips = () => {
    const tooltips = document.querySelectorAll('.tooltip');

    tooltips.forEach(tooltip => {
      const content = tooltip.querySelector('.tooltip-content');

      if (content) {
        tooltip.addEventListener('mouseenter', () => {
          content.style.visibility = 'visible';
          content.style.opacity = '1';
        });

        tooltip.addEventListener('mouseleave', () => {
          content.style.visibility = 'hidden';
          content.style.opacity = '0';
        });
      }
    });
  };

  // ========== Alerts ==========
  const initAlerts = () => {
    const alerts = document.querySelectorAll('.alert');

    alerts.forEach(alert => {
      const closeBtn = alert.querySelector('.alert-close');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          alert.style.display = 'none';
        });
      }
    });
  };

  // ========== Form Validation ==========
  const initFormValidation = () => {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('.form-control[required]');
        let isValid = true;

        inputs.forEach(input => {
          if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            const errorMsg = input.parentElement.querySelector('.form-text.error');
            if (errorMsg) {
              errorMsg.style.display = 'block';
            }
          } else {
            input.classList.remove('error');
            const errorMsg = input.parentElement.querySelector('.form-text.error');
            if (errorMsg) {
              errorMsg.style.display = 'none';
            }
          }
        });

        if (!isValid) {
          e.preventDefault();
        }
      });
    });
  };

  // ========== Lazy Loading ==========
  const initLazyLoading = () => {
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');

      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  };

  // ========== Smooth Scroll ==========
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  };

  // ========== Pagination ==========
  const initPagination = () => {
    const paginationLinks = document.querySelectorAll('.pagination-link');

    paginationLinks.forEach(link => {
      if (!link.classList.contains('disabled') && !link.classList.contains('active')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          // Would implement actual pagination here
          console.log('Navigating to page');
        });
      }
    });
  };

  // ========== Search Functionality ==========
  const initSearch = () => {
    const searchInputs = document.querySelectorAll('.header-search-input, .home-hero-search-input');

    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = input.value.trim();
          if (query) {
            window.location.href = `?search=${encodeURIComponent(query)}`;
          }
        }
      });
    });
  };

  // ========== Favorites ==========
  const initFavorites = () => {
    const favoriteButtons = document.querySelectorAll('[data-favorite]');

    favoriteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = btn.dataset.favorite;
        const isFavorited = btn.classList.toggle('favorited');

        // Would implement actual favorite functionality here
        console.log(`Item ${itemId} ${isFavorited ? 'added to' : 'removed from'} favorites`);
      });
    });
  };

  // ========== Initialize All ==========
  const init = () => {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  };

  const initAll = () => {
    initHeaderMenus();
    initListPageControls();
    initFilterPanel();
    initModals();
    initTabs();
    initDropdowns();
    initTooltips();
    initAlerts();
    initFormValidation();
    initLazyLoading();
    initSmoothScroll();
    initPagination();
    initSearch();
    initFavorites();
  };

  // Public API
  return {
    init,
    openModal,
    closeModal,
    getActiveFilters
  };
})();

// Initialize on page load
ModernUI.init();
