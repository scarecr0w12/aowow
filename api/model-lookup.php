<?php
/**
 * Model Lookup API
 * Maps displayIds to actual converted model files
 * Uses consistent hashing to map displayIds to available models
 * 
 * Usage: /api/model-lookup.php?type=1&displayId=12345
 */

header('Content-Type: application/json');

$type = isset($_GET['type']) ? intval($_GET['type']) : 0;
$displayId = isset($_GET['displayId']) ? intval($_GET['displayId']) : 0;
$slot = isset($_GET['slot']) ? intval($_GET['slot']) : 0;
$race = isset($_GET['race']) ? intval($_GET['race']) : 0;
$sex = isset($_GET['sex']) ? intval($_GET['sex']) : 0;

if (!$type) {
    http_response_code(400);
    echo json_encode(['error' => 'type parameter required']);
    exit;
}

$typeMap = [
    1 => 'npc',
    2 => 'object',
    3 => 'item',
    4 => 'item',
    8 => 'pet',
    16 => 'character'
];

$modelType = $typeMap[$type] ?? 'npc';
$model = null;

switch ($type) {
    case 1: // NPC
    case 2: // Object
    case 8: // Pet
        // For NPC/Object/Pet, use hash-based selection from available models
        $models = getAvailableModels($modelType);
        if (!empty($models)) {
            $index = abs(crc32($displayId)) % count($models);
            $model = $models[$index];
        } else {
            $model = $modelType . '_' . $displayId;
        }
        break;
    case 3: // Item
    case 4: // ItemSet
        // For items, use hash-based selection from available item models
        $models = getAvailableModels('item');
        if (!empty($models)) {
            $index = abs(crc32($displayId)) % count($models);
            $model = $models[$index];
        } else {
            $model = 'item_' . $displayId;
        }
        break;
    case 16: // Character
        // Character models are named by race_sex
        $raceId = ($race > 0 ? $race : 1);
        $sexId = ($sex >= 0 ? $sex : 0);
        
        // Map race/sex to actual character model names
        $raceNames = [
            1 => 'human',
            2 => 'orc',
            3 => 'dwarf',
            4 => 'nightelf',
            5 => 'scourge',
            6 => 'tauren',
            7 => 'gnome',
            8 => 'troll',
            10 => 'bloodelf',
            11 => 'draenei'
        ];
        
        $sexNames = [0 => 'male', 1 => 'female'];
        
        $raceName = $raceNames[$raceId] ?? 'human';
        $sexName = $sexNames[$sexId] ?? 'male';
        $model = $raceName . $sexName;
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type: ' . $type]);
        exit;
}

if (!$model) {
    http_response_code(404);
    echo json_encode(['error' => 'No models available for type: ' . $modelType]);
    exit;
}

echo json_encode([
    'success' => true,
    'type' => $type,
    'displayId' => $displayId,
    'model' => $model,
    'path' => '/static/models/' . $modelType . '/' . $model . '.glb'
]);

function getAvailableModels($modelType) {
    static $modelCache = [];
    
    if (isset($modelCache[$modelType])) {
        return $modelCache[$modelType];
    }
    
    $modelDir = __DIR__ . '/../static/models/' . $modelType;
    $models = [];
    
    if (is_dir($modelDir)) {
        $files = scandir($modelDir);
        foreach ($files as $file) {
            if (substr($file, -4) === '.glb') {
                $models[] = substr($file, 0, -4);
            }
        }
    }
    
    // Also check for JSON list of models
    if (empty($models)) {
        $jsonFile = __DIR__ . '/../static/models/' . $modelType . '-models.json';
        if (file_exists($jsonFile)) {
            $jsonData = json_decode(file_get_contents($jsonFile), true);
            if (is_array($jsonData)) {
                $models = $jsonData;
            }
        }
    }
    
    $modelCache[$modelType] = $models;
    return $models;
}
?>
