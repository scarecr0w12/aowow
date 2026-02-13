#!/usr/bin/env php
<?php

/**
 * Fix Stuck Profiles
 * 
 * Resets profiles stuck in WORKING status and runs the queue
 */

// Change to project root
chdir(dirname(__DIR__));

define('AOWOW_REVISION', 1);
define('CLI', 1);

// Load kernel
ob_start();
require_once 'includes/kernel.php';
ob_end_clean();

echo "\n=== Fixing Stuck Profiles ===\n\n";

// Check for profiles stuck in WORKING status
echo "Checking for stuck profiles...\n";
$stuck = DB::Aowow()->select('SELECT * FROM aowow_profiler_sync WHERE status = ?d AND requestTime < ?d', PR_QUEUE_STATUS_WORKING, time() - (5 * MINUTE));

if ($stuck) {
    echo "Found " . count($stuck) . " stuck profiles:\n";
    foreach ($stuck as $row) {
        echo sprintf("  - Realm %d, GUID %d, Type %d, TypeID %d\n", $row['realm'], $row['realmGUID'], $row['type'], $row['typeId']);
    }
    
    echo "\nResetting to WAITING status...\n";
    DB::Aowow()->query('UPDATE aowow_profiler_sync SET status = ?d, errorCode = 0 WHERE status = ?d AND requestTime < ?d', PR_QUEUE_STATUS_WAITING, PR_QUEUE_STATUS_WORKING, time() - (5 * MINUTE));
    echo "Done!\n";
} else {
    echo "No stuck profiles found.\n";
}

// Check for profiles that need resync
echo "\nChecking for profiles that need resync...\n";
$needsResync = DB::Aowow()->select('SELECT id, realm, realmGUID, name, cuFlags FROM aowow_profiler_profiles WHERE (cuFlags & ?d) != 0 LIMIT 20', PROFILER_CU_NEEDS_RESYNC);

if ($needsResync) {
    echo "Found " . count($needsResync) . " profiles that need resync:\n";
    foreach ($needsResync as $profile) {
        echo sprintf("  - [%d] %s (Realm %d, GUID %d)\n", $profile['id'], $profile['name'], $profile['realm'], $profile['realmGUID']);
        
        // Check if already in queue
        $inQueue = DB::Aowow()->selectCell('SELECT COUNT(*) FROM aowow_profiler_sync WHERE realm = ?d AND realmGUID = ?d AND type = ?d', $profile['realm'], $profile['realmGUID'], Type::PROFILE);
        
        if (!$inQueue) {
            echo "    Adding to queue...\n";
            DB::Aowow()->query('REPLACE INTO aowow_profiler_sync (realm, realmGUID, type, typeId, requestTime, status, errorCode) VALUES (?d, ?d, ?d, ?d, UNIX_TIMESTAMP(), ?d, 0)', 
                $profile['realm'], $profile['realmGUID'], Type::PROFILE, $profile['id'], PR_QUEUE_STATUS_WAITING);
        } else {
            echo "    Already in queue\n";
        }
    }
} else {
    echo "No profiles need resync.\n";
}

// Show queue status
echo "\n=== Queue Status ===\n";
$queueStats = DB::Aowow()->select('SELECT status, COUNT(*) as count FROM aowow_profiler_sync GROUP BY status');

$statusNames = [
    0 => 'NONE',
    1 => 'WAITING',
    2 => 'WORKING',
    3 => 'READY',
    4 => 'ERROR',
];

foreach ($queueStats as $stat) {
    $statusName = $statusNames[$stat['status']] ?? 'UNKNOWN';
    echo sprintf("  %s: %d\n", $statusName, $stat['count']);
}

// Check if queue is running
echo "\n=== Queue Process ===\n";
$queuePID = Profiler::queueStatus();
if ($queuePID) {
    echo "Queue is running (PID: $queuePID)\n";
} else {
    echo "Queue is NOT running\n";
    
    $waiting = DB::Aowow()->selectCell('SELECT COUNT(*) FROM aowow_profiler_sync WHERE status = ?d', PR_QUEUE_STATUS_WAITING);
    if ($waiting > 0) {
        echo "\nThere are $waiting items waiting to be processed.\n";
        echo "Start the queue with: php prQueue\n";
    }
}

echo "\n=== Done ===\n\n";

