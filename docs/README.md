# Qn Chrome Tabs 文档站

本文档站需要同时支持三种运行方式：

- 本地独立运行并实时编辑 MDX。
- 作为 qiankun 子应用加载到 micro-portal。
- 提交 Git 后通过 CDN 加载生产构建。

浏览器端只使用 `collections/browser` 加载当前页 MDX。文档清单、目录树和搜索索引
由 Vite 在开发或构建阶段生成，禁止在浏览器代码中导入 `collections/server`。

## 独立运行

在仓库根目录执行：

```bash
bun run docs:dev
```

也可以进入文档目录执行：

```bash
cd docs
bun install
bun run dev
```

访问 `http://localhost:5175/`。

编辑 MDX、frontmatter 或 `meta.json` 后，开发服务器会重新生成文档清单并刷新页面。

## 多语言约定

文档支持中文、英文和韩文，URL 约定如下：

| 语言 | 首页 | 文档示例 |
| --- | --- | --- |
| 中文 | `/` | `/docs/guide` |
| English | `/en` | `/en/docs/guide` |
| 한국어 | `/ko` | `/ko/docs/guide` |

切换语言时保留当前文档 slug，例如 `/docs/api/events` 会切换为
`/en/docs/api/events` 或 `/ko/docs/api/events`。

内容目录约定：

```text
content/docs/              # 中文
content/docs/en/           # English
content/docs/ko/           # 한국어
```

每种语言必须同时维护：

- 顶部菜单和 Fumadocs UI 文案。
- `meta.json` 侧栏目录。
- MDX 的标题、描述、正文、表格和文档内链接。
- 当前语言的搜索索引。
- 页面动态标题。
- 首页 Demo 的界面文字与代码示例。

新增页面时，三个语言目录使用相同的相对路径。中文链接使用 `/docs/...`，英文和韩文
分别使用 `/en/docs/...`、`/ko/docs/...`。

## 静态文档清单

`vite.config.ts` 在 Node/Vite 侧扫描内容目录，为每种语言生成：

- slug 到 browser collection 文件路径的映射。
- 当前语言的 Fumadocs page tree。
- 页面标题。

开发环境通过 `/api/docs-manifest` 返回最新清单；生产环境将清单编译进虚拟模块。
MDX 正文仍由 browser collection 按当前页面加载，不会把全部正文放进清单。

这层边界用于避免 `collections/server` 或 Markdown 编译器依赖进入浏览器，防止 Vite
开发环境出现数千个依赖源码请求。

## 搜索

搜索索引按语言独立生成：

```text
/api/search/zh
/api/search/en
/api/search/ko
```

生产构建对应输出：

```text
dist/api/search/zh
dist/api/search/en
dist/api/search/ko
```

搜索采用两层加载：

1. 关闭搜索时只挂载轻量 Base UI Dialog 句柄，保证顶部按钮和
   `⌘ K` / `Ctrl K` 能触发。
2. 第一次打开时才动态导入搜索弹窗、FlexSearch 客户端和结果渲染模块。

首次加载期间显示当前语言的遮罩、旋转动画和加载提示；加载完成后自动显示搜索框，
后续打开复用浏览器已缓存的模块。

不能在 `open === false` 时把 Dialog 根节点一起卸载，否则 Fumadocs 的按钮和快捷键
没有可用的 `dialogHandle`。也不能直接预加载完整搜索弹窗，否则会违背关闭时不加载
重型搜索文件的要求。桥接实现位于 `src/components/search-dialog-bridge.tsx`。

## 首页 Demo 通信

首页通过 iframe 加载 `demo/index.html`。当前语言同时写入查询参数：

```text
demo/index.html?locale=zh
demo/index.html?locale=en
demo/index.html?locale=ko
```

Demo 启动时优先读取查询参数，确保独立运行、qiankun 和 CDN 跨域加载后的首次语言
一致。父子页面还使用以下消息保持运行时同步：

| 消息 | 方向 | 用途 |
| --- | --- | --- |
| `qn-chrome-tabs-locale` | 文档站 → Demo | 更新 Demo 语言 |
| `qn-chrome-tabs-demo-height` | Demo → 文档站 | 更新 iframe 高度 |
| `qn-chrome-tabs-open-search` | Demo → 文档站 | iframe 内按快捷键时打开搜索 |

首页焦点进入 iframe 后，键盘事件不会冒泡到父页面。Demo 因此捕获
`⌘ K` / `Ctrl K` 并通知父页面。父页面必须同时校验消息 origin 和
`event.source === iframe.contentWindow`。

## 门户子应用

该文档站通过 `vite-plugin-qiankun` 注册 qiankun 生命周期，同时保留独立运行模式。

- qiankun 应用名：`chrome-tabs-docs`
- shell `entry`：`http://localhost:5175/`
- shell 生产 `entry`：`https://qlynick.github.io/qn-chrome-tabs/`
- shell 初始 `path`：`/`
- 生命周期入口：`src/main.tsx`
- shell 配置：`micro-portal/shell/src/nav-config.ts`

联调时同时启动文档站和 shell，再从 shell 的“前端组件 → ChromeTabs”进入。

