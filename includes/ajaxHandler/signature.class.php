<?php

if (!defined('AOWOW_REVISION'))
    die('illegal access');

class AjaxSignature extends AjaxHandler
{
    protected $validParams = ['generate', 'delete'];

    protected $_get = array(
        'id'      => ['filter' => FILTER_CALLBACK, 'options' => 'AjaxHandler::checkIdList'],
        'profile' => ['filter' => FILTER_SANITIZE_NUMBER_INT]
    );

    public function __construct(array $params)
    {
        parent::__construct($params);

        if (!$this->params)
            return;

        if (!Cfg::get('PROFILER_ENABLE'))
            return;

        switch ($this->params[0])
        {
            case 'generate':
                $this->handler = 'handleGenerate';
                break;
            case 'delete':
                $this->handler = 'handleDelete';
                break;
        }
    }

    /**
     * Generate a 468x60 signature image for a character profile.
     * URL: ?signature=generate&id=<profileId>.png
     */
    protected function handleGenerate() : string
    {
        // Extract profile ID from the 'id' GET parameter (may have .png suffix stripped by routing)
        $profileId = 0;
        if (!empty($this->_get['id']))
            $profileId = $this->_get['id'][0];

        if (!$profileId && isset($_GET['id']))
        {
            // Handle "123.png" format — strip the .png suffix
            $raw = preg_replace('/\.png$/i', '', $_GET['id']);
            $profileId = intval($raw);
        }

        if (!$profileId)
        {
            header('HTTP/1.1 404 Not Found');
            die();
        }

        $pBase = DB::Aowow()->selectRow(
            'SELECT p.id, p.name, p.level, p.class, p.race, p.gender, p.realm, p.guild,
                    pg.name AS guildname
             FROM   ?_profiler_profiles p
             LEFT JOIN ?_profiler_guild pg ON pg.id = p.guild
             WHERE  p.id = ?d',
            $profileId
        );

        if (!$pBase)
        {
            header('HTTP/1.1 404 Not Found');
            die();
        }

        // Look up realm name from auth DB
        $pBase['realmname'] = '';
        if ($pBase['realm'])
        {
            foreach (Profiler::getRealms() as $rId => $rData)
            {
                if ($rId == $pBase['realm'])
                {
                    $pBase['realmname'] = $rData['name'];
                    break;
                }
            }
        }

        $this->renderSignatureImage($pBase);
        die();
    }

    /**
     * Delete signatures. Stub — signatures are generated on-the-fly,
     * so there is nothing persistent to delete.
     */
    protected function handleDelete() : string
    {
        // Signature deletion is a no-op since we generate images dynamically
        return '';
    }

