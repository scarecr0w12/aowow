<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

<?php $this->brick('announcement'); ?>
<?php $this->brick('pageTemplate'); ?>

    <div class="detail-grid" id="main">
        <!-- Main Content -->
        <div class="detail-grid-main detail-content-card" id="main-contents">
            <div class="text">
                <div class="detail-actions-bar">
<?php $this->brick('redButtons'); ?>
                </div>

                <h1><?=$this->name; ?></h1>

<?php if ($this->unavailable): ?>
                <div class="detail-alert-warning">
                    <?=Lang::item('_unavailable'); ?>
                </div>
<?php endif; ?>

                <div class="detail-tooltip-section">
<?php $this->brick('tooltip'); ?>
                </div>

<?php $this->brick('article'); ?>

<?php if (!empty($this->transfer)): ?>
                <div class="detail-section">
                    <?=$this->transfer; ?>
                </div>
<?php endif; ?>

<?php if (!empty($this->subItems)): ?>
                <div class="detail-section">
                    <h3><?=Lang::item('_rndEnchants'); ?></h3>
                    <div class="random-enchantments">
                        <ul>
<?php
        foreach ($this->subItems['data'] as $k => $i):
            if ($k < (count($this->subItems['data']) / 2)):
                $eText = [];
                foreach ($i['enchantment'] as $eId => $txt):
                    $eText[] = '<a href="?enchantment='.$eId.'">'.$txt.'</a>';
                endforeach;

                echo '                            <li><div><span title="ID'.Lang::main('colon').$this->subItems['randIds'][$k].'" class="tip q'.$this->subItems['quality'].'">...'.$i['name'].'</span>';
                echo ' <small class="q0">'.sprintf(Lang::item('_chance'), $i['chance']).'</small><br />'.implode(', ', $eText).'</div></li>'."\n";
            endif;
        endforeach;
?>
                        </ul>
                    </div>
<?php if (count($this->subItems) > 1): ?>
                    <div class="random-enchantments">
                        <ul>
<?php
        foreach ($this->subItems['data'] as $k => $i):
            if ($k >= (count($this->subItems['data']) / 2)):
                $eText = [];
                foreach ($i['enchantment'] as $eId => $txt):
                    $eText[] = '<a href="?enchantment='.$eId.'">'.$txt.'</a>';
                endforeach;

                echo '                            <li><div><span title="ID'.Lang::main('colon').$this->subItems['randIds'][$k].'" class="tip q'.$this->subItems['quality'].'">...'.$i['name'].'</span>';
                echo ' <small class="q0">'.sprintf(Lang::item('_chance'), $i['chance']).'</small><br />'.implode(', ', $eText).'</div></li>'."\n";
            endif;
        endforeach;
?>
                        </ul>
                    </div>
<?php endif; ?>
                </div>
<?php endif; ?>

<?php $this->brick('book'); ?>

                <h2 class="clear"><?=Lang::main('related'); ?></h2>
            </div>

<?php $this->brick('lvTabs', ['relTabs' => true]); ?>

<?php $this->brick('contribute'); ?>

            <div class="clear"></div>
        </div><!-- detail-grid-main -->

        <!-- Sidebar -->
        <aside class="detail-grid-sidebar">
<?php $this->brick('infobox'); ?>
        </aside>
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
