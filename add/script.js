/**
 * 添加友链页逻辑
 * - 表单填写 → 实时预览 → 生成 JS 数据
 * - 链接动态增删（1~4）
 * - 校验、本地缓存、主题切换、复制
 */
(function () {
    'use strict';

    var MAX_LINKS = 4;
    var TITLE_MAX = 70;
    var STORE_KEY = 'add-card-state-v1';
    var THEME_KEY = 'add-card-theme';

    var EXAMPLE = {
        avatar: 'https://uecook.top/avatar.avif',
        name: '圣堂之魂',
        title: '是圣堂呀~请你吃青苹果！',
        links: [
            { type: 'L', icon: 'house', url: 'https://uecook.top', title: '主页' },
            { type: 'L', icon: 'id-card', url: 'https://oc.uecook.top', title: 'OC' },
            { type: 'F', icon: 'bookmark', url: 'https://blog.uoca.top', title: 'blog' }
        ]
    };

    var state = {
        avatar: '',
        name: '',
        title: '',
        links: [{ type: 'L', icon: '', url: '', title: '' }]
    };

    /* ---------- 工具 ---------- */
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
    function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* 已触碰字段集合：错误只在字段被 touch（blur）后才显示，
       避免页面加载/未开始填写时就提示。forceShow 用于「复制」等强制校验。 */
    var touched = new Set();
    function keyFor(input) {
        if (input.id === 'f-name') return 'name';
        if (input.id === 'f-avatar') return 'avatar';
        if (input.id === 'f-title') return 'title';
        if (input.classList.contains('link-url')) {
            var row = input.closest('.link-row');
            return row ? 'link-' + row.getAttribute('data-index') : null;
        }
        return null;
    }
    function markTouched(e) {
        var key = keyFor(e.target);
        if (key && !touched.has(key)) { touched.add(key); refresh(); }
    }

    /* ---------- 主题 ---------- */
    function initTheme() {
        var saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light') document.documentElement.classList.remove('dark');
        else document.documentElement.classList.add('dark');
    }
    $('#theme-toggle').addEventListener('click', function () {
        document.documentElement.classList.toggle('dark');
        localStorage.setItem(THEME_KEY, document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    /* ---------- 链接行渲染 ---------- */
    function linkRowTemplate(index, data) {
        var div = el('div', 'link-row');
        div.setAttribute('data-index', index);

        var isT = (data.type || 'L').toUpperCase() === 'T';

        var isFirst = index === 0;
        var removeBtn = isFirst
            ? '<span class="badge-secondary">必填</span>'
            : '<button type="button" class="btn-ghost btn-sm btn-icon link-remove" title="删除此链接" aria-label="删除">' +
                '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
              '</button>';

        div.innerHTML =
            '<div class="link-row-bar">' +
                '<span class="badge-secondary">链接 ' + (index + 1) + '</span>' +
                removeBtn +
            '</div>' +
            '<div class="link-fields form">' +
                '<div role="group" class="field">' +
                    '<label>图标类型</label>' +
                    '<select class="link-type">' +
                        '<option value="L"' + ((data.type || 'L') === 'L' ? ' selected' : '') + '>Lucide (L)</option>' +
                        '<option value="F"' + (data.type === 'F' ? ' selected' : '') + '>Feather (F)</option>' +
                        '<option value="T"' + (data.type === 'T' ? ' selected' : '') + '>自定义 SVG (T)</option>' +
                    '</select>' +
                '</div>' +
                '<div role="group" class="field field-icon">' +
                    '<label>图标 <span class="req" data-role="icon-req" hidden>必填</span></label>' +
                    '<p class="hint" data-role="icon-hint">输入图标名称</p>' +
                    '<input class="link-icon" type="text" placeholder="如 house" value="' + escapeHtml(isT ? '' : data.icon) + '"' + (isT ? ' hidden' : '') + '>' +
                    '<textarea class="link-svg" rows="3" placeholder="<svg viewBox=\'0 0 24 24\'>...</svg>"' + (isT ? '' : ' hidden') + '>' + escapeHtml(isT ? data.icon : '') + '</textarea>' +
                '</div>' +
                '<div role="group" class="field field-url">' +
                    '<label>链接地址 <span class="req" data-role="url-req"' + (index === 0 ? '' : ' hidden') + '>必填</span></label>' +
                    '<p class="hint">支持 https:// 或 mailto:</p>' +
                    '<input class="link-url" type="url" placeholder="https://example.com 或 mailto:a@b.com" value="' + escapeHtml(data.url) + '">' +
                    '<p class="err" role="alert" hidden></p>' +
                '</div>' +
                '<div role="group" class="field field-title">' +
                    '<label>标题</label>' +
                    '<input class="link-title" type="text" placeholder="如 主页" value="' + escapeHtml(data.title) + '" maxlength="30">' +
                '</div>' +
            '</div>';
        return div;
    }

    function renderLinks() {
        var container = $('#links-container');
        container.innerHTML = '';
        state.links.forEach(function (link, i) {
            container.appendChild(linkRowTemplate(i, link));
        });
        updateLinkCount();
    }

    function updateLinkCount() {
        $('#link-count-badge').textContent = state.links.length + ' / ' + MAX_LINKS;
        $('#add-link').disabled = state.links.length >= MAX_LINKS;
        $('#add-link').style.opacity = state.links.length >= MAX_LINKS ? '0.5' : '';
    }

    /* ---------- 收集数据 ---------- */
    function collect() {
        var data = {
            avatar: ($('#f-avatar').value || '').trim(),
            name: ($('#f-name').value || '').trim(),
            title: ($('#f-title').value || '').trim(),
            links: []
        };
        $all('.link-row').forEach(function (row) {
            var type = $('.link-type', row).value;
            var isT = type === 'T';
            var icon = (isT ? $('.link-svg', row).value : $('.link-icon', row).value || '').trim();
            var url = ($('.link-url', row).value || '').trim();
            var title = ($('.link-title', row).value || '').trim();
            data.links.push({ type: type, icon: icon, url: url, title: title });
        });
        state = data;
        return data;
    }

    /* ---------- 校验 ---------- */
    /* ---------- 校验 ----------
       forceShow：true 时无视 touched，显示所有错误（用于复制前的强制校验）。
       返回总体是否合法；错误提示仅在字段已 touch 或 forceShow 时显示。 */
    function validate(data, forceShow) {
        var ok = true;

        // 名称
        var nameInput = $('#f-name');
        var nameErr = $('#name-help');
        var nameShow = forceShow || touched.has('name');
        if (!data.name) {
            ok = false;
            if (nameShow) {
                nameInput.classList.add('invalid');
                nameErr.hidden = false;
                nameErr.textContent = '请填写名称';
            }
        } else {
            nameInput.classList.remove('invalid');
            nameErr.hidden = true;
        }

        // 头像 https
        var avatarInput = $('#f-avatar');
        var avatarShow = forceShow || touched.has('avatar');
        if (data.avatar && data.avatar.indexOf('https://') !== 0) {
            if (avatarShow) avatarInput.classList.add('invalid');
            ok = false;
        } else {
            avatarInput.classList.remove('invalid');
        }

        // 链接：允许 https:// 或 mailto:
        $all('.link-row').forEach(function (row, i) {
            var urlInput = $('.link-url', row);
            var url = urlInput.value.trim();
            var err = $('.err', row);
            var key = 'link-' + i;
            var show = forceShow || touched.has(key);
            var validProto = url.indexOf('https://') === 0 || url.indexOf('mailto:') === 0;
            if (url && !validProto) {
                ok = false;
                if (show) {
                    urlInput.classList.add('invalid');
                    err.hidden = false;
                    err.textContent = '地址须以 https:// 或 mailto: 开头';
                }
            } else if (i === 0 && !url) {
                ok = false;
                if (show) {
                    urlInput.classList.add('invalid');
                    err.hidden = false;
                    err.textContent = '第 1 个链接为必填项';
                }
            } else {
                urlInput.classList.remove('invalid');
                err.hidden = true;
            }
        });

        return ok;
    }

    /* ---------- 预览 ---------- */
    var needL = false, needF = false;

    // 自定义 SVG 颜色适配：让默认/黑色填充改用 currentColor，
    // 从而跟随 .fcard-link 的文本色（常态 text-secondary、hover accent、明暗主题）
    function adaptCustomSvg(host) {
        var svg = host.querySelector('svg');
        if (!svg) return;
        svg.style.width = '20px';
        svg.style.height = '20px';
        svg.style.color = 'inherit';
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        var BLACK = /^(black|#0{3,6}|#0{8})$/i;
        Array.prototype.forEach.call(svg.querySelectorAll('*'), function (node) {
            var fill = node.getAttribute('fill');
            var stroke = node.getAttribute('stroke');
            // 未声明 fill（浏览器默认黑色）→ 改 currentColor
            if (fill === null) {
                node.setAttribute('fill', 'currentColor');
            } else if (BLACK.test(fill.trim())) {
                node.setAttribute('fill', 'currentColor');
            }
            // 显式黑色 stroke → 改 currentColor（Lucide 风格的 currentColor 不动）
            if (stroke && BLACK.test(stroke.trim())) {
                node.setAttribute('stroke', 'currentColor');
            }
        });
    }

    function renderPreview(data) {
        var wrap = $('#preview');
        wrap.innerHTML = '';
        wrap.classList.add('mnet');
        needL = false; needF = false;

        var card = el('div', 'fcard');

        // 头像
        if (data.avatar) {
            var img = document.createElement('img');
            img.className = 'fcard-avatar';
            img.alt = data.name || 'avatar';
            img.src = data.avatar;
            img.onerror = function () {
                this.style.display = 'none';
                var ph = el('div', 'fcard-avatar fcard-avatar--empty');
                ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>';
                card.insertBefore(ph, card.firstChild);
            };
            card.appendChild(img);
        } else {
            var ph = el('div', 'fcard-avatar fcard-avatar--empty');
            ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"/></svg>';
            card.appendChild(ph);
        }

        // 信息
        var info = el('div', 'fcard-info');
        var nameEl = el('div', 'fcard-name');
        if (data.name) { nameEl.textContent = data.name; }
        else { nameEl.textContent = '你的名称'; nameEl.classList.add('placeholder'); }
        info.appendChild(nameEl);

        if (data.title) {
            var t = el('div', 'fcard-title');
            t.textContent = data.title;
            info.appendChild(t);
        }
        card.appendChild(info);

        // 链接
        var validLinks = data.links.filter(function (l) { return l.url; });
        if (validLinks.length) {
            var lw = el('div', 'fcard-links');
            validLinks.forEach(function (link) {
                var a = document.createElement('a');
                a.className = 'fcard-link';
                a.href = link.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.title = link.title || '';

                var t = (link.type || 'L').toUpperCase();
                if (t === 'L') {
                    needL = true;
                    var iL = document.createElement('i');
                    iL.setAttribute('data-lucide', link.icon || 'link');
                    a.appendChild(iL);
                } else if (t === 'F') {
                    needF = true;
                    var iF = document.createElement('i');
                    iF.setAttribute('data-feather', link.icon || 'link');
                    a.appendChild(iF);
                } else {
                    a.innerHTML = link.icon || '';
                    adaptCustomSvg(a);
                }
                lw.appendChild(a);
            });
            card.appendChild(lw);
        }

        wrap.appendChild(card);

        // 渲染图标
        if (needL && window.lucide) { try { window.lucide.createIcons(); } catch (e) {} }
        if (needF && window.feather) { try { window.feather.replace(); } catch (e) {} }
    }

    /* ---------- 代码生成 ---------- */
    function q(s) {
        return "'" + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
    }

    function buildCode(data) {
        var lines = [];
        lines.push('{');
        lines.push('    avatar: ' + q(data.avatar) + ',');
        lines.push('    name: ' + q(data.name) + ',');
        lines.push('    title: ' + q(data.title) + ',');
        lines.push('    links:');
        lines.push('    [');
        var outLinks = data.links.filter(function (l) { return l.url; });
        outLinks.forEach(function (l) {
            lines.push('      { type: ' + q(l.type) + ', icon: ' + q(l.icon) + ', url: ' + q(l.url) + ', title: ' + q(l.title) + ' },');
        });
        lines.push('    ]');
        lines.push('}');
        return lines.join('\n');
    }

    function highlightCode(code) {
        var html = escapeHtml(code);
        // 字符串
        html = html.replace(/(&#39;)([^&]|&(?!#39;))*?(&#39;)/g, function (m) {
            return '<span class="tok-str">' + m + '</span>';
        });
        // 键名
        html = html.replace(/(^|\n)(\s+)(avatar|name|title|type|icon|url|links)(:)/g, '$1$2<span class="tok-key">$3</span>$4');
        return html;
    }

    function renderCode(data) {
        var code = buildCode(data);
        $('#code-output').innerHTML = highlightCode(code);
        $('#code-output').setAttribute('data-raw', code);
    }

    /* ---------- 主刷新 ---------- */
    function refresh() {
        var data = collect();
        validate(data, false);
        renderPreview(data);
        renderCode(data);
        saveState();
        updateTitleCount();
    }

    function saveState() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
    }
    function loadState() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            if (raw) {
                var s = JSON.parse(raw);
                if (s && Array.isArray(s.links) && s.links.length) {
                    return s;
                }
            }
        } catch (e) {}
        return null;
    }

    function applyState(s) {
        state = s;
        $('#f-avatar').value = s.avatar || '';
        $('#f-name').value = s.name || '';
        $('#f-title').value = s.title || '';
        renderLinks();
    }

    function updateTitleCount() {
        var len = ($('#f-title').value || '').length;
        $('#title-count').textContent = len + ' / ' + TITLE_MAX;
    }

    /* ---------- 复制 ---------- */
    var COPY_ICON = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
    var CHECK_ICON = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

    function copyCode() {
        var code = $('#code-output').getAttribute('data-raw') || '';
        var btn = $('#btn-copy');
        function done(ok) {
            if (ok) {
                btn.innerHTML = CHECK_ICON;
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.innerHTML = COPY_ICON;
                    btn.classList.remove('copied');
                }, 1500);
                toast('success', '已复制', '友链数据已复制到剪贴板');
            } else {
                toast('error', '复制失败', '请手动选中代码进行复制');
            }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(function () { done(true); }).catch(function () { fallback(); });
        } else { fallback(); }
        function fallback() {
            try {
                var ta = document.createElement('textarea');
                ta.value = code;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                var ok = document.execCommand('copy');
                document.body.removeChild(ta);
                done(ok);
            } catch (e) { done(false); }
        }
    }

    function toast(category, title, description) {
        document.dispatchEvent(new CustomEvent('basecoat:toast', {
            detail: { config: { category: category, title: title, description: description } }
        }));
    }

    /* ---------- 事件绑定 ---------- */
    function bindEvents() {
        // 基本信息：input 实时刷新；focusout 标记字段已触碰（之后才提示错误）
        $('#basic-form').addEventListener('input', refresh);
        $('#basic-form').addEventListener('focusout', markTouched);

        // 链接容器：input / select 变更
        $('#links-container').addEventListener('input', function (e) {
            var row = e.target.closest('.link-row');
            if (!row) return;
            refresh();
        });
        $('#links-container').addEventListener('focusout', markTouched);
        $('#links-container').addEventListener('change', function (e) {
            if (e.target.classList.contains('link-type')) {
                var row = e.target.closest('.link-row');
                handleTypeChange(row);
            }
            refresh();
        });

        // 删除
        $('#links-container').addEventListener('click', function (e) {
            var btn = e.target.closest('.link-remove');
            if (!btn) return;
            btn.blur();
            var row = e.target.closest('.link-row');
            var idx = parseInt(row.getAttribute('data-index'), 10);
            state.links.splice(idx, 1);
            renderLinks();
            refresh();
        });

        // 添加
        $('#add-link').addEventListener('click', function () {
            if (state.links.length >= MAX_LINKS) return;
            state.links.push({ type: 'L', icon: '', url: '', title: '' });
            renderLinks();
            refresh();
            // 滚动到新增行
            var rows = $all('.link-row');
            var last = rows[rows.length - 1];
            if (last) { last.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        });

        // 复制
        $('#btn-copy').addEventListener('click', function () {
            var data = collect();
            if (!validate(data, true)) {
                toast('warning', '信息未填写完整', '请检查标红的必填项后再复制');
                return;
            }
            copyCode();
        });

        // 载入示例
        $('#btn-example').addEventListener('click', function () {
            touched.clear();
            applyState(JSON.parse(JSON.stringify(EXAMPLE)));
            refresh();
            toast('info', '已载入示例', '可在此基础上修改为你的信息');
        });

        // 重置
        $('#btn-reset').addEventListener('click', function () {
            touched.clear();
            applyState({ avatar: '', name: '', title: '', links: [{ type: 'L', icon: '', url: '', title: '' }] });
            refresh();
            toast('info', '已重置', '');
        });
    }

    function handleTypeChange(row) {
        var type = $('.link-type', row).value;
        var isT = type === 'T';
        var input = $('.link-icon', row);
        var area = $('.link-svg', row);
        var hint = $('[data-role="icon-hint"]', row);

        // 保留已输入内容：在两个字段间转移
        if (isT) {
            area.value = input.value ? input.value : area.value;
            input.value = '';
            hint.textContent = '粘贴完整 SVG 代码';
        } else {
            input.value = area.value ? area.value : input.value;
            area.value = '';
            hint.textContent = '输入图标名称';
        }
        input.hidden = isT;
        area.hidden = !isT;
    }

    /* ---------- 右栏定位（fixed）----------
       在 ≥1024px 下，右栏脱离文档流，按表单列右边缘 + topbar 高度
       实时计算 left / width / top，使其完全脱离页面滚动。 */
    var layoutEl = $('.layout');
    var colFormEl = $('.col-form');
    var colOutputEl = $('.col-output');
    var topbarEl = $('.topbar');

    function layoutOutput() {
        if (window.innerWidth < 1024) {
            colOutputEl.style.left = '';
            colOutputEl.style.width = '';
            colOutputEl.style.top = '';
            return;
        }
        var formRect = colFormEl.getBoundingClientRect();
        var layoutRect = layoutEl.getBoundingClientRect();
        var gap = parseFloat(getComputedStyle(layoutEl).gap) || 24;
        var left = formRect.right + gap;
        colOutputEl.style.left = left + 'px';
        colOutputEl.style.width = (layoutRect.right - left) + 'px';
        colOutputEl.style.top = topbarEl.offsetHeight + 'px';
    }

    /* ---------- 初始化 ---------- */
    function init() {
        initTheme();
        var saved = loadState();
        if (saved) applyState(saved); else renderLinks();
        bindEvents();
        refresh();
        layoutOutput();
        window.addEventListener('resize', layoutOutput);
        window.addEventListener('load', layoutOutput);
        document.fonts && document.fonts.ready.then(layoutOutput);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
