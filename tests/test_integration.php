#!/usr/bin/env php
<?php

/**
 * Integration Test for Autoloader
 * 
 * Tests that the autoloader works correctly with the full kernel initialization
 * 
 * Usage: php tests/test_integration.php
 */

// Change to project root
chdir(dirname(__DIR__));

// ANSI color codes
define('COLOR_GREEN', "\033[0;32m");
define('COLOR_RED', "\033[0;31m");
define('COLOR_YELLOW', "\033[1;33m");
define('COLOR_BLUE', "\033[0;34m");
define('COLOR_RESET', "\033[0m");

echo "\n";
echo COLOR_BLUE . "========================================\n";
echo "AoWoW Integration Test\n";
echo "========================================" . COLOR_RESET . "\n\n";

// Test 1: Kernel initialization
echo COLOR_YELLOW . "Test 1: Kernel Initialization\n" . COLOR_RESET;
echo "Loading kernel.php ... ";

try {
    // Minimal defines needed for kernel
    define('AOWOW_REVISION', 1);
    define('CLI', 1);
    
    // Suppress output from kernel
    ob_start();
    require_once 'includes/kernel.php';
    ob_end_clean();
    
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $test1 = true;
} catch (Exception $e) {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    echo "  Error: " . $e->getMessage() . "\n";
    $test1 = false;
}

echo "\n";

// Test 2: Check autoloader is registered
echo COLOR_YELLOW . "Test 2: Autoloader Registration\n" . COLOR_RESET;
echo "Checking if Autoloader is registered ... ";

if (class_exists('Autoloader')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $test2 = true;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $test2 = false;
}

echo "\n";

// Test 3: Load classes dynamically
echo COLOR_YELLOW . "Test 3: Dynamic Class Loading\n" . COLOR_RESET;

$testClasses = [
    'ItemList',
    'SpellList',
    'CreatureList',
    'QuestList',
    'AjaxComment',
];

$passed = 0;
$failed = 0;

foreach ($testClasses as $class) {
    echo sprintf("  Loading %-20s ... ", $class);
    if (class_exists($class)) {
        echo COLOR_GREEN . "✓" . COLOR_RESET . "\n";
        $passed++;
    } else {
        echo COLOR_RED . "✗" . COLOR_RESET . "\n";
        $failed++;
    }
}

$test3 = ($failed === 0);

echo "\n";

// Test 4: Autoloader statistics
echo COLOR_YELLOW . "Test 4: Autoloader Statistics\n" . COLOR_RESET;

if (class_exists('Autoloader')) {
    $stats = Autoloader::getStats();
    echo "  Classes loaded: " . count($stats['loaded']) . "\n";
    echo "  Cache hits: " . $stats['hits'] . "\n";
    echo "  Cache misses: " . $stats['misses'] . "\n";
    
    if ($stats['hits'] > 0) {
        echo "  " . COLOR_GREEN . "✓ Autoloader is working" . COLOR_RESET . "\n";
        $test4 = true;
    } else {
        echo "  " . COLOR_YELLOW . "⚠ No classes loaded via autoloader" . COLOR_RESET . "\n";
        $test4 = false;
    }
} else {
    echo "  " . COLOR_RED . "✗ Autoloader not available" . COLOR_RESET . "\n";
    $test4 = false;
}

echo "\n";

// Summary
echo COLOR_BLUE . "========================================\n";
echo "Test Summary\n";
echo "========================================" . COLOR_RESET . "\n";

$tests = [
    'Kernel Initialization' => $test1,
    'Autoloader Registration' => $test2,
    'Dynamic Class Loading' => $test3,
    'Autoloader Statistics' => $test4,
];

$totalPassed = 0;
$totalFailed = 0;

foreach ($tests as $name => $result) {
    $status = $result ? COLOR_GREEN . "✓ PASS" . COLOR_RESET : COLOR_RED . "✗ FAIL" . COLOR_RESET;
    echo sprintf("%-30s %s\n", $name, $status);
    if ($result) {
        $totalPassed++;
    } else {
        $totalFailed++;
    }
}

echo "\n";
echo sprintf("Total: %s%d passed%s, %s%d failed%s\n", 
    COLOR_GREEN, $totalPassed, COLOR_RESET,
    COLOR_RED, $totalFailed, COLOR_RESET
);

if ($totalFailed === 0) {
    echo "\n" . COLOR_GREEN . "✓ All integration tests passed!" . COLOR_RESET . "\n\n";
    exit(0);
} else {
    echo "\n" . COLOR_RED . "✗ Some integration tests failed!" . COLOR_RESET . "\n\n";
    exit(1);
}

