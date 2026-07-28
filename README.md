# Qn Chrome Tabs

**English** | [简体中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/qn-chrome-tabs?logo=npm&logoColor=white)](https://www.npmjs.com/package/qn-chrome-tabs)
[![weekly downloads](https://img.shields.io/npm/dw/qn-chrome-tabs?logo=npm&logoColor=white)](https://www.npmjs.com/package/qn-chrome-tabs)
[![license](https://img.shields.io/npm/l/qn-chrome-tabs?logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/qn-chrome-tabs?logo=javascript&logoColor=white)](https://bundlephobia.com/package/qn-chrome-tabs)
[![runtime dependencies](https://img.shields.io/badge/runtime_dependencies-0-2ea44f?logo=webassembly&logoColor=white)](./package.json)

A dependency-free, framework-agnostic Chrome-style tab bar Web Component.

[Live Demo](https://qlynick.github.io/qn-chrome-tabs/en/) ·
[Documentation](https://qlynick.github.io/qn-chrome-tabs/en/docs/) ·
[Edit in StackBlitz](https://stackblitz.com/github/qlynick/qn-chrome-tabs?file=demo%2Fmain.ts&startScript=dev) ·
[npm](https://www.npmjs.com/package/qn-chrome-tabs)

![Qn Chrome Tabs demo](https://raw.githubusercontent.com/qlynick/qn-chrome-tabs/main/assets/qn-chrome-tabs-demo.gif)

- Drag sorting, closing, adding, editing, and context-menu actions
- Multiple groups, horizontal overflow navigation, and active-tab tracking
- CSS variables and `::part()` for deep styling
- Works with plain HTML, Vue, React, and micro-frontends
- Written in TypeScript with zero runtime dependencies
- Chinese, English, and Korean interface localization

## Good fit

- Admin dashboards and workspace-style apps that need Chrome-like tab interactions
- Components shared across plain HTML, Vue, React, or micro-frontends
- Controlled state flows where the application owns tab and group data

## Not included

- Routing, page content rendering, or state persistence
- Browser window or process management
- An internal data store that mutates your business state automatically

## Installation

```bash
npm install qn-chrome-tabs
```

Import the package once to register `<qn-chrome-tabs>`:

```ts
import 'qn-chrome-tabs';
```

You can also load the latest stable release directly from a CDN:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/qn-chrome-tabs@latest/dist/qn-chrome-tabs.js"
></script>
```

Pin an exact version in production if you do not want later releases to change
the component automatically.

## Quick start

```html
<qn-chrome-tabs id="tabs"></qn-chrome-tabs>

<script type="module">
  import 'qn-chrome-tabs';

  const tabsElement = document.querySelector('#tabs');

  let tabs = [
    { id: 'home', title: 'Home' },
    { id: 'orders', title: 'Orders' },
    { id: 'users', title: 'Users' },
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
</script>
```

Qn Chrome Tabs is a controlled component: it renders the values you provide and
emits user actions as events. Your application remains responsible for updating
`tabs`, `groups`, `activeTabId`, and `activeGroupId`.

## Data

```ts
import {
  CHROME_TABS_TAG,
  chromeTabsEvents,
} from 'qn-chrome-tabs';

const element = document.createElement(CHROME_TABS_TAG);

element.tabs = [
  { id: 'home', title: 'Home' },
  { id: 'docs', title: 'Docs', backgroundColor: '#f8fafc' },
];
element.activeTabId = 'home';
element.groups = [
  { id: 'work', name: 'Work' },
  { id: 'study', name: 'Study' },
];
element.activeGroupId = 'work';

element.addEventListener(chromeTabsEvents.activate, (event) => {
  element.activeTabId = event.detail.tabId;
});

document.body.append(element);
```

| Property | Type | Description |
| --- | --- | --- |
| `tabs` | `ChromeTabItem[]` | Tabs displayed in the active group |
| `activeTabId` | `string` | Active tab ID |
| `groups` | `ChromeTabGroup[]` | Available groups |
| `activeGroupId` | `string` | Active group ID |
| `locale` | `'zh' \| 'en' \| 'ko'` | UI locale; detected from the browser when omitted |

## Events

All component events are bubbling and composed `CustomEvent` instances.

| Event | Detail | Trigger |
| --- | --- | --- |
| `tab-activate` | `{ tabId }` | Click a tab |
| `tab-edit-address` | `{ tabId }` | Double-click a tab |
| `tab-close` | `{ tabId }` | Close a tab |
| `tab-add` | none | Click the add button |
| `tab-reorder` | `{ tabId, targetTabId, position }` | Drop a dragged tab |
| `tab-close-left` | `{ tabId }` | Close tabs to the left |
| `tab-close-right` | `{ tabId }` | Close tabs to the right |
| `tab-close-others` | `{ tabId }` | Close all other tabs |
| `group-switch` | `{ groupId }` | Switch groups |
| `group-add` | none | Request a new group |
| `group-rename` | `{ groupId }` | Request a group rename |
| `group-delete` | `{ groupId }` | Request group deletion |

## Styling

Use CSS variables for theme-level customization:

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

Use CSS Parts when you need to target a specific public element:

```css
qn-chrome-tabs::part(group-toggle) {
  color: #fff;
  background: #344054;
}

qn-chrome-tabs::part(active-tab) {
  font-weight: 600;
}
```

See the [styling guide](https://qlynick.github.io/qn-chrome-tabs/en/docs/guide/styling)
for the complete CSS variable and CSS Parts reference.

## Frameworks

Web Component data such as `tabs` is passed through JavaScript properties rather
than serialized HTML attributes. In Vue and React, set these properties through
a DOM `ref`.

See the [Vue and React guide](https://qlynick.github.io/qn-chrome-tabs/en/docs/guide/frameworks)
for complete examples.

## Development

```bash
bun install
bun run dev
```

Build the package and its TypeScript declarations:

```bash
bun run build
npm pack --dry-run
```

The documentation app lives in `docs/`:

```bash
bun run docs:dev
bun run docs:build
```

## License

[MIT](./LICENSE)
