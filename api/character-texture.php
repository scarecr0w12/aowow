<?php
/**
 * Character Texture Compositor API
 * 
 * Composites character skin + equipped armor textures into a single PNG.
 * Calls a Python backend script for the actual BLP decoding and compositing.
 *
 * Parameters:
 *   race    - Race name (e.g. "bloodelf")
 *   sex     - "male" or "female"
 *   skin    - Skin color index (0-9)
 *   items   - Comma-separated displayIds (e.g. "220,229,453")
 *
 * Returns: PNG image
 *
 * Caching: Results are cached by parameter hash in /var/www/aowow/cache/chartex/
 */

header('Access-Control-Allow-Origin: *');

$race  = isset($_GET['race'])  ? preg_replace('/[^a-z]/i', '', $_GET['race']) : 'human';
$sex   = isset($_GET['sex'])   ? (strtolower($_GET['sex']) === 'female' ? 'female' : 'male') : 'male';
$skin  = isset($_GET['skin'])  ? intval($_GET['skin']) : 0;
$items = isset($_GET['items']) ? preg_replace('/[^0-9,]/', '', $_GET['items']) : '';

// Build cache key
$cacheKey = md5("{$race}_{$sex}_{$skin}_{$items}");
$cacheDir = __DIR__ . '/../cache/chartex';
$cachePath = "{$cacheDir}/{$cacheKey}.png";

// Serve from cache if available
if (file_exists($cachePath) && (time() - filemtime($cachePath)) < 86400) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cachePath);
    exit;
}

// Ensure cache directory exists
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// Call Python compositor
$python = '/usr/bin/python3';
$script = __DIR__ . '/../tools/composite_texture.py';

$cmd = escapeshellcmd($python) . ' ' . escapeshellarg($script)
     . ' --race ' . escapeshellarg($race)
     . ' --sex ' . escapeshellarg($sex)
     . ' --skin ' . escapeshellarg(strval($skin))
     . ' --items ' . escapeshellarg($items)
     . ' --output ' . escapeshellarg($cachePath)
     . ' 2>&1';

$output = shell_exec($cmd);
$exitCode = 0;

if (file_exists($cachePath) && filesize($cachePath) > 0) {
    header('Content-Type: image/png');
    header('Cache-Control: public, max-age=86400');
    readfile($cachePath);
} else {
    // Return error as JSON
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Texture generation failed',
        'details' => $output,
    ]);
}
