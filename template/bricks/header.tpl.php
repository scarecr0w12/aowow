<!DOCTYPE html>
<html>
<head>
<?php $this->brick('head'); ?>
</head>

<body<?=(User::isPremium() ? ' class="premium-logo"' : null); ?>>
<div id="layers"></div>

<script type="text/javascript">
<?=$this->writeGlobalVars(); ?>
</script>

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
                    <input type="text" name="search" class="header-search-input" placeholder="Search items, spells, quests..." value="<?=Util::htmlEscape($this->search ?? ''); ?>" />
                </form>
            </div>

            <nav class="header-nav">
                <div class="header-nav-dropdown">
                    <a href="#" class="header-nav-link header-nav-link-has-dropdown">Database</a>
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

    <main>
        <div class="container">
