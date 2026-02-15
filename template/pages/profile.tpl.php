<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');
?>

            <div id="profilah-generic"></div>
            <script type="text/javascript">//<![CDATA[
                var profilah = new Profiler();
                profilah.initialize('profilah-generic', { id: <?=$this->subjectGUID; ?> });
                var _topbar = $WH.ge('topbar');
                if (_topbar) pr_setRegionRealm($WH.gE(_topbar, 'form')[0], '<?=$this->region; ?>', '<?=$this->realm; ?>');
            //]]></script>

            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
