---
description: MPQ file extraction process and data pipeline for AoWoW
activation_mode: model_decision
---

# MPQ Extraction and Data Pipeline

<mpq_overview>
- MPQ (MoPaQ) files contain World of Warcraft game assets
- Located in `/var/www/clientdata/Data/` directory (25GB WoW client installation)
- Main MPQ files: patch.MPQ, common.MPQ, expansion.MPQ, lichking.MPQ
- Extracted data stored in `/var/www/clientdata/enUS/` directory
- MPQExtractor tool located in `/MPQExtractor/` directory
</mpq_overview>

<extraction_tools>
- MPQExtractor - C++ tool for extracting MPQ archives
- Located in `/MPQExtractor/bin/MPQExtractor`
- Uses StormLib library for MPQ file handling
- Configured via CMake build system
- Supports batch extraction of multiple MPQ files
</extraction_tools>

<extraction_process>
- Run extraction scripts from `/setup/` directory
- `extract.sh` - Main extraction script
- `generate-db.sh` - Database generation from extracted data
- Extract DBC files (database containers) from MPQ archives
- Extract M2 models (3D character/creature models)
- Extract BLP images (textures and icons)
- Extract WMO files (world map objects)
</extraction_process>

<dbc_files>
- DBC (DataBase Container) files contain game data
- Common DBC files: Item.dbc, Spell.dbc, Creature.dbc, Quest.dbc
- DBC files are binary format with fixed-width records
- Parsed into database tables during setup
- Located in extracted data directory after extraction
- Currently using downloaded DBC files from GitHub (v16) as fallback
</dbc_files>

<extraction_workflow>
1. Source MPQ files from client installation
2. Run MPQExtractor on MPQ archives
3. Extract DBC files to temporary directory
4. Parse DBC files into SQL format
5. Import parsed data into database
6. Extract images and models as needed
7. Verify data integrity and completeness
</extraction_workflow>

<performance_considerations>
- MPQ extraction is I/O intensive (25GB client data)
- Cache extracted data to avoid re-extraction
- Batch process DBC parsing for efficiency
- Store extracted assets in appropriate directories
- Use incremental updates when possible
- Monitor disk space during extraction
</performance_considerations>

<error_handling>
- Verify MPQ file integrity before extraction
- Handle corrupted or incomplete MPQ files
- Log extraction errors with file details
- Provide fallback to GitHub DBC files if extraction fails
- Validate extracted data before importing
- Rollback database changes on import failure
</error_handling>
