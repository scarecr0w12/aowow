---
description: Type class implementation patterns for AoWoW game objects
activation_mode: glob
glob_pattern: includes/types/**/*.php
---

# Type Class Patterns

<base_structure>
- All type classes extend `baseType` class
- Located in `/includes/types/` directory
- File naming: `{objecttype}.class.php` (e.g., `item.class.php`)
- Class naming: PascalCase (e.g., `class Item`)
</base_structure>

<required_methods>
- `__construct($id)` - Initialize with entry ID
- `getEntry()` - Return the entry ID
- `getName()` - Return the object name
- `getTemplate()` - Return the template file path
- `getPageData()` - Return data for page rendering
</required_methods>

<common_patterns>
- Store entry ID in `$this->id`
- Use `$this->localisation` for localized strings
- Implement caching for expensive queries
- Use type-specific database tables
- Implement error handling for missing entries
</common_patterns>

<localization>
- Use `$this->localisation` array for multi-language support
- Access localized strings via `$this->localisation[$locale]`
- Provide fallback to English if translation missing
- Support locale codes: enus, dede, eses, frfr, ruru, zhcn, zhtw, koko
</localization>

<data_fetching>
- Fetch data from appropriate database tables
- Use prepared statements for all queries
- Cache frequently accessed data
- Handle missing entries gracefully
- Implement lazy loading for expensive operations
</data_fetching>

<template_integration>
- Pass all necessary data to template via `getPageData()`
- Keep template logic minimal
- Use consistent variable naming in templates
- Separate presentation from business logic
</template_integration>

<example_types>
- Item - `/includes/types/item.class.php`
- Spell - `/includes/types/spell.class.php`
- NPC/Creature - `/includes/types/creature.class.php`
- Quest - `/includes/types/quest.class.php`
- Achievement - `/includes/types/achievement.class.php`
- Enchantment - `/includes/types/enchantment.class.php`
</example_types>