shell 与子应用使用以下协议：

| 属性 | 方向 | 用途 |
| --- | --- | --- |
| `initialPath` | shell → 子应用 | 恢复子应用内部路由 |
| `onPathChange(path)` | 子应用 → shell | 持久化当前内部路由 |
| `onTitleChange(title)` | 子应用 → shell | 同步工作区标签和浏览器标题 |

页面标题统一为 `页面标题 | Qn Chrome Tabs`。独立运行时更新 `document.title`；
嵌入时将完整标题回传给 shell。

子应用内的清单、搜索和 iframe URL 必须通过 qiankun 注入的 public path 解析，
不能使用 shell 的 `window.location.origin` 或根路径 `/...`。

## 自动构建与发布

推送 `main` 后，`.github/workflows/deploy-docs.yml` 自动构建文档站并发布到
`https://qlynick.github.io/qn-chrome-tabs/`。独立 Demo 不再单独发布；原来的
“在线 Demo”地址直接进入文档站，交互示例由文档首页内嵌。

部署涉及四类不同的地址或“基址”，不能混用：

| 层级 | 本地开发 | GitHub Pages | qiankun |
| --- | --- | --- | --- |
| 子应用 entry | `http://localhost:5175/` | `https://qlynick.github.io/qn-chrome-tabs/` | shell 按环境选择左侧地址 |
| Vite public base | `/` | 完整 Pages 项目地址 | 用于独立构建 |
| React Router basename | `/` | `/qn-chrome-tabs` | 使用 Memory Router，不设置 basename |
| 运行时资源基址 | Vite 开发地址 | Pages 项目地址 | `__INJECTED_PUBLIC_PATH_BY_QIANKUN__` |

GitHub Pages 项目站点挂载在仓库路径 `/qn-chrome-tabs/`，不是用户站点根路径 `/`。
独立运行时，React Router 从 Vite public base 自动取得 `basename`，因此首页、
返回首页和文档链接都不会跳到 `https://qlynick.github.io/`。

工作流将入口页复制为 `404.html`，使 GitHub Pages 在刷新
`/qn-chrome-tabs/docs/guide` 等客户端路由时仍交给文档站处理。GitHub Pages
返回的 HTTP 状态可能仍是 404，但响应正文是 SPA 入口，浏览器执行后由客户端路由
渲染正确页面。`/docs`、`/en/docs` 和 `/ko/docs` 会分别跳转到对应语言的使用指南。

常见现象与原因：

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 页面内跳转正常，刷新后显示 GitHub 404 | Pages 没有 SPA 路由回退 | 构建后复制 `index.html` 为 `404.html` |
| 项目根地址显示“页面不存在” | Browser Router 未设置仓库路径 basename | 从 Vite public base 派生 basename |
| “返回首页”跳到 `qlynick.github.io/` | `/` 被错误解释为域名根路径 | 使用正确 basename，不手工拼接域名 |
| JS、搜索索引或 JSON 请求返回 HTML | public base 或 qiankun 资源基址错误 | 统一 entry、分包和运行时资源基址 |

`docs/dist/` 是本地及 CI 构建产物，已加入 `.gitignore`，不提交到 Git。文档内容
没有变化时，也不会因为重新构建而产生大量待提交文件。

生产构建默认使用 GitHub Pages 文档地址。发布到其他 CDN 时，通过
`DOCS_PUBLIC_BASE` 指定包含末尾 `/` 的完整资源目录：

```bash
DOCS_PUBLIC_BASE=https://cdn.example.com/qn-chrome-tabs/docs/dist/ bun run build
```

shell 的生产 `entry` 应指向同一目录。

入口、分包资源、静态搜索索引必须来自同一次构建并使用同一个 public base，避免
CDN 缓存混用不同版本。

## 错误处理

路由加载异常使用中文错误页展示：

- 错误摘要。
- HTTP 状态。
- 实际请求地址。
- 可操作的处理建议和重新加载入口。

如果 JSON 接口返回以 `<!doctype` 开头的 HTML，通常表示资源 URL 错误地落到了
micro-portal 主应用，应优先检查子应用 entry 和 qiankun public path。

## 验证

```bash
bun run build
```

构建后应生成三份搜索索引。还需在浏览器完成以下验收：

- 独立访问中文、英文、韩文首页和 MDX 页面。
- “文/A”语言菜单能保持当前文档 slug。
- 顶部菜单、侧栏、MDX、标题和首页 Demo 同步切换语言。
- 首页与 MDX 页面点击搜索按钮均能打开搜索。
- 焦点在父页面和首页 iframe 内时，`⌘ K` / `Ctrl K` 均能打开搜索。
- 搜索关闭时不请求 `search-dialog` 重型分包；首次打开时显示加载动画并按需请求。
- 搜索结果只来自当前语言索引，点击后进入对应语言 URL。
- shell 能装载、卸载和重新挂载子应用，内部路径和标题保持同步。
- CDN entry、分包、搜索索引和 Demo iframe 均从子应用 public base 加载。
- 浏览器控制台没有跨域、生命周期、JSON 解析或资源 404 错误。
