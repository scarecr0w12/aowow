# AoWoW Setup Scripts

This directory contains scripts for setting up and generating the AoWoW database.

## Security Notice

**NEVER commit credentials to version control!**

All database credentials should be stored in environment variables or `.env` files, which are excluded from git.

## Database Generation

### Prerequisites

- PHP 8.2 or higher
- MySQL/MariaDB server
- wget and unzip utilities
- AzerothCore database (world, auth, characters)

### Setup

1. **Copy the environment template:**
   ```bash
   cp setup/.env.example setup/.env
   ```

2. **Edit `.env` with your credentials:**
   ```bash
   nano setup/.env
   ```
   
   Configure all database connection settings:
   - `DB_HOST` - Database server hostname
   - `DB_PORT` - Database server port
   - `DB_USER` - Database username
   - `DB_PASS` - Database password
   - Database names for aowow, world, auth, and characters

3. **Run the secure generation script:**
   ```bash
   cd setup
   chmod +x generate-db-secure.sh
   ./generate-db-secure.sh
   ```

### What the Script Does

1. Validates environment variables
2. Generates `config/config.php` from environment
3. Creates the AoWoW database
4. Imports database structure
5. Downloads WoW client data (DBC files)
6. Runs SQL generation from DBC files
7. Creates database dumps
8. Packages everything into `aowow_db.sql.zip`

### Output Files

- `config/config.php` - Generated database configuration
- `aowow_update.sql` - AoWoW database dump
- `acore_world.sql` - World database dump
- `aowow_db.sql.zip` - Complete package

## Legacy Script

The old `generate-db.sh` script with hardcoded credentials is **deprecated** and should not be used in production.

Use `generate-db-secure.sh` instead.

## GitHub Actions

The GitHub Actions workflow (`.github/workflows/generate-aowow-database.yml`) uses GitHub Secrets for credentials.

### Required Secrets

Configure these in your repository settings:

- `DB_HOST` (optional, defaults to 127.0.0.1)
- `DB_PORT` (optional, defaults to 63306)
- `DB_USER` (optional, defaults to root)
- `DB_PASS` (optional, defaults to password)
- `AOWOW_DB_NAME` (optional, defaults to tmp_aowow)
- `WORLD_DB_NAME` (optional, defaults to acore_world)
- `AUTH_DB_NAME` (optional, defaults to acore_auth)
- `CHARACTERS_DB_NAME` (optional, defaults to acore_characters)

## Troubleshooting

### "Missing required environment variables"

Make sure your `.env` file exists and contains all required variables. Check `.env.example` for the complete list.

### "Failed to create database"

- Verify database credentials in `.env`
- Ensure MySQL server is running
- Check user has CREATE DATABASE permission

### "Client data download failed"

- Check internet connection
- Verify the CLIENT_DATA_URL in `.env`
- Try downloading manually and extracting to `setup/mpqdata/enus/DBFilesClient/`

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Use strong passwords** - Especially for production databases
3. **Limit database permissions** - Grant only necessary privileges
4. **Rotate credentials regularly** - Update passwords periodically
5. **Use GitHub Secrets** - For CI/CD workflows, never hardcode credentials

## Additional Scripts

- `extract.sh` - MPQ file extraction (requires MPQExtractor)
- `spell_learn_spell.sql` - Spell learning data import

## Support

For issues or questions, please open an issue on the GitHub repository.

