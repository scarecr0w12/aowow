<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

/**
 * PSR-4 Autoloader for AoWoW
 * 
 * Handles automatic loading of classes from various directories
 * following the project's naming conventions.
 * 
 * @version 1.0
 * @author AoWoW Development Team
 */
class Autoloader
{
    /**
     * @var array Map of class names to file paths for known classes
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
        'includes/components/SmartAI/',
        'includes/components/Conditions/',
    ];
    
    /**
     * @var array File naming patterns to try (in order of preference)
     */
    private static $patterns = [
        '%s.class.php',
        '%s.php',
        'class.%s.php',
    ];
    
    /**
     * @var bool Whether autoloader is registered
     */
    private static $registered = false;
    
    /**
     * @var array Statistics for debugging
     */
    private static $stats = [
        'hits' => 0,
        'misses' => 0,
        'loaded' => []
    ];
    
    /**
     * Register the autoloader
     * 
     * @return void
     */
    public static function register()
    {
        if (self::$registered) {
            return;
        }
        
        spl_autoload_register([__CLASS__, 'load'], true, true);
        self::buildClassMap();
        self::$registered = true;
    }
    
    /**
     * Build the class map for known classes
     * This improves performance by avoiding filesystem lookups for common classes
     *
     * @return void
     */
    private static function buildClassMap()
    {
        // Load utilities.php first - contains traits and utility classes used by many classes
        if (!trait_exists('TrRequestData', false)) {
            require_once 'includes/utilities.php';
        }

        // Core classes (from kernel.php)
        self::$classMap = [
            'Stat'              => 'includes/stats.class.php',  // Abstract class
            'Stats'             => 'includes/stats.class.php',  // Alias for compatibility
            'StatsContainer'    => 'includes/stats.class.php',  // Also in stats.class.php
            'Game'              => 'includes/game.php',
            'Profiler'          => 'includes/profiler.class.php',
            'Markup'            => 'includes/markup.class.php',
            'CommunityContent'  => 'includes/community.class.php',
            'Loot'              => 'includes/loot.class.php',
            'GenericPage'       => 'pages/genericPage.class.php',

            // Utility classes (from utilities.php - already loaded above)
            'SimpleXML'         => 'includes/utilities.php',
            'Timer'             => 'includes/utilities.php',
            'Report'            => 'includes/utilities.php',

            // Additional core classes
            'User'              => 'includes/user.class.php',
            'DB'                => 'includes/database.class.php',
            'Lang'              => 'includes/lang.class.php',
            'Util'              => 'includes/util.class.php',
            'BaseType'          => 'includes/basetype.class.php',
            'AjaxHandler'       => 'includes/ajaxHandler.class.php',
            
            // Type classes
            'ItemList'          => 'includes/types/item.class.php',
            'SpellList'         => 'includes/types/spell.class.php',
            'CreatureList'      => 'includes/types/creature.class.php',
            'QuestList'         => 'includes/types/quest.class.php',
            'GameObjectList'    => 'includes/types/gameobject.class.php',
            'AchievementList'   => 'includes/types/achievement.class.php',
            'ZoneList'          => 'includes/types/zone.class.php',
            'FactionList'       => 'includes/types/faction.class.php',
            'CurrencyList'      => 'includes/types/currency.class.php',
            'SoundList'         => 'includes/types/sound.class.php',
            'CharClassList'     => 'includes/types/charclass.class.php',
            'CharRaceList'      => 'includes/types/charrace.class.php',
            'AreaTriggerList'   => 'includes/types/areatrigger.class.php',
            'MailList'          => 'includes/types/mail.class.php',
            
            // AJAX handlers
            'AjaxComment'       => 'includes/ajaxHandler/comment.class.php',
            'AjaxData'          => 'includes/ajaxHandler/data.class.php',
            'AjaxAdmin'         => 'includes/ajaxHandler/admin.class.php',
            'AjaxAccount'       => 'includes/ajaxHandler/account.class.php',
            'AjaxGuild'         => 'includes/ajaxHandler/guild.class.php',
            'AjaxArenaTeam'     => 'includes/ajaxHandler/arenateam.class.php',
            'AjaxFilter'        => 'includes/ajaxHandler/filter.class.php',
            'AjaxSignature'     => 'includes/ajaxHandler/signature.class.php',
            
            // Page classes
            'SignaturePage'     => 'pages/signature.php',
            
            // SmartAI components (special case - SmartHelper trait must be loaded first)
            'SmartAI'           => 'includes/components/SmartAI/SmartAI.class.php',
            'SmartEvent'        => 'includes/components/SmartAI/SmartAI.class.php',  // Contains SmartHelper trait
            'SmartAction'       => 'includes/components/SmartAI/SmartAI.class.php',  // Contains SmartHelper trait
            'SmartTarget'       => 'includes/components/SmartAI/SmartAI.class.php',  // Contains SmartHelper trait
            
            // Conditions component
            'Conditions'        => 'includes/components/Conditions/Conditions.class.php',
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
        // Special case: SmartAI components need all files loaded together
        if (in_array($class, ['SmartAI', 'SmartEvent', 'SmartAction', 'SmartTarget'])) {
            if (!class_exists('SmartAI', false)) {
                require_once 'includes/components/SmartAI/SmartAI.class.php';
            }
            if (!class_exists('SmartEvent', false)) {
                require_once 'includes/components/SmartAI/SmartEvent.class.php';
            }
            if (!class_exists('SmartAction', false)) {
                require_once 'includes/components/SmartAI/SmartAction.class.php';
            }
            if (!class_exists('SmartTarget', false)) {
                require_once 'includes/components/SmartAI/SmartTarget.class.php';
            }
            self::$stats['hits']++;
            self::$stats['loaded'][] = $class;
            return true;
        }

        // Check class map first (fastest path)
        if (isset(self::$classMap[$class])) {
            $file = self::$classMap[$class];
            if (file_exists($file)) {
                require_once $file;
                self::$stats['hits']++;
                self::$stats['loaded'][] = $class;
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
                    self::$stats['hits']++;
                    self::$stats['loaded'][] = $class;
                    return true;
                }
            }
        }

        // Not found
        self::$stats['misses']++;
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

    /**
     * Get autoloader statistics
     *
     * @return array Statistics array
     */
    public static function getStats()
    {
        return self::$stats;
    }

    /**
     * Check if a class is in the class map
     *
     * @param string $class Class name
     * @return bool True if class is mapped
     */
    public static function isMapped($class)
    {
        return isset(self::$classMap[$class]);
    }

    /**
     * Manually add a class to the class map
     * Useful for dynamically generated or special classes
     *
     * @param string $class Class name
     * @param string $file File path
     * @return void
     */
    public static function addClass($class, $file)
    {
        self::$classMap[$class] = $file;
    }
}

?>

