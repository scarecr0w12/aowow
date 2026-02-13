---
description: Spell and ability information storage, management, and loading for AoWoW
activation_mode: glob
glob_pattern: includes/types/spell.class.php
---

# Spell and Ability Management

<spell_data_sources>
- Spell.dbc - Spell definitions and properties
- SpellEffect.dbc - Spell effect definitions
- SpellRange.dbc - Spell range data
- SpellCooldown.dbc - Cooldown information
- Extracted from MPQ files during setup
</spell_data_sources>

<spell_database_tables>
- `spell` - Spell definitions and properties
- `spell_effect` - Spell effects and mechanics
- `spell_range` - Spell range definitions
- `spell_cooldown` - Cooldown data
- `spell_cast_time` - Cast time definitions
- `spell_duration` - Duration definitions
- `spell_power` - Power cost definitions
</spell_database_tables>

<spell_properties>
- Spell ID (entry) - Unique identifier
- Name - Spell name
- Description - Spell text and effects
- Icon - Spell icon ID
- Type - Spell type (damage, heal, buff, debuff, etc.)
- School - Damage school (physical, fire, frost, etc.)
- Power Type - Power cost type (mana, rage, energy, etc.)
- Power Cost - Mana/resource cost
- Cast Time - Time to cast in milliseconds
- Range - Spell range in yards
- Cooldown - Cooldown duration
- Duration - Effect duration
- Target - Target type (self, single, area, etc.)
- Effect - Spell effects and mechanics
- Scaling - Spell power scaling
</spell_properties>

<spell_class_implementation>
- Extend `baseType` class
- File: `/includes/types/spell.class.php`
- Load spell data from spell table
- Fetch effect information
- Load range and cooldown data
- Cache spell details for performance
- Handle missing or invalid spell IDs
</spell_class_implementation>

<spell_loading>
- Load spell by ID from spell table
- Fetch spell effects from spell_effect
- Get range information
- Load cooldown data
- Get cast time information
- Load duration data
- Load power cost information
- Cache frequently accessed spells
</spell_loading>

<spell_display>
- Show spell name and description
- Display spell icon
- Show spell type and school
- Display power cost and type
- Show cast time and range
- Display cooldown duration
- List spell effects
- Show scaling information
- Display target type
- Show spell requirements
</spell_display>

<spell_icons>
- Store icon ID from game data
- Map icon IDs to image files
- Load icon images from `/static/images/Icon/`
- Support multiple icon sizes
- Cache icon references
- Provide fallback for missing icons
</spell_icons>

<spell_effects>
- Store spell effect definitions
- Track effect types (damage, heal, buff, etc.)
- Calculate effect values
- Handle effect scaling
- Support multiple effects per spell
- Display effect mechanics
- Show effect interactions
</spell_effects>

<spell_mechanics>
- Store cast time definitions
- Store range definitions
- Store cooldown information
- Store duration information
- Store power cost information
- Handle global cooldowns
- Support spell interactions
</spell_mechanics>

<spell_relationships>
- Link to class abilities
- Link to talent trees
- Link to items that grant spells
- Link to quest rewards
- Show spell chains and upgrades
- Display spell prerequisites
- Show spell alternatives
</spell_relationships>

<spell_filtering>
- Filter by class
- Filter by spell type
- Filter by damage school
- Filter by power type
- Filter by level requirement
- Filter by range
- Search by spell name
</spell_filtering>

<spell_scaling>
- Store scaling coefficients
- Calculate spell power scaling
- Handle stat scaling
- Support level scaling
- Display damage/healing ranges
- Show scaling formulas
</spell_scaling>

<performance_optimization>
- Cache spell data by ID
- Use database indexes on spell ID and name
- Cache icon references
- Cache effect calculations
- Implement pagination for spell lists
- Cache scaling data
- Monitor query performance
</performance_optimization>

<spell_comparison>
- Compare spells side-by-side
- Calculate damage/healing differences
- Show efficiency comparisons
- Display cost-benefit analysis
- Compare cooldowns and durations
- Show stat scaling differences
</spell_comparison>
