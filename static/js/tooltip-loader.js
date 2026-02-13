/**
 * AoWoW Tooltip Loader for External Sites
 * 
 * Usage:
 *   <script src="https://aowow.com/static/js/tooltip-loader.js"></script>
 *   <a href="#" data-tooltip-type="item" data-tooltip-id="12345">Item Name</a>
 * 
 * Or programmatically:
 *   AoWoWTooltip.show(element, { type: 'item', id: 12345 });
 */

(function(window) {
    'use strict';

    const AoWoWTooltip = {
        config: {
            apiUrl: 'https://aowow.com/tooltip-api.php',
            locale: 'enus',
            cacheTooltips: true,
            tooltipCache: {}
        },

        init: function() {
            this.setupEventListeners();
            this.loadCachedScripts();
        },

        setupEventListeners: function() {
            document.addEventListener('mouseover', (e) => {
                let el = e.target.closest('[data-tooltip-type][data-tooltip-id]');
                if (!el) {
                    el = e.target.closest('[rel*="item="], [rel*="spell="], [rel*="quest="], [rel*="achievement="], [rel*="npc="]');
                }
                if (el) {
                    this.handleMouseOver(el, e);
                }
            });

            document.addEventListener('mouseout', (e) => {
                let el = e.target.closest('[data-tooltip-type][data-tooltip-id]');
                if (!el) {
                    el = e.target.closest('[rel*="item="], [rel*="spell="], [rel*="quest="], [rel*="achievement="], [rel*="npc="]');
                }
                if (el) {
                    this.handleMouseOut(el, e);
                }
            });

            document.addEventListener('mousemove', (e) => {
                let el = e.target.closest('[data-tooltip-type][data-tooltip-id]');
                if (!el) {
                    el = e.target.closest('[rel*="item="], [rel*="spell="], [rel*="quest="], [rel*="achievement="], [rel*="npc="]');
                }
                if (el && window.$WH && window.$WH.Tooltip) {
                    window.$WH.Tooltip.cursorUpdate(e);
                }
            });
        },

        loadCachedScripts: function() {
            if (window.$WH && window.$WH.Tooltip) {
                return;
            }

            const scripts = [
                { src: '/static/js/basic.js', name: 'basic' },
                { src: '/static/js/global.js', name: 'global' }
            ];

            scripts.forEach(script => {
                const tag = document.createElement('script');
                tag.src = this.getAbsoluteUrl(script.src);
                tag.async = false;
                document.head.appendChild(tag);
            });
        },

        handleMouseOver: function(el, event) {
            let type = el.getAttribute('data-tooltip-type');
            let id = parseInt(el.getAttribute('data-tooltip-id'));
            let locale = el.getAttribute('data-tooltip-locale') || this.config.locale;

            // Handle old rel attribute format (e.g., rel="item=50690")
            if (!type && el.getAttribute('rel')) {
                const rel = el.getAttribute('rel');
                const match = rel.match(/(item|spell|quest|achievement|npc)=(\d+)/);
                if (match) {
                    type = match[1];
                    id = parseInt(match[2]);
                }
            }

            if (type && id) {
                this.fetchTooltip(type, id, locale, (tooltip) => {
                    if (tooltip && window.$WH && window.$WH.Tooltip) {
                        window.$WH.Tooltip.showAtCursor(event, tooltip, 0, 0, 'q');
                    }
                });
            }
        },

        handleMouseOut: function(el, event) {
            if (window.$WH && window.$WH.Tooltip) {
                window.$WH.Tooltip.hide();
            }
        },

        fetchTooltip: function(type, id, locale, callback) {
            const cacheKey = type + '_' + id + '_' + locale;

            if (this.config.cacheTooltips && this.config.tooltipCache[cacheKey]) {
                callback(this.config.tooltipCache[cacheKey]);
                return;
            }

            const url = this.config.apiUrl + '?action=get-tooltip&type=' + type + '&id=' + id + '&locale=' + locale;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tooltip) {
                    if (this.config.cacheTooltips) {
                        this.config.tooltipCache[cacheKey] = data.tooltip;
                    }
                    callback(data.tooltip);
                } else {
                    console.warn('Failed to fetch tooltip:', data.error);
                    callback(null);
                }
            })
            .catch(error => {
                console.error('Tooltip fetch error:', error);
                callback(null);
            });
        },

        fetchTooltips: function(type, ids, locale, callback) {
            const url = this.config.apiUrl + '?action=get-tooltips&type=' + type + '&ids=' + ids.join(',') + '&locale=' + locale;

            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                mode: 'cors'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (this.config.cacheTooltips && data.tooltips) {
                        for (const id in data.tooltips) {
                            const cacheKey = type + '_' + id + '_' + locale;
                            this.config.tooltipCache[cacheKey] = data.tooltips[id];
                        }
                    }
                    callback(data.tooltips);
                } else {
                    console.warn('Failed to fetch tooltips:', data.error);
                    callback({});
                }
            })
            .catch(error => {
                console.error('Tooltips fetch error:', error);
                callback({});
            });
        },

        show: function(element, options) {
            const type = options.type || element.getAttribute('data-tooltip-type');
            const id = options.id || parseInt(element.getAttribute('data-tooltip-id'));
            const locale = options.locale || element.getAttribute('data-tooltip-locale') || this.config.locale;

            if (!type || !id) {
                console.error('Invalid tooltip options:', options);
                return;
            }

            this.fetchTooltip(type, id, locale, (tooltip) => {
                if (tooltip && window.$WH && window.$WH.Tooltip) {
                    const event = new MouseEvent('mouseover', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    window.$WH.Tooltip.showAtCursor(event, tooltip, 0, 0, 'q');
                }
            });
        },

        hide: function() {
            if (window.$WH && window.$WH.Tooltip) {
                window.$WH.Tooltip.hide();
            }
        },

        setConfig: function(config) {
            Object.assign(this.config, config);
        },

        getAbsoluteUrl: function(path) {
            if (path.startsWith('http')) {
                return path;
            }
            const baseUrl = this.config.apiUrl.split('/tooltip-api.php')[0];
            return baseUrl + path;
        }
    };

    window.AoWoWTooltip = AoWoWTooltip;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AoWoWTooltip.init();
        });
    } else {
        AoWoWTooltip.init();
    }

})(window);
