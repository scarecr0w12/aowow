<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');
?>

            <div class="text">
                <div id="compare-generic"></div>
                <script type="text/javascript">//<![CDATA[
<?php
foreach ($this->cmpItems as $iId => $iData):
    echo '                        g_items.add('.$iId.', '.Util::toJSON($iData).");\n";
endforeach;
?>
                    new Summary(<?=Util::toJSON($this->summary); ?>);
                //]]></script>
            </div>

            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
