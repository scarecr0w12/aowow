---
description: Image, icon, and asset management for AoWoW
activation_mode: model_decision
---

# Image and Icon Management

<image_types>
- BLP files - World of Warcraft texture format (extracted from MPQ)
- PNG/JPG - Web-compatible formats for display
- Icons - 64x64 or 128x128 pixel images for items, spells, achievements
- Textures - Large images for 3D models and UI elements
- Screenshots - User-uploaded content
</image_types>

<image_storage>
- `/static/images/` - Main image directory
- `/static/images/Icon/` - Game icons (items, spells, achievements)
- `/static/images/Listview/` - List view icons and thumbnails
- `/static/images/LiveSearch/` - Search result icons
- Additional subdirectories for specific content types
</image_storage>

<icon_naming_conventions>
- Item icons: `item_{id}.png` (e.g., `item_12345.png`)
- Spell icons: `spell_{id}.png` (e.g., `spell_67890.png`)
- Achievement icons: `achievement_{id}.png`
- NPC/Creature icons: `creature_{id}.png`
- Quest icons: `quest_{id}.png`
- Lowercase with underscores, numeric IDs from game database
</icon_naming_conventions>

<blp_to_image_conversion>
- BLP files extracted from MPQ archives
- Convert BLP to PNG for web display
- Use appropriate compression settings
- Maintain aspect ratio and quality
- Generate multiple sizes for responsive design
- Cache converted images to avoid re-conversion
</blp_to_image_conversion>

<image_loading>
- Lazy load images for performance
- Use CDN or caching for frequently accessed images
- Implement fallback images for missing assets
- Provide alt text for accessibility
- Use responsive image techniques (srcset, picture element)
- Cache image URLs in database for quick lookup
</image_loading>

<image_optimization>
- Compress images without quality loss
- Use appropriate formats (PNG for icons, JPG for photos)
- Generate thumbnails for list views
- Implement progressive image loading
- Use image sprites for multiple small icons
- Monitor image file sizes and optimize as needed
</image_optimization>

<asset_extraction>
- Extract images from MPQ during setup process
- Store extracted images in appropriate directories
- Maintain mapping between game IDs and image files
- Handle missing or corrupted image files gracefully
- Provide default/placeholder images as fallback
- Document image source and extraction date
</asset_extraction>

<user_uploaded_images>
- Store user screenshots in separate directory
- Validate file type and size before upload
- Scan for malicious content
- Generate thumbnails for preview
- Implement quota limits per user
- Allow deletion of uploaded content
</user_uploaded_images>
