<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
$this->brick('announcement');

$this->brick('pageTemplate');

if ($this->notFound):
?>
<?php
    if (!empty($this->doResync)):
?>
            <div id="roster-status" class="profiler-message clear"></div>
<?php
    endif;
?>

            <div class="pad3"></div>

            <div class="inputbox">
                <h1><?=$this->notFound['title']; ?></h1>
                <div id="inputbox-error"><?=$this->notFound['msg']; ?></div>        <!-- style="background: no-repeat 3px 3px" -->
<?php
    if (!empty($this->doResync)):
?>
                <script type="text/javascript">//<![CDATA[
                    pr_updateStatus('<?=$this->doResync[0]; ?>', $WH.ge('roster-status'), <?=$this->doResync[1]; ?>, 1);
                    var _topbar = $WH.ge('topbar');
                    if (_topbar) pr_setRegionRealm($WH.gE(_topbar, 'form')[0], '<?=$this->region; ?>', '<?=$this->realm; ?>');
                //]]></script>
<?php
    endif;
?>
                <div class="clear"></div>
            </div>
<?php
else:
?>
            <div class="text">
                <h1><?=$this->name; ?></h1>

<?php
    $this->brick('article');

    if (isset($this->extraText)):
?>
                <div id="text-generic" class="left"></div>
                <script type="text/javascript">//<![CDATA[
                    Markup.printHtml("<?=Util::jsEscape($this->extraText); ?>", "text-generic", {
                        allow: Markup.CLASS_ADMIN,
                        dbpage: true
                    });
                //]]></script>

                <div class="pad2"></div>
            </div>
<?php
    endif;

    if (isset($this->extraHTML)):
        echo $this->extraHTML;
    endif;

endif;
?>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
