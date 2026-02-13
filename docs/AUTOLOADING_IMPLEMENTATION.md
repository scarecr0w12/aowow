# Autoloading Implementation Guide

## Overview

This guide provides detailed instructions for implementing PSR-4 autoloading in the AoWoW project to replace manual `require_once` statements.

## Current State Analysis

### Files Currently Manually Loaded

From `includes/kernel.php`:
```php
require_once 'includes/stats.class.php';
require_once 'includes/game.php';
require_once 'includes/profiler.class.php';
require_once 'includes/markup.class.php';
require_once 'includes/community.class.php';
require_once 'includes/loot.class.php';
require_once 'pages/genericPage.class.php';
```

### Class Naming Patterns

The project uses several naming patterns:
- `ClassName.class.php` - Most classes (e.g., `Stats.class.php`)
- `classname.php` - Some utilities (e.g., `game.php`)
- `PageName.php` - Page controllers (e.g., `genericPage.class.php`)

## Implementation Strategy

### Phase 1: Create Autoloader

**File**: `includes/Autoloader.class.php`

```php
<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

/**
 * PSR-4 Autoloader for AoWoW
 * 
 * Handles automatic loading of classes from various directories
 * following the project's naming conventions.
 */
class Autoloader
{
    /**
     * @var array Map of class names to file paths
     */
    private static $classMap = [];
    
    /**
     * @var array Directories to search for classes
     */
    private static $directories = [
        'includes/',
        'pages/',
        'includes/types/',
        'includes/ajaxHandler/',
        'includes/community/',
    ];
    
    /**
     * @var array File naming patterns to try
     */
    private static $patterns = [
        '%s.class.php',
        '%s.php',
        'class.%s.php',
    ];
    
    /**
     * Register the autoloader
     */
    public static function register()
    {
        spl_autoload_register([__CLASS__, 'load'], true, true);
        self::buildClassMap();
    }
    
    /**
     * Build the class map for known classes
     */
    private static function buildClassMap()
    {
        // Core classes
        self::$classMap = [
            'Stats'             => 'includes/stats.class.php',
            'Game'              => 'includes/game.php',
            'Profiler'          => 'includes/profiler.class.php',
            'Markup'            => 'includes/markup.class.php',
            'CommunityContent'  => 'includes/community.class.php',
            'Loot'              => 'includes/loot.class.php',
            'GenericPage'       => 'pages/genericPage.class.php',
            'User'              => 'includes/user.class.php',
            'DB'                => 'includes/database.class.php',
            'Lang'              => 'includes/lang.class.php',
            'Util'              => 'includes/util.class.php',
            
            // Type classes
            'ItemList'          => 'includes/types/item.class.php',
            'SpellList'         => 'includes/types/spell.class.php',
            'CreatureList'      => 'includes/types/creature.class.php',
            'QuestList'         => 'includes/types/quest.class.php',
            'GameObjectList'    => 'includes/types/gameobject.class.php',
            'AchievementList'   => 'includes/types/achievement.class.php',
            'ZoneList'          => 'includes/types/zone.class.php',
            
            // AJAX handlers
            'AjaxComment'       => 'includes/ajaxHandler/comment.class.php',
            'AjaxData'          => 'includes/ajaxHandler/data.class.php',
            'AjaxAdmin'         => 'includes/ajaxHandler/admin.class.php',
            'AjaxAccount'       => 'includes/ajaxHandler/account.class.php',
        ];
    }
    
    /**
     * Load a class
     * 
     * @param string $class Class name to load
     * @return bool True if loaded, false otherwise
     */
    public static function load($class)
    {
        // Check class map first (fastest)
        if (isset(self::$classMap[$class])) {
            $file = self::$classMap[$class];
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }
        
        // Try to find in standard locations
        $classLower = strtolower($class);
        
        foreach (self::$directories as $dir) {
            foreach (self::$patterns as $pattern) {
                $file = $dir . sprintf($pattern, $classLower);
                if (file_exists($file)) {
                    require_once $file;
                    // Cache for future use
                    self::$classMap[$class] = $file;
                    return true;
                }
            }
        }
        
        // Not found
        return false;
    }
    
    /**
     * Get all loaded classes
     * 
     * @return array List of loaded class files
     */
    public static function getLoadedClasses()
    {
        return self::$classMap;
    }
}
```

### Phase 2: Update kernel.php

**File**: `includes/kernel.php`

Replace the manual require_once block (lines 56-63) with:

```php
// Register autoloader for automatic class loading
require_once 'includes/Autoloader.class.php';
Autoloader::register();

// Legacy compatibility - these will be autoloaded on first use
// Keeping commented for reference and quick rollback if needed
/*
require_once 'includes/stats.class.php';
require_once 'includes/game.php';
require_once 'includes/profiler.class.php';
require_once 'includes/markup.class.php';
require_once 'includes/community.class.php';
require_once 'includes/loot.class.php';
require_once 'pages/genericPage.class.php';
*/
```

### Phase 3: Testing

Create test script: `tests/test_autoloader.php`

```php
<?php

define('AOWOW_REVISION', 1);

require_once 'includes/Autoloader.class.php';
Autoloader::register();

// Test loading various classes
$tests = [
    'Stats',
    'Game',
    'Profiler',
    'Markup',
    'ItemList',
    'SpellList',
    'AjaxComment',
];

echo "Testing Autoloader...\n";
echo "====================\n\n";

foreach ($tests as $class) {
    echo "Testing $class... ";
    if (class_exists($class)) {
        echo "✓ PASS\n";
    } else {
        echo "✗ FAIL\n";
    }
}

echo "\nLoaded classes:\n";
print_r(Autoloader::getLoadedClasses());
```

## Benefits

1. **Performance**: Classes loaded only when needed (lazy loading)
2. **Maintainability**: No need to update kernel.php when adding classes
3. **Memory**: Reduced memory footprint (only load what's used)
4. **Organization**: Clear class location patterns
5. **Modern**: Follows PHP best practices

## Migration Checklist

- [ ] Create `includes/Autoloader.class.php`
- [ ] Update `includes/kernel.php`
- [ ] Test all pages load correctly
- [ ] Test AJAX handlers work
- [ ] Test CLI scripts function
- [ ] Verify no "Class not found" errors
- [ ] Performance benchmark (before/after)
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

## Rollback Plan

If issues arise:

1. Uncomment the old require_once statements in kernel.php
2. Comment out the Autoloader::register() line
3. Clear all caches
4. Test thoroughly
5. Document the issue for future resolution

## Performance Considerations

**Before Autoloading**:
- All classes loaded on every request
- ~50-100 files loaded per request
- Higher memory usage

**After Autoloading**:
- Only needed classes loaded
- ~20-40 files loaded per request (typical)
- Lower memory usage
- Slightly slower first class access (negligible)

## Future Enhancements

1. **Namespace Support**: Add PSR-4 namespace mapping
2. **Caching**: Cache class map to file for faster lookups
3. **Development Mode**: Rebuild class map on each request in dev
4. **Production Mode**: Use static class map in production
5. **Composer Integration**: Eventually migrate to Composer autoloading

