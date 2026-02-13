---
description: PHP coding standards and conventions for AoWoW project
activation_mode: model_decision
---

# PHP Coding Standards

<project_context>
AoWoW is a World of Warcraft database viewer written in PHP. The project uses a class-based architecture with types, pages, and AJAX handlers.
</project_context>

<coding_guidelines>
- Use PHP 5.3+ syntax with class-based OOP patterns
- Follow PSR-1 and PSR-2 coding standards where applicable
- Use meaningful variable and function names (camelCase for methods/properties, snake_case for database fields)
- Always add type hints where possible
- Use early returns to reduce nesting
- Avoid deep nesting (max 3 levels)
- Use descriptive comments for complex logic
</coding_guidelines>

<file_organization>
- Type classes go in `/includes/types/` directory
- Page handlers go in `/pages/` directory
- AJAX handlers go in `/includes/ajaxHandler/` directory
- Template files go in `/template/` directory with `.tpl.php` extension
- Utility classes go in `/includes/` directory
</file_organization>

<database_patterns>
- Use prepared statements to prevent SQL injection
- Database queries should be in type classes, not in templates
- Use the DbSimple library for database operations
- Cache frequently accessed data when possible
</database_patterns>

<template_guidelines>
- Keep logic minimal in templates
- Use template variables passed from page/type classes
- Avoid direct database queries in templates
- Use consistent indentation (tabs or spaces, be consistent)
</template_guidelines>
