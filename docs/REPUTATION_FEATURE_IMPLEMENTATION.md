# Site Reputation Privileges - Implementation Guide

## Overview

Complete the frontend implementation for reputation-based user privileges. The backend constants and logic are already defined, but the UI and user-facing features need to be implemented.

## Current State

### Backend (Complete ✓)

**File**: `pages/more.php:29-38`

```php
define('REP_REQ_EXT_LINKS',  100);  // External links in comments
define('REP_REQ_NO_CAPTCHA', 100);  // No captcha required
define('REP_REQ_BORDER_UNCO', 100); // Uncommon avatar border
define('REP_REQ_BORDER_RARE', 250); // Rare avatar border
define('REP_REQ_BORDER_EPIC', 500); // Epic avatar border
define('REP_REQ_BORDER_LEGE', 750); // Legendary avatar border
```

**File**: `includes/user.class.php`

User reputation is tracked and accessible via `User::$reputation`

### Frontend (Incomplete ❌)

Missing implementations:
1. External link posting UI and validation
2. Captcha show/hide based on reputation
3. Avatar border display
4. Privilege requirement indicators

## Implementation Plan

### Phase 1: User Class Methods (2 hours)

**File**: `includes/user.class.php`

Add helper methods:

```php
/**
 * Check if user can post external links
 * 
 * @return bool True if user has sufficient reputation
 */
public static function canPostExternalLinks(): bool
{
    if (!self::$id) {
        return false;
    }
    return self::$reputation >= REP_REQ_EXT_LINKS;
}

/**
 * Check if user needs captcha verification
 * 
 * @return bool True if captcha is required
 */
public static function needsCaptcha(): bool
{
    if (!self::$id) {
        return true; // Not logged in = needs captcha
    }
    return self::$reputation < REP_REQ_NO_CAPTCHA;
}

/**
 * Get avatar border tier based on reputation
 * 
 * @return int Border tier (0-4)
 */
public static function getAvatarBorderTier(): int
{
    if (!self::$id) {
        return 0;
    }
    
    if (self::$reputation >= REP_REQ_BORDER_LEGE) return 4;
    if (self::$reputation >= REP_REQ_BORDER_EPIC) return 3;
    if (self::$reputation >= REP_REQ_BORDER_RARE) return 2;
    if (self::$reputation >= REP_REQ_BORDER_UNCO) return 1;
    return 0;
}

/**
 * Get avatar border CSS class
 * 
 * @return string CSS class name
 */
public static function getAvatarBorderClass(): string
{
    $tier = self::getAvatarBorderTier();
    if ($tier === 0) {
        return '';
    }
    return 'avatar-border-q' . ($tier + 1); // q2-q5 for quality colors
}

/**
 * Get reputation requirements for next privilege
 * 
 * @return array|null Next privilege info or null if max
 */
public static function getNextPrivilege(): ?array
{
    $current = self::$reputation;
    
    $privileges = [
        REP_REQ_EXT_LINKS  => 'Post external links',
        REP_REQ_NO_CAPTCHA => 'No captcha required',
        REP_REQ_BORDER_UNCO => 'Uncommon avatar border',
        REP_REQ_BORDER_RARE => 'Rare avatar border',
        REP_REQ_BORDER_EPIC => 'Epic avatar border',
        REP_REQ_BORDER_LEGE => 'Legendary avatar border',
    ];
    
    foreach ($privileges as $req => $desc) {
        if ($current < $req) {
            return [
                'required' => $req,
                'remaining' => $req - $current,
                'description' => $desc
            ];
        }
    }
    
    return null; // Max reputation reached
}
```

### Phase 2: Comment Form Updates (3 hours)

**File**: `template/localized/contrib_0.tpl.php`

Update comment form to show/hide features based on reputation:

```php
<div class="comment-form">
    <?php if (User::isLoggedIn()): ?>
        
        <!-- External Links Notice -->
        <?php if (!User::canPostExternalLinks()): ?>
        <div class="info-box">
            <small>
                External links require <?= REP_REQ_EXT_LINKS ?> reputation. 
                You have <?= User::$reputation ?> reputation.
                (<?= REP_REQ_EXT_LINKS - User::$reputation ?> more needed)
            </small>
        </div>
        <?php endif; ?>
        
        <!-- Comment Text Area -->
        <textarea id="comment-text" name="commentText" rows="5"></textarea>
        
        <!-- Captcha (if needed) -->
        <?php if (User::needsCaptcha()): ?>
        <div class="captcha-container">
            <label>Verification:</label>
            <!-- Captcha implementation -->
            <div class="captcha-image"></div>
            <input type="text" name="captcha" required>
            <small>
                Captcha will be removed at <?= REP_REQ_NO_CAPTCHA ?> reputation.
                (<?= max(0, REP_REQ_NO_CAPTCHA - User::$reputation) ?> more needed)
            </small>
        </div>
        <?php endif; ?>
        
        <button type="submit">Post Comment</button>
        
    <?php else: ?>
        <p>Please <a href="?account=signin">sign in</a> to post comments.</p>
    <?php endif; ?>
</div>
```

### Phase 3: JavaScript Validation (2 hours)

**File**: `static/js/user.js`

Add client-side validation for external links:

