/**
 * 页面本体逻辑
 * 包含：主题切换、卡片渲染、多图标库支持
 */
(function () {
    // ===== 禁止右键、拖拽、复制 =====
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('dragstart', function (e) { e.preventDefault(); });
    document.addEventListener('copy', function (e) { e.preventDefault(); });
    document.addEventListener('cut', function (e) { e.preventDefault(); });
    document.addEventListener('selectstart', function (e) {
        // 允许输入框内选择
        var tag = e.target.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); }
    });

    // ===== 主题切换 =====
    var toggle = document.getElementById('theme-toggle');
    var html = document.documentElement;

    var saved = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', saved);
    updateIcon(saved);

    toggle.addEventListener('click', function () {
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon(next);
    });

    function updateIcon(theme) {
        // 切换 lucide 图标：深色显示月亮，浅色显示太阳
        toggle.innerHTML = '<i data-lucide="' + (theme === 'dark' ? 'sun' : 'moon') + '"></i>';
        toggle.title = theme === 'dark' ? '切换到亮色' : '切换到深色';
        if (typeof lucide !== 'undefined') { lucide.createIcons(); }
    }

    // ===== 动态加载脚本 =====
    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                if (existing.dataset.loaded === 'true') { resolve(); return; }
                existing.addEventListener('load', resolve);
                existing.addEventListener('error', reject);
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.onload = function () { s.dataset.loaded = 'true'; resolve(); };
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    // ===== 侧边栏图标初始化 =====
    // 先初始化侧边栏中的 feather 图标（blog、github）
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // ===== 卡片渲染 =====
    var container = document.getElementById('cards-container');
    if (container && typeof CARDS_DATA !== 'undefined') {

        // 收集本次渲染需要的图标类型
        var needLucide = false;
        var needFeather = false;

        CARDS_DATA.forEach(function (cardData) {
            var card = document.createElement('div');
            card.className = 'card';

            // 头像
            var avatar = document.createElement('img');
            avatar.className = 'card-avatar';
            avatar.src = cardData.avatar;
            avatar.alt = cardData.name;
            avatar.onerror = function () { this.style.display = 'none'; };
            card.appendChild(avatar);

            // 信息区
            var info = document.createElement('div');
            info.className = 'card-info';

            var nameEl = document.createElement('div');
            nameEl.className = 'card-name';
            nameEl.textContent = cardData.name;
            info.appendChild(nameEl);

            if (cardData.title) {
                var titleEl = document.createElement('div');
                titleEl.className = 'card-title';
                titleEl.textContent = cardData.title;
                info.appendChild(titleEl);
            }
            card.appendChild(info);

            // 链接区（2×2 网格）
            if (cardData.links && cardData.links.length > 0) {
                var linksWrap = document.createElement('div');
                linksWrap.className = 'card-links';

                cardData.links.forEach(function (link) {
                    var a = document.createElement('a');
                    a.className = 'card-link';
                    a.href = link.url || '#';
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.title = link.title || '';

                    var iconType = (link.type || 'L').toUpperCase(); // 默认 L
                    var iconName = link.icon || 'link';

                    if (iconType === 'L') {
                        // Lucide 图标
                        needLucide = true;
                        var iL = document.createElement('i');
                        iL.setAttribute('data-lucide', iconName);
                        a.appendChild(iL);
                    } else if (iconType === 'F') {
                        // Feather 图标
                        needFeather = true;
                        var iF = document.createElement('i');
                        iF.setAttribute('data-feather', iconName);
                        a.appendChild(iF);
                    } else if (iconType === 'T') {
                        // 自定义图标（直接插入 SVG 代码）
                        a.innerHTML = iconName;
                    }

                    linksWrap.appendChild(a);
                });

                card.appendChild(linksWrap);
            }

            container.appendChild(card);
        });

        // ===== 图标初始化 =====
        // Lucide 图标
        if (needLucide && typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Feather 图标（按需动态加载）
        if (needFeather) {
            var featherSrc = 'font/feather.min.js';
            if (typeof feather !== 'undefined') {
                feather.replace();
            } else {
                loadScript(featherSrc).then(function () {
                    if (typeof feather !== 'undefined') {
                        feather.replace();
                    }
                }).catch(function () {
                    console.warn('[feather] 加载失败：' + featherSrc);
                });
            }
        }
    }
})();
