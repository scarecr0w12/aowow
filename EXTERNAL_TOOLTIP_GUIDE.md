# AoWoW External Tooltip Integration Guide

This guide explains how to integrate AoWoW tooltips into external websites and applications.

## Quick Start

### Method 1: Automatic HTML Attributes (Easiest)

Add the tooltip loader script to your page:

```html
<script src="https://aowow.com/static/js/tooltip-loader.js"></script>
```

Then use data attributes on your links:

```html
<!-- Item tooltip -->
<a href="#" data-tooltip-type="item" data-tooltip-id="12345">Legendary Sword</a>

<!-- Spell tooltip -->
<a href="#" data-tooltip-type="spell" data-tooltip-id="6789">Fireball</a>

<!-- Quest tooltip -->
<a href="#" data-tooltip-type="quest" data-tooltip-id="1234">The Lost Artifact</a>

<!-- NPC tooltip -->
<a href="#" data-tooltip-type="npc" data-tooltip-id="5678">Thrall</a>

<!-- Achievement tooltip -->
<a href="#" data-tooltip-type="achievement" data-tooltip-id="9999">Legendary Hero</a>
```

That's it! Tooltips will automatically appear on hover.

### Method 2: Programmatic Control

```javascript
// Initialize the tooltip system
AoWoWTooltip.init();

// Show a tooltip
const element = document.getElementById('my-item');
AoWoWTooltip.show(element, {
    type: 'item',
    id: 12345,
    locale: 'enus'  // optional, defaults to 'enus'
});

// Hide the tooltip
AoWoWTooltip.hide();
```

### Method 3: Fetch Multiple Tooltips

```javascript
// Fetch multiple tooltips at once
AoWoWTooltip.fetchTooltips('item', [12345, 12346, 12347], 'enus', function(tooltips) {
    console.log(tooltips);
    // {
    //   12345: '<div class="tooltip">...</div>',
    //   12346: '<div class="tooltip">...</div>',
    //   12347: '<div class="tooltip">...</div>'
    // }
});
```

## Configuration

Customize the tooltip behavior:

```javascript
AoWoWTooltip.setConfig({
    apiUrl: 'https://aowow.com/tooltip-api.php',  // API endpoint
    locale: 'enus',                                 // Default locale
    cacheTooltips: true                             // Cache tooltips in memory
});
```

## Supported Locales

- `enus` - English (US)
- `dede` - German
- `eses` - Spanish
- `frfr` - French
- `ruru` - Russian
- `zhcn` - Chinese (Simplified)

## API Endpoints

### Get Single Tooltip

```
GET /tooltip-api.php?action=get-tooltip&type=item&id=12345&locale=enus
```

Response:
```json
{
    "success": true,
    "type": "item",
    "id": 12345,
    "locale": "enus",
    "tooltip": "<div class=\"tooltip\">...</div>",
    "data": { ... }
}
```

### Get Multiple Tooltips

```
GET /tooltip-api.php?action=get-tooltips&type=item&ids=12345,12346,12347&locale=enus
```

Response:
```json
{
    "success": true,
    "type": "item",
    "locale": "enus",
    "tooltips": {
        "12345": "<div class=\"tooltip\">...</div>",
        "12346": "<div class=\"tooltip\">...</div>",
        "12347": "<div class=\"tooltip\">...</div>"
    }
}
```

### Get Script Content

```
GET /tooltip-api.php?action=get-script&script=tooltip-loader
```

Available scripts:
- `tooltip-loader` - Main loader script
- `tooltip-core` - Core tooltip functionality (basic.js)
- `tooltip-global` - Global utilities (global.js)

## Supported Types

- `item` - World of Warcraft items
- `spell` - Spells and abilities
- `quest` - Quests
- `npc` - NPCs and creatures
- `achievement` - Achievements

## Examples

### Example 1: Simple Item Link

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://aowow.com/static/js/tooltip-loader.js"></script>
</head>
<body>
    <p>Check out this awesome <a href="#" data-tooltip-type="item" data-tooltip-id="19019">Perdition's Blade</a>!</p>
