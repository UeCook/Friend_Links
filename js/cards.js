/**
 * 卡片数据配置
 * 每个对象代表一张卡片：头像、名称、标题、链接（最多 4 个）
 *
 * link.type 图标类型（可选，默认 'L'）：
 *   'L' — 使用 lucide 图标库（font/lucide.min.js）
 *         icon 字段填写 lucide 图标名称，如 'user'、'home'
 *   'F' — 使用 feather 图标库（font/feather.min.js，按需自动加载）
 *         icon 字段填写 feather 图标名称，如 'github'、'twitter'
 *   'T' — 自定义图标，直接插入 SVG 代码
 *         icon 字段填写完整的 SVG 标签字符串
 */
const CARDS_DATA = [
    {
        avatar: './avatar.avif',
        name: '测试1',
        title: '副标题1',
        links: [
            { type: 'L', icon: 'user', url: '#', title: '个人主页' },
            { type: 'L', icon: 'home', url: '#', title: '首页' },
            { type: 'L', icon: 'link', url: '#', title: 'GitHub' },
            { type: 'L', icon: 'mail', url: '#', title: '邮箱' }
        ]
    },
    {
        avatar: '',
        name: '测试2',
        title: '副标题2',
        links: [
            { type: 'L', icon: 'user', url: '#', title: '个人主页' },
            { type: 'T', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>', url: '#', title: '自定义图标' },
            { type: 'F', icon: 'star', url: '#', title: 'Feather图标' },
            { type: 'T', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', url: '#', title: '星星' }
        ]
    }
];
