---
description: Character information storage, management, and loading for AoWoW
activation_mode: model_decision
---

# Character Data Management

<character_data_sources>
- Character.dbc - Character class and race definitions
- CharacterStats.dbc - Base character statistics
- Skill.dbc - Character skills and professions
- Talent.dbc - Talent tree definitions
- Extracted from MPQ files during setup
</character_data_sources>

<character_database_tables>
- `character_class` - Character classes (Warrior, Mage, etc.)
- `character_race` - Character races (Human, Orc, etc.)
- `character_skills` - Available skills and professions
- `character_talents` - Talent tree definitions
- `character_stats` - Base statistics by level and class
- `character_equipment` - Equipment slots and restrictions
</character_database_tables>

<character_properties>
- Class ID - Character class identifier
- Race ID - Character race identifier
- Level - Character level (1-80)
- Experience - Current experience points
- Stats - Strength, Agility, Stamina, Intellect, Spirit
- Skills - Professions and combat skills
- Talents - Talent tree specialization
- Equipment - Equipped items and gear
- Reputation - Faction reputation standings
</character_properties>

<class_and_race_data>
- Store class definitions (name, description, starting stats)
- Store race definitions (name, description, racial bonuses)
- Link classes to available talents
- Link races to starting zones
- Store racial passive abilities
- Maintain class-specific mechanics
</class_and_race_data>

<character_stats>
- Base stats by level and class
- Stat calculations and formulas
- Bonus stats from equipment
- Bonus stats from talents and abilities
- Stat caps and diminishing returns
- Combat rating conversions
</character_stats>

<skill_and_profession_data>
- Skill definitions and descriptions
- Skill levels and progression
- Profession recipes and crafting
- Skill requirements for items
- Skill training NPCs and costs
- Skill specializations
</skill_and_profession_data>

<talent_tree_management>
- Store talent tree structure
- Define talent prerequisites
- Calculate talent point costs
- Track talent specialization paths
- Manage talent respec mechanics
- Display talent tree UI data
</talent_tree_management>

<character_loading>
- Load class and race information
- Fetch base statistics
- Load available skills and talents
- Get racial bonuses and abilities
- Load equipment restrictions
- Cache character data for performance
</character_loading>

<character_display>
- Show class and race information
- Display base statistics
- Show available talents and skills
- Display racial bonuses
- Show equipment slots
- Provide talent calculator interface
- Display stat calculations
</character_display>

<data_relationships>
- Link classes to talent trees
- Link races to starting zones
- Link skills to NPCs
- Link talents to abilities
- Link equipment to classes/races
- Show stat scaling formulas
</data_relationships>

<performance_optimization>
- Cache class and race data
- Cache talent tree definitions
- Use database indexes on class/race IDs
- Pre-calculate stat formulas
- Cache frequently accessed character data
- Implement pagination for large datasets
</performance_optimization>
