---
description: Quest information storage, management, and loading for AoWoW
activation_mode: glob
glob_pattern: includes/types/quest.class.php
---

# Quest Data Management

<quest_data_sources>
- Quest.dbc - Main quest definitions from game data
- quest_template - Database table with quest details
- Extracted from MPQ files during setup
- Includes quest objectives, rewards, requirements
</quest_data_sources>

<quest_database_tables>
- `quest_template` - Quest definitions and properties
- `quest_objectives` - Quest objectives and tasks
- `quest_rewards` - Quest rewards (items, experience, reputation)
- `quest_starter_item` - Items that start quests
- `quest_objective_progress` - Player progress tracking
</quest_database_tables>

<quest_properties>
- Quest ID (entry) - Unique identifier
- Title - Quest name
- Description - Quest text and objectives
- Level - Recommended player level
- Type - Quest type (kill, collect, explore, etc.)
- Rewards - Items, experience, reputation, money
- Prerequisites - Required quests or items
- Objectives - What player must do to complete
- Giver - NPC or item that starts quest
- Ender - NPC that completes quest
</quest_properties>

<quest_class_implementation>
- Extend `baseType` class
- File: `/includes/types/quest.class.php`
- Load quest data from database on initialization
- Cache quest details for performance
- Handle missing or invalid quest IDs
- Support quest chains and prerequisites
</quest_class_implementation>

<quest_loading>
- Load quest by ID from quest_template
- Fetch associated objectives from quest_objectives
- Load reward information
- Get NPC/item references for quest givers/enders
- Cache frequently accessed quests
- Implement lazy loading for expensive data
</quest_loading>

<quest_display>
- Show quest title and description
- Display objectives clearly
- List rewards with icons and values
- Show prerequisites and level requirements
- Display quest giver and completion NPC
- Show quest chain relationships
- Provide quest tracking information
</quest_display>

<quest_relationships>
- Track quest chains (prerequisite quests)
- Link to NPCs that give/complete quests
- Link to items involved in quests
- Link to creatures/objects to interact with
- Show related achievements
- Display quest zones and locations
</quest_relationships>

<quest_filtering>
- Filter by level range
- Filter by quest type
- Filter by zone/location
- Filter by NPC giver
- Filter by reward type
- Search by quest name or description
</quest_filtering>

<performance_optimization>
- Cache quest data in memory
- Use database indexes on quest ID and level
- Batch load related data (objectives, rewards)
- Implement pagination for quest lists
- Cache quest search results
- Monitor query performance
</performance_optimization>
