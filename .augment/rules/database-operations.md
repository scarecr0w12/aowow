---
description: Database operation patterns and security practices for AoWoW
activation_mode: model_decision
---

# Database Operations

<security_practices>
- Always use prepared statements with parameterized queries
- Never concatenate user input directly into SQL queries
- Validate and sanitize all user inputs before database operations
- Use the DbSimple library's built-in escaping functions
- Check user permissions before executing database modifications
</security_practices>

<query_patterns>
- Use DbSimple's `select()` method for SELECT queries
- Use DbSimple's `query()` method for INSERT/UPDATE/DELETE
- Always check for database errors and handle them gracefully
- Use transactions for multi-step operations that must succeed together
- Cache query results when appropriate to reduce database load
</query_patterns>

<data_access>
- Database queries should be encapsulated in type classes
- Avoid raw SQL in templates or page handlers
- Use type class methods to fetch and format data
- Implement lazy loading for expensive queries
- Use database indexes for frequently queried fields
</data_access>

<common_tables>
- `item_template` - Item definitions
- `spell` - Spell definitions
- `creature_template` - NPC definitions
- `quest_template` - Quest definitions
- `achievement_dbc` - Achievement data
- `aowow_comments` - User comments
- `aowow_ratings` - User ratings
</common_tables>

<performance_considerations>
- Limit query results with LIMIT clause
- Use appropriate JOIN operations instead of multiple queries
- Index frequently searched columns
- Consider caching for read-heavy operations
- Monitor query performance and optimize slow queries
</performance_considerations>
