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

<?php
$this->brick('article');

if ($this->relBoss):
    echo "                <div>".sprintf(Lang::gameObject('npcLootPH'), $this->name, $this->relBoss[0], $this->relBoss[1])."</div>\n";
    echo '                <div class="pad"></div>';
endif;

if (!empty($this->map)):
    $this->brick('mapper');
else:
    echo Lang::gameObject('unkPosition');
endif;

$this->brick('book');

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
