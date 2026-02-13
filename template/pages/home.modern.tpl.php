<!DOCTYPE html>
<html>
<head>
<?php $this->brick('head'); ?>
</head>
<body class="home-modern<?=(User::isPremium() ? ' premium-logo' : null); ?>">
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
                    <a href="?items" class="header-nav-link">Items</a>
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
        <!-- Hero Section -->
        <section class="home-hero">
            <div class="home-hero-content">
                <h1 class="home-hero-title">AoWoW Database</h1>
                <p class="home-hero-subtitle">The comprehensive World of Warcraft database for Old Man Warcraft private server</p>

                <div class="home-hero-search">
                    <form method="get">
                        <svg class="home-hero-search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input type="text" name="search" class="home-hero-search-input" placeholder="Search for items, spells, quests, NPCs..." />
                    </form>
                </div>
            </div>
        </section>

        <!-- Featured Section -->
        <section class="home-featured">
            <div class="home-featured-container">
                <h2 class="home-featured-title">Featured Content</h2>

                <div class="home-featured-grid">
                    <div class="home-featured-card">
                        <div class="home-featured-card-image" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/featured/items.jpg');"></div>
                        <div class="home-featured-card-content">
                            <h3 class="home-featured-card-title">Items Database</h3>
                            <p class="home-featured-card-description">Browse thousands of items with detailed stats, effects, and drop locations.</p>
                            <a href="?items" class="home-featured-card-link">
                                Explore Items
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="home-featured-card">
                        <div class="home-featured-card-image" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/featured/spells.jpg');"></div>
                        <div class="home-featured-card-content">
                            <h3 class="home-featured-card-title">Spells & Abilities</h3>
                            <p class="home-featured-card-description">Complete spell database with mechanics, cooldowns, and class information.</p>
                            <a href="?spells" class="home-featured-card-link">
                                View Spells
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div class="home-featured-card">
                        <div class="home-featured-card-image" style="background-image: url('<?=Cfg::get('STATIC_URL'); ?>/images/featured/quests.jpg');"></div>
                        <div class="home-featured-card-content">
                            <h3 class="home-featured-card-title">Quests</h3>
                            <p class="home-featured-card-description">Quest guides with objectives, rewards, and step-by-step instructions.</p>
                            <a href="?quests" class="home-featured-card-link">
                                Browse Quests
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Quick Links Section -->
        <section class="home-quick-links">
            <div class="home-quick-links-container">
                <h2 class="home-quick-links-title">Quick Access</h2>

                <div class="home-quick-links-grid">
                    <a href="?items" class="home-quick-link">
                        <span class="home-quick-link-icon">⚔️</span>
                        <span class="home-quick-link-text">Items</span>
                    </a>
                    <a href="?spells" class="home-quick-link">
                        <span class="home-quick-link-icon">✨</span>
                        <span class="home-quick-link-text">Spells</span>
                    </a>
                    <a href="?quests" class="home-quick-link">
                        <span class="home-quick-link-icon">📜</span>
                        <span class="home-quick-link-text">Quests</span>
                    </a>
                    <a href="?npcs" class="home-quick-link">
                        <span class="home-quick-link-icon">👤</span>
                        <span class="home-quick-link-text">NPCs</span>
                    </a>
                    <a href="?zones" class="home-quick-link">
                        <span class="home-quick-link-icon">🗺️</span>
                        <span class="home-quick-link-text">Zones</span>
                    </a>
                    <a href="?guides" class="home-quick-link">
                        <span class="home-quick-link-icon">📚</span>
                        <span class="home-quick-link-text">Guides</span>
                    </a>
                </div>
            </div>
        </section>

        <!-- Statistics Section -->
        <section class="home-stats">
            <div class="home-stats-container">
                <div class="home-stats-grid">
                    <div class="home-stat-card">
                        <div class="home-stat-number">10K+</div>
                        <div class="home-stat-label">Items</div>
                    </div>
                    <div class="home-stat-card">
                        <div class="home-stat-number">5K+</div>
                        <div class="home-stat-label">Spells</div>
                    </div>
                    <div class="home-stat-card">
                        <div class="home-stat-number">3K+</div>
                        <div class="home-stat-label">Quests</div>
                    </div>
                    <div class="home-stat-card">
                        <div class="home-stat-number">2K+</div>
                        <div class="home-stat-label">NPCs</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="home-cta">
            <div class="home-cta-container">
                <h2 class="home-cta-title">Start Your Adventure</h2>
                <p class="home-cta-description">Join our community and contribute to the most comprehensive WoW database for Old Man Warcraft.</p>
                <div class="home-cta-buttons">
                    <?php if (!User::isLogged()): ?>
                        <a href="?account" class="btn btn-accent">Create Account</a>
                        <a href="?account" class="btn btn-outline">Sign In</a>
                    <?php else: ?>
                        <a href="?guides" class="btn btn-accent">Write a Guide</a>
                        <a href="?profiler" class="btn btn-outline">Character Profiler</a>
                    <?php endif; ?>
                </div>
            </div>
        </section>

        <!-- Latest Updates Section -->
        <section class="home-latest">
            <div class="home-latest-container">
                <h2 class="home-latest-title">Latest Updates</h2>

                <div class="home-latest-list">
                    <div class="home-latest-item">
                        <div class="home-latest-item-date">Today</div>
                        <div class="home-latest-item-title">New Item Database Update</div>
                        <div class="home-latest-item-description">Added 50 new items from the latest patch with complete stats and drop information.</div>
                    </div>
                    <div class="home-latest-item">
                        <div class="home-latest-item-date">Yesterday</div>
                        <div class="home-latest-item-title">Quest Guide Improvements</div>
                        <div class="home-latest-item-description">Updated quest guides with better navigation and improved step-by-step instructions.</div>
                    </div>
                    <div class="home-latest-item">
                        <div class="home-latest-item-date">2 days ago</div>
                        <div class="home-latest-item-title">Website Modernization</div>
                        <div class="home-latest-item-description">Launched new modern design with improved performance and mobile responsiveness.</div>
                    </div>
                </div>
            </div>
        </section>
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
