<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');
?>

        <div id="<?=$this->tcType; ?>-classes">
                <div id="<?=$this->tcType; ?>-classes-outer">
                    <div id="<?=$this->tcType; ?>-classes-inner"><p><?=($this->tcType == 'tc' ? Lang::main('chooseClass') : Lang::main('chooseFamily')) . Lang::main('colon'); ?></p></div>
                </div>
            </div>
            <div id="<?=$this->tcType; ?>-itself"></div>
            <script type="text/javascript">
                <?=$this->tcType; ?>_init();
            </script>

            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
