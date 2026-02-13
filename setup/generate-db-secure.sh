#!/bin/bash
# AoWoW Database Generation Script (Secure Version)
# Uses environment variables instead of hardcoded credentials

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}AoWoW Database Generation Script${NC}"
echo "=================================="

# Load environment variables from .env file
if [ -f "setup/.env" ]; then
    echo -e "${GREEN}✓${NC} Loading environment variables from setup/.env"
    export $(cat setup/.env | grep -v '^#' | xargs)
elif [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}✗${NC} Error: .env file not found!"
    echo "Please copy setup/.env.example to setup/.env and configure it."
    exit 1
fi

# Validate required environment variables
REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASS" "AOWOW_DB_NAME" "WORLD_DB_NAME" "AUTH_DB_NAME" "CHARACTERS_DB_NAME")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}✗${NC} Missing required environment variables:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

echo -e "${GREEN}✓${NC} All required environment variables present"

# Create MySQL connection string
MYSQL_CMD="mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS}"
MYSQLDUMP_CMD="mysqldump -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS}"

# Generate config/config.php
echo -e "${YELLOW}→${NC} Generating config/config.php..."
cat > ../config/config.php << EOF
<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');


\$AoWoWconf['aowow'] = array (
  'host' => '${DB_HOST}:${DB_PORT}',
  'user' => '${DB_USER}',
  'pass' => '${DB_PASS}',
  'db' => '${AOWOW_DB_NAME}',
  'prefix' => '${AOWOW_DB_PREFIX}',
);

\$AoWoWconf['world'] = array (
  'host' => '${DB_HOST}:${DB_PORT}',
  'user' => '${DB_USER}',
  'pass' => '${DB_PASS}',
  'db' => '${WORLD_DB_NAME}',
  'prefix' => '${WORLD_DB_PREFIX}',
);

\$AoWoWconf['auth'] = array (
  'host' => '${DB_HOST}:${DB_PORT}',
  'user' => '${DB_USER}',
  'pass' => '${DB_PASS}',
  'db' => '${AUTH_DB_NAME}',
  'prefix' => '${AUTH_DB_PREFIX}',
);

\$AoWoWconf['characters']['${REALM_ID}'] = array (
  'host' => '${DB_HOST}:${DB_PORT}',
  'user' => '${DB_USER}',
  'pass' => '${DB_PASS}',
  'db' => '${CHARACTERS_DB_NAME}',
  'prefix' => '${CHARACTERS_DB_PREFIX}',
);

?>
EOF

echo -e "${GREEN}✓${NC} Config file generated"

# Create database
echo -e "${YELLOW}→${NC} Creating database ${AOWOW_DB_NAME}..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS ${AOWOW_DB_NAME};" 2>/dev/null || {
    echo -e "${RED}✗${NC} Failed to create database. Check credentials."
    exit 1
}
echo -e "${GREEN}✓${NC} Database created"

# Import structure
echo -e "${YELLOW}→${NC} Importing database structure..."
$MYSQL_CMD ${AOWOW_DB_NAME} < db_structure.sql
echo -e "${GREEN}✓${NC} Structure imported"

# Import spell data
echo -e "${YELLOW}→${NC} Importing spell learn data..."
$MYSQL_CMD ${WORLD_DB_NAME} < spell_learn_spell.sql
echo -e "${GREEN}✓${NC} Spell data imported"

# Prepare DBC directory
cd ..
mkdir -p setup/mpqdata/enus/DBFilesClient/

# Download client data if not exists
if [ ! -d "setup/mpqdata/enus/DBFilesClient/dbc" ]; then
    echo -e "${YELLOW}→${NC} Downloading client data..."
    wget -q ${CLIENT_DATA_URL:-https://github.com/wowgaming/client-data/releases/download/v16/data.zip}
    unzip -q data.zip "dbc/*" -d ./
    mv dbc/* "setup/mpqdata/enus/DBFilesClient/"
    rm data.zip
    echo -e "${GREEN}✓${NC} Client data downloaded"
else
    echo -e "${GREEN}✓${NC} Client data already present"
fi

# Run SQL generation
echo -e "${YELLOW}→${NC} Running SQL generation (this may take a while)..."
php aowow --sql

# Create dumps
echo -e "${YELLOW}→${NC} Creating database dumps..."
$MYSQLDUMP_CMD ${AOWOW_DB_NAME} --ignore-table=${AOWOW_DB_NAME}.${AOWOW_DB_PREFIX}config > ${DUMP_AOWOW:-aowow_update.sql}
$MYSQLDUMP_CMD ${WORLD_DB_NAME} > ${DUMP_WORLD:-acore_world.sql}

# Create archive
echo -e "${YELLOW}→${NC} Creating archive..."
zip -q ${ARCHIVE_NAME:-aowow_db.sql.zip} ${DUMP_AOWOW:-aowow_update.sql} ${DUMP_WORLD:-acore_world.sql}

echo -e "${GREEN}✓${NC} Database generation complete!"
echo -e "Archive created: ${GREEN}${ARCHIVE_NAME:-aowow_db.sql.zip}${NC}"

