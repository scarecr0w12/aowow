<?php $this->brick('header'); ?>

    <div id="main-precontents" class="detail-breadcrumb-bar"></div>

    <div class="detail-grid" id="main">
        <div class="detail-grid-main detail-content-card" id="main-contents">

<?php
$this->brick('announcement');

$this->brick('pageTemplate');
?>

            <div class="text">
                <a href="<?=$this->wowheadLink; ?>" class="button-red"><em><b><i>Wowhead</i></b><span>Wowhead</span></em></a>
<?php
if ($this->lvTabs):
    echo '                <h1>'.Lang::main('foundResult').' <i>'.Util::htmlEscape($this->search).'</i>';
    if ($this->invalid):
        echo '<span class="sub">'.sprintf(Lang::main('ignoredTerms'), implode(', ', $this->invalid)).'</span>';
    endif;
    echo "</h1>\n";
?>
            </div>
<?php
$this->brick('lvTabs');

else:
    echo '            <h1>'.Lang::main('noResult').' <i>'.Util::htmlEscape($this->search).'</i>';
    if ($this->invalid):
        echo '<span class="sub">'.sprintf(Lang::main('ignoredTerms'), implode(', ', $this->invalid)).'</span>';
    endif;
    echo "</h1>\n";
?>
            <div class="search-noresults"></div>

<?php
    echo '            '.Lang::main('tryAgain')."\n";
endif;
?>
            <div class="clear"></div>
        </div><!-- detail-grid-main -->
    </div><!-- detail-grid -->

<?php $this->brick('footer'); ?>
