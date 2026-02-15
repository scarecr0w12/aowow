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
        </div>
    </div>
</footer>

<noscript>
    <div id="noscript-bg"></div>
    <div id="noscript-text"><?=Lang::main('noJScript'); ?></div>
</noscript>

<script type="text/javascript">if (typeof DomContentLoaded !== 'undefined') { DomContentLoaded.now(); }</script>
</body>
</html>
