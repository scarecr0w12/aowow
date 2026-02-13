#!/usr/bin/env php
<?php

/**
 * Profiler System Test
 * 
 * Tests that the Profiler class and system are working correctly
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
echo "Profiler System Test\n";
echo "========================================" . COLOR_RESET . "\n\n";

$passed = 0;
$failed = 0;

// Test 1: Profiler class exists
echo "Test 1: Profiler class exists ... ";
if (class_exists('Profiler')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $failed++;
}

// Test 2: Profiler is enabled
echo "Test 2: Profiler is enabled ... ";
$enabled = Cfg::get('PROFILER_ENABLE');
if ($enabled) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . " (enabled)\n";
    $passed++;
} else {
    echo COLOR_YELLOW . "⚠ SKIP" . COLOR_RESET . " (disabled in config)\n";
}

// Test 3: Profiler constants defined
echo "Test 3: Profiler constants ... ";
if (defined('PR_QUEUE_STATUS_WAITING') && defined('PR_QUEUE_STATUS_READY')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . " (constants not defined)\n";
    $failed++;
}

// Test 4: Profiler methods exist
echo "Test 4: Profiler methods exist ... ";
$methods = ['queueStart', 'queueStatus', 'getRealms', 'scheduleResync'];
$allExist = true;
foreach ($methods as $method) {
    if (!method_exists('Profiler', $method)) {
        $allExist = false;
        break;
    }
}
if ($allExist) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . " (missing methods)\n";
    $failed++;
}

// Test 5: Database tables exist
echo "Test 5: Profiler database tables ... ";
try {
    $tables = DB::Aowow()->selectCol('SHOW TABLES LIKE "aowow_profiler%"');
    if (count($tables) >= 5) {
        echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . " (" . count($tables) . " tables)\n";
        $passed++;
    } else {
        echo COLOR_YELLOW . "⚠ WARN" . COLOR_RESET . " (only " . count($tables) . " tables found)\n";
    }
} catch (Exception $e) {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . " (" . $e->getMessage() . ")\n";
    $failed++;
}

// Test 6: ProfilerPage class exists
echo "Test 6: ProfilerPage class exists ... ";
if (class_exists('ProfilerPage')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $failed++;
}

// Test 7: Check if Profiler.js exists
echo "Test 7: Profiler.js exists ... ";
if (file_exists('static/js/Profiler.js')) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $failed++;
}

// Test 8: Check profiler configuration
echo "Test 8: Profiler configuration ... ";
$config = [
    'PROFILER_ENABLE' => Cfg::get('PROFILER_ENABLE'),
    'PROFILER_QUEUE_DELAY' => Cfg::get('PROFILER_QUEUE_DELAY'),
    'PROFILER_RESYNC_DELAY' => Cfg::get('PROFILER_RESYNC_DELAY'),
    'PROFILER_RESYNC_PING' => Cfg::get('PROFILER_RESYNC_PING'),
];
if ($config['PROFILER_ENABLE'] !== null) {
    echo COLOR_GREEN . "✓ PASS" . COLOR_RESET . "\n";
    echo "  - Enabled: " . ($config['PROFILER_ENABLE'] ? 'Yes' : 'No') . "\n";
    echo "  - Queue Delay: " . $config['PROFILER_QUEUE_DELAY'] . "ms\n";
    echo "  - Resync Delay: " . $config['PROFILER_RESYNC_DELAY'] . "s\n";
    echo "  - Resync Ping: " . $config['PROFILER_RESYNC_PING'] . "ms\n";
    $passed++;
} else {
    echo COLOR_RED . "✗ FAIL" . COLOR_RESET . "\n";
    $failed++;
}

// Summary
echo "\n";
echo COLOR_BLUE . "========================================\n";
echo "Test Summary\n";
echo "========================================" . COLOR_RESET . "\n";
echo sprintf("Passed: %s%d%s\n", COLOR_GREEN, $passed, COLOR_RESET);
echo sprintf("Failed: %s%d%s\n", COLOR_RED, $failed, COLOR_RESET);
echo sprintf("Total:  %d\n", $passed + $failed);

if ($failed === 0) {
    echo "\n" . COLOR_GREEN . "✓ All profiler tests passed!" . COLOR_RESET . "\n\n";
    exit(0);
} else {
    echo "\n" . COLOR_RED . "✗ Some profiler tests failed!" . COLOR_RESET . "\n\n";
    exit(1);
}

