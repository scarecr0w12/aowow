---
description: Creature and NPC information storage, management, and loading for AoWoW
activation_mode: glob
glob_pattern: includes/types/creature.class.php
---

# Creature and NPC Management

<creature_data_sources>
- Creature.dbc - Creature definitions and properties
- CreatureType.dbc - Creature type classifications
- creature_template - Database table with NPC details
- creature_model_info - 3D model data
- Extracted from MPQ files during setup
</creature_data_sources>

<creature_database_tables>
- `creature_template` - NPC/creature definitions
- `creature_model_info` - 3D model references and display data
- `creature_loot_template` - Loot drops
- `creature_quest_starter` - Quests started by NPC
- `creature_quest_ender` - Quests completed by NPC
- `creature_vendor` - Vendor items and prices
- `creature_trainer` - Skill/spell training
- `creature_gossip` - NPC dialogue options
</creature_database_tables>

<creature_properties>
- Creature ID (entry) - Unique identifier
- Name - Creature/NPC name
- Type - Creature type (humanoid, beast, undead, etc.)
- Level - Creature level
- Health - Hit points
- Armor - Armor value
- Faction - Faction allegiance
- Model ID - 3D model reference
- Scale - Model size multiplier
- Speed - Movement speed
- Abilities - Special abilities and spells
- Loot - Items dropped on defeat
</creature_properties>

<creature_class_implementation>
- Extend `baseType` class
- File: `/includes/types/creature.class.php`
- Load creature data from creature_template
- Fetch model information for 3D display
- Load loot table and quest associations
- Cache creature details for performance
- Handle missing or invalid creature IDs
</creature_class_implementation>

<creature_loading>
- Load creature by ID from creature_template
- Fetch model data from creature_model_info
- Load loot table information
- Get associated quests (starter/ender)
- Load vendor items if applicable
- Load trainer spells/skills if applicable
- Load gossip options and dialogue
- Cache frequently accessed creatures
</creature_loading>

<creature_display>
- Show creature name and type
- Display level and health
- Show 3D model preview
- Display faction and reputation
- List loot drops with percentages
- Show associated quests
- Display vendor items or training options
- Show special abilities
- Display creature location/zone
</creature_display>

<model_management>
- Store M2 model file references
- Manage model display scale
- Handle model animations
- Store model texture references
- Link models to creature entries
- Support multiple models per creature
- Cache model data for performance
</model_management>

<loot_management>
- Store loot table definitions
- Track drop percentages
- Link to item information
- Handle quest items vs regular loot
- Support conditional loot (class-specific, etc.)
- Calculate average loot value
- Display loot statistics
</loot_management>

<quest_associations>
- Track quests started by NPC
- Track quests completed by NPC
- Store quest giver dialogue
- Manage quest prerequisites
- Display quest chains
- Show quest rewards
</quest_associations>

<vendor_and_trainer_data>
- Store vendor item lists
- Track vendor prices
- Store trainer spells/skills
- Track training costs
- Store training requirements
- Display availability by class/race
</vendor_and_trainer_data>

<creature_relationships>
- Link to zone/location data
- Link to faction information
- Link to quest data
- Link to item data
- Link to ability/spell data
- Show creature family relationships
</creature_relationships>

<performance_optimization>
- Cache creature data by ID
- Use database indexes on creature ID and name
- Batch load related data (loot, quests)
- Implement pagination for creature lists
- Cache model references
- Cache loot table calculations
- Monitor query performance
</performance_optimization>

<search_and_filtering>
- Search by creature name
- Filter by type
- Filter by level range
- Filter by zone/location
- Filter by faction
- Filter by quest association
- Filter by loot type
</search_and_filtering>
