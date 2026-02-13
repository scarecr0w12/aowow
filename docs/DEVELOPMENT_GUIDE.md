# AoWoW Development Guide

**Version**: 1.0  
**Last Updated**: February 5, 2026

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Coding Standards](#coding-standards)
4. [Testing](#testing)
5. [Debugging](#debugging)
6. [Common Tasks](#common-tasks)
7. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- PHP 8.0 or higher
- MySQL 8.0+ or MariaDB 10.5+
- Apache or Nginx web server
- Git
- Composer (optional, for dependencies)

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/azerothcore/aowow.git
   cd aowow
   ```

2. **Configure environment**
   ```bash
   cp setup/.env.example setup/.env
   # Edit setup/.env with your database credentials
   ```

3. **Generate configuration**
   ```bash
   cd setup
   ./generate-db-secure.sh
   ```

4. **Set up web server**
   - Point document root to `/var/www/aowow`
   - Enable mod_rewrite (Apache) or equivalent
   - Configure PHP settings (see below)

5. **Run tests**
   ```bash
   php tests/test_autoloader.php
   php tests/test_integration.php
   ```

### PHP Configuration

Recommended `php.ini` settings:

```ini
memory_limit = 512M
max_execution_time = 300
upload_max_filesize = 10M
post_max_size = 10M
display_errors = Off  # On for development
error_reporting = E_ALL
```

---

## Development Environment

### Recommended Tools

- **IDE**: PhpStorm, VS Code with PHP extensions
- **Database**: MySQL Workbench, phpMyAdmin
- **Version Control**: Git with GUI (GitKraken, SourceTree)
- **Browser DevTools**: Chrome/Firefox Developer Tools
- **API Testing**: Postman, curl

### VS Code Extensions

- PHP Intelephense
- PHP Debug
- GitLens
- ESLint
- Prettier

### Directory Permissions

```bash
chmod 755 /var/www/aowow
chmod 777 /var/www/aowow/cache
chmod 777 /var/www/aowow/cache/template
chmod 777 /var/www/aowow/cache/alphaMaps
chmod 600 /var/www/aowow/config/config.php
```

---

## Coding Standards

### PHP Standards

Follow PSR-12 coding style with AoWoW-specific conventions:

**Naming Conventions**:
- Classes: `PascalCase` (e.g., `ItemList`, `SpellPage`)
- Methods: `camelCase` (e.g., `getListviewData()`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `AOWOW_REVISION`)
- Variables: `camelCase` (e.g., `$itemData`)

**File Structure**:
```php
<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

class MyClass extends BaseType
{
    // Properties
    public static $type = Type::ITEM;
    
    // Constructor
    public function __construct($conditions = [])
    {
        parent::__construct($conditions);
    }
    
    // Methods
    public function myMethod()
    {
        // Implementation
    }
}

?>
```

**Indentation**: 4 spaces (no tabs)

**Braces**: K&R style
```php
if ($condition)
{
    // code
}
else
{
    // code
}
```

### JavaScript Standards

- Use ES5+ syntax
- Avoid `eval()` - use `JSON.parse()`
- Add error handling for AJAX calls
- Use `$WH` namespace for utilities
- Comment complex logic

**Example**:
```javascript
// Good
try {
    var data = JSON.parse(response);
} catch (e) {
    console.error('Parse error:', e);
}

// Bad
var data = eval('(' + response + ')');
```

### SQL Standards

- Use prepared statements
- Prefix table names with `?_`
- Use meaningful aliases
- Comment complex queries

**Example**:
```php
$items = DB::Aowow()->select(
    'SELECT i.*, i.id AS ARRAY_KEY 
     FROM ?_items i 
     WHERE i.quality = ?d 
     ORDER BY i.name',
    $quality
);
```

---

## Testing

### Running Tests

```bash
# Autoloader tests
php tests/test_autoloader.php

# Integration tests
php tests/test_integration.php

# Profiler tests
php tests/test_profiler.php

# All class loading tests
php tests/test_all_classes.php
```

### Writing Tests

Create test files in `tests/` directory:

```php
#!/usr/bin/env php
<?php

chdir(dirname(__DIR__));
define('AOWOW_REVISION', 1);
define('CLI', 1);

require_once 'includes/kernel.php';

// Your test code here
$passed = 0;
$failed = 0;

// Test something
if (class_exists('MyClass')) {
    echo "✓ PASS\n";
    $passed++;
} else {
    echo "✗ FAIL\n";
    $failed++;
}

exit($failed === 0 ? 0 : 1);
```

---

## Debugging

### Enable Debug Mode

Edit `config/config.php` or database:

```sql
UPDATE aowow_config SET value = '3' WHERE `key` = 'debug';
```

Debug levels:
- `0` - None
- `1` - Errors only
- `2` - Warnings
- `3` - Info (full debugging)

### Common Debugging Techniques

**1. Error Logging**
```php
trigger_error('Debug message', E_USER_NOTICE);
```

**2. Database Query Logging**
```php
// Enable profiler in database.class.php
DB::Aowow()->setLogger(['DB', 'profiler']);
```

**3. JavaScript Console**
```javascript
console.log('Debug:', data);
console.error('Error:', error);
```

**4. Network Inspection**
- Use browser DevTools Network tab
- Check AJAX requests/responses
- Verify headers and status codes

---

## Common Tasks

### Adding a New Type Class

1. Create file: `includes/types/mytype.class.php`
2. Extend `BaseType`
3. Implement required methods
4. Add to autoloader class map
5. Create page controller
6. Add tests

### Adding a New Page

1. Create file: `pages/mypage.php`
2. Extend `GenericPage`
3. Implement `__construct()` and `generateContent()`
4. Create template: `template/pages/mypage.tpl.php`
5. Add route in `index.php` if needed

### Adding an AJAX Handler

1. Create file: `includes/ajaxHandler/myhandler.class.php`
2. Extend `AjaxHandler`
3. Implement handler methods
4. Return JSON response
5. Add JavaScript caller

### Database Migration

1. Create SQL file: `setup/updates/TIMESTAMP_01.sql`
2. Add migration queries
3. Test on development database
4. Document changes

---

## Best Practices

### Security

✅ **DO**:
- Use prepared statements
- Validate all user input
- Escape output
- Use HTTPS
- Store credentials in `.env`
- Use `JSON.parse()` instead of `eval()`

❌ **DON'T**:
- Trust user input
- Use `eval()` on user data
- Hardcode credentials
- Expose sensitive data in errors

### Performance

✅ **DO**:
- Use autoloading (lazy loading)
- Cache frequently accessed data
- Optimize database queries
- Minimize AJAX requests
- Use CDN for static assets

❌ **DON'T**:
- Load all classes upfront
- Run queries in loops
- Fetch unnecessary data
- Make synchronous AJAX calls

### Code Quality

✅ **DO**:
- Write self-documenting code
- Add comments for complex logic
- Follow coding standards
- Write tests
- Use meaningful names

❌ **DON'T**:
- Leave commented code
- Use magic numbers
- Create god classes
- Ignore errors
- Skip documentation

---

**Next**: See `docs/ARCHITECTURE.md` for system architecture and `docs/API_REFERENCE.md` for API documentation.

