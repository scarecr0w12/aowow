<!DOCTYPE html>
<html>
<head>
<?php $this->brick('head'); ?>
</head>
<body class="list-page-modern">
    <div id="layers"></div>

    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-inner">
                <a href="?" class="header-logo">
                    <span class="header-logo-text">AoWoW</span>
                </a>

                <div class="header-search">
                    <form method="get" class="header-search-form">
                        <svg class="header-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" name="search" class="header-search-input" placeholder="Search items, spells, quests..." />
                    </form>
                </div>

                <nav class="header-nav">
                    <a href="?items" class="header-nav-link active">Items</a>
                    <a href="?spells" class="header-nav-link">Spells</a>
                    <a href="?quests" class="header-nav-link">Quests</a>
                    <a href="?npcs" class="header-nav-link">NPCs</a>
                    <a href="?guides" class="header-nav-link">Guides</a>
                </nav>

                <div class="header-user">
                    <?php if (User::isLogged()): ?>
                        <div class="header-user-menu">
                            <button class="header-user-menu-toggle">
                                <span><?=User::getName(); ?></span>
                            </button>
                            <div class="header-user-menu-dropdown">
                                <a href="?account" class="header-user-menu-item">Account</a>
                                <a href="?my-guides" class="header-user-menu-item">My Guides</a>
                                <div class="header-user-menu-divider"></div>
                                <a href="?logout" class="header-user-menu-item">Logout</a>
                            </div>
                        </div>
                    <?php else: ?>
                        <a href="?account" class="btn btn-primary btn-sm">Sign In</a>
                    <?php endif; ?>
                </div>

                <button class="header-mobile-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main>
        <div class="container">
            <!-- Breadcrumb -->
            <div class="detail-breadcrumb">
                <div class="detail-breadcrumb-item">
                    <a href="?" class="detail-breadcrumb-link">Home</a>
                </div>
                <div class="detail-breadcrumb-item detail-breadcrumb-current">
                    Items
                </div>
            </div>

            <!-- List Page Layout -->
            <div class="list-page-modern">
                <!-- Filters Sidebar -->
                <aside class="list-page-filters">
                    <div class="filter-panel">
                        <div class="filter-panel-title">Filters</div>

                        <!-- Quality Filter -->
                        <div class="filter-group">
                            <div class="filter-group-title">Quality</div>
                            <div class="filter-option">
                                <input type="checkbox" id="quality-common" name="quality" value="common">
                                <label for="quality-common">Common</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="quality-uncommon" name="quality" value="uncommon">
                                <label for="quality-uncommon">Uncommon</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="quality-rare" name="quality" value="rare">
                                <label for="quality-rare">Rare</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="quality-epic" name="quality" value="epic">
                                <label for="quality-epic">Epic</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="quality-legendary" name="quality" value="legendary">
                                <label for="quality-legendary">Legendary</label>
                            </div>
                        </div>

                        <!-- Type Filter -->
                        <div class="filter-group">
                            <div class="filter-group-title">Type</div>
                            <div class="filter-option">
                                <input type="checkbox" id="type-armor" name="type" value="armor">
                                <label for="type-armor">Armor</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="type-weapon" name="type" value="weapon">
                                <label for="type-weapon">Weapon</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="type-accessory" name="type" value="accessory">
                                <label for="type-accessory">Accessory</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="type-consumable" name="type" value="consumable">
                                <label for="type-consumable">Consumable</label>
                            </div>
                            <div class="filter-option">
                                <input type="checkbox" id="type-quest" name="type" value="quest">
                                <label for="type-quest">Quest Item</label>
                            </div>
                        </div>

                        <!-- Level Range Filter -->
                        <div class="filter-group">
                            <div class="filter-group-title">Item Level</div>
                            <div class="filter-slider">
                                <input type="range" min="1" max="80" value="1" id="level-min" name="level-min">
                                <input type="range" min="1" max="80" value="80" id="level-max" name="level-max">
                                <div class="filter-slider-values">
                                    <span id="level-min-display">1</span>
                                    <span id="level-max-display">80</span>
                                </div>
                            </div>
                        </div>

                        <!-- Filter Actions -->
                        <div class="filter-actions">
                            <button class="filter-apply">Apply</button>
                            <button class="filter-reset">Reset</button>
                        </div>
                    </div>
                </aside>

                <!-- Content Area -->
                <div class="list-page-content">
                    <!-- List Header -->
                    <div class="list-header">
                        <h1 class="list-header-title">Items</h1>
                        <div class="list-header-controls">
                            <div class="list-view-toggle">
                                <button class="active" data-view="grid" title="Grid View">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                </button>
                                <button data-view="table" title="Table View">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="8" y1="6" x2="21" y2="6"></line>
                                        <line x1="8" y1="12" x2="21" y2="12"></line>
                                        <line x1="8" y1="18" x2="21" y2="18"></line>
                                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                    </svg>
                                </button>
                            </div>
                            <select class="list-sort-select">
                                <option value="name">Sort by Name</option>
                                <option value="level">Sort by Level</option>
                                <option value="quality">Sort by Quality</option>
                                <option value="newest">Newest First</option>
                            </select>
                            <span class="list-count">Showing 1-20 of 10,000+ items</span>
                        </div>
                    </div>

                    <!-- Grid View -->
                    <div class="list-grid" id="items-grid">
                        <a href="?item=1234" class="list-item-card">
                            <div class="list-item-icon" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/wow/icons/tiny/inv_helmet_plate_raiddeathknight_p_01.jpg');"></div>
                            <div class="list-item-name">Helm of the Eternal Flame</div>
                            <div class="list-item-meta">
                                <span class="list-item-meta-item">
                                    <span class="list-item-quality quality-epic">Epic</span>
                                </span>
                                <span class="list-item-meta-item">iLvl 264</span>
                            </div>
                        </a>

                        <a href="?item=1235" class="list-item-card">
                            <div class="list-item-icon" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/wow/icons/tiny/inv_chest_plate_raiddeathknight_p_01.jpg');"></div>
                            <div class="list-item-name">Breastplate of the Eternal Flame</div>
                            <div class="list-item-meta">
                                <span class="list-item-meta-item">
                                    <span class="list-item-quality quality-epic">Epic</span>
                                </span>
                                <span class="list-item-meta-item">iLvl 264</span>
                            </div>
                        </a>

                        <a href="?item=1236" class="list-item-card">
                            <div class="list-item-icon" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/wow/icons/tiny/inv_gauntlets_plate_raiddeathknight_p_01.jpg');"></div>
                            <div class="list-item-name">Gauntlets of the Eternal Flame</div>
                            <div class="list-item-meta">
                                <span class="list-item-meta-item">
                                    <span class="list-item-quality quality-epic">Epic</span>
                                </span>
                                <span class="list-item-meta-item">iLvl 264</span>
                            </div>
                        </a>

                        <a href="?item=1237" class="list-item-card">
                            <div class="list-item-icon" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/wow/icons/tiny/inv_pants_plate_raiddeathknight_p_01.jpg');"></div>
                            <div class="list-item-name">Legplates of the Eternal Flame</div>
                            <div class="list-item-meta">
                                <span class="list-item-meta-item">
                                    <span class="list-item-quality quality-epic">Epic</span>
                                </span>
                                <span class="list-item-meta-item">iLvl 264</span>
                            </div>
                        </a>
                    </div>

                    <!-- Pagination -->
                    <div class="list-pagination">
                        <a href="#" class="pagination-link disabled">← Previous</a>
                        <span class="pagination-info">Page 1 of 500</span>
                        <a href="#" class="pagination-link">Next →</a>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div>
                <h3>About</h3>
                <ul>
                    <li><a href="?aboutus">About AoWoW</a></li>
                    <li><a href="?help">Help & FAQ</a></li>
                    <li><a href="?privilege">Privileges</a></li>
                </ul>
            </div>
            <div>
                <h3>Community</h3>
                <ul>
                    <li><a href="?guides">Guides</a></li>
                    <li><a href="?top-users">Top Contributors</a></li>
                    <li><a href="?latest-comments">Latest Comments</a></li>
                </ul>
            </div>
            <div>
                <h3>Resources</h3>
                <ul>
                    <li><a href="https://github.com/azerothcore/aowow" target="_blank">GitHub</a></li>
                    <li><a href="?searchplugins">Search Plugins</a></li>
                    <li><a href="#" id="footer-links-language">Language</a></li>
                </ul>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 AoWoW | Revision <?=AOWOW_REVISION; ?></p>
                <p>AzerothCore <a href="https://github.com/azerothcore/azerothcore-wotlk/commit/804769400bcb">804769400bcb</a></p>
            </div>
        </div>
    </footer>

    <?php $this->brick('pageTemplate'); ?>

    <noscript>
        <div id="noscript-bg"></div>
        <div id="noscript-text"><b><?=Lang::main('jsError'); ?></b></div>
    </noscript>

    <script type="text/javascript">
        // Mobile menu toggle
        document.querySelector('.header-mobile-toggle')?.addEventListener('click', function() {
            document.querySelector('.header-mobile-menu')?.classList.toggle('active');
        });

        // User menu toggle
        document.querySelectorAll('.header-user-menu-toggle').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.header-user-menu').classList.toggle('active');
            });
        });

        // Close menus when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.header-user-menu')) {
                document.querySelectorAll('.header-user-menu.active').forEach(menu => {
                    menu.classList.remove('active');
                });
            }
        });

        // View toggle
        document.querySelectorAll('.list-view-toggle button').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.list-view-toggle button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const view = this.dataset.view;
                // Toggle between grid and table view
                if (view === 'table') {
                    document.getElementById('items-grid').style.display = 'none';
                    // Show table view (would be implemented with actual table)
                } else {
                    document.getElementById('items-grid').style.display = 'grid';
                }
            });
        });

        // Level range slider
        const levelMin = document.getElementById('level-min');
        const levelMax = document.getElementById('level-max');
        const levelMinDisplay = document.getElementById('level-min-display');
        const levelMaxDisplay = document.getElementById('level-max-display');

        levelMin?.addEventListener('input', function() {
            levelMinDisplay.textContent = this.value;
        });

        levelMax?.addEventListener('input', function() {
            levelMaxDisplay.textContent = this.value;
        });
    </script>
</body>
</html>
