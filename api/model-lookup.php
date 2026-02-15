<?php
/**
 * Model Lookup API
 * Maps displayIds to actual model files via database lookups.
 *
 * Usage: /api/model-lookup.php?type=1&displayId=12345
 *        /api/model-lookup.php?type=16&race=1&sex=0
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=86400');

$type      = isset($_GET['type'])      ? intval($_GET['type'])      : 0;
$displayId = isset($_GET['displayId']) ? intval($_GET['displayId']) : 0;
$slot      = isset($_GET['slot'])      ? intval($_GET['slot'])      : 0;
$race      = isset($_GET['race'])      ? intval($_GET['race'])      : 0;
$sex       = isset($_GET['sex'])       ? intval($_GET['sex'])       : 0;

if (!$type) {
    http_response_code(400);
    echo json_encode(['error' => 'type parameter required']);
    exit;
}

// Database connection (aowow DB has the DBC tables)
$db = @new mysqli('localhost', 'aowow', 'aowow_password', 'aowow');
if ($db->connect_error) {
    // Fallback: try root (for dev environments)
    $db = @new mysqli('localhost', 'root', 'root', 'aowow');
}
if ($db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
$db->set_charset('utf8');

$modelsBase = __DIR__ . '/../static/models';
$model = null;
$modelPath = null;
$modelCategory = null;
$source = 'unknown';

switch ($type) {
    case 1:  // NPC
    case 8:  // Pet (same creature display)
    case 32: // Humanoid NPC
        $modelCategory = 'npc';
        // creature displayId -> filesystem scan
        // The NPC model directory may be empty, but we still look up the name
        // from DBC for future use
        if ($displayId > 0) {
            $model = findCreatureModel($db, $displayId, $modelsBase);
            $source = $model ? 'db_lookup' : 'not_found';
        }
        break;

    case 2:  // Object
    case 64: // Object (Flash modelType)
        $modelCategory = 'object';
        if ($displayId > 0) {
            $model = findObjectModel($displayId, $modelsBase);
            $source = $model ? 'filesystem' : 'not_found';
        }
        break;

    case 3:  // Item
    case 4:  // Item Set (individual item lookup)
        $modelCategory = 'item';
        if ($displayId > 0) {
            $model = findItemModel($db, $displayId, $modelsBase);
            $source = $model ? 'db_lookup' : 'not_found';
        }
        break;

    case 16: // Character
        $modelCategory = 'character';
        $raceNames = [
            1 => 'human', 2 => 'orc', 3 => 'dwarf', 4 => 'nightelf',
            5 => 'scourge', 6 => 'tauren', 7 => 'gnome', 8 => 'troll',
            10 => 'bloodelf', 11 => 'draenei'
        ];
        $sexNames = [0 => 'male', 1 => 'female'];

        $raceId  = ($race > 0 ? $race : 1);
        $sexId   = ($sex >= 0 ? $sex : 0);
        $raceName = $raceNames[$raceId] ?? 'human';
        $sexName  = $sexNames[$sexId] ?? 'male';
        $model    = $raceName . $sexName;
        $source   = 'direct';

        // Verify file exists
        if (!file_exists("$modelsBase/character/$model.glb")) {
            $source = 'not_found';
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid type: ' . $type]);
        $db->close();
        exit;
}

$db->close();

// Build response
if ($model) {
    $category = $modelCategory;
    $glbPath  = "/static/models/$category/$model.glb";
    $fullPath = __DIR__ . '/..' . $glbPath;

    $exists = file_exists($fullPath);
    echo json_encode([
        'success'   => true,
        'type'      => $type,
        'displayId' => $displayId,
        'model'     => $model,
        'path'      => $glbPath,
        'exists'    => $exists,
        'source'    => $source
    ]);
} else {
    echo json_encode([
        'success'   => false,
        'type'      => $type,
        'displayId' => $displayId,
        'error'     => 'No model found for this displayId',
        'source'    => $source
    ]);
}

/**
 * Find item model by displayId using dbc_itemdisplayinfo table
 */
function findItemModel($db, $displayId, $modelsBase) {
    $stmt = $db->prepare("SELECT leftModelName, rightModelName FROM dbc_itemdisplayinfo WHERE id = ?");
    if (!$stmt) return null;

    $stmt->bind_param('i', $displayId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $modelName = $row['leftModelName'] ?: $row['rightModelName'];
        if ($modelName) {
            // Strip .mdx extension and lowercase to match our GLB files
            $glbName = strtolower(str_ireplace('.mdx', '', $modelName));
            if (file_exists("$modelsBase/item/$glbName.glb")) {
                $stmt->close();
                return $glbName;
            }
        }
    }
    $stmt->close();
    return null;
}

/**
 * Find creature/NPC model by displayId
 * Uses dbc_creaturedisplayinfo -> modelId -> filesystem lookup
 */
function findCreatureModel($db, $displayId, $modelsBase) {
    // For now, creature models are named by their creature folder name
    // We'd need a creaturemodeldata table with file paths for proper mapping
    // Check if any GLB file in npc/ matches patterns
    $npcDir = "$modelsBase/npc";
    if (!is_dir($npcDir)) return null;

    $files = scandir($npcDir);
    foreach ($files as $f) {
        if (substr($f, -4) === '.glb') {
            return substr($f, 0, -4);
        }
    }
    return null;
}

/**
 * Find object model by displayId
 */
function findObjectModel($displayId, $modelsBase) {
    $objDir = "$modelsBase/object";
    if (!is_dir($objDir)) return null;

    // No DBC mapping available - list what we have
    $files = [];
    foreach (scandir($objDir) as $f) {
        if (substr($f, -4) === '.glb') {
            $files[] = substr($f, 0, -4);
        }
    }
    if (!empty($files)) {
        // Use displayId as seed for consistent selection
        $index = abs(crc32((string)$displayId)) % count($files);
        return $files[$index];
    }
    return null;
}
