// Core dependency library - ensures all required functions and objects are defined

// Initialize $WH if not already defined
if (typeof $WH == "undefined") {
    var $WH = {};
}

// Utility functions for $WH
$WH.ge = function(id) {
    if (typeof id != 'string') {
        return id;
    }
    return document.getElementById(id);
};

$WH.ce = function(tag, parent, className) {
    var el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    if (parent) {
        parent.appendChild(el);
    }
    return el;
};

$WH.ae = function(parent, child) {
    if ($WH.is_array(child)) {
        for (var i = 0; i < child.length; i++) {
            parent.appendChild(child[i]);
        }
    } else {
        parent.appendChild(child);
    }
    return parent;
};

$WH.de = function(el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el);
    }
};

$WH.ee = function(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
};

$WH.cO = function(dest, src) {
    if (!src) return dest;
    for (var key in src) {
        if (src.hasOwnProperty(key)) {
            dest[key] = src[key];
        }
    }
    return dest;
};

$WH.is_array = function(obj) {
    return Array.isArray(obj);
};

$WH.aE = function(el, event, handler) {
    if (el.addEventListener) {
        el.addEventListener(event, handler, false);
    } else if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    }
};

$WH.dE = function(el, event, handler) {
    if (el.removeEventListener) {
        el.removeEventListener(event, handler, false);
    } else if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    }
};

$WH.st = function(el, text) {
    if (el.textContent !== undefined) {
        el.textContent = text;
    } else {
        el.innerText = text;
    }
};

$WH.ct = function(text) {
    return document.createTextNode(text);
};

$WH.aef = function(parent, child) {
    if (parent.firstChild) {
        parent.insertBefore(child, parent.firstChild);
    } else {
        parent.appendChild(child);
    }
    return parent;
};

$WH.sp = function(e) {
    if (!e) e = window.event;
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
};

$WH.$E = function(e) {
    if (!e) {
        if (typeof event != 'undefined') {
            e = event;
        } else {
            return null;
        }
    }
    if (e.which) {
        e._button = e.which;
    } else {
        e._button = e.button + 1;
    }
    e._target = e.target ? e.target : e.srcElement;
    return e;
};

$WH.qs = function(selector, context) {
    return (context || document).querySelector(selector);
};

$WH.qsa = function(selector, context) {
    return (context || document).querySelectorAll(selector);
};

// Tabs constructor
function Tabs(options) {
    var self = this;
    $WH.cO(this, options);
    
    this.tabs = [];
    this.contents = [];
    this.activeTab = 0;
    this.uls = [];
    this.nShows = 0;
    this.poundable = 1;
    
    if (this.parent) {
        if (typeof this.parent === 'string') {
            this.parent = $WH.ge(this.parent);
        }
    }
    
    this.add = function(name, data) {
        var tabIndex = this.tabs.length;
        this.tabs.push({ name: name, data: data, index: tabIndex });
        
        if (this.parent) {
            var tabEl = $WH.ce('div', this.parent, 'tab');
            if (typeof name === 'string' && name.charAt(0) === '$') {
                // Handle language constants like $LANG.tab_comments
                var langPath = name.substring(1).split('.');
                var langValue = window;
                for (var i = 0; i < langPath.length; i++) {
                    langValue = langValue[langPath[i]];
                    if (!langValue) break;
                }
                tabEl.innerHTML = langValue || name;
            } else {
                tabEl.innerHTML = name;
            }
            $WH.aE(tabEl, 'click', function() { self.show(tabIndex); });
        }
        
        return tabIndex;
    };
    
    this.show = function(tabIndex) {
        if (tabIndex < 0 || tabIndex >= this.tabs.length) return;
        
        this.activeTab = tabIndex;
        
        if (this.onShow) {
            this.onShow(this.parent, tabIndex, this.tabs[tabIndex]);
        }
    };
    
    this.flush = function() {
        if (this.activeTab >= 0 && this.activeTab < this.tabs.length) {
            this.show(this.activeTab);
        }
    };
}

// Global listviews registry
if (typeof g_listviews == "undefined") {
    var g_listviews = {};
}

