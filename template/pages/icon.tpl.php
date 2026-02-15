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
                <div id="h1-icon-0" class="h1-icon"></div>
                <script type="text/javascript">//<![CDATA[
                    $WH.ge('h1-icon-0').appendChild(Icon.create("<?=$this->icon;?>", 2));
                //]]></script>
<?php
    $this->brick('article');
?>
                <div class="clear"></div>
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
