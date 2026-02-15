<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');
?>

            <div class="text">
                <h1><?=$this->name;?></h1>
                <p><?=$this->privReqPoints;?></p><br>
<?php
    $this->brick('article');
?>
            </div>
            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