// Listview constructor
function Listview(options) {
    var self = this;
    $WH.cO(this, options);
    
    this.id = options.id || 'listview-' + Math.random().toString(36).substr(2, 9);
    this.template = options.template || 'generic';
    this.data = options.data || [];
    this.parent = options.parent ? (typeof options.parent === 'string' ? $WH.ge(options.parent) : options.parent) : null;
    this.tabs = options.tabs || null;
    this.tabIndex = options.tabIndex || null;
    this.name = options.name || null;
    
    // Register this listview
    g_listviews[this.id] = this;
    
    if (this.parent) {
        var container = $WH.ce('div', this.parent, 'listview-container');
        container.id = 'lv-' + this.id;
        
        if (this.data && Array.isArray(this.data) && this.data.length > 0) {
            var table = $WH.ce('table', container);
            table.className = 'listview-table';
            
            // Create header row
            var thead = $WH.ce('thead', table);
            var headerRow = $WH.ce('tr', thead);
            
            // Create body rows
            var tbody = $WH.ce('tbody', table);
            for (var i = 0; i < this.data.length; i++) {
                var row = $WH.ce('tr', tbody);
                row.className = 'listview-row';
                
                if (this.data[i] && this.data[i].name) {
                    var cell = $WH.ce('td', row);
                    cell.innerHTML = this.data[i].name;
                }
            }
        }
    }
    
    if (this.tabs && typeof this.tabs.add === 'function') {
        var tabName = this.name;
        if (typeof tabName === 'string' && tabName.charAt(0) === '$') {
            // Handle language constants
            var langPath = tabName.substring(1).split('.');
            var langValue = window;
            for (var i = 0; i < langPath.length; i++) {
                langValue = langValue[langPath[i]];
                if (!langValue) break;
            }
            tabName = langValue || this.name;
        }
        this.tabs.add(tabName || this.id, { id: this.id });
    }
}

// Markup object
if (typeof Markup == "undefined") {
    var Markup = {
        MODE_COMMENT: 1,
        MODE_ARTICLE: 2,
        MODE_QUICKFACTS: 3,
        MODE_SIGNATURE: 4,
        MODE_REPLY: 5,
        
        CLASS_ADMIN: 40,
        CLASS_STAFF: 30,
        CLASS_PREMIUM: 20,
        CLASS_USER: 10,
        CLASS_PENDING: 1,
        
        SOURCE_LIVE: 1,
        SOURCE_PTR: 2,
        SOURCE_BETA: 3,
        
        rolesToClass: function(roles) {
            if (roles & (U_GROUP_ADMIN | U_GROUP_VIP | U_GROUP_DEV)) {
                return Markup.CLASS_ADMIN;
            } else if (roles & U_GROUP_STAFF) {
                return Markup.CLASS_STAFF;
            } else if (roles & U_GROUP_PREMIUM) {
                return Markup.CLASS_PREMIUM;
            } else if (roles & U_GROUP_PENDING) {
                return Markup.CLASS_PENDING;
            } else {
                return Markup.CLASS_USER;
            }
        }
    };
}

// Sticky functions for screenshots and videos
function ss_appendSticky() {
    var container = $WH.ge('infobox-sticky-ss');
    if (!container) {
        container = $WH.ce('div');
        container.id = 'infobox-sticky-ss';
        container.className = 'infobox-sticky';
        
        var parent = $WH.ge('infobox');
        if (parent) {
            parent.appendChild(container);
        }
    }
    return container;
}

function vi_appendSticky() {
    var container = $WH.ge('infobox-sticky-vi');
    if (!container) {
        container = $WH.ce('div');
        container.id = 'infobox-sticky-vi';
        container.className = 'infobox-sticky';
        
        var parent = $WH.ge('infobox');
        if (parent) {
            parent.appendChild(container);
        }
    }
    return container;
}

// Global page info object
if (typeof g_pageInfo == "undefined") {
    var g_pageInfo = {
        type: null,
        typeId: null,
        name: null
    };
}

// Global user object
if (typeof g_user == "undefined") {
    var g_user = {
        id: 0,
        roles: 0,
        name: null
    };
}

// Language constants
if (typeof LANG == "undefined") {
    var LANG = {
        tab_comments: 'Comments',
        tab_screenshots: 'Screenshots',
        tab_videos: 'Videos'
    };
}

// User group constants (if not already defined)
if (typeof U_GROUP_ADMIN == "undefined") {
    var U_GROUP_ADMIN = 0x2;
    var U_GROUP_EDITOR = 0x4;
    var U_GROUP_MOD = 0x8;
    var U_GROUP_BUREAU = 0x10;
    var U_GROUP_DEV = 0x20;
    var U_GROUP_VIP = 0x40;
    var U_GROUP_STAFF = U_GROUP_ADMIN | U_GROUP_EDITOR | U_GROUP_MOD | U_GROUP_BUREAU | U_GROUP_DEV;
    var U_GROUP_PREMIUM = 0x100;
    var U_GROUP_SCREENSHOT = 0x800;
    var U_GROUP_VIDEO = 0x1000;
}
