<?php $this->brick('modern-header'); ?>

    <main>
        <div class="container">
            <!-- Breadcrumb -->
            <div class="detail-breadcrumb">
                <div class="detail-breadcrumb-item">
                    <a href="?" class="detail-breadcrumb-link">Home</a>
                </div>
                <div class="detail-breadcrumb-item">
                    <a href="?npcs" class="detail-breadcrumb-link">NPCs</a>
                </div>
                <div class="detail-breadcrumb-item detail-breadcrumb-current">
                    <?=$this->name.($this->subname ? ' &lt;'.$this->subname.'&gt;' : null); ?>
                </div>
            </div>

            <!-- Detail Page Layout -->
            <div class="detail-page-modern">
                <!-- Main Content Area -->
                <div class="detail-page-main">
                    <!-- Header Section -->
                    <div class="detail-header">
                        <div class="detail-header-content">
                            <h1 class="detail-header-title"><?=$this->name.($this->subname ? ' &lt;'.$this->subname.'&gt;' : null); ?></h1>
                            <div class="detail-header-actions">
                                <button class="btn btn-primary btn-sm">Add to Favorites</button>
                                <button class="btn btn-secondary btn-sm">Share</button>
                            </div>
                        </div>
                    </div>

                    <!-- Description Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title">NPC Details</h2>
                        <div class="detail-description">

<?php
    $this->brick('article');

if ($this->accessory):
    echo '                <div>'.Lang::npc('accessoryFor').' ';
    echo Lang::concat($this->accessory, true, function ($v, $k) { return '<a href="?npc='.$v[0].'">'.$v[1].'</a>'; });
    echo ".</div>\n";
endif;

if ($this->placeholder):
    echo '                <div>'.Lang::npc('difficultyPH', $this->placeholder)."</div>\n";
?>
                <div class="pad"></div>
<?php
elseif (!empty($this->map)):
    $this->brick('mapper');
else:
    echo '                '.Lang::npc('unkPosition')."\n";
endif;

if ($this->quotes[0]):
?>
                <h3><a class="disclosure-off" onclick="return g_disclose($WH.ge('quotes-generic'), this)"><?=Lang::npc('quotes').'&nbsp;('.$this->quotes[1]; ?>)</a></h3>
                <div id="quotes-generic" style="display: none"><ul>
<?php
    foreach ($this->quotes[0] as $group):
        if (count($group) > 1 && count($this->quotes[0]) > 1):
            echo "<ul>\n";
        endif;

        echo '<li>';

        $last = end($group);
        foreach ($group as $itr):
            echo sprintf(sprintf($itr['text'], $itr['prefix']), $this->name);
            echo ($itr == $last) ? null : "</li>\n<li>";
        endforeach;

        echo "</li>\n";

        if (count($group) > 1 && count($this->quotes[0]) > 1):
            echo "</ul>\n";
        endif;

    endforeach;
?>
                </ul></div>
<?php
endif;

if ($this->reputation):
?>
                <h3><?=Lang::main('gains'); ?></h3>
<?php
    echo Lang::npc('gainsDesc').Lang::main('colon');

    foreach ($this->reputation as $set):
        if (count($this->reputation) > 1):
            echo '<ul><li><span class="rep-difficulty">'.$set[0].'</span></li>';
        endif;

        echo '<ul>';

        foreach ($set[1] as $itr):
            if ($itr['qty'][1] && User::isInGroup(U_GROUP_EMPLOYEE))
                $qty = intVal($itr['qty'][0]) . sprintf(Util::$dfnString, Lang::faction('customRewRate'), ($itr['qty'][1] > 0 ? '+' : '').intVal($itr['qty'][1]));
            else
                $qty = intVal(array_sum($itr['qty']));

            echo '<li><div'.($itr['qty'][0] < 0 ? ' class="reputation-negative-amount"' : null).'><span>'.$qty.'</span> '.Lang::npc('repWith') .
                ' <a href="?faction='.$itr['id'].'">'.$itr['name'].'</a>'.($itr['cap'] && $itr['qty'][0] > 0 ? '&nbsp;('.sprintf(Lang::npc('stopsAt'), $itr['cap']).')' : null).'</div></li>';
        endforeach;

        echo '</ul>';

        if (count($this->reputation) > 1):
            echo '</ul>';
        endif;
    endforeach;
endif;

if (isset($this->smartAI)):
?>
    <div id="text-generic" class="left"></div>
    <script type="text/javascript">//<![CDATA[
        Markup.printHtml("<?=$this->smartAI; ?>", "text-generic", {
            allow: Markup.CLASS_ADMIN,
            dbpage: true
        });
    //]]></script>

    <div class="pad2"></div>
<?php
endif;
?>
                        </div>
                    </div>

                    <!-- Related Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title"><?=Lang::main('related'); ?></h2>
                        <div id="related-items-container">
<?php
$this->brick('lvTabs', ['relTabs' => true]);
?>
                        </div>
                    </div>

                    <!-- Contribute Section -->
                    <div class="detail-section">
<?php
$this->brick('contribute');
?>
                    </div>
                </div>

                <!-- Sidebar -->
                <aside class="detail-page-sidebar">
                    <!-- Quick Info Card -->
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-card-title">Quick Info</div>
                        <div class="detail-sidebar-info">
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">NPC ID:</span>
                                <span class="detail-sidebar-info-value"><?=$this->id; ?></span>
                            </div>
<?php
    $this->brick('redButtons');
?>
                        </div>
                    </div>

                    <!-- Infobox -->
<?php
    $this->brick('infobox');
?>
                </aside>
            </div>
        </div>
    </main>

<?php $this->brick('modern-footer'); ?>
