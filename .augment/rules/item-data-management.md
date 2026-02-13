---
description: Item information storage, management, and loading for AoWoW
activation_mode: glob
glob_pattern: includes/types/item.class.php
---

# Item Data Management

<item_data_sources>
- Item.dbc - Item definitions and properties
- ItemClass.dbc - Item class classifications
- ItemSubClass.dbc - Item subclass definitions
- item_template - Database table with item details
- Extracted from MPQ files during setup
</item_data_sources>

<item_database_tables>
- `item_template` - Item definitions and properties
- `item_enchantment_template` - Enchantment data
- `item_set_names` - Item set definitions
- `item_set_member` - Items in sets
- `item_loot_template` - Items from loot
- `item_required_target` - Item usage requirements
</item_database_tables>

<item_properties>
- Item ID (entry) - Unique identifier
- Name - Item name
- Description - Item flavor text
- Class - Item class (weapon, armor, consumable, etc.)
- SubClass - Item subclass (sword, plate, potion, etc.)
- Quality - Rarity (common, uncommon, rare, epic, legendary)
- Level - Required level
- Armor - Armor value (for armor items)
- Damage - Damage range (for weapons)
- Stats - Bonuses (strength, agility, stamina, etc.)
- Effects - Special effects and procs
- Durability - Item durability
- Binding - Bind on pickup/equip/use
- Unique - Unique item flag
- Icon - Item icon ID
- Price - Vendor price
- Sellprice - Vendor sell price
</item_properties>

<item_class_implementation>
- Extend `baseType` class
- File: `/includes/types/item.class.php`
- Load item data from item_template
- Fetch enchantment information
- Load item set data if applicable
- Cache item details for performance
- Handle missing or invalid item IDs
</item_class_implementation>

<item_loading>
- Load item by ID from item_template
- Fetch class and subclass information
- Load enchantment data
- Get item set membership
- Load stat bonuses
- Load special effects
- Load icon reference
- Cache frequently accessed items
</item_loading>

<item_display>
- Show item name and description
- Display quality with color coding
- Show item icon
- Display class and subclass
- Show required level
- List stats and bonuses
- Display armor/damage values
- Show special effects and procs
- Display binding type
- Show vendor prices
- Display item set information
</item_display>

<item_icons>
- Store icon ID from game data
- Map icon IDs to image files
- Load icon images from `/static/images/Icon/`
- Support multiple icon sizes
- Cache icon references
- Provide fallback for missing icons
</item_icons>

<item_stats>
- Store stat bonuses (strength, agility, stamina, etc.)
- Calculate total stat values
- Handle stat scaling by level
- Support conditional stats (class-specific, etc.)
- Display stat calculations
- Show stat comparisons
</item_stats>

<item_enchantments>
- Store enchantment definitions
- Link enchantments to items
- Display enchantment effects
- Track enchantment levels
- Show enchantment requirements
- Calculate enchantment bonuses
</item_enchantments>

<item_sets>
- Store item set definitions
- Track set membership
- Calculate set bonuses
- Display bonus requirements (2-piece, 4-piece, etc.)
- Show set statistics
- Link to set items
</item_sets>

<item_relationships>
- Link to quest rewards
- Link to vendor items
- Link to loot tables
- Link to crafting recipes
- Link to enchantments
- Show item upgrades/downgrades
- Display item comparisons
</item_relationships>

<search_and_filtering>
- Search by item name
- Filter by class
- Filter by subclass
- Filter by quality
- Filter by level range
- Filter by stats
- Filter by binding type
- Filter by armor/damage type
</search_and_filtering>

<performance_optimization>
- Cache item data by ID
- Use database indexes on item ID and name
- Cache icon references
- Cache stat calculations
- Implement pagination for item lists
- Cache enchantment data
- Cache item set data
- Monitor query performance
</performance_optimization>

<item_comparison>
- Compare items side-by-side
- Calculate stat differences
- Show upgrade paths
- Display alternative items
- Calculate DPS/HPS values
- Show cost-benefit analysis
</item_comparison>
