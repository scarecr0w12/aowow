#!/usr/bin/env php
<?php

/**
 * Test Profile URL Parsing
 * 
 * Tests the URL parsing for profile pages
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
echo "Profile URL Parsing Test\n";
echo "========================================" . COLOR_RESET . "\n\n";

// Test URL: dev.old-man-warcraft.selarii
$testUrl = 'dev.old-man-warcraft.selarii';
echo "Testing URL: " . COLOR_YELLOW . $testUrl . COLOR_RESET . "\n\n";

// Parse the URL
$params = array_map('urldecode', explode('.', $testUrl));
echo "Parsed parameters:\n";
echo "  [0] Region: " . ($params[0] ?? 'NULL') . "\n";
echo "  [1] Realm:  " . ($params[1] ?? 'NULL') . "\n";
echo "  [2] Char:   " . ($params[2] ?? 'NULL') . "\n";
echo "\n";

// Urlize the parameters
if ($params[0])
    $params[0] = Profiler::urlize($params[0]);
if (isset($params[1]))
    $params[1] = Profiler::urlize($params[1], true);

echo "After urlize:\n";
echo "  [0] Region: " . ($params[0] ?? 'NULL') . "\n";
echo "  [1] Realm:  " . ($params[1] ?? 'NULL') . "\n";
echo "  [2] Char:   " . ($params[2] ?? 'NULL') . "\n";
echo "\n";

// Check if region is valid
$validRegions = ['us', 'kr', 'eu', 'tw', 'cn', 'dev'];
echo "Region '" . $params[0] . "' is " . (in_array($params[0], $validRegions) ? COLOR_GREEN . "VALID" . COLOR_RESET : COLOR_RED . "INVALID" . COLOR_RESET) . "\n";
echo "\n";

// Get realms
echo "Fetching realms from database...\n";
$realms = Profiler::getRealms();
echo "Found " . count($realms) . " realms\n\n";

// Try to find the realm
$realmFound = false;
$realmId = null;
$realmName = null;

foreach ($realms as $rId => $r) {
    $urlized = Profiler::urlize($r['name'], true);
    if ($urlized == $params[1]) {
        $realmFound = true;
        $realmId = $rId;
        $realmName = $r['name'];
        break;
    }
}

if ($realmFound) {
    echo COLOR_GREEN . "✓ Realm found!" . COLOR_RESET . "\n";
    echo "  ID:   " . $realmId . "\n";
    echo "  Name: " . $realmName . "\n";
} else {
    echo COLOR_RED . "✗ Realm NOT found!" . COLOR_RESET . "\n";
    echo "\nAvailable realms:\n";
    foreach ($realms as $rId => $r) {
        $urlized = Profiler::urlize($r['name'], true);
        echo sprintf("  [%d] %-30s (urlized: %s)\n", $rId, $r['name'], $urlized);
    }
}

echo "\n";

// Check character
if ($realmFound) {
    $charName = Util::ucFirst($params[2]);
    echo "Looking for character: " . COLOR_YELLOW . $charName . COLOR_RESET . "\n";
    
    // Check if character exists in profiler database
    $profile = DB::Aowow()->selectRow('SELECT id, realmGUID, name, cuFlags FROM ?_profiler_profiles WHERE realm = ?d AND name = ?', $realmId, $charName);
    
    if ($profile) {
        echo COLOR_GREEN . "✓ Character found in profiler database!" . COLOR_RESET . "\n";
        echo "  Profile ID: " . $profile['id'] . "\n";
        echo "  Realm GUID: " . ($profile['realmGUID'] ?? 'NULL') . "\n";
        echo "  Name: " . $profile['name'] . "\n";
        echo "  Flags: " . $profile['cuFlags'] . "\n";
        
        if ($profile['cuFlags'] & PROFILER_CU_NEEDS_RESYNC) {
            echo "  " . COLOR_YELLOW . "⚠ Needs resync" . COLOR_RESET . "\n";
        }
    } else {
        echo COLOR_YELLOW . "⚠ Character NOT in profiler database" . COLOR_RESET . "\n";
        
        // Check if character exists on realm
        echo "Checking realm database...\n";
        try {
            $char = DB::Characters($realmId)->selectRow('SELECT guid, name, race, class, level FROM characters WHERE name = ?', $charName);
            
            if ($char) {
                echo COLOR_GREEN . "✓ Character found on realm!" . COLOR_RESET . "\n";
                echo "  GUID:  " . $char['guid'] . "\n";
                echo "  Name:  " . $char['name'] . "\n";
                echo "  Race:  " . $char['race'] . "\n";
                echo "  Class: " . $char['class'] . "\n";
                echo "  Level: " . $char['level'] . "\n";
            } else {
                echo COLOR_RED . "✗ Character NOT found on realm!" . COLOR_RESET . "\n";
            }
        } catch (Exception $e) {
            echo COLOR_RED . "✗ Error querying realm database: " . $e->getMessage() . COLOR_RESET . "\n";
        }
    }
}

echo "\n";
echo COLOR_BLUE . "========================================" . COLOR_RESET . "\n";
echo "\n";