</body>
</html>
```

### Example 2: Multiple Items with Custom Styling

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://aowow.com/static/js/tooltip-loader.js"></script>
    <style>
        .item-link {
            color: #0070dd;
            text-decoration: none;
            cursor: pointer;
        }
        .item-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h2>Recommended Gear</h2>
    <ul>
        <li><a class="item-link" data-tooltip-type="item" data-tooltip-id="19019">Perdition's Blade</a></li>
        <li><a class="item-link" data-tooltip-type="item" data-tooltip-id="19020">Perdition's Helm</a></li>
        <li><a class="item-link" data-tooltip-type="item" data-tooltip-id="19021">Perdition's Armor</a></li>
    </ul>
</body>
</html>
```

### Example 3: Dynamic Tooltip Loading

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://aowow.com/static/js/tooltip-loader.js"></script>
</head>
<body>
    <div id="item-container"></div>

    <script>
        // Fetch and display item tooltips dynamically
        const itemIds = [19019, 19020, 19021];
        
        AoWoWTooltip.fetchTooltips('item', itemIds, 'enus', function(tooltips) {
            const container = document.getElementById('item-container');
            
            itemIds.forEach(id => {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = 'Item ' + id;
                link.setAttribute('data-tooltip-type', 'item');
                link.setAttribute('data-tooltip-id', id);
                
                container.appendChild(link);
                container.appendChild(document.createElement('br'));
            });
        });
    </script>
</body>
</html>
```

### Example 4: Spell and Quest Tooltips

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://aowow.com/static/js/tooltip-loader.js"></script>
</head>
<body>
    <h2>Spells</h2>
    <ul>
        <li><a href="#" data-tooltip-type="spell" data-tooltip-id="133">Fireball</a></li>
        <li><a href="#" data-tooltip-type="spell" data-tooltip-id="143">Arcane Missiles</a></li>
    </ul>

    <h2>Quests</h2>
    <ul>
        <li><a href="#" data-tooltip-type="quest" data-tooltip-id="1">Westfall Stew</a></li>
        <li><a href="#" data-tooltip-type="quest" data-tooltip-id="2">Rolf's Cage</a></li>
    </ul>
</body>
</html>
```

## CORS Support

All tooltip endpoints support CORS (Cross-Origin Resource Sharing), allowing requests from any domain. No additional configuration is needed.

## Caching

The tooltip loader automatically caches tooltips in memory to reduce API calls. To disable caching:

```javascript
AoWoWTooltip.setConfig({
    cacheTooltips: false
});
```

## Performance Tips

1. **Batch Load Tooltips**: Use `fetchTooltips()` to load multiple tooltips at once instead of individual requests.
2. **Enable Caching**: Keep caching enabled (default) to reduce API calls for repeated tooltips.
3. **Lazy Load**: Only load tooltips when needed (on hover) rather than preloading all tooltips.
4. **Use CDN**: Host the tooltip-loader.js script on a CDN for faster delivery.

## Troubleshooting

### Tooltips not appearing

1. Check browser console for errors
2. Verify the tooltip-loader.js script is loaded
3. Ensure data attributes are correct: `data-tooltip-type` and `data-tooltip-id`
4. Check that the API endpoint is accessible

### CORS errors

If you see CORS errors in the browser console, ensure:
1. You're using the correct API URL (https://aowow.com/tooltip-api.php)
2. The server has CORS headers enabled (they are by default)
3. Your browser supports CORS

### Tooltips showing wrong content

1. Verify the item/spell/quest ID is correct
2. Check the locale setting matches your content
3. Clear browser cache and reload

## Browser Support

The tooltip loader works in all modern browsers that support:
- ES6 JavaScript
- Fetch API
- CORS

Minimum browser versions:
- Chrome 42+
- Firefox 39+
- Safari 10+
- Edge 14+
- IE 11 (with polyfills)

## License

The AoWoW tooltip system is provided as-is for integration into external websites. Please respect the World of Warcraft intellectual property and Blizzard Entertainment's terms of service.

## Support

For issues or questions, please visit the AoWoW project repository or contact the development team.
