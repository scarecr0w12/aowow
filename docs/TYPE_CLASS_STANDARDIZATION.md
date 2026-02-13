# Type Class Standardization Guide

## Overview

This guide provides detailed instructions for standardizing implementation patterns across all type classes (ItemList, SpellList, CreatureList, QuestList, etc.).

## Current State Analysis

### Existing Type Classes

1. **ItemList** (`includes/types/item.class.php`)
   - Has `initSubItems()` method
   - Implements `extendJsonStats()`
   - Complex vendor cost handling
   - Multi-slot enchantment support

2. **SpellList** (`includes/types/spell.class.php`)
   - Has `relItems` property
   - Skill line handling
   - Reagent processing
   - Talent tree integration

3. **CreatureList** (`includes/types/creature.class.php`)
   - Uses `spawnHelper` trait
   - Loot table integration
   - Vendor item handling
   - Spawn location processing

4. **QuestList** (`includes/types/quest.class.php`)
   - Objective parsing
   - Reward calculation
   - Chain quest handling
   - Reputation rewards

### Common Patterns Identified

All type classes share:
- `getListviewData()` - Generate data for list views
- `getJSGlobals()` - Generate JavaScript globals
- `renderTooltip()` - Generate tooltip HTML
- Database query construction
- Data caching mechanisms

### Inconsistencies Found

1. **Method Signatures**: Different parameter orders
2. **Error Handling**: Some return null, others false, some throw
3. **Caching**: Different cache key patterns
4. **Validation**: Inconsistent input validation
5. **Documentation**: Varying levels of inline comments

## Standardization Strategy

### Phase 1: Define Standard Interface

**File**: `includes/basetype.class.php`

Add these abstract methods and standard implementations:

```php
<?php

// Add to BaseType class after existing code

/**
 * Standard interface for all type classes
 */
abstract class BaseType
{
    // ... existing code ...
    
    /**
     * Post-process data after loading from database
     * Override this to add custom processing
     * 
     * @return void
     */
    protected function postProcessData(): void
    {
        // Default: no post-processing
    }
    
    /**
     * Validate loaded data
     * Override this to add custom validation
     * 
     * @return bool True if data is valid
     */
    protected function validateData(): bool
    {
        return !empty($this->data);
    }
    
    /**
     * Initialize related data (items, spells, etc.)
     * Override this to load related entities
     * 
     * @return void
     */
    protected function initializeRelatedData(): void
    {
        // Default: no related data
    }
    
    /**
     * Cache the results
     * Override this to customize caching behavior
     * 
     * @return void
     */
    protected function cacheResults(): void
    {
        if (empty($this->data)) {
            return;
        }
        
        $cacheKey = $this->getCacheKey();
        if ($cacheKey) {
            // Cache implementation
            // TODO: Implement caching mechanism
        }
    }
    
    /**
     * Get cache key for this type
     * 
     * @return string|null Cache key or null if not cacheable
     */
    protected function getCacheKey(): ?string
    {
        return null; // Override in subclasses
    }
    
    /**
     * Standard error handling
     * 
     * @param string $message Error message
     * @param array $context Additional context
     * @return void
     */
    protected function handleError(string $message, array $context = []): void
    {
        trigger_error(
            sprintf('[%s] %s', get_class($this), $message),
            E_USER_WARNING
        );
        
        // Log to database if available
        if (class_exists('DB') && DB::isConnected()) {
            DB::Aowow()->query(
                'INSERT INTO ?_errors (date, version, phpError, file, line, query, userGroups, ip) 
                 VALUES (UNIX_TIMESTAMP(), ?d, ?, ?, ?d, ?, ?d, ?)',
                AOWOW_REVISION,
                $message,
                $context['file'] ?? __FILE__,
                $context['line'] ?? __LINE__,
                $context['query'] ?? '',
                User::$groups ?? 0,
                $_SERVER['REMOTE_ADDR'] ?? ''
            );
        }
    }
    
    /**
     * Standard data loading workflow
     * 
     * @return bool True if data loaded successfully
     */
    protected function loadData(): bool
    {
        try {
            // 1. Load from database
            $this->queryDatabase();
            
            // 2. Validate data
            if (!$this->validateData()) {
                $this->handleError('Data validation failed');
                return false;
            }
            
            // 3. Post-process
            $this->postProcessData();
            
            // 4. Load related data
            $this->initializeRelatedData();
            
            // 5. Cache results
            $this->cacheResults();
            
            return true;
            
        } catch (Exception $e) {
            $this->handleError('Data loading failed: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return false;
        }
    }
    
    /**
     * Query database for data
     * Must be implemented by subclasses
     * 
     * @return void
     */
    abstract protected function queryDatabase(): void;
}
```

### Phase 2: Refactor ItemList

**File**: `includes/types/item.class.php`

Example implementation:

```php
class ItemList extends BaseType
{
    // ... existing properties ...
    
    /**
     * Query database for item data
     */
    protected function queryDatabase(): void
    {
        // Existing query logic
        $this->data = DB::Aowow()->select(/* ... */);
    }
    
    /**
     * Post-process item data
     */
    protected function postProcessData(): void
    {
        foreach ($this->data as &$item) {
            // Process vendor costs
            if (!empty($item['buyPrice'])) {
                $item['cost'] = $this->formatCost($item['buyPrice']);
            }
            
            // Process enchantments
            if (!empty($item['enchantment'])) {
                $item['enchantments'] = $this->parseEnchantments($item['enchantment']);
            }
        }
    }
    
    /**
     * Initialize related data
     */
    protected function initializeRelatedData(): void
    {
        // Load sub-items if needed
        if (method_exists($this, 'initSubItems')) {
            $this->initSubItems();
        }
    }
    
    /**
     * Get cache key
     */
    protected function getCacheKey(): ?string
    {
        return 'itemlist_' . md5(serialize($this->conditions));
    }
    
    /**
     * Validate item data
     */
    protected function validateData(): bool
    {
        if (!parent::validateData()) {
            return false;
        }
        
        // Item-specific validation
        foreach ($this->data as $item) {
            if (empty($item['id']) || empty($item['name'])) {
                return false;
            }
        }
        
        return true;
    }
}
```

### Phase 3: Standard Method Signatures

All type classes should implement these methods with consistent signatures:

```php
/**
 * Get listview data
 * 
 * @param array $options Display options
 * @return array Formatted data for listview
 */
public function getListviewData(array $options = []): array

/**
 * Get JavaScript globals
 * 
 * @param int $mode Display mode
 * @return array JavaScript data
 */
public function getJSGlobals(int $mode = 0): array

/**
 * Render tooltip
 * 
 * @param int $id Entity ID
 * @param array $options Tooltip options
 * @return string HTML tooltip
 */
public function renderTooltip(int $id, array $options = []): string
```

### Phase 4: Error Handling Standards

**Standard Return Values**:
- `null` - Entity not found
- `false` - Operation failed
- `array` - Success with data
- `true` - Success without data

**Example**:
```php
public function getItem(int $id): ?array
{
    $item = DB::Aowow()->selectRow('SELECT * FROM ?_items WHERE id = ?d', $id);
    
    if (!$item) {
        return null; // Not found
    }
    
    if (!$this->validateItem($item)) {
        $this->handleError('Invalid item data', ['id' => $id]);
        return null;
    }
    
    return $item;
}
```

## Implementation Checklist

### For Each Type Class:

- [ ] Implement `queryDatabase()` method
- [ ] Implement `postProcessData()` method
- [ ] Implement `validateData()` method
- [ ] Implement `initializeRelatedData()` if needed
- [ ] Implement `getCacheKey()` method
- [ ] Standardize method signatures
- [ ] Update error handling to use `handleError()`
- [ ] Add PHPDoc comments
- [ ] Write unit tests
- [ ] Update documentation

### Testing:

- [ ] Test data loading
- [ ] Test validation
- [ ] Test error handling
- [ ] Test caching
- [ ] Test related data loading
- [ ] Integration tests with other components

## Migration Order

1. **ItemList** (most complex, set the pattern)
2. **SpellList** (similar to items)
3. **CreatureList** (has spawn handling)
4. **QuestList** (has chain handling)
5. **GameObjectList**
6. **AchievementList**
7. **ZoneList**
8. Other type classes

## Benefits

1. **Consistency**: Same patterns across all types
2. **Maintainability**: Easier to understand and modify
3. **Reliability**: Standard error handling
4. **Performance**: Consistent caching
5. **Testing**: Easier to write tests
6. **Documentation**: Clear expectations

## Timeline

- **Week 1**: Define standards, update BaseType
- **Week 2**: Refactor ItemList and SpellList
- **Week 3**: Refactor CreatureList and QuestList
- **Week 4**: Refactor remaining classes, testing

