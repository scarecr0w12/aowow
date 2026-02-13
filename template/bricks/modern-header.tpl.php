<!-- Modern Header -->
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
                <?php if (User::$id): ?>
                    <div class="header-user-menu">
                        <button class="header-user-menu-toggle">
                            <span><?=User::$displayName; ?></span>
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
