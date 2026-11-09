# NexusMods 界面汉化

一个用户脚本，把 [Nexus Mods](https://www.nexusmods.com/) 的**站点界面**翻译成简体中文，同时**不改动用户内容**——模组标题、作者名、描述、评论、合集说明等一律保持原文。

适用于 Tampermonkey / Violentmonkey，支持 Nexus Mods 目前并存的新版 React 页面与旧版模组页。

## 安装

先安装一个用户脚本管理器：[Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。

### 方式一：从 Greasy Fork 安装（推荐）

1. 打开发布页：<https://greasyfork.org/zh-CN/scripts/604540>
2. 点击页面上的「安装此脚本」。
3. 安装完成后打开 Nexus Mods，界面即为中文。

Greasy Fork 分发的安装文件自带 `@downloadURL` / `@updateURL`，之后的版本更新由 Greasy Fork 推送，脚本管理器会提示升级，无需回到本仓库操作。

### 方式二：从本仓库安装

点击安装：**<https://raw.githubusercontent.com/wakaba-mark/nexusmods-zh/refs/heads/main/nexusmods-zh.user.js>**

也可以下载 `nexusmods-zh.user.js` 后拖进浏览器窗口，或在脚本管理器里新建脚本粘贴内容保存。这种方式不携带自动更新地址，升级时需要重新安装，或用脚本管理器的「检查更新」手动比对。

安装完成后打开 Nexus Mods，界面即为中文。

需要停用中文时，点脚本管理器的图标菜单 →「暂时显示英文原文」，刷新后生效；再次点击恢复。

## 翻译范围

| 区域 | 内容 |
| --- | --- |
| 顶栏 / 导航 / 页脚 | 主导航、游戏切换、搜索、通知、个人菜单、站点页脚 |
| 首页 | 各板块标题、排序页签、宣传语、社区卡片 |
| 游戏库 / 游戏主页 | 游戏类型筛选、筛选面板、游戏卡片统计 |
| 模组列表 | 分类树、标签筛选、语言支持、内容选项、排序、分页、结果计数 |
| 模组详情 | 统计栏、文件信息、标签、页签、前置要求、许可与致谢、翻译表、变更日志标题、下载信息 |
| 文件页 | 文件分组标题、排序下拉、版本历史，以及下载按钮（含 Shadow DOM 组件内的「模组管理器下载 / 手动下载 / 预览文件内容」） |
| 评论区 | 评论计数、分页、锁定 / 置顶标记 |
| 合集 | 合集类型与筛选、卡片标签与统计、合辑详情页签（关于 / 模组 / 评论 / 变更日志 / 问题反馈） |
| 图片 | 图片分类、浏览量等统计标签 |
| 搜索页 | 结果标题、分区标题、结果计数 |
| 站点偏好设置 | 全部设置项标签与说明 |
| 账户中心 | 安全页、双重验证流程、修改邮箱 / 密码、删除账户等对话框 |
| 个人主页 / 关注中心 | 统计标签、关注列表表头、筛选与排序项 |
| 其他 | 404 页、时间与日期本地化、`placeholder` / `title` / `aria-label` 提示文本 |

**刻意不翻译**（避免破坏信息与可用性）：

- 模组 / 合集 / 图片的标题、摘要、作者名
- 模组描述、评论正文、合集创作者说明
- 游戏名称与品牌名（Nexus Mods、Vortex、SKSE 等）
- 图标字体的内部名称、文件版本号、体积、哈希
- 游戏内自定义分类与标签（仅覆盖站点通用分类集）

## 行为细节

- **日期本地化**：`6 Nov 2026` → `2026-11-06`，`06 May 2026, 6:41AM` → `2026-05-06 06:41`，`7 minutes ago` → `7 分钟前`。
- **动态内容**：通过 `MutationObserver` 监听 DOM，路由切换、筛选、分页、下拉、弹窗中新出现的文本会继续翻译。
- **Shadow DOM**：自动进入 Web Component 的 shadow root，并接管后创建的 shadow root（下载按钮、搜索框、试用横幅等）。
- **故障隔离**：单个文本节点出错不会中断整页翻译。

## 发布与同步

本仓库与 [Greasy Fork](https://greasyfork.org/zh-CN/scripts/604540) 上的发布版本通过「源代码同步」关联：

- Greasy Fork 定期从 `main` 分支的 `nexusmods-zh.user.js` 拉取，检测到 `@version` 递增即发布新版本；
- 脚本页的说明文字来自 [`description.md`](description.md)，同样通过同步更新；
- 发布新版本的流程：修改脚本 → 递增 `@version` → 提交并推送 → Greasy Fork 自动跟进（也可在其脚本管理页手动触发同步）。

## 定制与扩展

脚本是单文件，按段落组织，加词条不需要了解整个引擎：

| 段落 | 用途 |
| --- | --- |
| `DICT` | 精确词条，key 为小写、空白折叠后的整段文本。绝大多数词条加在这里 |
| `RULES` | 正则规则，处理带数字 / 日期的文案（`12 results`、`3 days ago`、`Step 2`…） |
| `SCOPED` | 只在指定容器内生效的词典，用于被 `<strong>` / `<span>` 切碎的整句 |
| `EXCLUDE_SEL` | 不翻译的区域（用户内容、图标字体、代码块） |
| `ATTR_DICT` | `placeholder` / `title` / `aria-label` 属性词典 |

查漏译：在页面控制台执行 `__nxmzhReport()`，会列出当前页面仍为英文的短文本及其所在位置，便于补词条。

## 已知限制

- 论坛 `forums.nexusmods.com` 是另一套界面，本脚本未覆盖。
- 各游戏专属的自定义分类 / 标签保持英文，只覆盖站点通用分类集与常见类型。
- 若站点改版调整了用户内容区块的 class，个别描述可能被误翻，可在 `EXCLUDE_SEL` 中补充选择器。
- 站点使用 Cloudflare，频繁刷新可能触发人机验证，与脚本无关。

## 声明

本项目为非官方汉化脚本，与 Nexus Mods 及 Black Tree Gaming Ltd. 无隶属关系，仅修改本地浏览器中的显示文本。

## 许可证

[MIT](LICENSE)
