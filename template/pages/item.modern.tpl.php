<!DOCTYPE html>
<html>
<head>
<?php $this->brick('head'); ?>
</head>
<body class="detail-page-modern">
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
                    <div class="header-nav-dropdown">
                        <a href="#" class="header-nav-link header-nav-link-has-dropdown active">Database</a>
                        <div class="header-nav-dropdown-menu header-nav-dropdown-mega">
                            <div class="header-nav-dropdown-column">
                                <div class="header-nav-dropdown-heading">Items</div>
                                <a href="?items" class="header-nav-dropdown-item">Items</a>
                                <a href="?itemsets" class="header-nav-dropdown-item">Item Sets</a>
                                <a href="?enchantments" class="header-nav-dropdown-item">Enchantments</a>
                            </div>
                            <div class="header-nav-dropdown-column">
                                <div class="header-nav-dropdown-heading">Character</div>
                                <a href="?achievements" class="header-nav-dropdown-item">Achievements</a>
                                <a href="?classes" class="header-nav-dropdown-item">Classes</a>
                                <a href="?pets" class="header-nav-dropdown-item">Hunter Pets</a>
                                <a href="?skills" class="header-nav-dropdown-item">Professions &amp; Skills</a>
                                <a href="?races" class="header-nav-dropdown-item">Races</a>
                                <a href="?spells" class="header-nav-dropdown-item">Spells</a>
                                <a href="?titles" class="header-nav-dropdown-item">Titles</a>
                            </div>
                            <div class="header-nav-dropdown-column">
                                <div class="header-nav-dropdown-heading">World</div>
                                <a href="?currencies" class="header-nav-dropdown-item">Currencies</a>
                                <a href="?factions" class="header-nav-dropdown-item">Factions</a>
                                <a href="?npcs" class="header-nav-dropdown-item">NPCs</a>
                                <a href="?objects" class="header-nav-dropdown-item">Objects</a>
                                <a href="?quests" class="header-nav-dropdown-item">Quests</a>
                                <a href="?events" class="header-nav-dropdown-item">World Events</a>
                                <a href="?zones" class="header-nav-dropdown-item">Zones</a>
                            </div>
                            <div class="header-nav-dropdown-column">
                                <div class="header-nav-dropdown-heading">Other</div>
                                <a href="?icons" class="header-nav-dropdown-item">Icons</a>
                                <a href="?sounds" class="header-nav-dropdown-item">Sounds</a>
                                <a href="?emotes" class="header-nav-dropdown-item">Emotes</a>
                            </div>
                        </div>
                    </div>
                    <div class="header-nav-dropdown">
                        <a href="#" class="header-nav-link header-nav-link-has-dropdown">Tools</a>
                        <div class="header-nav-dropdown-menu">
                            <a href="?talent" class="header-nav-dropdown-item">Talent Calculator</a>
                            <a href="?petcalc" class="header-nav-dropdown-item">Pet Calculator</a>
                            <a href="?compare" class="header-nav-dropdown-item">Item Comparison</a>
                            <a href="?profiler" class="header-nav-dropdown-item">Profiler</a>
                            <a href="?maps" class="header-nav-dropdown-item">Maps</a>
                        </div>
                    </div>
                    <div class="header-nav-dropdown">
                        <a href="#" class="header-nav-link header-nav-link-has-dropdown">Community</a>
                        <div class="header-nav-dropdown-menu">
                            <a href="?reputation" class="header-nav-dropdown-item">Site Reputation</a>
                            <a href="?top-users" class="header-nav-dropdown-item">Top Users</a>
                        </div>
                    </div>
                    <div class="header-nav-dropdown">
                        <a href="?guides" class="header-nav-link header-nav-link-has-dropdown">Guides</a>
                        <div class="header-nav-dropdown-menu">
                            <a href="?guides=7" class="header-nav-dropdown-item">Achievements</a>
                            <a href="?guides=1" class="header-nav-dropdown-item">Classes</a>
                            <a href="?guides=6" class="header-nav-dropdown-item">Economy &amp; Money</a>
                            <a href="?guides=4" class="header-nav-dropdown-item">New Players &amp; Leveling</a>
                            <a href="?guides=2" class="header-nav-dropdown-item">Professions</a>
                            <a href="?guides=5" class="header-nav-dropdown-item">Raid &amp; Boss Fights</a>
                            <a href="?guides=8" class="header-nav-dropdown-item">Vanity Items, Pets &amp; Mounts</a>
                            <a href="?guides=3" class="header-nav-dropdown-item">World Events</a>
                            <a href="?guides=9" class="header-nav-dropdown-item">Other</a>
                        </div>
                    </div>
                    <div class="header-nav-dropdown">
                        <a href="#" class="header-nav-link header-nav-link-has-dropdown">More</a>
                        <div class="header-nav-dropdown-menu">
                            <a href="?aboutus" class="header-nav-dropdown-item">About Us &amp; Contact</a>
                            <a href="?faq" class="header-nav-dropdown-item">FAQ</a>
                            <a href="?whats-new" class="header-nav-dropdown-item">What's New</a>
                            <div class="header-nav-dropdown-divider"></div>
                            <a href="?tooltips" class="header-nav-dropdown-item">Tooltips</a>
                            <a href="?searchbox" class="header-nav-dropdown-item">Search Box</a>
                            <a href="?searchplugins" class="header-nav-dropdown-item">Search Plugins</a>
                        </div>
                    </div>
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
                <div class="detail-breadcrumb-item">
                    <a href="?items" class="detail-breadcrumb-link">Items</a>
                </div>
                <div class="detail-breadcrumb-item detail-breadcrumb-current">
                    Item Details
                </div>
            </div>

            <!-- Detail Page Layout -->
            <div class="detail-page-modern">
                <!-- Main Content Area -->
                <div class="detail-page-main">
                    <!-- Header Section -->
                    <div class="detail-header">
                        <div class="detail-header-icon" id="item-icon"></div>
                        <div class="detail-header-content">
                            <h1 class="detail-header-title" id="item-name">Item Name</h1>
                            <div class="detail-header-meta">
                                <div class="detail-header-meta-item">
                                    <span class="detail-header-meta-label">Quality:</span>
                                    <span id="item-quality">Common</span>
                                </div>
                                <div class="detail-header-meta-item">
                                    <span class="detail-header-meta-label">Type:</span>
                                    <span id="item-type">Item Type</span>
                                </div>
                                <div class="detail-header-meta-item">
                                    <span class="detail-header-meta-label">Level:</span>
                                    <span id="item-level">0</span>
                                </div>
                            </div>
                            <div class="detail-header-actions">
                                <button class="btn btn-primary btn-sm">Add to Favorites</button>
                                <button class="btn btn-secondary btn-sm">Share</button>
                            </div>
                        </div>
                    </div>

                    <!-- Description Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title">Description</h2>
                        <div class="detail-description" id="item-description">
                            Item description will appear here.
                        </div>
                    </div>

                    <!-- Stats Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title">Stats</h2>
                        <div class="detail-stats" id="item-stats">
                            <div class="detail-stat">
                                <div class="detail-stat-label">Armor</div>
                                <div class="detail-stat-value">+50</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Stamina</div>
                                <div class="detail-stat-value">+25</div>
                            </div>
                            <div class="detail-stat">
                                <div class="detail-stat-label">Intellect</div>
                                <div class="detail-stat-value">+15</div>
                            </div>
                        </div>
                    </div>

                    <!-- Effects Section -->
                    <div class="detail-section" id="item-effects-section" style="display: none;">
                        <h2 class="detail-section-title">Effects</h2>
                        <ul class="detail-list" id="item-effects">
                        </ul>
                    </div>

                    <!-- Drop Information -->
                    <div class="detail-section" id="item-drops-section" style="display: none;">
                        <h2 class="detail-section-title">Drop Information</h2>
                        <ul class="detail-list" id="item-drops">
                        </ul>
                    </div>

                    <!-- Related Items -->
                    <div class="detail-section" id="item-related-section" style="display: none;">
                        <h2 class="detail-section-title">Related Items</h2>
                        <div class="detail-related" id="item-related">
                        </div>
                    </div>

                    <!-- Comments Section -->
                    <div class="detail-comments">
                        <h2 class="detail-comments-title">Comments</h2>
                        <div id="comments-container">
                            <div class="detail-comment">
                                <div class="detail-comment-header">
                                    <span class="detail-comment-author">User Name</span>
                                    <span class="detail-comment-date">2 days ago</span>
                                </div>
                                <div class="detail-comment-text">
                                    This is a great item for tanking builds. Highly recommended!
                                </div>
                                <div class="detail-comment-actions">
                                    <span class="detail-comment-action">👍 Helpful (5)</span>
                                    <span class="detail-comment-action">Reply</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <aside class="detail-page-sidebar">
                    <!-- Quick Info Card -->
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-card-title">Quick Info</div>
                        <div class="detail-sidebar-info">
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Item ID:</span>
                                <span class="detail-sidebar-info-value" id="sidebar-item-id">0</span>
                            </div>
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Rarity:</span>
                                <span class="detail-sidebar-info-value" id="sidebar-rarity">Common</span>
                            </div>
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Slot:</span>
                                <span class="detail-sidebar-info-value" id="sidebar-slot">Head</span>
                            </div>
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Armor:</span>
                                <span class="detail-sidebar-info-value" id="sidebar-armor">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions Card -->
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-actions">
                            <button class="detail-sidebar-action">Add to Favorites</button>
                            <button class="detail-sidebar-action secondary">Share</button>
                            <button class="detail-sidebar-action secondary">Report Issue</button>
                        </div>
                    </div>

                    <!-- Sources Card -->
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-card-title">Where to Get</div>
                        <div class="detail-sidebar-info">
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Drop Rate:</span>
                                <span class="detail-sidebar-info-value">5%</span>
                            </div>
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Source:</span>
                                <span class="detail-sidebar-info-value">Boss Drop</span>
                            </div>
                        </div>
                    </div>
                </aside>
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
    </script>
</body>
</html>
