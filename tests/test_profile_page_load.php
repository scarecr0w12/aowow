#!/usr/bin/env php
<?php

/**
 * Test Profile Page Loading
 * 
 * Simulates loading a profile page to find errors
 */

// Change to project root
chdir(dirname(__DIR__));

// Simulate web request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_HOST'] = 'localhost';
$_SERVER['REQUEST_URI'] = '/?profile=dev.old-man-warcraft.selarii';
$_GET['profile'] = 'dev.old-man-warcraft.selarii';

define('AOWOW_REVISION', 1);

// Capture all output
ob_start();

try {
    require_once 'includes/kernel.php';
    
    echo "\n\n=== Attempting to create ProfilePage ===\n";
    
    $pageCall = 'profile';
    $pageParam = 'dev.old-man-warcraft.selarii';
    
    echo "Page Call: $pageCall\n";
    echo "Page Param: $pageParam\n\n";
    
    $page = new ProfilePage($pageCall, $pageParam);
    
    echo "ProfilePage created successfully!\n";
    echo "Subject GUID: " . ($page->subjectGUID ?? 'NULL') . "\n";
    
} catch (Exception $e) {
    echo "\n\n=== EXCEPTION CAUGHT ===\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
} catch (Error $e) {
    echo "\n\n=== ERROR CAUGHT ===\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}

$output = ob_get_clean();
echo $output;

