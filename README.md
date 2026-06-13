# Friend_Links

> 一个简洁、美观、可配置的**友情链接**展示页面。纯静态实现，无需任何构建工具或后端服务，开箱即用。

## 一、特性

- **莫奈取色系统** — 通过 CSS 变量统一管理配色，只需修改一个主色调，全站自动跟随变化
- **双主题切换** — 支持深色 / 浅色主题，通过 `localStorage` 自动记忆用户偏好
- **卡片化展示** — 每张卡片展示头像、名称、副标题及最多 4 个链接（2×2 网格）
- **多图标库支持** — 同时兼容 [Lucide](https://lucide.dev)、[Feather](https://feathericons.com) 图标库及自定义 SVG
- **完全响应式** — 使用 `clamp()` 实现流畅自适应，手机端体验良好
- **内容保护** — 自动禁用右键菜单、拖拽、复制与文本选择（输入框除外）
- **零依赖** — 纯 HTML + CSS + 原生 JavaScript，无需 npm、无需打包

---

## 二、项目结构

```
Friend_Links
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── cards.js            # 卡片数据配置（修改此文件即可定制内容）
│   └── app.js
└── font/
    ├── lucide.min.js       # Lucide 图标库
    ├── feather.min.js      # Feather 图标库
    ├── LICENSE_Feather
    └── LICENSE_Lucide
```
---

## 三、自定义指南

### 1. 添加 / 编辑卡片

编辑 `js/cards.js` 中的 `CARDS_DATA` 数组，每个对象代表一张卡片。完整字段说明如下：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `avatar` | string | 否 | 头像路径，为空则不显示头像 |
| `name` | string | 是 | 名字 |
| `title` | string | 否 | 自我介绍，建议不超过 70 字 |
| `links` | array | 是 | 链接数组，最多 4 个（2×2 网格），**第 1 个链接必填** |

#### `links` 数组中每个对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | string | 否 | 图标类型：`'L'`（Lucide）/ `'F'`（Feather）/ `'T'`（自定义 SVG）。**默认 `'L'`** |
| `icon` | string | 否 | 图标名称或 SVG 代码。**默认 `'user'`**（配合 `type: 'L'`） |
| `url` | string | 是 | 链接地址，**仅支持 `https://`** |
| `title` | string | 否 | 鼠标悬停提示文字 |

#### `type` 字段取值说明

| type 值 | 图标库       | `icon` 字段填写内容                 | 说明                     |
|---------|-------------|--------------------------------------|--------------------------|
| `'L'`   | Lucide      | Lucide 图标名称，如 `'user'`、`'home'` | **默认值**，页面已预加载 |
| `'F'`   | Feather     | Feather 图标名称，如 `'github'`      | 按需自动加载             |
| `'T'`   | 自定义图标  | 完整的 SVG 标签字符串                | 直接插入渲染             |

> **图标查找**：[Lucide 图标列表](https://lucide.dev/icons) · [Feather 图标列表](https://feathericons.com)

#### 配置示例

```javascript
{
    avatar: '',
    name: '测试2',
    title: '介绍一下你自己（建议70字以内）',
    links: [
        // 第 1 个链接（必填）
        { type: 'L', icon: 'user', url: 'https://example.com', title: '个人主页' },
        // 自定义 SVG 图标
        { type: 'T', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>', url: 'https://example.com', title: '自定义图标' },
        // Feather 图标
        { type: 'F', icon: 'star', url: 'https://example.com', title: 'Feather图标' },
        // Lucide 图标
        { type: 'L', icon: 'mail', url: 'https://example.com', title: '邮箱' }
    ]
}
```

### 2. 自定义主题配色

编辑 `css/style.css` 顶部的 `:root` 区块，修改莫奈取色变量：

```css
:root {
    --monet-accent: #46a15e;    /* 主色调（强调色） */
    --monet-base:   #f5f3f0;    /* 底色（浅色主题背景） */
}
```

- **`--monet-accent`**：全站强调色，影响按钮、边框、图标 hover 等
- **`--monet-base`**：浅色主题的背景基色

其余所有颜色变量均由这两个值通过 `color-mix()` 自动派生，无需手动调整。深色主题仅覆盖 `--monet-base`，主色调自动复用。

### 3. 配置侧边栏导航

编辑 `index.html` 中的 `.sidebar` 区块，修改链接的 `href` 和 `title`：

```html
<a href="https://your-home.com" class="sidebar-btn" data-action="home" title="主页">
    <i data-lucide="home"></i>
</a>
```

---

## 四、许可证

本项目基于 [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) 协议开源。内置图标库遵循各自的开源许可证：

- Lucide：[ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE)
- Feather：[MIT License](https://github.com/feathericons/feather/blob/main/LICENSE)

---

UeCook / 圣堂之魂

- GitHub：[UeCook/Friend_Links](https://github.com/UeCook/Friend_Links)
