# Qn Chrome Tabs

零框架依赖的 Chrome 风格标签栏 Web Component。可直接放进普通 HTML，也可以在
Vue、React 或其他前端项目中使用。

[在线 Demo](https://qlynick.github.io/qn-chrome-tabs/) ·
[GitHub](https://github.com/qlynick/qn-chrome-tabs) ·
[npm](https://www.npmjs.com/package/qn-chrome-tabs)

> Qn Chrome Tabs 负责显示标签和派发操作事件，不会替你保存业务数据。用户点击关闭、
> 新增或切换标签后，由你的 JavaScript 更新标签数组。这样它可以安全地接入不同项目。

## 特性

- Chrome 风格活动、悬停、关闭和新增标签交互
- 标签点击激活、双击编辑事件
- 当前分组内拖拽排序及插入位置提示
- 标签过多时支持滚轮横向滚动、左右按钮导航及活动标签自动定位
- 右键菜单：关闭、关闭左侧所有、关闭右侧所有、关闭其他所有
- 多分组切换、新建、重命名和删除
- 中文、英文、韩文界面；默认按浏览器语言选择，不支持的语言回退中文
- 分组菜单 hover 显示重命名、删除图标
- 点击组件外部自动关闭分组菜单和右键菜单
- 每个标签可单独设置活动背景色
- Shadow DOM 样式隔离
- CSS 变量主题配置
- `::part()` 深度样式定制
- 完整 TypeScript 类型
- 无运行时依赖

## 快速开始

### 方式一：纯 HTML，无需安装

新建一个 `index.html`，复制下面的完整代码，然后通过本地服务器打开即可：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Qn Chrome Tabs 示例</title>
  </head>
  <body>
    <qn-chrome-tabs id="tabs"></qn-chrome-tabs>

    <script
      type="module"
      src="https://cdn.jsdelivr.net/gh/qlynick/qn-chrome-tabs@v1.0.1/dist/qn-chrome-tabs.js"
    ></script>
    <script type="module">
      const tabsElement = document.querySelector('#tabs');

      let tabs = [
        { id: 'home', title: '首页' },
        { id: 'orders', title: '订单管理' },
        { id: 'users', title: '用户管理' },
      ];

      function render() {
        tabsElement.tabs = tabs;
      }

      render();
      tabsElement.activeTabId = 'home';

      tabsElement.addEventListener('tab-activate', (event) => {
        tabsElement.activeTabId = event.detail.tabId;
      });

      tabsElement.addEventListener('tab-close', (event) => {
        tabs = tabs.filter((tab) => tab.id !== event.detail.tabId);
        render();
      });

      tabsElement.addEventListener('tab-add', () => {
        const id = crypto.randomUUID();
        tabs = [...tabs, { id, title: '新标签' }];
        render();
        tabsElement.activeTabId = id;
      });
    </script>
  </body>
</html>
```

上面的脚本地址来自本 GitHub 仓库的 `dist` 构建产物，并固定在 `v1.0.1`，
避免后续版本升级意外影响现有页面。也可以下载
[`dist/qn-chrome-tabs.js`](./dist/qn-chrome-tabs.js) 放到自己的项目中：

```html
<script type="module" src="./qn-chrome-tabs.js"></script>
```

不要直接双击 HTML 文件。ES Module 需要通过 HTTP 访问，可以在文件目录执行：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080`。

### 方式二：在前端项目中安装

任选项目正在使用的包管理器执行一条命令：

```bash
npm install qn-chrome-tabs
# 或
yarn add qn-chrome-tabs
# 或
pnpm add qn-chrome-tabs
# 或
bun add qn-chrome-tabs
```

在入口文件中导入一次，浏览器就会注册 `<qn-chrome-tabs>`：

```ts
import 'qn-chrome-tabs';
```

然后创建组件并传入数据：

```js
import {
  CHROME_TABS_TAG,
  chromeTabsEvents,
} from 'qn-chrome-tabs';

const element = document.createElement(CHROME_TABS_TAG);

element.tabs = [
  { id: 'home', title: '首页' },
  { id: 'docs', title: '文档', backgroundColor: '#f8fafc' },
];
element.activeTabId = 'home';
element.groups = [
  { id: 'work', name: '工作' },
  { id: 'study', name: '学习' },
];
element.activeGroupId = 'work';

element.addEventListener(chromeTabsEvents.activate, (event) => {
  element.activeTabId = event.detail.tabId;
});

document.body.append(element);
```

组件不会自行修改传入数据。收到事件后，需要更新 `tabs`、`groups`、
`activeTabId` 或 `activeGroupId` 并重新赋值。

### Vue

Web Component 的 `tabs` 是 JavaScript 属性，不是 HTML 字符串属性，因此通过 `ref`
赋值最直观：

```vue
<script setup>
import { onMounted, ref } from 'vue';
import 'qn-chrome-tabs';

const tabsRef = ref();

onMounted(() => {
  tabsRef.value.tabs = [
    { id: 'home', title: '首页' },
    { id: 'docs', title: '文档' },
  ];
  tabsRef.value.activeTabId = 'home';
});
</script>

<template>
  <qn-chrome-tabs ref="tabsRef" />
</template>
```

### React

React 中同样通过 DOM `ref` 设置组件属性：

```tsx
import { useEffect, useRef } from 'react';
import 'qn-chrome-tabs';

export function Tabs() {
  const tabsRef = useRef<HTMLElement & {
    tabs: Array<{ id: string; title: string }>;
    activeTabId: string;
  }>(null);

  useEffect(() => {
    if (!tabsRef.current) return;
    tabsRef.current.tabs = [
      { id: 'home', title: '首页' },
      { id: 'docs', title: '文档' },
    ];
    tabsRef.current.activeTabId = 'home';
  }, []);

  return <qn-chrome-tabs ref={tabsRef} />;
}
```

## 数据类型

### ChromeTabItem

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 标签唯一标识 |
| `title` | `string` | 是 | 显示名称 |
| `backgroundColor` | `string` | 否 | 当前标签激活时的独立背景色 |

### ChromeTabGroup

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 分组唯一标识 |
| `name` | `string` | 是 | 下拉菜单显示名称 |

### ChromeTabsElement

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `tabs` | `ChromeTabItem[]` | 当前分组显示的标签 |
| `activeTabId` | `string` | 当前激活标签 |
| `groups` | `ChromeTabGroup[]` | 所有可切换分组 |
| `activeGroupId` | `string` | 当前分组 |
| `locale` | `'zh' \| 'en' \| 'ko'` | 界面语言；未设置时自动识别浏览器语言 |

## 事件

所有事件均为可冒泡、可穿透 Shadow DOM 的 `CustomEvent`。

每个事件都通过 `event.detail` 携带操作数据。例如，点击 ID 为 `home` 的标签时，
收到的事件可以理解为：

```js
{
  type: 'tab-activate',
  detail: {
    tabId: 'home',
  },
}
```

因此 JavaScript 中可以直接读取：

```js
element.addEventListener('tab-activate', (event) => {
  console.log(event.detail.tabId);
});
```

### 标签事件

| 常量 | 事件名 | detail | 触发时机 |
| --- | --- | --- | --- |
| `activate` | `tab-activate` | `{ tabId }` | 点击标签 |
| `editAddress` | `tab-edit-address` | `{ tabId }` | 双击标签 |
| `close` | `tab-close` | `{ tabId }` | 点击关闭或右键“关闭” |
| `add` | `tab-add` | 无 | 点击新增按钮 |
| `reorder` | `tab-reorder` | `{ tabId, targetTabId, position }` | 拖拽放置标签 |
| `closeLeft` | `tab-close-left` | `{ tabId }` | 关闭目标左侧所有标签 |
| `closeRight` | `tab-close-right` | `{ tabId }` | 关闭目标右侧所有标签 |
| `closeOthers` | `tab-close-others` | `{ tabId }` | 关闭目标之外所有标签 |

`position` 为 `'before' | 'after'`，表示拖拽标签应插入目标标签的前面或后面。

### 分组事件

| 常量 | 事件名 | detail |
| --- | --- | --- |
| `switchGroup` | `group-switch` | `{ groupId }` |
| `addGroup` | `group-add` | 无 |
| `renameGroup` | `group-rename` | `{ groupId }` |
| `deleteGroup` | `group-delete` | `{ groupId }` |

### TypeScript 事件类型

TypeScript 默认只把监听器参数识别为普通 `Event`，而普通 `Event` 类型没有
`detail`。此时可以使用组件导出的数据类型：

```ts
import type { ChromeTabEventDetail } from 'qn-chrome-tabs';

element.addEventListener('tab-activate', (event) => {
  const customEvent = event as CustomEvent<ChromeTabEventDetail>;
  console.log(customEvent.detail.tabId);
});
```

`ChromeTabEventDetail` 的结构就是 `{ tabId: string }`。这里的 `as` 只是在告诉
TypeScript 数据结构，不会在浏览器运行时转换事件。

## 自定义样式

### CSS 变量

CSS 变量用于稳定的主题配置，建议优先使用。

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `--chrome-tabs-height` | `38px` | 标签栏高度；大于 38px 时标签保持 38px，小于时同步缩小 |
| `--chrome-tabs-background` | `#dee1e6` | 标签栏背景 |
| `--chrome-tabs-font` | `12px Arial, sans-serif` | 标签栏字体 |
| `--chrome-tab-min-width` | `52px` | 标签最小宽度 |
| `--chrome-tab-max-width` | `120px` | 标签最大宽度及伸缩基准 |
| `--chrome-tab-radius` | `8px` | 标签顶部圆角 |
| `--chrome-tab-text-color` | `#5f6368` | 普通标签文字及图标颜色 |
| `--chrome-tab-active-text-color` | `#202124` | 活动标签文字颜色 |
| `--chrome-tab-hover-background` | `#f4f5f6` | 标签 hover 背景 |
| `--chrome-tab-active-background` | `#fff` | 活动标签默认背景 |
| `--chrome-tab-divider-color` | `#a9adb0` | 标签分隔线颜色 |
| `--chrome-tab-close-hover-background` | `#dadce0` | 关闭及操作图标 hover 高亮 |
| `--chrome-tabs-accent-color` | `#1a73e8` | 拖拽指示及活动分组颜色 |
| `--chrome-tabs-menu-background` | `#fff` | 下拉、右键菜单背景 |
| `--chrome-tabs-menu-border-color` | `#dadce0` | 菜单边框颜色 |
| `--chrome-tabs-menu-hover-background` | `#f1f3f4` | 菜单选中及 hover 高亮 |
| `--chrome-tabs-menu-text-color` | 普通标签文字色 | 菜单普通文字颜色 |
| `--chrome-tabs-menu-icon-color` | 普通标签文字色 | 下拉、重命名和删除图标颜色 |
| `--chrome-tabs-menu-icon-background` | `rgb(255 255 255 / 62%)` | 分组菜单入口图标背景 |
| `--chrome-tabs-menu-shadow` | `0 6px 18px ...` | 菜单阴影 |

```css
qn-chrome-tabs {
  --chrome-tabs-height: 42px;
  --chrome-tabs-background: #182230;
  --chrome-tab-text-color: #98a2b3;
  --chrome-tab-active-text-color: #101828;
  --chrome-tab-hover-background: #344054;
  --chrome-tab-active-background: #f9fafb;
  --chrome-tabs-accent-color: #7f56d9;
}
```

### CSS Parts

当 CSS 变量不足以表达需求时，通过 `::part()` 精确修改结构。

| part | 对应元素 |
| --- | --- |
| `strip` | 整条标签栏 |
| `tab-list` | 标签列表容器 |
| `tab` | 每个标签 |
| `active-tab` | 当前活动标签，同时具有 `tab` part |
| `title` | 标签标题 |
| `close-button` | 标签关闭按钮 |
| `add-button` | 新增标签按钮 |
| `scroll-left-button` | 标签溢出时的向左滚动按钮 |
| `scroll-right-button` | 标签溢出时的向右滚动按钮 |
| `group-toggle` | 分组下拉入口 |
| `group-menu` | 分组下拉菜单 |
| `group-option` | 分组选项 |
| `active-group-option` | 当前分组选项 |
| `context-menu` | 标签右键菜单 |

```css
qn-chrome-tabs::part(group-toggle) {
  color: #fff;
  background: #344054;
}

qn-chrome-tabs::part(active-tab) {
  font-weight: 600;
}
```

不建议依赖组件内部 class；内部 class 不属于公开 API。

## Demo

```bash
bun install
bun run dev
```

生产构建 demo：

```bash
bun run build:demo
```

demo 覆盖标签增删、改名、激活、拖拽、右键批量关闭、分组管理和事件日志。
交互式主题编辑器可实时调整公开 CSS 变量及圆角、恢复默认值，并一键复制可直接使用的 CSS。
内置“海盐蓝”“午夜紫”“樱雾粉”“森屿绿”“琥珀橙”“黑白直角”六套主题，
可直接点击预览后继续微调。

## 构建与发布

```bash
bun run build
npm pack --dry-run
```

`dist/qn-chrome-tabs.js` 是浏览器可直接加载的 ESM 文件，
`dist/types/index.d.ts` 是 TypeScript 类型声明。两者都会提交到 Git，
以便纯 HTML 页面直接引用固定 Git 标签下的构建产物。

推送 `v*` Git 标签后，GitHub Actions 会自动发布对应 npm 版本。

## 开源协议

[MIT](./LICENSE)
