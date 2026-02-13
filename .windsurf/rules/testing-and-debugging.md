---
description: Testing and debugging guidelines for AoWoW development
activation_mode: model_decision
---

# Testing and Debugging

<debugging_practices>
- Use error logging to track issues
- Add descriptive log messages with context
- Use var_dump() or print_r() for quick debugging (remove before commit)
- Check browser console for JavaScript errors
- Use browser developer tools for network inspection
- Test in multiple browsers for compatibility
</debugging_practices>

<testing_approach>
- Test new features with sample data
- Verify database queries return expected results
- Test edge cases (empty results, invalid IDs, missing data)
- Test permission checks and security measures
- Verify localization works for all supported languages
- Test responsive design on different screen sizes
</testing_approach>

<common_issues>
- Database connection failures - check config and credentials
- Missing data in templates - verify data is passed from type class
- JavaScript errors - check browser console and syntax
- Localization issues - verify locale files are loaded
- Performance issues - check query efficiency and caching
- Permission errors - verify user authentication and authorization
</common_issues>

<logging>
- Log errors with context information
- Include timestamps in log messages
- Log database errors with query details
- Log authentication/authorization failures
- Keep logs for audit trail purposes
- Rotate logs to prevent excessive disk usage
</logging>

<performance_optimization>
- Profile slow pages to identify bottlenecks
- Cache expensive queries
- Use database indexes effectively
- Minimize HTTP requests
- Compress static assets
- Monitor database query performance
</performance_optimization>