    /**
     * Render a 468×60 character signature banner as PNG.
     */
    private function renderSignatureImage(array $profile) : void
    {
        $width  = 468;
        $height = 60;

        $img = imagecreatetruecolor($width, $height);

        // Enable alpha blending
        imagealphablending($img, true);
        imagesavealpha($img, true);

        // Background gradient — dark themed
        $bgTop    = imagecolorallocate($img, 30, 30, 40);
        $bgBottom = imagecolorallocate($img, 15, 15, 25);
        for ($y = 0; $y < $height; $y++)
        {
            $ratio = $y / $height;
            $r = (int)(30 + (15 - 30) * $ratio);
            $g = (int)(30 + (15 - 30) * $ratio);
            $b = (int)(40 + (25 - 40) * $ratio);
            $lineColor = imagecolorallocate($img, $r, $g, $b);
            imageline($img, 0, $y, $width, $y, $lineColor);
        }

        // Border
        $borderColor = imagecolorallocate($img, 80, 80, 100);
        imagerectangle($img, 0, 0, $width - 1, $height - 1, $borderColor);

        // Inner highlight line
        $highlightColor = imagecolorallocate($img, 50, 50, 65);
        imagerectangle($img, 1, 1, $width - 2, $height - 2, $highlightColor);

        // Colors for text
        $nameColor   = imagecolorallocate($img, 255, 209, 0);   // Gold
        $detailColor = imagecolorallocate($img, 200, 200, 210);  // Light gray
        $guildColor  = imagecolorallocate($img, 130, 180, 255);  // Light blue
        $levelColor  = imagecolorallocate($img, 255, 255, 255);  // White

        // Class color mapping (WoW class colors)
        $classColors = [
            1  => [199, 156, 110],  // Warrior — tan
            2  => [245, 140, 186],  // Paladin — pink
            3  => [171, 212, 115],  // Hunter — green
            4  => [255, 245, 105],  // Rogue — yellow
            5  => [255, 255, 255],  // Priest — white
            6  => [196, 30,  59],   // Death Knight — red
            7  => [0,   112, 222],  // Shaman — blue
            8  => [105, 204, 240],  // Mage — light blue
            9  => [148, 130, 201],  // Warlock — purple
            11 => [255, 125, 10],   // Druid — orange
        ];

        // Use class color for the name if available
        $classId = (int)$profile['class'];
        if (isset($classColors[$classId]))
        {
            $cc = $classColors[$classId];
            $nameColor = imagecolorallocate($img, $cc[0], $cc[1], $cc[2]);
        }

        // Font — use DejaVu Sans if available, fall back to built-in
        $fontPath = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
        $fontBold = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
        $useTTF   = file_exists($fontPath) && file_exists($fontBold);

        // Get localized class and race names
        $className = Lang::game('cl', $classId) ?? 'Unknown';
        $raceName  = Lang::game('ra', (int)$profile['race']) ?? 'Unknown';
        $charName  = $profile['name'] ?? 'Unknown';
        $level     = (int)$profile['level'];
        $guildName = $profile['guildname'] ?? '';
        $realmName = $profile['realmname'] ?? '';

        $xOffset = 10;

        if ($useTTF)
        {
            // Character name (bold, larger)
            $nameSize = 14;
            imagettftext($img, $nameSize, 0, $xOffset, 20, $nameColor, $fontBold, $charName);

            // Measure name width to place level after it
            $bbox = imagettfbbox($nameSize, 0, $fontBold, $charName);
            $nameWidth = $bbox[2] - $bbox[0];

            // Level and class/race info
            $infoText = "Level {$level} {$raceName} {$className}";
            imagettftext($img, 10, 0, $xOffset, 36, $detailColor, $fontPath, $infoText);

            // Guild name (if any) or realm name
            $bottomText = '';
            if ($guildName)
                $bottomText = '<' . $guildName . '>';
            if ($realmName)
                $bottomText .= ($bottomText ? ' - ' : '') . $realmName;

            if ($bottomText)
                imagettftext($img, 9, 0, $xOffset, 52, $guildColor, $fontPath, $bottomText);

            // Site branding — right aligned
            $brand = Cfg::get('SITE_HOST') ?: 'AoWoW';
            $brandBbox = imagettfbbox(8, 0, $fontPath, $brand);
            $brandWidth = $brandBbox[2] - $brandBbox[0];
            imagettftext($img, 8, 0, $width - $brandWidth - 10, 52, $highlightColor, $fontPath, $brand);
        }
        else
        {
            // Fallback: use built-in bitmap fonts
            $font = 5;  // largest built-in font
            imagestring($img, $font, $xOffset, 5, $charName, $nameColor);

            $infoText = "Level {$level} {$raceName} {$className}";
            imagestring($img, 3, $xOffset, 24, $infoText, $detailColor);

            $bottomText = '';
            if ($guildName)
                $bottomText = '<' . $guildName . '>';
            if ($realmName)
                $bottomText .= ($bottomText ? ' - ' : '') . $realmName;

            if ($bottomText)
                imagestring($img, 2, $xOffset, 40, $bottomText, $guildColor);
        }

        // Decorative class icon area — small colored square indicator
        $indicatorX = $width - 20;
        $indicatorY = 8;
        if (isset($classColors[$classId]))
        {
            $cc = $classColors[$classId];
            $iconColor = imagecolorallocate($img, $cc[0], $cc[1], $cc[2]);
            imagefilledrectangle($img, $indicatorX, $indicatorY, $indicatorX + 12, $indicatorY + 12, $iconColor);
            imagerectangle($img, $indicatorX, $indicatorY, $indicatorX + 12, $indicatorY + 12, $borderColor);
        }

        // Output PNG — flush ALL output buffers to prevent stray content
        while (ob_get_level())
            ob_end_clean();

        // Capture image to a variable for Content-Length
        ob_start();
        imagepng($img);
        $imgData = ob_get_clean();
        imagedestroy($img);

        header('Content-Type: image/png');
        header('Content-Length: ' . strlen($imgData));
        header('Cache-Control: public, max-age=3600');
        header('Pragma: public');
        echo $imgData;
    }
}
