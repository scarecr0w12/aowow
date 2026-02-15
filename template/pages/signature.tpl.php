<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');

    $profileId   = $this->profileData['id'];
    $charName    = htmlspecialchars($this->profileData['name']);
    $className   = Lang::game('cl', (int)$this->profileData['class']);
    $raceName    = Lang::game('ra', (int)$this->profileData['race']);
    $level       = (int)$this->profileData['level'];
    $guildName   = htmlspecialchars($this->profileData['guildname'] ?? '');
    $realmName   = htmlspecialchars($this->profileData['realmname'] ?? '');
    $sigUrl      = Cfg::get('HOST_URL') . '/?signature=generate&id=' . $profileId . '.png';
    $sigUrlHtml  = htmlspecialchars($sigUrl, ENT_QUOTES, 'UTF-8');
?>

            <div class="text">
                <h1>Signature: <?=$charName; ?></h1>

                <p>Level <?=$level; ?> <?=$raceName; ?> <?=$className; ?><?=($guildName ? ' &lt;'.$guildName.'&gt;' : ''); ?><?=($realmName ? ' - '.$realmName : ''); ?></p>

                <div class="pad2"></div>

                <h2 class="clear">Preview</h2>
                <div style="margin: 10px 0; padding: 10px; background: #1a1a2a; display: inline-block; border-radius: 4px;">
                    <img src="<?=$sigUrlHtml; ?>" alt="<?=$charName; ?> signature" width="468" height="60" />
                </div>

                <div class="pad2"></div>

                <h2 class="clear">Embed Codes</h2>

                <div style="margin: 10px 0;">
                    <h3>Direct Image Link</h3>
                    <input type="text" readonly="readonly" onclick="this.select();" value="<?=$sigUrlHtml; ?>" style="width: 100%; max-width: 600px; padding: 4px; font-family: monospace; font-size: 12px;" />
                </div>

                <div style="margin: 10px 0;">
                    <h3>BBCode (for forums)</h3>
                    <input type="text" readonly="readonly" onclick="this.select();" value="[img]<?=$sigUrlHtml; ?>[/img]" style="width: 100%; max-width: 600px; padding: 4px; font-family: monospace; font-size: 12px;" />
                </div>

                <div style="margin: 10px 0;">
                    <h3>HTML</h3>
                    <input type="text" readonly="readonly" onclick="this.select();" value="&lt;img src=&quot;<?=$sigUrlHtml; ?>&quot; alt=&quot;<?=$charName; ?>&quot; width=&quot;468&quot; height=&quot;60&quot; /&gt;" style="width: 100%; max-width: 600px; padding: 4px; font-family: monospace; font-size: 12px;" />
                </div>
            </div>

            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
