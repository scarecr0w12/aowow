#!/usr/bin/env php
<?php

/**
 * Test All Classes Loading
 * 
 * Attempts to load all classes to find missing ones
 */

// Change to project root
chdir(dirname(__DIR__));

define('AOWOW_REVISION', 1);
define('CLI', 1);

// Load kernel
ob_start();
require_once 'includes/kernel.php';
ob_end_clean();

// ANSI colors
define('COLOR_GREEN', "\033[0;32m");
define('COLOR_RED', "\033[0;31m");
define('COLOR_YELLOW', "\033[1;33m");
define('COLOR_BLUE', "\033[0;34m");
define('COLOR_RESET', "\033[0m");

echo "\n";
echo COLOR_BLUE . "========================================\n";
echo "All Classes Loading Test\n";
echo "========================================" . COLOR_RESET . "\n\n";

$passed = 0;
$failed = 0;
$missing = [];

// Test all classes that might be used by profiler
$testClasses = [
    // Core
    'Stat', 'StatsContainer', 'Game', 'Profiler', 'Markup', 'CommunityContent', 'Loot',
    
    // Utilities
    'SimpleXML', 'Timer', 'Report', 'Util', 'Lang', 'User', 'DB', 'Cfg',
    
    // Base types
    'BaseType', 'GenericPage',
    
    // Type classes
    'ItemList', 'SpellList', 'CreatureList', 'QuestList', 'GameObjectList',
    'AchievementList', 'ZoneList', 'FactionList', 'CurrencyList', 'SoundList',
    'CharClassList', 'CharRaceList', 'AreaTriggerList',
    'LocalProfileList', 'RemoteProfileList', 'LocalGuildList', 'RemoteGuildList',
    
    // AJAX handlers
    'AjaxHandler', 'AjaxComment', 'AjaxData', 'AjaxAdmin', 'AjaxAccount',
    
    // SmartAI
    'SmartAI', 'SmartEvent', 'SmartAction', 'SmartTarget',
    
    // Conditions
    'Conditions',
    
    // Pages
    'ProfilePage', 'ProfilesPage', 'ProfilerPage', 'GuildPage',
];

foreach ($testClasses as $class) {
    echo sprintf("%-30s ... ", $class);
    
    try {
        if (class_exists($class) || interface_exists($class) || trait_exists($class)) {
            echo COLOR_GREEN . "✓" . COLOR_RESET . "\n";
            $passed++;
        } else {
            echo COLOR_RED . "✗ NOT FOUND" . COLOR_RESET . "\n";
            $failed++;
            $missing[] = $class;
        }
    } catch (Exception $e) {
        echo COLOR_RED . "✗ ERROR: " . $e->getMessage() . COLOR_RESET . "\n";
        $failed++;
        $missing[] = $class;
    }
}

echo "\n";
echo COLOR_BLUE . "========================================\n";
echo "Test Summary\n";
echo "========================================" . COLOR_RESET . "\n";
echo sprintf("Passed: %s%d%s\n", COLOR_GREEN, $passed, COLOR_RESET);
echo sprintf("Failed: %s%d%s\n", COLOR_RED, $failed, COLOR_RESET);
echo sprintf("Total:  %d\n", $passed + $failed);

if ($missing) {
    echo "\n" . COLOR_RED . "Missing classes:" . COLOR_RESET . "\n";
    foreach ($missing as $class) {
        echo "  - $class\n";
    }
}

// Show autoloader stats
$stats = Autoloader::getStats();
echo "\n" . COLOR_BLUE . "Autoloader Statistics:" . COLOR_RESET . "\n";
echo sprintf("  Hits:   %d\n", $stats['hits']);
echo sprintf("  Misses: %d\n", $stats['misses']);
echo sprintf("  Loaded: %d classes\n", count($stats['loaded']));

if ($failed === 0) {
    echo "\n" . COLOR_GREEN . "✓ All classes can be loaded!" . COLOR_RESET . "\n\n";
    exit(0);
} else {
    echo "\n" . COLOR_RED . "✗ Some classes are missing!" . COLOR_RESET . "\n\n";
    exit(1);
}

