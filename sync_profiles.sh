#!/bin/bash

# Sync Profiles Helper Script
# 
# This script helps sync character profiles that need updating
# Usage: ./sync_profiles.sh [options]
#
# Options:
#   --fix-stuck    Reset profiles stuck in WORKING status
#   --queue-all    Add all profiles needing resync to queue
#   --run-queue    Run the profiler queue to process pending syncs
#   --status       Show queue status
#   --help         Show this help message

set -e

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
show_help() {
    echo -e "${BLUE}=== Profile Sync Helper ===${NC}\n"
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --fix-stuck    Reset profiles stuck in WORKING status"
    echo "  --queue-all    Add all profiles needing resync to queue"
    echo "  --run-queue    Run the profiler queue to process pending syncs"
    echo "  --status       Show queue status"
    echo "  --all          Do all of the above (fix, queue, run)"
    echo "  --help         Show this help message"
    echo ""
}

show_status() {
    echo -e "${BLUE}=== Queue Status ===${NC}"
    mysql -u aowow -paowow_password -h localhost -D aowow -e "
        SELECT 
            CASE status
                WHEN 0 THEN 'NONE'
                WHEN 1 THEN 'WAITING'
                WHEN 2 THEN 'WORKING'
                WHEN 3 THEN 'READY'
                WHEN 4 THEN 'ERROR'
                ELSE 'UNKNOWN'
            END as Status,
            COUNT(*) as Count
        FROM aowow_profiler_sync
        GROUP BY status
        ORDER BY status;
    " 2>/dev/null | grep -v "Warning"
    
    echo ""
    echo -e "${BLUE}=== Profiles Needing Resync ===${NC}"
    local count=$(mysql -u aowow -paowow_password -h localhost -D aowow -N -e "SELECT COUNT(*) FROM aowow_profiler_profiles WHERE (cuFlags & 16) != 0;" 2>/dev/null)
    echo "Count: $count"
}

fix_stuck() {
    echo -e "${YELLOW}Fixing stuck profiles...${NC}"
    mysql -u aowow -paowow_password -h localhost -D aowow -e "
        UPDATE aowow_profiler_sync 
        SET status = 1, errorCode = 0 
        WHERE status = 2 AND requestTime < UNIX_TIMESTAMP() - 300;
    " 2>/dev/null
    
    local affected=$(mysql -u aowow -paowow_password -h localhost -D aowow -N -e "SELECT ROW_COUNT();" 2>/dev/null)
    echo -e "${GREEN}Reset $affected stuck profiles${NC}"
}

queue_all() {
    echo -e "${YELLOW}Adding profiles to queue...${NC}"
    php tests/fix_stuck_profiles.php 2>&1 | grep -v "Warning" | grep -v "Fatal Error"
    echo -e "${GREEN}Done!${NC}"
}

run_queue() {
    echo -e "${YELLOW}Running profiler queue...${NC}"
    echo -e "${BLUE}Press Ctrl+C to stop${NC}\n"
    php prQueue 2>&1 | grep -v "WARNING - ini_set()"
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    --help)
        show_help
        ;;
    --status)
        show_status
        ;;
    --fix-stuck)
        fix_stuck
        ;;
    --queue-all)
        queue_all
        ;;
    --run-queue)
        run_queue
        ;;
    --all)
        echo -e "${BLUE}=== Running Full Sync Process ===${NC}\n"
        fix_stuck
        echo ""
        queue_all
        echo ""
        show_status
        echo ""
        run_queue
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac

