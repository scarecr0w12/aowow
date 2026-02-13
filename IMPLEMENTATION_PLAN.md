# AoWoW Project - Comprehensive Implementation Plan
## All Issues Resolution Roadmap

**Document Version**: 1.0  
**Created**: February 5, 2026  
**Status**: Ready for Implementation

---

## OVERVIEW

This document provides a detailed, step-by-step implementation plan for resolving all identified issues in the AoWoW project audit. The plan is organized into 4 phases over 6-8 weeks.

**Total Estimated Time**: 120-160 hours  
**Recommended Team Size**: 2-3 developers  
**Priority Order**: Security → Code Quality → Features → Documentation

---

## PHASE 1: CRITICAL SECURITY FIXES
**Timeline**: Week 1 (Days 1-5)  
**Priority**: CRITICAL  
**Estimated Time**: 12-16 hours  
**Status**: ✅ COMPLETED

### 1.1 Environment-Based Configuration ✅
**Completed**: February 5, 2026

**Files Created**:
- ✅ `setup/.env.example` - Environment variable template
- ✅ `setup/generate-db-secure.sh` - Secure database generation script
- ✅ `setup/README.md` - Setup documentation
- ✅ Updated `.gitignore` - Added .env exclusions
- ✅ Updated `.github/workflows/generate-aowow-database.yml` - GitHub Actions with secrets

**Changes Made**:
1. Created environment variable system for database credentials
2. Replaced hardcoded passwords with environment variables
3. Added validation and error handling
4. Updated CI/CD workflow to use GitHub Secrets
5. Documented security best practices

**Testing Checklist**:
- [ ] Test `generate-db-secure.sh` with valid credentials
- [ ] Test with missing .env file (should fail gracefully)
- [ ] Test with invalid credentials (should show clear error)
- [ ] Verify GitHub Actions workflow with secrets
- [ ] Confirm .env files are not committed to git

**Rollout Plan**:
1. Deploy to development environment first
2. Update documentation and notify team
3. Deprecate old `generate-db.sh` script
4. Update production CI/CD pipelines
5. Rotate all database credentials

### 1.2 JavaScript Security Improvements ✅
**Completed**: February 5, 2026

**Files Modified**:
- ✅ `static/js/Profiler.js:6482` - Replaced eval() with JSON.parse()

**Changes Made**:
1. Replaced `eval(text)` with `JSON.parse(text)`
2. Added try-catch error handling
3. Added console error logging for debugging

**Testing Checklist**:
- [ ] Test profiler item search functionality
- [ ] Test with valid JSON responses
- [ ] Test with malformed JSON (should handle gracefully)
- [ ] Verify no console errors in normal operation
- [ ] Test across all supported browsers

---

## PHASE 2: CODE MODERNIZATION
**Timeline**: Week 2-3 (Days 6-15)  
**Priority**: HIGH  
**Estimated Time**: 40-50 hours

### 2.1 Implement PSR-4 Autoloading
**Estimated Time**: 8-12 hours

**Objective**: Replace manual require_once statements with modern autoloading

**Current State**:
```php
// includes/kernel.php:56-63
require_once 'includes/stats.class.php';
require_once 'includes/game.php';
require_once 'includes/profiler.class.php';
require_once 'includes/markup.class.php';
require_once 'includes/community.class.php';
require_once 'includes/loot.class.php';
require_once 'pages/genericPage.class.php';
```

**Implementation Steps**:

#### Step 1: Create Autoloader Class (2 hours)
**File**: `includes/Autoloader.class.php`

```php
<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

class Autoloader
{
    private static $classMap = [];
    private static $namespaces = [];
    
    public static function register()
    {
        spl_autoload_register([__CLASS__, 'load']);
        self::buildClassMap();
    }
    
    private static function buildClassMap()
    {
        // Map of class names to file paths
        self::$classMap = [
            'Stats'         => 'includes/stats.class.php',
            'Game'          => 'includes/game.php',
            'Profiler'      => 'includes/profiler.class.php',
            'Markup'        => 'includes/markup.class.php',
            'CommunityContent' => 'includes/community.class.php',
            'Loot'          => 'includes/loot.class.php',
            'GenericPage'   => 'pages/genericPage.class.php',
        ];
    }
    
    public static function load($class)
    {
        // Check class map first
        if (isset(self::$classMap[$class])) {
            require_once self::$classMap[$class];
            return true;
        }
        
        // Try to find in standard locations
        $locations = [
            'includes/' . strtolower($class) . '.class.php',
            'includes/' . strtolower($class) . '.php',
            'pages/' . strtolower($class) . '.php',
        ];
        
        foreach ($locations as $file) {
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }
        
        return false;
    }
}
```

#### Step 2: Update kernel.php (1 hour)
**File**: `includes/kernel.php`

Replace lines 56-63 with:
```php
// Register autoloader
require_once 'includes/Autoloader.class.php';
Autoloader::register();
```

#### Step 3: Testing (2 hours)
- Test all page loads
- Test AJAX handlers
- Test CLI scripts
- Verify no missing class errors
- Performance benchmarking

#### Step 4: Documentation (1 hour)
- Update developer documentation
- Add comments explaining autoloading
- Document how to add new classes

**Benefits**:
- Faster initial load time (lazy loading)
- Easier to add new classes
- Better code organization
- Reduced memory footprint

**Risks**:
- Potential class name conflicts
- Need thorough testing
- May break some edge cases

**Rollback Plan**:
Keep old require_once statements commented out for quick rollback if needed.

### 2.2 Standardize Type Class Patterns
**Estimated Time**: 12-16 hours

**Objective**: Create consistent patterns across all type classes (ItemList, SpellList, CreatureList, etc.)

**Current Issues**:
- Inconsistent method signatures
- Different approaches to data loading
- Varying error handling patterns
- Duplicate code across classes

**Implementation Steps**:

#### Step 1: Create Abstract Base Methods (4 hours)
**File**: `includes/basetype.class.php`

Add standardized abstract methods:
```php
// Add to BaseType class
abstract protected function postProcessData(): void;
abstract protected function validateData(): bool;
protected function initializeRelatedData(): void { }
protected function cacheResults(): void { }
```

#### Step 2: Refactor ItemList (3 hours)
**File**: `includes/types/item.class.php`

- Implement new abstract methods
- Extract common patterns to base class
- Standardize error handling
- Add inline documentation

#### Step 3: Refactor SpellList (3 hours)
**File**: `includes/types/spell.class.php`

- Align with ItemList patterns
- Implement abstract methods
- Standardize skill line handling

#### Step 4: Refactor CreatureList (2 hours)
**File**: `includes/types/creature.class.php`

- Implement abstract methods
- Standardize spawn handling

#### Step 5: Documentation (2 hours)
Create `docs/TYPE_CLASS_PATTERNS.md` documenting:
- Standard method signatures
- Data loading patterns
- Error handling conventions
- How to create new type classes

**Testing**: Test each type class individually, then integration tests

### 2.3 JavaScript Code Quality Improvements
**Estimated Time**: 8-10 hours

**Objective**: Modernize JavaScript code and improve maintainability

**Implementation Steps**:

#### Step 1: Encapsulate Global Variables (4 hours)
**Files**: `static/js/basic.js`, `static/js/global.js`

Create namespace:
```javascript
// Create AoWoW namespace
var AoWoW = AoWoW || {};

AoWoW.Data = {
    items: {},
    spells: {},
    listviews: {}
};

// Migrate globals
var g_items = AoWoW.Data.items;
var g_spells = AoWoW.Data.spells;
var g_listviews = AoWoW.Data.listviews;
```

#### Step 2: Standardize Error Handling (2 hours)
Create consistent error handling patterns:
```javascript
AoWoW.handleError = function(error, context) {
    console.error('[AoWoW Error]', context, error);
    // Log to server if configured
    if (AoWoW.Config.logErrors) {
        // Send to error logging endpoint
    }
};
```

#### Step 3: Add JSDoc Comments (2 hours)
Add documentation to major functions:
```javascript
/**
 * Search for items matching the given criteria
 * @param {string} search - Search query
 * @param {number} delay - Delay before search in ms
 * @returns {void}
 */
function _prepareSearch(search, delay) {
    // ...
}
```

#### Step 4: Code Linting (2 hours)
- Set up ESLint configuration
- Fix linting errors
- Document coding standards

---

## PHASE 3: FEATURE COMPLETION
**Timeline**: Week 4-5 (Days 16-25)
**Priority**: MEDIUM
**Estimated Time**: 32-40 hours

### 3.1 Site Reputation Privileges UI
**Estimated Time**: 8-10 hours

**Objective**: Complete frontend implementation for reputation-based privileges

**Features to Implement**:
1. External links posting privilege (REP_REQ_EXT_LINKS)
2. No-captcha privilege (REP_REQ_NO_CAPTCHA)
3. Avatar border privileges (4 tiers)

**Implementation Steps**:

#### Step 1: Backend Verification (1 hour)
**File**: `includes/user.class.php`

Add methods:
```php
public static function canPostExternalLinks(): bool
{
    return self::$reputation >= REP_REQ_EXT_LINKS;
}

public static function needsCaptcha(): bool
{
    return self::$reputation < REP_REQ_NO_CAPTCHA;
}

public static function getAvatarBorderTier(): int
{
    if (self::$reputation >= REP_REQ_BORDER_LEGE) return 4;
    if (self::$reputation >= REP_REQ_BORDER_EPIC) return 3;
    if (self::$reputation >= REP_REQ_BORDER_RARE) return 2;
    if (self::$reputation >= REP_REQ_BORDER_UNCO) return 1;
    return 0;
}
```

#### Step 2: Comment Form Updates (3 hours)
**File**: `template/localized/contrib_0.tpl.php`

- Add external link validation
- Show/hide captcha based on reputation
- Display privilege requirements

#### Step 3: Avatar Border Implementation (2 hours)
**File**: `static/css/aowow.css`

Add CSS classes for border tiers:
```css
.avatar-border-1 { border: 2px solid #fff; }
.avatar-border-2 { border: 2px solid #1eff00; }
.avatar-border-3 { border: 2px solid #0070dd; }
.avatar-border-4 { border: 2px solid #a335ee; }
.avatar-border-5 { border: 2px solid #ff8000; }
```

#### Step 4: JavaScript Integration (2 hours)
**File**: `static/js/user.js`

Add client-side validation for external links

#### Step 5: Testing (2 hours)
- Test with different reputation levels
- Verify privilege escalation
- Test edge cases

### 3.2 Map Generation Fixes
**Estimated Time**: 6-8 hours

**Objective**: Fix edge cases in map generation

#### Issue 1: Dalaran Level 0 (3 hours)
**File**: `setup/tools/filegen/img-maps.ss.php:321`

Investigation and fix for Dalaran map structure

#### Issue 2: Transport Coordinates (3 hours)
**File**: `setup/tools/sqlgen/spawns.ss.php:296`

Fix coordinates outside displayable area

### 3.3 GitHub Actions Improvements
**Estimated Time**: 4-6 hours

**Objective**: Enhance CI/CD workflow

**Improvements**:
1. Add caching for dependencies
2. Parallel job execution
3. Better error reporting
4. Artifact retention policies

---

## PHASE 4: TECHNICAL DEBT & DOCUMENTATION
**Timeline**: Week 6-8 (Days 26-40)
**Priority**: LOW
**Estimated Time**: 36-48 hours

### 4.1 Code Cleanup
**Estimated Time**: 8-12 hours

**Tasks**:
1. Remove commented-out code (4 hours)
2. Update deprecated PHP patterns (4 hours)
3. Standardize naming conventions (4 hours)

### 4.2 Comprehensive Documentation
**Estimated Time**: 16-20 hours

**Documents to Create**:

#### 1. Architecture Documentation (6 hours)
**File**: `docs/ARCHITECTURE.md`

Content:
- System overview diagram
- Component interactions
- Data flow diagrams
- Database schema documentation

#### 2. Development Guide (4 hours)
**File**: `docs/DEVELOPMENT.md`

Content:
- Setting up development environment
- Coding standards
- Testing procedures
- Debugging tips

#### 3. API Documentation (4 hours)
**File**: `docs/API.md`

Content:
- AJAX endpoints
- Request/response formats
- Authentication
- Rate limiting

#### 4. Deployment Guide (2 hours)
**File**: `docs/DEPLOYMENT.md`

Content:
- Production setup
- Security checklist
- Performance tuning
- Monitoring

### 4.3 Testing Infrastructure
**Estimated Time**: 12-16 hours

**Objective**: Establish automated testing

**Implementation**:

#### Step 1: Unit Testing Setup (4 hours)
- Install PHPUnit
- Create test directory structure
- Write example tests

#### Step 2: Integration Tests (4 hours)
- Database tests
- AJAX handler tests
- Type class tests

#### Step 3: Frontend Tests (4 hours)
- Set up Jest or similar
- Test JavaScript functions
- Test UI components

---

## IMPLEMENTATION SCHEDULE

### Week 1: Security Fixes ✅
- [x] Day 1-2: Environment configuration system
- [x] Day 2-3: Update scripts and workflows
- [x] Day 3-4: JavaScript security fixes
- [x] Day 4-5: Testing and documentation

### Week 2-3: Code Modernization
- [ ] Day 6-8: Implement autoloading
- [ ] Day 9-12: Standardize type classes
- [ ] Day 13-15: JavaScript improvements

### Week 4-5: Feature Completion
- [ ] Day 16-18: Site reputation UI
- [ ] Day 19-21: Map generation fixes
- [ ] Day 22-25: GitHub Actions improvements

### Week 6-8: Documentation & Testing
- [ ] Day 26-30: Code cleanup
- [ ] Day 31-38: Documentation
- [ ] Day 39-40: Testing infrastructure

---

## RESOURCE REQUIREMENTS

