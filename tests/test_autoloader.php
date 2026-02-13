#!/usr/bin/env php
<?php

/**
 * Autoloader Test Script
 * 
 * Tests the PSR-4 autoloader implementation to ensure all classes
 * can be loaded correctly.
 * 
 * Usage: php tests/test_autoloader.php
 */

// Change to project root
chdir(dirname(__DIR__));

define('AOWOW_REVISION', 1);
define('CLI', 1);

// Load minimal dependencies
require_once 'includes/Autoloader.class.php';
Autoloader::register();

// ANSI color codes for output
define('COLOR_GREEN', "\033[0;32m");
define('COLOR_RED', "\033[0;31m");
define('COLOR_YELLOW', "\033[1;33m");
define('COLOR_BLUE', "\033[0;34m");
define('COLOR_RESET', "\033[0m");

/**
 * Test if a class can be loaded
 */
function testClass($className, $description = '', $allowAbstract = false)
{
    $desc = $description ?: $className;
    echo sprintf("Testing %-30s ... ", $desc);

    // Check for both regular classes and abstract classes
    if (class_exists($className) || ($allowAbstract && class_exists($className, true))) {
        echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
        return true;
    } else {
        echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
        return false;
    }
}

/**
 * Test if a class is in the class map
 */
function testMapped($className)
{
    if (Autoloader::isMapped($className)) {
        return COLOR_BLUE . "[mapped]" . COLOR_RESET;
    }
    return COLOR_YELLOW . "[dynamic]" . COLOR_RESET;
}

// Start testing
echo "\n";
echo COLOR_BLUE . "========================================\n";
echo "AoWoW Autoloader Test Suite\n";
echo "========================================" . COLOR_RESET . "\n\n";

$passed = 0;
$failed = 0;

// Test core classes
echo COLOR_YELLOW . "Core Classes:\n" . COLOR_RESET;
$coreClasses = [
    'Game' => 'Game data and functions',
    'Profiler' => 'Profiler feature',
    'Markup' => 'Markup text manipulation',
    'CommunityContent' => 'Comments, screenshots, videos',
    'Loot' => 'Loot information',
    'GenericPage' => 'Generic page controller',
];

foreach ($coreClasses as $class => $desc) {
    if (testClass($class, $desc)) {
        $passed++;
    } else {
        $failed++;
    }
}

// Test abstract classes separately
echo "\n" . COLOR_YELLOW . "Abstract Classes:\n" . COLOR_RESET;
echo sprintf("Testing %-30s ... ", "Game statistics (Stat)");
if (class_exists('Stat')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . " (abstract)\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $failed++;
}

echo "\n";

// Test type classes
echo COLOR_YELLOW . "Type Classes:\n" . COLOR_RESET;
$typeClasses = [
    'ItemList' => 'Item data',
    'SpellList' => 'Spell data',
    'CreatureList' => 'Creature/NPC data',
    'QuestList' => 'Quest data',
    'GameObjectList' => 'GameObject data',
    'AchievementList' => 'Achievement data',
    'ZoneList' => 'Zone data',
    'FactionList' => 'Faction data',
    'CurrencyList' => 'Currency data',
    'SoundList' => 'Sound data',
];

foreach ($typeClasses as $class => $desc) {
    if (testClass($class, $desc)) {
        $passed++;
    } else {
        $failed++;
    }
}

echo "\n";

// Test AJAX handlers
echo COLOR_YELLOW . "AJAX Handlers:\n" . COLOR_RESET;
$ajaxClasses = [
    'AjaxComment' => 'Comment handler',
    'AjaxData' => 'Data handler',
    'AjaxAdmin' => 'Admin handler',
    'AjaxAccount' => 'Account handler',
    'AjaxGuild' => 'Guild handler',
    'AjaxArenaTeam' => 'Arena team handler',
];

foreach ($ajaxClasses as $class => $desc) {
    if (testClass($class, $desc)) {
        $passed++;
    } else {
        $failed++;
    }
}

echo "\n";

// Display statistics
echo COLOR_BLUE . "========================================\n";
echo "Test Results\n";
echo "========================================" . COLOR_RESET . "\n";
echo sprintf("Passed: %s%d%s\n", COLOR_GREEN, $passed, COLOR_RESET);
echo sprintf("Failed: %s%d%s\n", COLOR_RED, $failed, COLOR_RESET);
echo sprintf("Total:  %d\n", $passed + $failed);

$stats = Autoloader::getStats();
echo sprintf("\nAutoloader Statistics:\n");
echo sprintf("  Hits:   %d\n", $stats['hits']);
echo sprintf("  Misses: %d\n", $stats['misses']);
echo sprintf("  Loaded: %d classes\n", count($stats['loaded']));

if ($failed === 0) {
    echo "\n" . COLOR_GREEN . "✓ All tests passed!" . COLOR_RESET . "\n\n";
    exit(0);
} else {
    echo "\n" . COLOR_RED . "✗ Some tests failed!" . COLOR_RESET . "\n\n";
    exit(1);
}

