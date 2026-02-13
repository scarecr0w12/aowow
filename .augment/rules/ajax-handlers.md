---
description: AJAX handler patterns and conventions for AoWoW
activation_mode: glob
glob_pattern: includes/ajaxHandler/**/*.php
---

# AJAX Handler Patterns

<handler_structure>
- All AJAX handlers extend `ajaxHandler` base class
- Handler files located in `/includes/ajaxHandler/` directory
- File naming: `{feature}.class.php` (e.g., `account.class.php`)
- Class naming: PascalCase matching the feature (e.g., `class Account`)
</handler_structure>

<handler_methods>
- Implement required methods for each action
- Use `$_REQUEST` or `$_POST` to access parameters
- Validate all input parameters before processing
- Return JSON responses for consistency
- Include error handling with appropriate HTTP status codes
</handler_methods>

<response_format>
- Return JSON with consistent structure
- Include `success` boolean to indicate operation result
- Include `message` for user-facing feedback
- Include `data` object for response payload
- Use appropriate HTTP status codes (200, 400, 401, 403, 404, 500)
</response_format>

<security_requirements>
- Check user authentication before processing
- Verify user permissions for the requested action
- Validate all input parameters
- Use prepared statements for database queries
- Prevent CSRF attacks with token validation
- Log sensitive operations for audit trails
</security_requirements>

<error_handling>
- Catch exceptions and return appropriate error responses
- Log errors for debugging
- Never expose sensitive information in error messages
- Provide helpful error messages to users
- Handle database connection failures gracefully
</error_handling>
