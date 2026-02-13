---
description: AoWoW project structure and architecture patterns
activation_mode: model_decision
---

# AoWoW Project Structure

<directory_structure>
- `/includes/` - Core PHP classes and utilities
  - `/types/` - Game object type classes (item, spell, npc, etc.)
  - `/ajaxHandler/` - AJAX request handlers
  - `/components/` - Reusable components (Conditions, SmartAI)
  - `/libs/` - Third-party libraries
- `/pages/` - Page handlers and controllers
- `/template/` - Template files (.tpl.php)
  - `/bricks/` - Reusable template components
  - `/listviews/` - List view templates
  - `/pages/` - Page-specific templates
- `/static/` - Static assets
  - `/css/` - Stylesheets
  - `/js/` - JavaScript files
  - `/images/` - Image assets
- `/setup/` - Database setup and migration scripts
- `/localization/` - Language/locale files
- `/api/` - API endpoints
</directory_structure>

<class_patterns>
- Type classes extend `baseType` class
- Implement required methods: `getEntry()`, `getName()`, `getTemplate()`
- Use `$this->id` to store the entry ID
- Use `$this->localisation` for localized strings
- Cache expensive queries in class properties
</class_patterns>

<naming_conventions>
- Class files: PascalCase (e.g., `enchantment.class.php`)
- Class names: PascalCase (e.g., `class Enchantment`)
- Database table names: snake_case (e.g., `item_template`)
- Template files: lowercase with hyphens (e.g., `item-detail.tpl.php`)
</naming_conventions>

<key_classes>
- `baseType` - Base class for all game object types
- `ajaxHandler` - Base class for AJAX handlers
- `config` - Configuration management
- `community` - Community/user management
- `localization` - Localization/translation handling
</key_classes>