```javascript
/**
 * Validate comment text for external links
 * @param {string} text Comment text
 * @param {boolean} canPostLinks Whether user can post external links
 * @returns {object} Validation result
 */
function validateCommentText(text, canPostLinks) {
    const urlPattern = /(https?:\/\/[^\s]+)/gi;
    const urls = text.match(urlPattern);
    
    if (urls && !canPostLinks) {
        return {
            valid: false,
            error: 'You need ' + REP_REQ_EXT_LINKS + ' reputation to post external links.'
        };
    }
    
    return { valid: true };
}

/**
 * Initialize comment form
 */
function initCommentForm() {
    const form = document.getElementById('comment-form');
    const textarea = document.getElementById('comment-text');
    const canPostLinks = g_user.canPostExternalLinks || false;
    
    if (!form || !textarea) return;
    
    form.addEventListener('submit', function(e) {
        const text = textarea.value;
        const validation = validateCommentText(text, canPostLinks);
        
        if (!validation.valid) {
            e.preventDefault();
            alert(validation.error);
            return false;
        }
    });
    
    // Real-time validation feedback
    textarea.addEventListener('input', function() {
        const text = this.value;
        const validation = validateCommentText(text, canPostLinks);
        
        if (!validation.valid) {
            this.classList.add('error');
            showValidationError(validation.error);
        } else {
            this.classList.remove('error');
            hideValidationError();
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCommentForm);
```

### Phase 4: Avatar Border Styling (2 hours)

**File**: `static/css/aowow.css`

Add CSS for avatar borders:

```css
/* Avatar Border Styles */
.avatar-container {
    position: relative;
    display: inline-block;
}

.avatar-border-q2 {
    border: 2px solid #fff;
    box-shadow: 0 0 5px #fff;
}

.avatar-border-q3 {
    border: 2px solid #1eff00;
    box-shadow: 0 0 5px #1eff00;
}

.avatar-border-q4 {
    border: 2px solid #0070dd;
    box-shadow: 0 0 5px #0070dd;
}

.avatar-border-q5 {
    border: 2px solid #a335ee;
    box-shadow: 0 0 5px #a335ee;
}

.avatar-border-q6 {
    border: 2px solid #ff8000;
    box-shadow: 0 0 5px #ff8000;
    animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
    0%, 100% { box-shadow: 0 0 5px #ff8000; }
    50% { box-shadow: 0 0 15px #ff8000; }
}

/* Reputation Progress Bar */
.reputation-progress {
    width: 100%;
    height: 20px;
    background: #2a2a2a;
    border: 1px solid #555;
    border-radius: 3px;
    overflow: hidden;
}

.reputation-progress-bar {
    height: 100%;
    background: linear-gradient(to right, #1eff00, #0070dd);
    transition: width 0.3s ease;
}
```

**File**: `template/bricks/user_avatar.tpl.php`

Update avatar display:

```php
<div class="avatar-container">
    <img src="<?= $avatarUrl ?>" 
         alt="<?= $userName ?>" 
         class="avatar <?= User::getAvatarBorderClass() ?>">
    
    <?php if (User::getAvatarBorderTier() > 0): ?>
    <div class="avatar-badge" title="Reputation: <?= User::$reputation ?>">
        <i class="icon-reputation"></i>
    </div>
    <?php endif; ?>
</div>
```

### Phase 5: Reputation Display (1 hour)

**File**: `pages/user.php`

Add reputation progress display to user profile:

```php
<div class="reputation-section">
    <h3>Site Reputation: <?= User::$reputation ?></h3>
    
    <?php $next = User::getNextPrivilege(); ?>
    <?php if ($next): ?>
    <div class="reputation-progress">
        <div class="reputation-progress-bar" 
             style="width: <?= (User::$reputation / $next['required']) * 100 ?>%">
        </div>
    </div>
    <p>
        Next privilege: <strong><?= $next['description'] ?></strong>
        (<?= $next['remaining'] ?> reputation needed)
    </p>
    <?php else: ?>
    <p class="q5">Maximum reputation privileges unlocked!</p>
    <?php endif; ?>
    
    <h4>Your Privileges:</h4>
    <ul class="privilege-list">
        <li class="<?= User::canPostExternalLinks() ? 'unlocked' : 'locked' ?>">
            Post external links
            <?php if (!User::canPostExternalLinks()): ?>
            (requires <?= REP_REQ_EXT_LINKS ?> reputation)
            <?php endif; ?>
        </li>
        <li class="<?= !User::needsCaptcha() ? 'unlocked' : 'locked' ?>">
            No captcha verification
            <?php if (User::needsCaptcha()): ?>
            (requires <?= REP_REQ_NO_CAPTCHA ?> reputation)
            <?php endif; ?>
        </li>
        <li class="<?= User::getAvatarBorderTier() > 0 ? 'unlocked' : 'locked' ?>">
            Avatar border: 
            <?php
            $tier = User::getAvatarBorderTier();
            $tiers = ['None', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
            echo '<span class="q' . ($tier + 1) . '">' . $tiers[$tier] . '</span>';
            ?>
        </li>
    </ul>
</div>
```

## Testing Checklist

### Functional Testing
- [ ] External link validation works
- [ ] Captcha shows/hides correctly
- [ ] Avatar borders display properly
- [ ] Reputation progress accurate
- [ ] Privilege indicators correct

### Edge Cases
- [ ] User not logged in
- [ ] User with 0 reputation
- [ ] User at exact threshold
- [ ] User with max reputation
- [ ] Invalid reputation values

### Cross-Browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Deployment

1. Deploy to staging environment
2. Test all functionality
3. Get user feedback
4. Fix any issues
5. Deploy to production
6. Monitor for problems
7. Document feature for users

## Documentation

Create user-facing documentation explaining:
- How reputation is earned
- What privileges are available
- How to unlock each tier
- Avatar border meanings

