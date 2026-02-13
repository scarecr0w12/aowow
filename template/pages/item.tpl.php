<?php $this->brick('modern-header'); ?>

    <main>
        <div class="container">
            <!-- Breadcrumb -->
            <div class="detail-breadcrumb">
                <div class="detail-breadcrumb-item">
                    <a href="?" class="detail-breadcrumb-link">Home</a>
                </div>
                <div class="detail-breadcrumb-item">
                    <a href="?items" class="detail-breadcrumb-link">Items</a>
                </div>
                <div class="detail-breadcrumb-item detail-breadcrumb-current">
                    <?=$this->name; ?>
                </div>
            </div>

            <!-- Detail Page Layout -->
            <div class="detail-page-modern">
                <!-- Main Content Area -->
                <div class="detail-page-main">
                    <!-- Header Section -->
                    <div class="detail-header">
                        <div class="detail-header-icon" id="item-icon"></div>
                        <div class="detail-header-content">
                            <h1 class="detail-header-title"><?=$this->name; ?></h1>
                            <div class="detail-header-meta">
<?php
    $this->brick('tooltip');
?>
                            </div>
<?php
if ($this->unavailable):
?>
                            <div style="color: var(--color-status-danger); margin-top: var(--spacing-3);">
                                <b><?=Lang::item('_unavailable'); ?></b>
                            </div>
<?php
endif;
?>
                            <div class="detail-header-actions">
                                <button class="btn btn-primary btn-sm">Add to Favorites</button>
                                <button class="btn btn-secondary btn-sm">Share</button>
                            </div>
                        </div>
                    </div>

                    <!-- Description Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title">Description</h2>
                        <div class="detail-description">
<?php
    $this->brick('article');

    if (!empty($this->transfer)):
        echo $this->transfer;
    endif;
?>
                        </div>
                    </div>

<?php
if (!empty($this->subItems)):
?>
                    <!-- Random Enchantments Section -->
                    <div class="detail-section">
                        <h2 class="detail-section-title"><?=Lang::item('_rndEnchants'); ?></h2>
                        <div class="detail-description">
                            <ul class="detail-list">
<?php
        foreach ($this->subItems['data'] as $k => $i):
            $eText = [];
            foreach ($i['enchantment'] as $eId => $txt):
                $eText[] = '<a href="?enchantment='.$eId.'">'.$txt.'</a>';
            endforeach;

            echo '<li class="detail-list-item">';
            echo '<span class="detail-list-item-label">'.$i['name'].' ('.sprintf(Lang::item('_chance'), $i['chance']).')</span>';
            echo '<span class="detail-list-item-value">'.implode(', ', $eText).'</span>';
            echo '</li>';
        endforeach;
?>
                            </ul>
                        </div>
                    </div>
<?php
endif;

$this->brick('book');
?>

                    <!-- Related Items -->
                    <div class="detail-section" id="related-section">
                        <h2 class="detail-section-title"><?=Lang::main('related'); ?></h2>
                        <div id="related-items-container">
<?php
    $this->brick('lvTabs', ['relTabs' => true]);
?>
                        </div>
                    </div>

                    <!-- Contribute Section -->
                    <div class="detail-section">
<?php
    $this->brick('contribute');
?>
                    </div>
                </div>

                <!-- Sidebar -->
                <aside class="detail-page-sidebar">
                    <!-- Quick Info Card -->
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-card-title">Quick Info</div>
                        <div class="detail-sidebar-info">
                            <div class="detail-sidebar-info-item">
                                <span class="detail-sidebar-info-label">Item ID:</span>
                                <span class="detail-sidebar-info-value"><?=$this->id; ?></span>
                            </div>
<?php
    $this->brick('redButtons');
?>
                        </div>
                    </div>

                    <!-- Infobox -->
<?php
    $this->brick('infobox');
?>
                </aside>
            </div>
        </div>
    </main>

<?php $this->brick('modern-footer'); ?>
