# AoWoW Architecture Documentation

**Version**: 1.0  
**Last Updated**: February 5, 2026  
**AoWoW Revision**: 40

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Directory Structure](#directory-structure)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [Database Architecture](#database-architecture)
7. [Class Hierarchy](#class-hierarchy)
8. [Request Lifecycle](#request-lifecycle)

---

## Overview

AoWoW is a World of Warcraft database website built in PHP, providing comprehensive information about game entities (items, spells, NPCs, quests, etc.) with a modern web interface.

### Technology Stack

- **Backend**: PHP 8.0+
- **Database**: MySQL 8.0+ / MariaDB 10.5+
- **Frontend**: JavaScript (ES5+), HTML5, CSS3
- **3D Viewer**: WebGL (Three.js)
- **Build Tools**: PHP CLI scripts
- **Version Control**: Git

### Key Features

- Game entity database (items, spells, NPCs, quests, etc.)
- Character profiler system
- 3D model viewer (WebGL)
- Multi-language support
- User comments and screenshots
- Search functionality
- Talent calculator
- Map viewer

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   HTML   │  │   CSS    │  │    JS    │  │  WebGL   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/AJAX
┌────────────────────────┴────────────────────────────────────┐
│                     Apache/Nginx                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                    PHP Application                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.php (Entry Point)                             │  │
│  │    ↓                                                  │  │
│  │  kernel.php (Bootstrap)                              │  │
│  │    ↓                                                  │  │
│  │  Autoloader → Classes → Templates → Output           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   MySQL Databases                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  aowow   │  │  world   │  │   auth   │  │characters│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
/var/www/aowow/
├── cache/                  # Cached templates and data
│   ├── alphaMaps/         # Generated alpha maps
│   └── template/          # Compiled page templates
├── config/                # Configuration files
│   ├── config.php         # Database credentials (generated)
│   └── extAuth.php.in     # External auth template
├── datasets/              # Static game data
│   └── zones/             # Zone information
├── docs/                  # Documentation
├── includes/              # PHP core classes
│   ├── components/        # SmartAI, Conditions
│   ├── ajaxHandler/       # AJAX request handlers
│   ├── types/             # Type classes (Item, Spell, etc.)
│   ├── Autoloader.class.php
│   ├── kernel.php         # Bootstrap file
│   ├── database.class.php
│   └── ...
├── pages/                 # Page controllers
│   ├── genericPage.class.php
│   └── ...
├── setup/                 # Setup and build scripts
│   ├── tools/             # Build tools
│   └── updates/           # Database migrations
├── static/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── images/            # Images and icons
│   └── webgl-viewer/      # 3D model viewer
├── template/              # Template files
│   ├── bricks/            # Reusable template components
│   └── pages/             # Page templates
├── tests/                 # Test scripts
└── index.php              # Application entry point
```

---

## Core Components

### 1. Kernel (`includes/kernel.php`)

The bootstrap file that initializes the application:

- Sets up error handling
- Loads configuration
- Registers autoloader
- Connects to databases
- Initializes session
- Sets up localization

### 2. Autoloader (`includes/Autoloader.class.php`)

PSR-4 compliant autoloader:

- Class map for common classes (fast path)
- Dynamic discovery for unmapped classes
- Special handling for SmartAI components
- Statistics tracking

### 3. Database Layer (`includes/database.class.php`)

Database abstraction using DbSimple:

- Multiple database connections (aowow, world, auth, characters)
- Query builder
- Prepared statements
- Error handling

### 4. Type Classes (`includes/types/*.class.php`)

Entity-specific classes extending `BaseType`:

- `ItemList` - Items
- `SpellList` - Spells
- `CreatureList` - NPCs/Creatures
- `QuestList` - Quests
- `GameObjectList` - Game objects
- And more...

Each type class provides:
- Data loading from database
- Listview data generation
- Tooltip rendering
- JavaScript globals

### 5. Page Controllers (`pages/*.php`)

Handle page requests and rendering:

- Extend `GenericPage`
- Load required data
- Generate page content
- Apply templates

### 6. AJAX Handlers (`includes/ajaxHandler/*.class.php`)

Process AJAX requests:

- `AjaxComment` - Comment operations
- `AjaxData` - Data queries
- `AjaxAdmin` - Admin operations
- Return JSON responses

---

## Data Flow

### Page Request Flow

```
1. User Request
   ↓
2. index.php (Entry point)
   ↓
3. kernel.php (Bootstrap)
   - Load config
   - Connect databases
   - Initialize session
   ↓
4. Route to Page Controller
   - Parse URL parameters
   - Instantiate page class
   ↓
5. Page Controller
   - Load data (Type classes)
   - Process logic
   - Prepare template data
   ↓
6. Template Rendering
   - Apply template
   - Generate HTML
   ↓
7. Output to Browser
```

### AJAX Request Flow

```
1. JavaScript AJAX Call
   ↓
2. index.php
   ↓
3. kernel.php
   ↓
4. AJAX Handler
   - Validate request
   - Process data
   - Query database
   ↓
5. JSON Response
   ↓
6. JavaScript Callback
```

---

## Database Architecture

### Primary Databases

1. **aowow** - Application database
   - Configuration (`aowow_config`)
   - User accounts (`aowow_account`)
   - Comments (`aowow_comments`)
   - Screenshots (`aowow_screenshots`)
   - Profiler data (`aowow_profiler_*`)
   - Cached data

2. **world** - Game world database
   - Items (`item_template`)
   - Spells (`spell_template`)
   - Creatures (`creature_template`)
   - Quests (`quest_template`)
   - Game objects (`gameobject_template`)

3. **characters** - Character database
   - Character data
   - Inventory
   - Skills
   - Achievements

4. **auth** - Authentication database
   - Account information
   - Realm list

### Key Tables

See `docs/DATABASE_SCHEMA.md` for detailed schema documentation.

---

## Class Hierarchy

```
BaseType (abstract)
├── ItemList
├── SpellList
├── CreatureList
├── QuestList
├── GameObjectList
├── AchievementList
└── ... (other type classes)

GenericPage (abstract)
├── ItemPage
├── SpellPage
├── CreaturePage
├── QuestPage
└── ... (other page classes)

AjaxHandler (abstract)
├── AjaxComment
├── AjaxData
├── AjaxAdmin
└── ... (other AJAX handlers)
```

---

## Request Lifecycle

### 1. Initialization Phase
- Load `index.php`
- Execute `kernel.php`
- Register autoloader
- Connect to databases
- Start session

### 2. Routing Phase
- Parse URL parameters
- Determine page type
- Instantiate page controller

### 3. Data Loading Phase
- Page controller loads required data
- Type classes query database
- Process and format data

### 4. Rendering Phase
- Apply template
- Generate HTML/JSON
- Add JavaScript globals

### 5. Output Phase
- Send headers
- Output content
- Close database connections

---

**Next**: See `docs/DEVELOPMENT_GUIDE.md` for development practices and `docs/API_REFERENCE.md` for API documentation.

