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
        avatar: 'https://uecook.top/avatar.avif',
        name: '圣堂之魂',
        title: '是圣堂呀~请你吃青苹果！',
        links: [
            { type: 'L', icon: 'house', url: 'https://uecook.top', title: '主页' },
            { type: 'L', icon: 'id-card', url: 'https://oc.uecook.top', title: 'OC' },
            { type: 'F', icon: 'bookmark', url: 'https://blog.uoca.top', title: 'blog' },
        ]
    },
    {
        avatar: 'https://www.misakaoi.top/images/icon/logo.png',
        name: '未眠海',
        title: '',
        links: [
            { type: 'L', icon: 'house', url: 'https://www.misakaoi.top', title: '主页' },
        ]
    },
    {
        avatar: 'https://github.com/CarmJos.png',
        name: 'Carm_卡姆',
        title: '编程与摄影日记',
        links: [
            { type: 'L', icon: 'house', url: 'https://www.carm.cc', title: '主页' },
        ]
    },
        {
        avatar: 'https://i1.hdslb.com/bfs/face/eaeee9f3e3f4ac18adb06933dd40ff4bf038d8fa.jpg@128w_128h_1c_1s.webp',
        name: 'FSE-Media-Group',
        title: 'FSE广播电视总台 FarSight-T.N.E Minecraft服务器',
        links: [
            { type: 'F', icon: 'youtube', url: 'https://space.bilibili.com/3632319667636264', title: 'B站' },
        ]
    }
];
