<?php

require 'includes/kernel.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');
$response = ['success' => false, 'error' => 'Invalid action'];

try {
    switch ($action) {
        case 'get-tooltip':
            $response = handleGetTooltip();
            break;
            
        case 'get-tooltips':
            $response = handleGetTooltips();
            break;
            
        case 'get-script':
            $response = handleGetScript();
            break;
            
        default:
            $response = ['success' => false, 'error' => 'Unknown action: ' . $action];
    }
} catch (Exception $e) {
    $response = ['success' => false, 'error' => $e->getMessage()];
}

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit;

function handleGetTooltip() {
    $type = isset($_GET['type']) ? intval($_GET['type']) : 0;
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    $locale = isset($_GET['locale']) ? $_GET['locale'] : Locale::getName();
    
    if (!$type || !$id) {
        return ['success' => false, 'error' => 'Missing type or id parameter'];
    }
    
    $typeMap = [
        'item' => 'item_template',
        'spell' => 'spell_template',
        'quest' => 'quest_template',
        'achievement' => 'achievement_template',
        'npc' => 'creature_template',
    ];
    
    $typeKey = array_search($type, array_flip($typeMap));
    if (!$typeKey) {
        return ['success' => false, 'error' => 'Invalid type'];
    }
    
    $db = DB::i();
    $row = $db->selectRow('SELECT * FROM ?_' . $typeMap[$typeKey] . ' WHERE entry = ?d', $id);
    
    if (!$row) {
        return ['success' => false, 'error' => 'Item not found'];
    }
    
    $tooltipField = 'tooltip_' . $locale;
    $tooltip = isset($row[$tooltipField]) ? $row[$tooltipField] : '';
    
    if (!$tooltip) {
        $tooltip = isset($row['tooltip_enus']) ? $row['tooltip_enus'] : '';
    }
    
    return [
        'success' => true,
        'type' => $typeKey,
        'id' => $id,
        'locale' => $locale,
        'tooltip' => $tooltip,
        'data' => $row
    ];
}

function handleGetTooltips() {
    $type = isset($_GET['type']) ? $_GET['type'] : '';
    $ids = isset($_GET['ids']) ? explode(',', $_GET['ids']) : [];
    $locale = isset($_GET['locale']) ? $_GET['locale'] : Locale::getName();
    
    if (!$type || empty($ids)) {
        return ['success' => false, 'error' => 'Missing type or ids parameter'];
    }
    
    $typeMap = [
        'item' => 'item_template',
        'spell' => 'spell_template',
        'quest' => 'quest_template',
        'achievement' => 'achievement_template',
        'npc' => 'creature_template',
    ];
    
    if (!isset($typeMap[$type])) {
        return ['success' => false, 'error' => 'Invalid type'];
    }
    
    $ids = array_map('intval', $ids);
    $db = DB::i();
    $table = $typeMap[$type];
    $tooltipField = 'tooltip_' . $locale;
    
    $rows = $db->select('SELECT entry, ' . $tooltipField . ' as tooltip FROM ?_' . $table . ' WHERE entry IN (?a)', $ids);
    
    $tooltips = [];
    foreach ($rows as $row) {
        $tooltips[$row['entry']] = $row['tooltip'];
    }
    
    return [
        'success' => true,
        'type' => $type,
        'locale' => $locale,
        'tooltips' => $tooltips
    ];
}

function handleGetScript() {
    $script = isset($_GET['script']) ? $_GET['script'] : 'tooltip-loader';
    
    $scripts = [
        'tooltip-loader' => 'tooltip-loader.js',
        'tooltip-core' => 'basic.js',
        'tooltip-global' => 'global.js',
    ];
    
    if (!isset($scripts[$script])) {
        return ['success' => false, 'error' => 'Unknown script'];
    }
    
    $scriptPath = '/static/js/' . $scripts[$script];
    $fullPath = $_SERVER['DOCUMENT_ROOT'] . $scriptPath;
    
    if (!file_exists($fullPath)) {
        return ['success' => false, 'error' => 'Script file not found'];
    }
    
    $content = file_get_contents($fullPath);
    
    return [
        'success' => true,
        'script' => $script,
        'url' => $scriptPath,
        'content' => $content
    ];
}
?>