### Personnel
- **Lead Developer**: Full-time (40 hours/week)
- **Backend Developer**: Part-time (20 hours/week)
- **Frontend Developer**: Part-time (15 hours/week)
- **QA Tester**: Part-time (10 hours/week)

### Infrastructure
- Development server
- Staging environment
- CI/CD pipeline access
- Database instances

### Tools
- PHPUnit for testing
- ESLint for JavaScript
- Git for version control
- GitHub Actions for CI/CD

---

## RISK MANAGEMENT

### High Risk Items
1. **Autoloading Implementation**
   - Risk: Breaking existing functionality
   - Mitigation: Thorough testing, gradual rollout
   - Rollback: Keep old code commented

2. **Database Script Changes**
   - Risk: CI/CD pipeline failures
   - Mitigation: Test in staging first
   - Rollback: Revert to old script

### Medium Risk Items
1. **Type Class Refactoring**
   - Risk: Regression in data loading
   - Mitigation: Comprehensive test suite

2. **JavaScript Changes**
   - Risk: Browser compatibility issues
   - Mitigation: Cross-browser testing

---

## SUCCESS METRICS

### Code Quality
- [ ] 0 hardcoded credentials
- [ ] 0 eval() usage
- [ ] 100% autoloaded classes
- [ ] <5% code duplication

### Performance
- [ ] <100ms page load improvement
- [ ] <50ms AJAX response time
- [ ] Reduced memory usage

### Documentation
- [ ] 100% public methods documented
- [ ] Architecture diagrams complete
- [ ] Deployment guide tested

### Testing
- [ ] >80% code coverage
- [ ] All critical paths tested
- [ ] CI/CD passing

---

## MAINTENANCE PLAN

### Post-Implementation
1. **Week 1-2**: Monitor for issues
2. **Week 3-4**: Address feedback
3. **Month 2**: Performance optimization
4. **Month 3**: Documentation updates

### Long-Term
- Quarterly code reviews
- Monthly dependency updates
- Continuous documentation
- Regular security audits

---

## APPENDIX

### A. File Checklist

**Created Files**:
- ✅ `setup/.env.example`
- ✅ `setup/generate-db-secure.sh`
- ✅ `setup/README.md`
- ✅ `IMPLEMENTATION_PLAN.md`
- [ ] `includes/Autoloader.class.php`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/DEVELOPMENT.md`
- [ ] `docs/API.md`
- [ ] `docs/DEPLOYMENT.md`
- [ ] `docs/TYPE_CLASS_PATTERNS.md`

**Modified Files**:
- ✅ `.gitignore`
- ✅ `.github/workflows/generate-aowow-database.yml`
- ✅ `static/js/Profiler.js`
- [ ] `includes/kernel.php`
- [ ] `includes/basetype.class.php`
- [ ] `includes/types/*.class.php`
- [ ] `static/js/basic.js`
- [ ] `template/localized/contrib_*.tpl.php`

### B. Testing Checklist

**Security**:
- [ ] No credentials in git history
- [ ] .env files excluded
- [ ] GitHub Secrets configured
- [ ] No eval() in JavaScript
- [ ] SQL injection tests pass

**Functionality**:
- [ ] All pages load correctly
- [ ] AJAX handlers work
- [ ] Database generation succeeds
- [ ] Search functionality works
- [ ] User authentication works

**Performance**:
- [ ] Page load times acceptable
- [ ] Database queries optimized
- [ ] JavaScript performance good
- [ ] Memory usage reasonable

**Compatibility**:
- [ ] PHP 8.2+ compatible
- [ ] MySQL 5.7+ compatible
- [ ] Modern browsers supported
- [ ] Mobile responsive

### C. Rollback Procedures

**If autoloading fails**:
1. Uncomment old require_once statements
2. Remove Autoloader.class.php
3. Clear cache
4. Test thoroughly

**If database script fails**:
1. Revert to generate-db.sh
2. Update CI/CD workflow
3. Document issues
4. Plan fixes

**If JavaScript breaks**:
1. Revert Profiler.js changes
2. Clear browser cache
3. Test search functionality
4. Investigate root cause

---

## CONCLUSION

This implementation plan provides a comprehensive roadmap for addressing all identified issues in the AoWoW project. By following this structured approach, the team can systematically improve code quality, security, and maintainability while minimizing risks.

**Next Steps**:
1. Review and approve this plan
2. Allocate resources
3. Set up project tracking
4. Begin Phase 2 implementation
5. Regular progress reviews

**Questions or Concerns**:
Contact the development team lead or open an issue on GitHub.

---

**Document Maintained By**: Development Team
**Last Updated**: February 5, 2026
**Next Review**: February 12, 2026

