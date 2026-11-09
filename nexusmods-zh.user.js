// ==UserScript==
// @name         NexusMods 界面汉化
// @name:en      NexusMods UI Chinese
// @namespace    https://github.com/wakaba-mark/nexusmods-zh
// @version      1.0.0
// @author       wakaba
// @description  将 Nexus Mods 站点界面汉化为简体中文（导航、筛选、按钮、标签页、统计、设置项、日期格式），不翻译模组标题、描述、评论等用户内容；兼容新版 React 页面、旧版模组页与 Shadow DOM 组件。
// @match        https://www.nexusmods.com/*
// @match        https://users.nexusmods.com/*
// @run-at       document-start
// @grant        GM_registerMenuCommand
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  /* ==========================================================================
   * 0. 基础工具
   * ========================================================================== */

  const collapse = (s) => s.replace(/[\s\u00a0\u200b\u3000]+/g, ' ').trim();

  const MONTHS = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
    january: 1, february: 2, march: 3, april: 4, june: 6, july: 7,
    august: 8, september: 9, october: 10, november: 11, december: 12,
  };

  const pad2 = (n) => String(n).padStart(2, '0');

  /** 把 "6 Nov 2026" / "06 November 2026" 转成 "2026-11-06" */
  function fmtDate(day, monthName, year) {
    const m = MONTHS[monthName.toLowerCase().slice(0, 4)] || MONTHS[monthName.toLowerCase().slice(0, 3)];
    if (!m) return null;
    return `${year}-${pad2(m)}-${pad2(Number(day))}`;
  }

  /** "6:41AM" → "06:41" */
  function fmtTime(h, min, ampm) {
    let hh = Number(h);
    if (ampm) {
      const pm = ampm.toUpperCase() === 'PM';
      if (hh === 12) hh = pm ? 12 : 0;
      else if (pm) hh += 12;
    }
    return `${pad2(hh)}:${min}`;
  }

  /* ==========================================================================
   * 1. 词典：界面文案（key 一律小写、空白折叠）
   * ========================================================================== */

  const DICT = {
    /* ---------- 顶栏 / 全局导航 ---------- */
    'games': '游戏',
    'mods': '模组',
    'collections': '合集',
    'media': '媒体',
    'community': '社区',
    'support': '支持',
    'search': '搜索',
    'upload': '上传',
    'log in': '登录',
    'login': '登录',
    'sign out': '退出登录',
    'download app': '下载应用',
    'skip to content': '跳到主要内容',
    'open navigation menu': '打开导航菜单',
    'close navigation menu': '关闭导航菜单',
    'open profile menu': '打开个人菜单',
    'open settings sidebar': '打开设置侧栏',
    'clear game filter': '清除游戏筛选',
    'back': '返回',
    'close': '关闭',
    'home': '首页',
    'go home': '返回首页',
    'error 404': '错误 404',
    'page not found.': '页面不存在。',
    'page not found': '页面不存在',
    'this could be because the page was moved or the address was typed incorrectly.':
      '可能是页面已被移动，或地址输入有误。',
    'current section': '当前栏目',
    'viewing:': '正在查看：',
    'loading...': '加载中…',
    'loading…': '加载中…',

    /* ---------- 头部下拉菜单 ---------- */
    'my profile': '我的主页',
    'my mods': '我的模组',
    'my collections': '我的合集',
    'my media': '我的媒体',
    'my wallet': '我的钱包',
    'my games': '我的游戏',
    'my images': '我的图片',
    'my files': '我的文件',
    'my content': '我的内容',
    'my download history': '我的下载历史',
    'tracking centre': '关注中心',
    'download history': '下载历史',
    'give feedback': '提交反馈',
    'account settings': '账户设置',
    'site preferences': '站点偏好',
    'member': '会员',
    'guest': '访客',
    'go premium': '升级高级版',
    'try premium free': '免费试用高级版',
    'try premium for free': '免费试用高级版',
    'premium': '高级版',
    'premium features': '高级版功能',
    'mod rewards': '模组奖励',
    'kudos given': '已给声望',
    'please log in': '请先登录',
    'to enjoy the benefits of nexus mods, please log in.': '登录后即可使用 Nexus Mods 的全部功能。',
    'exclusive media content and more': '专属媒体内容等更多权益',
    'start free trial': '开始免费试用',
    'welcome back,': '欢迎回来，',
    'cash payouts': '现金提现',
    'free premium': '免费高级版',
    'no ads': '无广告',
    'auto-install collections': '一键安装合集',
    'uncapped download speeds': '不限速下载',
    '- unlock faster downloads & 1-click installs': '- 解锁更快的下载速度与一键安装',

    /* ---------- 通知面板 ---------- */
    'notifications': '通知',
    'unread notifications': '未读通知',
    'mark all as read': '全部标为已读',
    'no unread notifications right now': '暂无未读通知',
    "you're up to date": '已全部读完',
    'see all': '查看全部',
    'you have unread notifications': '有未读通知',
    'oh dear! something has gone wrong!': '出错了！',
    'try reloading the notifications.': '请尝试重新加载通知。',
    'notifications / preferences': '通知偏好设置',

    /* ---------- 上传入口 ---------- */
    'upload a': '上传',
    'upload an': '上传',
    'add a': '添加',
    'mod': '模组',
    'image': '图片',
    'video': '视频',
    'upload mod': '上传模组',

    /* ---------- 页脚 ---------- */
    'news': '新闻',
    'statistics': '统计',
    'careers': '招聘',
    'about us': '关于我们',
    'discover': '发现',
    'all games': '全部游戏',
    'all mods': '全部模组',
    'new mods': '最新模组',
    'popular mods': '热门模组',
    'trending mods': '趋势模组',
    'all collections': '全部合集',
    'all images': '全部图片',
    'help': '帮助',
    'wiki': '维基',
    'feedback': '反馈',
    'report a bug': '报告问题',
    'unban requests': '解封申诉',
    'manage cookie settings': '管理 Cookie 设置',
    'forums': '论坛',
    'support authors': '支持作者',
    'contact us': '联系我们',
    'contact': '联系',
    'support nexus mods': '支持 Nexus Mods',
    'mod faster with premium': '用高级版加速模组安装',
    'network stats': '网络统计',
    'network stats.': '网络统计。',
    'members': '会员',
    'kudos': '声望',
    'server info': '服务器信息',
    'copyright ©': '版权所有 ©',
    'black tree gaming ltd. all rights reserved.': 'Black Tree Gaming Ltd. 保留所有权利。',
    'terms of service': '服务条款',
    'privacy policy': '隐私政策',
    'page served in': '服务器响应耗时',
    'all news': '全部新闻',
    'site news': '站点新闻',
    'competitions': '竞赛',
    'interviews': '访谈',
    'game guides': '游戏指南',
    'tutorial': '教程',
    'tools': '工具',
    'vortex help': 'Vortex 帮助',
    'install vortex': '安装 Vortex',
    'discover vortex': '了解 Vortex',
    'mod updates': '模组更新',
    'recent activity': '最近动态',
    'mod categories': '模组分类',
    'mods of the month': '本月精选模组',
    'top files': '热门文件',
    'collections tutorials': '合集教程',
    'modding tutorials': '模组教程',

    /* ---------- 首页 ---------- */
    'modding made easy': '模组安装，从此简单',
    'browse all mods': '浏览全部模组',
    'browse mods': '浏览模组',
    'downloads': '下载',
    'creator rewards': '创作者奖励',
    'rewards': '奖励',
    'community events': '社区活动',
    'join the modathon': '参加 Modathon 活动',
    'find out more': '了解更多',
    'find out more.': '了解更多。',
    'view all': '查看全部',
    'view more': '查看更多',
    'view more...': '查看更多…',
    'get started': '开始使用',
    'use mods to power up your game': '用模组强化你的游戏',
    'next level graphics': '次世代画面',
    'get massively improved graphics for classics and even brand new games.':
      '让经典游戏乃至最新作品都获得大幅提升的画面。',
    'auto-install 100s of mods': '一键安装数百个模组',
    'browse our mod collections to install 100s of mods without any hassle.':
      '浏览我们的合集，轻松安装数百个模组。',
    'epic new content': '精彩新内容',
    'get free, quality content for your games: new weapons, stories, and more!':
      '免费获取高质量的游戏内容：新武器、新剧情，还有更多！',
    'infinite replayability': '无限重玩价值',
    'mods expand the lifespan of any game - never run out of things to do again!':
      '模组能延长任何游戏的生命周期——永远有新内容可玩！',
    'new': '最新',
    'updated': '最近更新',
    'trending': '趋势',
    'popular': '热门',
    'surprise': '随机',
    'latest': '最新',
    'highest rated': '评分最高',
    'most endorsed': '点赞最多',
    'top pick': '精选',
    '7 days': '7 天',
    '24 hours': '24 小时',
    'get fast downloads with premium': '使用高级版享受高速下载',
    'upgrade to premium': '升级到高级版',
    'browse ad-free': '无广告浏览',
    'popular collections': '热门合集',
    'explore our collections and auto-install hundreds of mods with one click':
      '探索我们的合集，一键自动安装数百个模组',
    'our creators earned over $': '我们的创作者已累计获得超过',
    'share your creations on the': '在以下平台分享你的创作：',
    'biggest modding platform in the world.': '全球最大的模组平台。',
    'get': '获取',
    'exclusive premium perks,': '高级版专属特权，',
    'cash out reward points or': '将奖励积分兑换为现金，或',
    'trade them for new games.': '用积分换取新游戏。',
    'learn more': '了解更多',
    'earn mod rewards': '赢取模组奖励',
    'get free premium': '免费获得高级版',
    'connect with creators': '与创作者交流',
    'get free game keys': '免费领取游戏兑换码',
    'latest news': '最新新闻',
    'a community of': '一个由',
    'passionate gamers and creators': '热情的玩家与创作者组成的社区',
    'come and chat with our': '欢迎来我们的',
    'community.': '社区交流。',
    'join the conversation on our': '来我们的',
    'today.': '参与讨论。',
    'follow us on': '关注我们的',
    'for fresh video content.': '观看最新视频内容。',
    'find out more about modding with our': '通过我们的',
    'mods and collections for': '游戏库覆盖',
    'games.': '款游戏。',
    'no. of mods': '模组数',
    'no. of collections': '合计数',
    'no. of endorsements': '点赞数',
    'skyrim turns 15': '天际 15 周年',
    'celebrate skyrim\'s 15th anniversary with us': '与我们一起庆祝《天际》15 周年',
    'community event': '社区活动',
    'the best screen archery on the internet': '全网最出色的游戏截图社区',

    /* ---------- 游戏页 ---------- */
    'recently added': '最近添加',
    'your favourited games will be displayed here': '你收藏的游戏会显示在这里',
    'game genre': '游戏类型',
    'game genre search': '游戏类型搜索',
    'choose from': '可选',
    'affiliate link': '推广链接',
    'discover offers': '发现优惠',
    'get games to mod, cheaper.': '以更优惠的价格买到可模组的游戏。',
    'download count': '下载量',
    'modding tools': '模组工具',
    'show games with collections': '显示有合集的游戏',
    'show games with collections only': '仅显示有合集的游戏',
    'games with collections': '有合集的游戏',
    'filter': '筛选',
    'hide filters': '收起筛选',
    'show filters': '展开筛选',
    'sort': '排序',
    'apply': '应用',
    'all time': '全部时间',
    'game': '游戏',

    /* ---------- 模组列表 ---------- */
    'browse the internet\'s best mods': '浏览全网最优秀的模组',
    'skyrim special edition mods': 'Skyrim Special Edition 模组',
    'category': '分类',
    'tags': '标签',
    'includes': '包含',
    'excludes': '排除',
    'search parameters': '搜索参数',
    'title': '标题',
    'description': '描述',
    'author': '作者',
    'uploader': '上传者',
    'language support': '语言支持',
    'hide translations': '隐藏翻译版本',
    'content options': '内容选项',
    'hide adult content': '隐藏成人内容',
    'show only adult content': '仅显示成人内容',
    'supported by vortex': '支持 Vortex',
    'show only updated mods': '仅显示有更新的模组',
    'file size': '文件大小',
    'no min': '无下限',
    'no max': '无上限',
    'make mods.': '制作模组。',
    'earn rewards.': '赢取奖励。',
    'date published': '发布日期',
    'asc': '升序',
    'desc': '降序',
    'previous page': '上一页',
    'next page': '下一页',
    'page': '页码',
    'go': '跳转',
    'name': '名称',
    'date uploaded': '上传日期',
    'unique dls': '独立下载',
    'total dls': '总下载',
    'version': '版本',
    'size': '大小',
    'endorsements': '点赞',
    'mod options': '模组操作',
    'downloads earned': '获得的下载量',
    'results': '条结果',
    '20 items': '每页 20 项',

    /* ---------- 模组详情（旧版页面） ---------- */
    'total views': '总浏览量',
    'download:': '下载：',
    'file information': '文件信息',
    'last updated': '最后更新',
    'original upload': '首次上传',
    'created by': '创建者',
    'uploaded by': '上传者',
    'virus scan': '病毒扫描',
    'safe to use': '可安全使用',
    'tags for this mod': '此模组的标签',
    'tag this mod': '为此模组添加标签',
    'files': '文件',
    'images': '图片',
    'videos': '视频',
    'articles': '文章',
    'posts': '评论',
    'logs': '日志',
    'stats': '统计',
    'about this mod': '关于此模组',
    'requirements': '前置要求',
    'permissions and credits': '许可与致谢',
    'credits and distribution permission': '致谢与分发许可',
    'author notes': '作者说明',
    'file credits': '文件致谢',
    'donation points system': '捐赠点数系统',
    'translations': '翻译',
    'translations available on nexus mods': 'Nexus Mods 上已有的翻译',
    'changelogs': '变更日志',
    'changelog': '变更日志',
    'mods using this mod': '使用此模组的模组',
    'donations': '捐赠',
    'collections containing this mod': '包含此模组的合集',
    'show': '展开',
    'spoiler:': '剧透：',
    'straight donations accepted': '接受直接捐赠',
    'main files': '主文件',
    'optional files': '可选文件',
    'old files': '旧版本文件',
    'archived files': '归档文件',
    'miscellaneous files': '其他文件',
    'sort by': '排序方式',
    'version history': '版本历史',
    'you have to be logged in to download files': '需要登录后才能下载文件',
    'register': '注册',
    'mod manager download': '模组管理器下载',
    'manual download': '手动下载',
    'preview file contents': '预览文件内容',
    'files:': '文件：',
    'updated:': '更新于：',

    /* ---------- 评论区 ---------- */
    'log in to search comments': '登录后可搜索评论',
    'pages': '页',
    'jump': '跳转',
    'locked': '已锁定',
    'sticky': '置顶',
    'discussion': '讨论',

    /* ---------- 合集 ---------- */
    'collection type': '合集类型',
    'game version': '游戏版本',
    'badge': '徽章',
    'total overhaul': '全面大修',
    'vanilla plus': '原版增强',
    'themed': '主题向',
    'immersive & adult': '沉浸 & 成人',
    'immersive & pure': '沉浸 & 纯净',
    'adult': '成人',
    'essentials': '基础必备',
    'next-gen graphics': '次世代画面',
    'all-in-one': '一体化',
    'mod manager for installing collections': '用于安装合集的模组管理器',
    'install hundreds of mods with the click of a button.': '点一下按钮即可安装数百个模组。',
    'learn more about collections': '进一步了解合集',
    'easy install': '一键安装',
    'included mods': '包含的模组',
    'this is your primary collection.': '这是你的主合集。',
    'add collection': '添加到合集',
    'add collection (desktop only)': '添加到合集（仅限桌面端）',
    'back to collections': '返回合集',
    'about': '关于',
    'comments': '评论',
    'bugs': '问题反馈',
    'creator notes': '创作者说明',
    'download information': '下载信息',
    'dlc required': '需要 DLC',
    'dls': '下载',
    'adult content': '成人内容',
    'the fastest way to mod': '最快捷的模组安装方式',
    'install vortex here': '在此安装 Vortex',
    'download vortex here': '在此下载 Vortex',
    'watch the vortex tutorial': '观看 Vortex 教程',
    'explore': '探索',
    'browse all collections': '浏览全部合集',
    'show more': '显示更多',
    'show less': '收起',
    'more': '更多',

    /* ---------- 站点偏好设置 ---------- */
    'preferences': '偏好设置',
    'settings': '设置',
    'set the preferences you want when using nexus mods.': '设置你在使用 Nexus Mods 时的偏好。',
    'set your default tabs for the ‘homepage’ and ‘game homepages’.': '设置首页与游戏主页默认打开的标签页。',
    'global': '全局',
    'homepage': '首页',
    'default mods tab': '默认模组标签页',
    'default media tab': '默认媒体标签页',
    'default mod sorting': '默认模组排序',
    'default mod view': '默认模组视图',
    'default quick search': '默认快速搜索',
    'content blocking': '内容屏蔽',
    'blocked users': '已屏蔽用户',
    'turn off images': '关闭图片',
    'turn on images': '开启图片',
    'choose on a per image basis': '按单张图片选择',
    'file downloads open in a pop-up box': '文件下载在弹窗中打开',
    'remind me about file ratings': '提醒我为文件评分',
    'replies to posts bump the original post': '回复帖子会把原帖顶起',
    'show author activity on the files you track': '显示所关注文件的作者动态',
    'show user activity on the files you track': '显示所关注文件的用户动态',
    'show user activity on your files, images and videos': '显示你的文件、图片和视频上的用户动态',
    'show user comments about your files, images and videos': '显示你的文件、图片和视频的用户评论',
    'show user comments on the files you track': '显示所关注文件的用户评论',
    'tracked content updates': '关注内容更新',
    'never': '从不',
    'not set': '未设置',
    'compact': '紧凑',
    'standard': '标准',
    'list': '列表',
    'last comment': '最新评论',
    'mod name': '模组名称',
    'unique downloads': '独立下载',
    'emails': '邮件',
    'analytics': '分析',
    'security': '安全',
    'billing': '账单',
    'moderation': '审核',
    'invitations': '邀请',
    'api keys': 'API 密钥',
    'browse': '浏览',
    'profile': '个人资料',
    'dismiss': '忽略',
    'save': '保存',
    'cancel': '取消',
    'submit': '提交',
    'confirm': '确认',
    'delete': '删除',
    'edit': '编辑',
    'next': '下一步',
    'previous': '上一步',
    'continue': '继续',
    'reset': '重置',
    'done': '完成',
    'sign in': '登录',
    'register here': '点此注册',
    'password': '密码',
    'email or username': '邮箱或用户名',
    'remember me': '记住我',
    'share': '分享',
    'unlock 1-click automated collections': '解锁一键自动安装合集',
    'upgrade': '升级',
    'upgrade your account to unlock all media content.': '升级账户即可解锁全部媒体内容。',
    'supporter images': '支持者图片',
    'this month\'s nominated mods': '本月提名模组',
    'explore this month\'s nominated mods.': '看看本月提名的模组。',
    'drop files here': '将文件拖到此处',
    'download': '下载',
    'endorse': '点赞',
    'endorsed': '已点赞',
    'unendorse': '取消点赞',
    'track': '关注',
    'untrack': '取消关注',
    'favourite': '收藏',
    'favorite': '收藏',
    'report': '举报',

    'search results': '搜索结果',
    'revision': '修订',
    'published': '发布于',
    'total': '总计',
    'unique': '独立',
    'view changelog': '查看变更日志',
    'mods by': '模组作者',
    'one-click collection downloads in the last hour with': '次一键合集安装已完成（过去一小时），使用',
    'published:': '发布于：',

    'views': '浏览',
    'aesthetics': '美学',
    'funny': '搞笑',
    'narrative': '叙事',
    'poses': '姿势',
    'cold': '寒冷',
    'landscape': '风景',
    'characters': '角色',
    'action': '动作',
    'adventure': '冒险',

    'collection': '合集',
    'wabbajack list': 'Wabbajack 列表',

    /* ---------- 账户中心（users 子域） ---------- */
    'error': '错误',
    'you are already signed in.': '你已登录。',
    'please validate your email': '请验证你的邮箱',
    'click here to resend': '点此重新发送',
    'two-factor authentication': '双重验证（2FA）',
    'active': '已启用',
    'not active': '未启用',
    'disable 2fa': '关闭 2FA',
    'setup 2fa': '设置 2FA',
    'change email': '修改邮箱',
    'change password': '修改密码',
    'account recovery (temporarily disabled)': '账户找回（暂时停用）',
    'sms account recovery is no longer available.': '短信账户找回已不再提供。',
    'read more about account recovery': '了解账户找回的更多说明',
    'delete account': '删除账户',
    'current password': '当前密码',
    'new email': '新邮箱',
    'enter the': '请输入',
    '6-digit verification code': '6 位验证码',
    'generated by the app.': '（由验证器生成）。',
    '2fa key': '2FA 密钥',
    'new password': '新密码',
    'passwords must have:': '密码需满足：',
    '12 or more characters': '至少 12 个字符',
    'uppercase & lowercase': '包含大小写字母',
    'at least one number': '至少包含一个数字',
    'confirm new password': '确认新密码',
    'passwords must match': '两次输入的密码需一致',
    'delete your account': '删除你的账户',
    'username;': '用户名；',
    'e-mail address;': '电子邮箱；',
    'profile data;': '个人资料数据；',
    'preferences and settings;': '偏好与设置；',
    'turn off two-factor authentication': '关闭双重验证',
    'recovery codes can also be used to disable 2fa.': '恢复码同样可用于关闭 2FA。',
    'enter verification code': '输入验证码',
    'install app': '安装应用',
    'scan qr code': '扫描二维码',
    'link 2fa': '关联 2FA',
    '2fa key (manual entry)': '2FA 密钥（手动输入）',
    'open authentication app': '打开验证器应用',
    'verify 2fa': '验证 2FA',
    'enable 2fa': '启用 2FA',
    '2fa is activated': '2FA 已启用',
    '2fa backup keys': '2FA 备用密钥',
    'copy': '复制',
    'download .txt': '下载 .txt',
    'verify your email': '验证你的邮箱',
    'resend email': '重新发送邮件',
    "can't see the email?": '没收到邮件？',
    'delete the account?': '要删除账户吗？',
    'mods you uploaded': '你上传的模组',
    '(manage your mods)': '（管理你的模组）',
    'images you uploaded': '你上传的图片',
    '(manage your images)': '（管理你的图片）',
    'content of your posts': '你发布的内容',
    '(review your posts)': '（查看你的帖子）',
    'how do i stop recurring payments?': '如何停止自动续费？',
    'help article': '帮助文章',
    'or contact': '或联系',
    'keep my account': '保留我的账户',
    'delete my account': '删除我的账户',
    'account recovery': '账户找回',
    'edit profile': '编辑个人资料',
    'profile views': '主页浏览量',
    'kudos received': '收到的声望',
    'endorsements given': '已给出的点赞',
    'joined': '注册时间',
    'last active': '最近活跃',
    'about me': '关于我',
    'my stuff': '我的内容',
    'learn from the community with tutorials and guides.': '通过教程和指南向社区学习。',
    'vortex mod manager': 'Vortex 模组管理器',
    'the elegant, powerful and open-source mod manager.': '优雅、强大且开源的模组管理器。',
    'upload image': '上传图片',
    'upload video': '上传视频',
    'mod news': '模组新闻',
    'faq': '常见问题',
    'authors': '作者',
    "mods you're tracking": '你关注的模组',
    'tracked mods': '关注的模组',
    'my tracked mods': '我关注的模组',
    'last upload': '上次上传',
    'last download': '上次下载',
    'order': '排序',
    'updates': '更新',
    'highlight updates': '高亮更新',
    'log': '日志',
    'tracking': '关注',
    'view': '查看',
    'stop tracking': '取消关注',
    'appearance': '外观',
    'the powerful open-source mod manager from nexus mods.': '来自 Nexus Mods 的强大开源模组管理器。',
    'add': '添加',
    'or': '或',
    'other': '其他',
    'author:': '作者：',
    'link a new video': '关联新视频',
    'mod file requirements': '模组文件要求',
    'pick one of these': '选择其中一项',
    'main file': '主文件',
    'file archive': '归档文件',
    'alternatively use': '或者使用',
    'patch for': '适用于',
    'buy now': '立即购买',
    'free trial': '免费试用',
    'more time playing': '更多游戏时间',
    'no manual steps required': '无需手动操作',
    'more time playing your games': '把更多时间留给游戏',
    'get hundreds of curated mods the easy way and': '轻松获取数百个精选模组，',
    'make it one click with premium': '使用高级版即可一键完成',
    'vortex support': 'Vortex 支持',
    'donate': '捐赠',
    'get hundreds of curated mods the easy way': '轻松获取数百个精选模组',
    'make it 1-click with premium': '使用高级版即可一键安装',
    '10x faster': '快 10 倍',
    'with premium': '使用高级版',
    'max speeds': '满速下载',
    'and more.': '以及更多。',
    'get max speeds and more': '获取满速下载及更多权益',
    'try premium. go': '试用高级版。',
    'disable ad-block for 2x speeds': '关闭广告拦截即可获得 2 倍速度',
    'this mod is': '此模组',
    'opted-in': '已加入',
    'to receive donation points': '捐赠点数计划',
    "other user's assets": '他人素材',
    'upload permission': '上传许可',
    'modification permission': '修改许可',
    'conversion permission': '转换许可',
    'asset use permission': '素材使用许可',
    'asset use permission in mods/files that are being sold': '在售卖的模组或文件中使用素材',
    'asset use permission in mods/files that earn donation points': '在赚取捐赠点数的模组或文件中使用素材',
    "there's nothing here yet": '这里还没有内容',
    'two-factor authentication is an extra layer of security for your nexus mods account.':
      '双重验证能为你的 Nexus Mods 账户增加一层安全保障。',
    'account': '账户',

    /* ---------- 模组页其余按钮 ---------- */
    'manual': '手动',
    'vote': '投票',
    'votes': '投票',
    'add media': '添加媒体',
    'report abuse': '举报滥用',
    'show all': '显示全部',
    'mod details': '模组详情',
    'no results': '无结果',
    'no results found': '未找到结果',
    'search...': '搜索…',
    'you haven\'t downloaded this mod yet': '你还没有下载过此模组',
    'you have already downloaded this mod': '你已经下载过此模组',
    'additional files': '附加文件',
    'all content': '全部内容',
    'users': '用户',
    'images added by the author in the image description': '图片描述中作者添加的图片',

    /* ---------- 模组分类（站点通用分类集） ---------- */
    'alchemy': '炼金',
    'animation': '动画',
    'animations': '动画',
    'armour': '护甲',
    'armour - shields': '护甲 - 盾牌',
    'audio': '音频',
    'body, face, and hair': '身体、面部与头发',
    'bug fixes': 'Bug 修复',
    'bug fixes & optimization (non-skse)': 'Bug 修复与优化（非 SKSE）',
    'buildings': '建筑',
    'cheats and god items': '作弊与神级物品',
    'cities, towns, villages, and hamlets': '城市、城镇与村庄',
    'clothing and accessories': '服装与饰品',
    'clothing': '服装',
    'collectables, treasure hunts, and puzzles': '收集、寻宝与解谜',
    'combat': '战斗',
    'crafting': '制作',
    'creatures and mounts': '生物与坐骑',
    'creatures': '生物',
    'dungeons': '地下城',
    'environment': '环境',
    'environmental': '环境',
    'followers & companions': '随从与同伴',
    'followers & companions - creatures': '随从与同伴 - 生物',
    'gameplay': '玩法',
    'guilds/factions': '公会/阵营',
    'immersion': '沉浸感',
    'items and objects - player': '物品与物件 - 玩家',
    'items and objects - world': '物品与物件 - 世界',
    'lighting': '光照',
    'locations - new': '地点 - 新增',
    'locations - vanilla': '地点 - 原版',
    'magic - gameplay': '魔法 - 玩法',
    'magic - spells & enchantments': '魔法 - 法术与附魔',
    'misc': '杂项',
    'miscellaneous': '杂项',
    'models': '模型',
    'models and textures': '模型与贴图',
    'modders resources': '模组作者资源',
    'music': '音乐',
    'overhauls': '大修',
    'patches': '补丁',
    'player homes': '玩家住宅',
    'presets': '预设',
    'presets - enb and reshade': '预设 - ENB 与 ReShade',
    'quality of life': '体验优化',
    'quests and adventures': '任务与冒险',
    'races, classes, and birthsigns': '种族、职业与星座',
    'save games': '存档',
    'shaders': '着色器',
    'shouts': '龙吼',
    'skills and leveling': '技能与升级',
    'sound': '音效',
    'stealth': '潜行',
    'textures': '贴图',
    'ui': '界面',
    'user interface': '用户界面',
    'utilities': '实用工具',
    'utilities for modders': '模组作者工具',
    'utilities for players': '玩家实用工具',
    'visuals and graphics': '视觉与画面',
    'weapons': '武器',
    'weapons and armour': '武器与护甲',
    'weather': '天气',

    /* ---------- 合集标签 ---------- */
    'fair and balanced': '平衡友好',
    'items': '物品',
    'lore-friendly': '符合世界观',
    'magic': '魔法',
    'visual': '视觉',
    'hardcore': '硬核',
    'performance': '性能优化',
    'graphics': '画面',
    'exploration': '探索',
    'roleplay': '角色扮演',
    'localization': '本地化',
    'utility': '实用工具',
    'followers': '随从',
    'new lands': '新地图',
    'new quests': '新任务',
    'dlc-sized': 'DLC 级内容',

    /* ---------- 游戏类型 ---------- */
    'dungeon crawl': '地牢探索',
    'fighting': '格斗',
    'hack and slash': '动作砍杀',
    'horror': '恐怖',
    'indie': '独立',
    'metroidvania': '银河恶魔城',
    'platformer': '平台跳跃',
    'puzzle': '解谜',
    'racing': '竞速',
    'sandbox': '沙盒',
    'simulation': '模拟',
    'space sim': '太空模拟',
    'sports': '体育',
    'strategy': '策略',
    'survival': '生存',
    'third-person shooter': '第三人称射击',
    'visual novel': '视觉小说',

    /* ---------- 语言名 ---------- */
    'language': '语言',
    'afrikaans': '南非荷兰语',
    'arabic': '阿拉伯语',
    'belarusian': '白俄罗斯语',
    'chinese': '中文',
    'czech': '捷克语',
    'danish': '丹麦语',
    'dutch': '荷兰语',
    'english': '英语',
    'finnish': '芬兰语',
    'french': '法语',
    'german': '德语',
    'greek': '希腊语',
    'hebrew': '希伯来语',
    'hungarian': '匈牙利语',
    'indonesian': '印尼语',
    'italian': '意大利语',
    'japanese': '日语',
    'korean': '朝鲜语',
    'norwegian': '挪威语',
    'polish': '波兰语',
    'portuguese': '葡萄牙语',
    'portuguese (brazil)': '葡萄牙语（巴西）',
    'portuguese (portugal)': '葡萄牙语（葡萄牙）',
    'romanian': '罗马尼亚语',
    'russian': '俄语',
    'simplified chinese': '简体中文',
    'spanish': '西班牙语',
    'spanish (latin america)': '西班牙语（拉美）',
    'spanish (spain)': '西班牙语（西班牙）',
    'swedish': '瑞典语',
    'thai': '泰语',
    'traditional chinese': '繁体中文',
    'turkish': '土耳其语',
    'ukrainian': '乌克兰语',
    'vietnamese': '越南语',
  };

  /* ==========================================================================
   * 2. 正则规则（按顺序匹配整段文本）
   * ========================================================================== */

  const UNIT = { second: '秒', minute: '分钟', hour: '小时', day: '天', week: '周', month: '个月', year: '年' };

  /** 把 "about 6 years ago" / "2 hours ago" 片段译成中文 */
  function translateAgoPiece(s) {
    const m = s.match(/^(?:about )?(\d+|an?) (second|minute|hour|day|week|month|year)s? ago$/i);
    if (!m) return s;
    const n = /^an?$/i.test(m[1]) ? '1' : m[1];
    const about = /^about\s/i.test(s) ? '约 ' : '';
    return `${about}${n} ${UNIT[m[2].toLowerCase()]}前`;
  }

  const RULES = [
    /* 相对时间 */
    { re: /^about (\d+) (year|month|day|hour)s? ago$/i, to: (m) => `约 ${m[1]} ${UNIT[m[2].toLowerCase()]}前` },
    { re: /^welcome back (.+)$/i, to: '欢迎回来，$1' },
    { re: /^step (\d+)$/i, to: '第 $1 步' },
    { re: /^requires \((\d+)\)$/i, to: '需要（$1）' },
    { re: /^included in ([\d,]+) collections?$/i, to: '已收录于 $1 个合集' },
    { re: /^your download speed is limited to (.+)\. go premium for$/i, to: '你的下载速度上限为 $1，升级高级版可解锁' },
    {
      re: /^copyright © (\d{4}) black tree gaming ltd\. all rights reserved\.$/i,
      to: '版权所有 © $1 Black Tree Gaming Ltd. 保留所有权利。',
    },
    { re: /^your password was last updated (.+)\.$/i, to: (m) => `你的密码上次更新于 ${translateAgoPiece(m[1])}。` },
    { re: /^just now$/i, to: '刚刚' },
    { re: /^a few seconds ago$/i, to: '几秒前' },
    { re: /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i, to: (m) => `${m[1]} ${UNIT[m[2].toLowerCase()]}前` },
    { re: /^an?\s+(second|minute|hour|day|week|month|year)\s+ago$/i, to: (m) => `1 ${UNIT[m[1].toLowerCase()]}前` },
    /* 时间间隔选项：1 days / 24 Hours / 1 Year */
    { re: /^(\d+)\s+(second|minute|hour|day|week|month|year)s?$/i, to: (m) => `${m[1]} ${UNIT[m[2].toLowerCase()]}` },

    /* 绝对日期：06 May 2026, 6:41AM */
    {
      re: /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)?$/i,
      to: (m) => `${fmtDate(m[1], m[2], m[3])} ${fmtTime(m[4], m[5], m[6])}`,
    },
    /* 绝对日期：09 Nov 2026 */
    {
      re: /^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/,
      to: (m) => fmtDate(m[1], m[2], m[3]),
    },
    /* 新闻条目：Mod News • 6 Nov 2026 */
    {
      re: /^([A-Za-z][A-Za-z ]{1,20})\s*•\s*(.+)$/,
      to: (m) => {
        const pre = DICT[m[1].trim().toLowerCase()];
        const d = collapse(m[2]).match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
        if (!pre || !d) return null;
        return `${pre} • ${fmtDate(d[1], d[2], d[3])}`;
      },
    },

    /* 计数 */
    { re: /^(\d+) additional files? required$/i, to: '还需要 $1 个附加文件' },
    { re: /^([\d,.]+[km]?)\s+results?$/i, to: '$1 条结果' },
    { re: /^([\d,]+)\s+mods?$/i, to: '$1 个模组' },
    { re: /^([\d,]+)\s+collections?$/i, to: '$1 个合集' },
    { re: /^([\d,]+)\s+items?$/i, to: '$1 项' },
    { re: /^([\d,]+)\s+comments?$/i, to: '$1 条评论' },
    { re: /^([\d,]+)\s+languages?$/i, to: '$1 种语言' },
    { re: /^([\d,]+)\s+files?$/i, to: '$1 个文件' },
    { re: /^([\d,]+)\s+results?$/i, to: '$1 条结果' },
    { re: /^mods using this mod \((\d[\d,]*)\)$/i, to: '使用此模组的模组（$1）' },
    { re: /^mods using this mod$/, to: '使用此模组的模组' },
    { re: /^(\d[\d,]*)\s+items$/i, to: '$1 项' },

    /* 搜索标题：Search results for “skyui” */
    { re: /^search results for [“"']?(.+?)[”"']?$/i, to: '“$1”的搜索结果' },
    { re: /^([\d,]+)\s+results?$/i, to: '$1 条结果' },

    /* 服务器响应：Served in 0.398s */
    { re: /^served in ([\d.]+)s$/i, to: '响应耗时 $1 秒' },
    { re: /^page served in ([\d.]+)s$/i, to: '页面响应耗时 $1 秒' },

    /* 属性类：Bookmark XXX */
    { re: /^bookmark (.+)$/i, to: '收藏 $1' },
    { re: /^follow us on (.+)$/i, to: '在 $1 上关注我们' },
    { re: /^join us on (.+)$/i, to: '加入我们的 $1' },

    { re: /^view all \((\d+)\)$/i, to: '查看全部（$1）' },
    { re: /^view all ([\d,]+) authors$/i, to: '查看全部 $1 位作者' },
    /* 标题：<游戏名> mods / collections / images / videos */
    { re: /^([A-Za-z0-9 :'&.\-]{2,40}) (mods|collections|images|videos)$/i, to: (m) => `${m[1]} ${DICT[m[2].toLowerCase()] || m[2]}` },
    { re: /^(.+) one-click collection downloads in the last hour with$/i, to: '过去一小时内已完成 $1 次一键合集安装，来自' },

    /* 杂项 */
    { re: /^get (\d+) days? free$/i, to: '免费试用 $1 天' },
    { re: /^(\d+) days? free$/i, to: '免费 $1 天' },
    { re: /^v?(\d{4}\.\d{4}\.\d{4})\s*\|\s*(.+)$/i, to: '$1 | $2' },
  ];

  /* ==========================================================================
   * 3. 作用域词典（只在指定容器内生效，用于被标签切开的句子碎片）
   * ========================================================================== */

  const SCOPED = [
    {
      sel: '.user-profile-menu-premium-banner-content-text, .nav-mobile-profile .user-profile-menu-premium-banner-content-text',
      map: { 'unlock': '解锁', ',': '、', 'and': '和', '.': '。' },
    },
    {
      sel: '[class*="max-w-72"][class*="flex-col"]',
      map: {
        'get fast downloads with': '高速下载，来自',
        'to': '即可',
        ', get': '，畅享',
        'and': '、',
        '.': '。',
      },
    },
    {
      sel: '.max-w-3xl',
      map: { 'get': '获取', 'share your creations on the': '在以下平台分享你的创作：' },
    },
    {
      sel: '.space-y-2.rounded',
      map: {
        'come and chat with our': '欢迎来我们的',
        'community.': '社区交流。',
        'join the conversation on our': '来我们的',
        'today.': '参与讨论。',
        'follow us on': '关注我们的',
        'for fresh video content.': '观看最新视频内容。',
        'find out more about modding with our': '通过我们的',
        'wiki.': '维基了解更多模组知识。',
      },
    },
    {
      sel: '.forgot-email-password-label',
      map: { 'forgot your': '忘记' },
    },
    {
      sel: '[data-e2eid$="-filter"]',
      map: { 'to': '至' },
    },
    {
      sel: '.new-new-premium-banner',
      map: { 'go': '', 'with premium': '，需高级版', 'and': '，' },
    },
    {
      sel: '.permissions',
      map: {
        'you will need to seek permission from': '你需要先征得',
        'these': '这些',
        'authors before you can use their assets': '作者的许可才能使用其素材。',
      },
    },
    {
      sel: '.jumbotron',
      map: { 'manage your': '管理你的', 'info': '信息', 'privacy': '隐私', 'and': '和', ',': '，' },
    },
    {
      sel: '[class*="2fa-entry"], .modal-body',
      map: {
        'on your phone, download and install': '在手机上下载并安装',
        'or another authentication app such as': '或其他验证器应用，例如',
        'if you have questions about this process please consult our': '如对本流程有疑问，请查阅我们的',
      },
    },
    {
      sel: '.max-width-520',
      map: { 'you need to': '请先', 'before continuing.': '后继续。' },
    },
  ];

  /* ==========================================================================
   * 4. 排除区域：用户内容、图标字体、代码等一律不动
   * ========================================================================== */

  const EXCLUDE_SEL = [
    '[data-nxmzh-skip]',
    '[class*="material-icons"]',
    '[class*="nmicon"]',
    'code', 'pre', 'kbd', 'samp', 'textarea',
    /* 用户生成内容 */
    '.mod_description_container',
    '.comment-content-text',
    '.prose-lexical',
    '.prose',
    '.bbcode',
    '[data-e2eid="mod-tile-title"]',
    '[data-e2eid="mod-tile-summary"]',
    '[data-e2eid="user-link"]',
    '[data-e2eid="mod-tile-game"]',
    '[data-e2eid="media-tile-title"]',
    '[data-e2eid="media-tile-author"]',
    '[data-e2eid="media-tile-summary"]',
    '[data-e2eid="collection-tile-title"]',
    '[data-e2eid="collection-tile-summary"]',
    '[data-e2eid="collection-tile-author"]',
    '.mod-tile-title',
    '.user-profile-menu-username',
    '#comment-container .comment-name',
    '.comment-name',
    '[contenteditable="true"]',
    '.bbcode_spoiler_content',
  ].join(',');

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'SVG', 'PATH',
    'IFRAME', 'CANVAS', 'TEMPLATE', 'INPUT', 'SELECT',
  ]);

  /* ==========================================================================
   * 5. 属性翻译
   * ========================================================================== */

  const ATTRS = ['placeholder', 'title', 'aria-label'];
  const ATTR_SKIP_SEL = '[data-nxmzh-skip]';

  const ATTR_DICT = {
    'show search': '打开搜索',
    'mods filter': '模组筛选',
    'time': '时间',
    'desktop footer': '页面页脚',
    'mod options': '模组操作',
    'search games': '搜索游戏',
    'search mods': '搜索模组',
    'search collections': '搜索合集',
    'search images': '搜索图片',
    'search videos': '搜索视频',
    'search users': '搜索用户',
    'close': '关闭',
    'open profile menu': '打开个人菜单',
    'open navigation menu': '打开导航菜单',
    'close navigation menu': '关闭导航菜单',
    'bookmark': '收藏',
    'toggle navigation': '切换导航',
    'previous image': '上一张图片',
    'next image': '下一张图片',
    'full screen': '全屏',
  };

  /* ==========================================================================
   * 6. 引擎
   * ========================================================================== */

  const ENABLED_KEY = 'nxmzh.enabled';

  /** 单个节点出错不应中断整页翻译；错误记录下来供自查 */
  const errors = [];
  function guard(fn) {
    try { fn(); } catch (e) {
      if (errors.length < 5) errors.push(String((e && e.message) || e));
    }
  }

  const state = {
    enabled: readEnabled(),
    translatedNodes: new WeakMap(),
    observedRoots: new WeakSet(),
  };

  function readEnabled() {
    try { return localStorage.getItem(ENABLED_KEY) !== '0'; } catch { return true; }
  }
  function writeEnabled(v) {
    try { localStorage.setItem(ENABLED_KEY, v ? '1' : '0'); } catch { /* 忽略私有模式限制 */ }
  }

  function isExcluded(node) {
    let el = node.parentElement;
    while (el) {
      if (el.matches && el.matches(EXCLUDE_SEL)) return true;
      el = el.parentElement || (el.getRootNode && el.getRootNode().host) || null;
    }
    return false;
  }

  function lookupScoped(node, text) {
    const key = text.toLowerCase();
    const parent = node.parentElement;
    if (!parent) return null;
    for (const s of SCOPED) {
      if (!Object.prototype.hasOwnProperty.call(s.map, key)) continue;
      if (parent.closest(s.sel)) return s.map[key];
    }
    return null;
  }

  function translateText(text, node) {
    /* 作用域词典更具体，优先于全局词典 */
    if (node) {
      const scoped = lookupScoped(node, text);
      if (scoped != null) return scoped;
    }

    const key = text.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(DICT, key)) return DICT[key];

    for (const rule of RULES) {
      const m = text.match(rule.re);
      if (!m) continue;
      const out = typeof rule.to === 'function' ? rule.to(m) : text.replace(rule.re, rule.to);
      if (out != null) return out;
    }

    return null;
  }

  function handleTextNode(node) {
    if (node.nodeType !== 3) return;
    if (node.parentElement && node.parentElement.tagName === 'TITLE') return;  // 标题由 translateTitle 单独处理
    const raw = node.nodeValue;
    if (!raw || raw.length > 220) return;
    const hasLetter = /[A-Za-z]/.test(raw);
    if (!hasLetter && raw.trim().length > 2) return;

    const prev = state.translatedNodes.get(node);
    if (prev && raw === prev.out) return;   // 已是译文

    const core = collapse(raw);
    if (!core) return;
    if (isExcluded(node)) return;

    const t = hasLetter ? translateText(core, node) : lookupScoped(node, core);
    if (t == null || t === core) return;

    const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    node.nodeValue = m[1] + t + m[3];
    state.translatedNodes.set(node, { src: raw, out: node.nodeValue });
  }

  function handleAttributes(el) {
    if (!el.getAttribute) return;
    if (el.matches(ATTR_SKIP_SEL)) return;
    if (isExcluded(el)) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const core = collapse(v);
      if (!core || !/[A-Za-z]/.test(core)) continue;
      let t = ATTR_DICT[core.toLowerCase()];
      if (t == null) t = translateText(core, el);
      if (t == null || t === core) continue;
      el.setAttribute(a, t);
    }
    if (el.tagName === 'INPUT' && /^(submit|button)$/i.test(el.type || '')) {
      const v = el.value;
      if (v && /[A-Za-z]/.test(v)) {
        const t = translateText(collapse(v), el);
        if (t && t !== v) el.value = t;
      }
    }
  }

  /** 遍历子树（含 Shadow DOM），翻译文本与属性 */
  function processSubtree(root) {
    if (!state.enabled) return;
    if (root.nodeType === 3) { handleTextNode(root); return; }
    if (!root.querySelectorAll && !root.childNodes) return;

    const shadowRoots = [];
    if (root.nodeType === 1) {
      handleAttributes(root);
      if (root.shadowRoot) shadowRoots.push(root.shadowRoot);
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(n) {
          if (n.nodeType === 3) {
            const p = n.parentElement;
            if (!p || SKIP_TAGS.has(p.nodeName)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
          if (n.nodeName === 'SCRIPT' || n.nodeName === 'STYLE' || n.nodeName === 'SVG'
              || n.nodeName === 'NOSCRIPT' || n.nodeName === 'IFRAME') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) { guard(() => handleTextNode(n)); continue; }
      if (n.hasAttribute('placeholder') || n.hasAttribute('title') || n.hasAttribute('aria-label')
          || n.tagName === 'INPUT') {
        guard(() => handleAttributes(n));
      }
      if (n.shadowRoot) shadowRoots.push(n.shadowRoot);
    }

    for (const sr of shadowRoots) {
      observeRoot(sr);
      processSubtree(sr);
    }
  }

  function observeRoot(root) {
    if (state.observedRoots.has(root)) return;
    state.observedRoots.add(root);
    new MutationObserver(onMutations).observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
  }

  function onMutations(records) {
    if (!state.enabled) return;
    for (const rec of records) {
      if (rec.type === 'characterData') {
        guard(() => handleTextNode(rec.target));
      } else if (rec.type === 'attributes') {
        guard(() => handleAttributes(rec.target));
      } else {
        for (const node of rec.addedNodes) {
          if (node.nodeType === 3) guard(() => handleTextNode(node));
          else if (node.nodeType === 1) guard(() => processSubtree(node));
        }
      }
    }
  }

  /* 文档标题：只替换其中固定的界面词，保留游戏名与品牌名 */
  const TITLE_PAIRS = [
    [/mods and community/i, '模组与社区'],
    [/\bmods\b/i, '模组'],
    [/\bcollections\b/i, '合集'],
    [/\bimages\b/i, '图片'],
    [/\bvideos\b/i, '视频'],
    [/search results/i, '搜索结果'],
    [/preferences/i, '偏好设置'],
    [/settings/i, '设置'],
    [/\busers\b/i, '用户'],
    [/page not found/i, '页面不存在'],
  ];

  function translateTitle() {
    if (!state.enabled) return;
    const t = document.title;
    if (!t || !/[A-Za-z]/.test(t)) return;
    const BRAND = '@@NEXUS_MODS@@';
    let out = t.replace(/Nexus Mods/g, BRAND);
    for (const [re, rep] of TITLE_PAIRS) out = out.replace(re, rep);
    out = out.split(BRAND).join('Nexus Mods');
    if (out !== t) document.title = out;
  }

  /* 捕获后创建的 Shadow Root（自定义元素常用） */
  /** 开发自查：列出页面上仍未翻译的短文本（含 Shadow DOM） */
  function report() {
    const out = [];
    const walk = (root, path) => {
      const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) {
        if (n.nodeType === 1) {
          if (n.shadowRoot) walk(n.shadowRoot, path + ' >> ' + n.tagName.toLowerCase());
          continue;
        }
        const raw = n.nodeValue;
        if (!raw || !/[A-Za-z]{2}/.test(raw)) continue;
        if (/[一-鿿]/.test(raw)) continue;
        const t = collapse(raw);
        if (!t || t.length > 70) continue;
        if (state.translatedNodes.get(n)) continue;
        if (isExcluded(n)) continue;
        if (DICT[t.toLowerCase()]) continue;
        const chain = [];
        let el = n.parentElement;
        for (let i = 0; i < 4 && el; i++, el = el.parentElement) {
          chain.push(el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''));
        }
        out.push({ t, p: path + ' > ' + chain.join(' < ') });
      }
    };
    walk(document.body, 'body');
    return out;
  }

  function hookShadowRoots() {
    const proto = Element.prototype;
    const orig = proto.attachShadow;
    if (!orig || orig.__nxmzhPatched) return;
    const patched = function (init) {
      const sr = orig.call(this, init);
      try {
        observeRoot(sr);
        processSubtree(sr);
      } catch { /* 忽略单个组件异常 */ }
      return sr;
    };
    patched.__nxmzhPatched = true;
    proto.attachShadow = patched;
  }

  /* ==========================================================================
   * 7. 启动
   * ========================================================================== */

  function run() {
    try {
      observeRoot(document.documentElement);
      hookShadowRoots();
      if (document.body) processSubtree(document.body);
      if (document.head) {
        new MutationObserver(() => translateTitle()).observe(document.head, { childList: true, subtree: true, characterData: true });
      }
      translateTitle();
    } catch (e) {
      console.warn('[NexusMods 汉化] 初始化失败：', e);
    }
  }

  function registerMenu() {
    if (typeof GM_registerMenuCommand !== 'function') return;
    GM_registerMenuCommand(state.enabled ? '暂时显示英文原文' : '切换为中文界面', () => {
      state.enabled = !state.enabled;
      writeEnabled(state.enabled);
      location.reload();
    });
  }

  registerMenu();
  try {
    window.__nxmzhReport = report;
    window.__nxmzhErrors = errors;
  } catch { /* 忽略 */ }

  if (document.body) {
    run();
  } else {
    /* document-start 阶段可能连 <html> 都还不存在，直接观察 document 本身 */
    const boot = new MutationObserver(() => {
      if (!document.body) return;
      boot.disconnect();
      run();
    });
    boot.observe(document, { childList: true, subtree: true });
  }
})();
