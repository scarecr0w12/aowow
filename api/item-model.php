<?php
/**
 * Item Model API
 * Returns the correct 3D model for an item based on its displayId
 * 
 * Usage: /api/item-model.php?displayId=12345
 */

// Get displayId from query parameter
$displayId = isset($_GET['displayId']) ? intval($_GET['displayId']) : 0;

if (!$displayId) {
    http_response_code(400);
    echo json_encode(['error' => 'displayId parameter required']);
    exit;
}

// Load the item model mapping
$mappingFile = __DIR__ . '/../static/models/item-model-map.json';

if (!file_exists($mappingFile)) {
    // Generate mapping if it doesn't exist
    generateItemModelMap();
}

$mapping = json_decode(file_get_contents($mappingFile), true);

if (isset($mapping[$displayId])) {
    echo json_encode(['model' => $mapping[$displayId]]);
} else {
    // Return a random model if no specific mapping exists
    $models = array_values($mapping);
    $randomModel = $models[array_rand($models)];
    echo json_encode(['model' => $randomModel, 'note' => 'random']);
}

function generateItemModelMap() {
    // Scan available models and create a mapping
    $modelDir = __DIR__ . '/../static/models/item';
    $models = [];
    
    if (is_dir($modelDir)) {
        foreach (scandir($modelDir) as $file) {
            if (substr($file, -4) === '.glb') {
                $modelName = substr($file, 0, -4);
                $models[] = $modelName;
            }
        }
    }
    
    // Create a simple mapping: displayId -> model (using hash for consistency)
    $mapping = [];
    for ($i = 1; $i <= 100000; $i++) {
        if (!empty($models)) {
            $index = (crc32($i) % count($models));
            $mapping[$i] = $models[$index];
        }
    }
    
    // Save mapping
    $mappingFile = __DIR__ . '/../static/models/item-model-map.json';
    file_put_contents($mappingFile, json_encode($mapping));
}
?>
