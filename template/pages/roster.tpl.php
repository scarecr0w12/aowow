<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
$this->brick('announcement');

$this->brick('pageTemplate');

?>
<div id="roster-status" class="profiler-message" style="display: none"></div>

            <div class="text">
<?php $this->brick('redButtons'); ?>
                <h1 class="first"><?=$this->name; ?></h1>

<?php
    // subject statistics here
    if (isset($this->extraHTML)):
        echo $this->extraHTML;
    endif;
?>

            </div>
<?php
    $this->brick('lvTabs');
?>
            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
