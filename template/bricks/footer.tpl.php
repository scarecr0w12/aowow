        </div>
    </main>

<!-- Modern Footer -->
<footer>
    <div class="container">
        <div>
            <h3>About</h3>
            <ul>
                <li><a href="?aboutus">About AoWoW</a></li>
                <li><a href="?help">Help & FAQ</a></li>
                <li><a href="?privilege">Privileges</a></li>
            </ul>
        </div>
        <div>
            <h3>Community</h3>
            <ul>
                <li><a href="?guides">Guides</a></li>
                <li><a href="?top-users">Top Contributors</a></li>
                <li><a href="?latest-comments">Latest Comments</a></li>
            </ul>
        </div>
        <div>
            <h3>Resources</h3>
            <ul>
                <li><a href="https://github.com/azerothcore/aowow" target="_blank">GitHub</a></li>
                <li><a href="?searchplugins">Search Plugins</a></li>
                <li><a href="#" id="footer-links-language">Language</a></li>
            </ul>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 AoWoW | Revision <?=AOWOW_REVISION; ?></p>
            <p>AzerothCore <a href="https://github.com/azerothcore/azerothcore-wotlk/commit/804769400bcb">804769400bcb</a></p>
<?php
if (User::isInGroup(U_GROUP_EMPLOYEE) && ($this->time || isset($this->mysql) || $this->isCached)):
    echo "            <table style=\"margin:auto;\">\n";

    if (isset($this->mysql)):
        echo '                <tr><td style="text-align:left;">'.Lang::main('numSQL') .'</td><td>'.$this->mysql['count']."</td></tr>\n";
        echo '                <tr><td style="text-align:left;">'.Lang::main('timeSQL').'</td><td>'.Util::formatTime($this->mysql['time'] * 1000, true)."</td></tr>\n";
    endif;

    if ($this->time):
        echo '                <tr><td style="text-align:left;">Page generated in</td><td>'.Util::formatTime($this->time * 1000, true)."</td></tr>\n";
    endif;

    if ($this->cacheLoaded && $this->cacheLoaded[0] == CACHE_MODE_FILECACHE):
        echo "                <tr><td style=\"text-align:left;\">reloaded from filecache</td><td>created".Lang::main('colon').date(Lang::main('dateFmtLong'), $this->cacheLoaded[1])."</td></tr>\n";
    elseif ($this->cacheLoaded && $this->cacheLoaded[0] == CACHE_MODE_MEMCACHED):
        echo "                <tr><td style=\"text-align:left;\">reloaded from memcached</td><td>created".Lang::main('colon').date(Lang::main('dateFmtLong'), $this->cacheLoaded[1])."</td></tr>\n";
    endif;

    echo "            </table>\n";
endif;
?>
        </div>
    </div>
</footer>

<noscript>
    <div id="noscript-bg"></div>
    <div id="noscript-text"><?=Lang::main('noJScript'); ?></div>
</noscript>

<script type="text/javascript">if (typeof DomContentLoaded !== 'undefined') { DomContentLoaded.now(); }</script>
<?php
if (Cfg::get('DEBUG') >= CLI::LOG_INFO && User::isInGroup(U_GROUP_DEV | U_GROUP_ADMIN)):
?>
<script type="text/javascript">
    window.open("/", "SqlLog", "width=1800,height=200,top=100,left=100,status=no,location=no,toolbar=no,menubar=no").document.write('<?=DB::getProfiles();?>');
</script>
<?php
endif;
?>
</body>
</html>
