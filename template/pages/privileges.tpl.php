<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
    $this->brick('announcement');

    $this->brick('pageTemplate');
?>

            <div class="text">
                <h1><?=Lang::privileges('privileges');?></h1>
                <div style="float:right;line-height:1.2;max-width:410px;overflow:hidden;text-align:center"><img class="border" alt="" src="<?=Cfg::get('STATIC_URL');?>/images/help/privileges/example.jpg" /></div>
                <p><?=Lang::privileges('main');?></p>
                <br><br>
                <table class="wsa-list wsa-tbl">
                    <thead><th><?=Lang::privileges('privilege');?></th><th><?=Lang::privileges('requiredRep');?></th></thead>
                    <tbody>
<?php
    foreach ($this->privileges as $id => [$earned, $name, $value]):
        echo '                        <tr'.($earned ? ' class="wsa-earned"' : '').'><td><div class="wsa-check" style="float:left;margin:0 3px 0 0">&nbsp;</div><a href="?privilege='.$id.'">'.$name.'</a></td><td class="number-right"><span>'.Lang::nf($value)."</span></td></tr>\n";
    endforeach;
?>
                    </tbody>
                </table>
            </div>
            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
