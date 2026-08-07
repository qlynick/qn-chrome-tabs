import {
  CHROME_TABS_TAG,
  chromeTabsEvents,
  type ChromeTabEventDetail,
  type ChromeTabGroup,
  type ChromeTabGroupEventDetail,
  type ChromeTabItem,
  type ChromeTabReorderEventDetail,
  type ChromeTabsElement,
  type ChromeTabsLocale,
} from '../src';

interface DemoTab extends ChromeTabItem {
  groupId: string;
}

interface DemoGroup extends ChromeTabGroup {
  activeTabId: string;
}

const tabsElement = document.createElement(CHROME_TABS_TAG) as ChromeTabsElement;
const host = document.querySelector<HTMLDivElement>('#tabs-host')!;
const activeTitle = document.querySelector<HTMLElement>('#active-title')!;
const stateOutput = document.querySelector<HTMLElement>('#state-output')!;
const eventLog = document.querySelector<HTMLOListElement>('#event-log')!;
const scriptCode = document.querySelector<HTMLElement>('#script-code')!;
const languageSelect =
  document.querySelector<HTMLSelectElement>('#language-select')!;
const localeStorageKey = 'qn-chrome-tabs-demo-locale';
const presetStorageKey = 'qn-chrome-tabs-demo-preset';
const themeStorageKey = 'qn-chrome-tabs-demo-theme';

const translations: Record<'en' | 'ko', Record<string, string>> = {
  en: {
    '语言': 'Language',
    'GitHub 仓库': 'GitHub repository',
    '零框架依赖的标签栏，包含分组、拖拽排序和右键批量关闭。': 'A framework-free tab bar with groups, drag sorting, and batch close menus.',
    '精选预设': 'Featured presets',
    '一键应用完整配色方案，也可在下方继续微调': 'Apply a complete theme, then fine-tune it below',
    '交互式主题配置': 'Interactive theme editor',
    '调整后立即预览，并复制生成的 CSS。': 'Preview changes instantly and copy the generated CSS.',
    '恢复默认': 'Reset',
    '复制配置': 'Copy CSS',
    '已复制': 'Copied',
    '精细配置': 'Fine settings',
    '单独调整尺寸、圆角与颜色': 'Adjust sizes, corners, and colors',
    '实时预览': 'Live preview',
    '双击改名；拖拽排序；右击查看批量关闭菜单。': 'Double-click to rename, drag to reorder, and right-click for batch close.',
    '当前状态': 'Current state',
    '事件日志': 'Event log',
    '快速上手': 'Quick start',
    '纯 HTML 可直接引用 Git 构建产物，也可通过包管理器安装。': 'Use the Git build directly in plain HTML, or install it with a package manager.',
    '纯 HTML（无需安装）': 'Plain HTML (no installation)',
    '标签图标示例': 'Tab icon examples',
    '支持图片、同源 Favicon、指定 Favicon 路径和自定义 SVG。': 'Supports images, same-origin favicons, custom favicon paths, and custom SVG.',
    'SVG 图片': 'SVG image', '默认 Favicon': 'Default favicon',
    '指定 PNG': 'Custom PNG', '自定义 SVG': 'Custom SVG',
    '首页': 'Home', '文档': 'Docs',
    '工作': 'Work', '学习': 'Study',
    '仪表盘': 'Dashboard', '订单中心': 'Orders', '客户管理': 'Customers',
    '数据报表': 'Reports', '系统设置': 'Settings', '组件文档': 'Component docs',
    '学习笔记': 'Study notes', '空标签页': 'Empty tab',
    '标签栏高度': 'Bar height', '标签最小宽度': 'Min tab width',
    '标签最大宽度': 'Max tab width', '标签圆角': 'Tab radius',
    '标签栏背景': 'Bar background', '普通文字': 'Text',
    '活动文字': 'Active text', '悬停背景': 'Hover background',
    '活动背景': 'Active background', '分隔线': 'Divider',
    '关闭按钮高亮': 'Close hover', '强调色': 'Accent',
    '菜单背景': 'Menu background', '菜单边框': 'Menu border',
    '菜单高亮': 'Menu hover', '菜单文字': 'Menu text',
    '菜单图标': 'Menu icon', '菜单图标背景': 'Menu icon background',
    '标签栏': 'Tab bar', '栏高度、背景和分隔线': 'Height, background, and dividers',
    '标签': 'Tabs', '标签尺寸、圆角和状态颜色': 'Size, corners, and state colors',
    '菜单与操作': 'Menus', '分组菜单和右键菜单': 'Group and context menus',
    '海盐蓝': 'Sea Salt Blue', '清爽明亮': 'Clean and bright',
    '午夜紫': 'Midnight Purple', '沉稳高对比': 'Deep contrast',
    '樱雾粉': 'Cherry Mist', '柔和轻盈': 'Soft and light',
    '森屿绿': 'Forest Green', '自然舒展': 'Calm and natural',
    '琥珀橙': 'Amber Orange', '温暖醒目': 'Warm and vivid',
    '黑白直角': 'Mono Square', '克制利落': 'Minimal and crisp',
    '修改标签名称': 'Rename tab', '新分组名称': 'New group name',
    '修改分组名称': 'Rename group',
    '删除该分组及其中所有标签页？': 'Delete this group and all its tabs?',
    '新标签页': 'New tab', '新标签': 'New tab',
    '激活标签': 'Activate tab', '修改名称': 'Rename',
    '新增标签': 'Add tab', '关闭标签': 'Close tab',
    '拖拽排序': 'Reorder tabs', '切换分组': 'Switch group',
    '新建分组': 'Add group', '重命名分组': 'Rename group',
    '删除分组': 'Delete group',
    'Script 控制示例': 'Script control',
    '点击常用动作，实时观察标签栏与示例代码。': 'Run common actions and watch the tab bar and code update.',
    '激活客户管理': 'Activate Customers',
    '关闭当前标签': 'Close active tab',
    '关闭所有右侧': 'Close all to the right',
    '切换工作分组': 'Switch to Work',
    '切换学习分组': 'Switch to Study',
  },
  ko: {
    '语言': '언어',
    'GitHub 仓库': 'GitHub 저장소',
    '零框架依赖的标签栏，包含分组、拖拽排序和右键批量关闭。': '프레임워크 없이 그룹, 드래그 정렬, 일괄 닫기를 지원하는 탭 바입니다.',
    '精选预设': '추천 프리셋',
    '一键应用完整配色方案，也可在下方继续微调': '테마를 바로 적용하고 아래에서 세부 조정하세요',
    '交互式主题配置': '인터랙티브 테마 설정',
    '调整后立即预览，并复制生成的 CSS。': '변경 사항을 즉시 미리 보고 생성된 CSS를 복사하세요.',
    '恢复默认': '기본값 복원',
    '复制配置': 'CSS 복사',
    '已复制': '복사됨',
    '精细配置': '세부 설정',
    '单独调整尺寸、圆角与颜色': '크기, 모서리, 색상을 조정하세요',
    '实时预览': '실시간 미리보기',
    '双击改名；拖拽排序；右击查看批量关闭菜单。': '더블 클릭으로 이름 변경, 드래그로 정렬, 우클릭으로 일괄 닫기.',
    '当前状态': '현재 상태', '事件日志': '이벤트 로그',
    '快速上手': '빠른 시작',
    '纯 HTML 可直接引用 Git 构建产物，也可通过包管理器安装。': '일반 HTML에서는 Git 빌드를 직접 사용하거나 패키지 관리자로 설치할 수 있습니다.',
    '纯 HTML（无需安装）': '순수 HTML (설치 불필요)',
    '标签图标示例': '탭 아이콘 예제',
    '支持图片、同源 Favicon、指定 Favicon 路径和自定义 SVG。': '이미지, 동일 출처 파비콘, 사용자 지정 파비콘 경로 및 사용자 지정 SVG를 지원합니다.',
    'SVG 图片': 'SVG 이미지', '默认 Favicon': '기본 파비콘',
    '指定 PNG': 'PNG 경로 지정', '自定义 SVG': '사용자 지정 SVG',
    '首页': '홈', '文档': '문서',
    '工作': '업무', '学习': '학습',
    '仪表盘': '대시보드', '订单中心': '주문 센터', '客户管理': '고객 관리',
    '数据报表': '데이터 보고서', '系统设置': '시스템 설정', '组件文档': '컴포넌트 문서',
    '学习笔记': '학습 노트', '空标签页': '빈 탭',
    '标签栏高度': '탭 바 높이', '标签最小宽度': '최소 탭 너비',
    '标签最大宽度': '최대 탭 너비', '标签圆角': '탭 모서리',
    '标签栏背景': '탭 바 배경', '普通文字': '일반 텍스트',
    '活动文字': '활성 텍스트', '悬停背景': '호버 배경',
    '活动背景': '활성 배경', '分隔线': '구분선',
    '关闭按钮高亮': '닫기 호버', '强调色': '강조색',
    '菜单背景': '메뉴 배경', '菜单边框': '메뉴 테두리',
    '菜单高亮': '메뉴 강조', '菜单文字': '메뉴 텍스트',
    '菜单图标': '메뉴 아이콘', '菜单图标背景': '메뉴 아이콘 배경',
    '标签栏': '탭 바', '栏高度、背景和分隔线': '높이, 배경 및 구분선',
    '标签': '탭', '标签尺寸、圆角和状态颜色': '크기, 모서리 및 상태 색상',
    '菜单与操作': '메뉴', '分组菜单和右键菜单': '그룹 및 컨텍스트 메뉴',
    '海盐蓝': '씨솔트 블루', '清爽明亮': '맑고 밝게',
    '午夜紫': '미드나잇 퍼플', '沉稳高对比': '차분한 고대비',
    '樱雾粉': '체리 미스트', '柔和轻盈': '부드럽고 가볍게',
    '森屿绿': '포레스트 그린', '自然舒展': '자연스럽고 편안하게',
    '琥珀橙': '앰버 오렌지', '温暖醒目': '따뜻하고 선명하게',
    '黑白直角': '모노 스퀘어', '克制利落': '절제되고 선명하게',
    '修改标签名称': '탭 이름 변경', '新分组名称': '새 그룹 이름',
    '修改分组名称': '그룹 이름 변경',
    '删除该分组及其中所有标签页？': '이 그룹과 모든 탭을 삭제할까요?',
    '新标签页': '새 탭', '新标签': '새 탭',
    '激活标签': '탭 활성화', '修改名称': '이름 변경',
    '新增标签': '탭 추가', '关闭标签': '탭 닫기',
    '拖拽排序': '탭 순서 변경', '切换分组': '그룹 전환',
    '新建分组': '그룹 추가', '重命名分组': '그룹 이름 변경',
    '删除分组': '그룹 삭제',
    'Script 控制示例': '스크립트 제어',
    '点击常用动作，实时观察标签栏与示例代码。': '자주 쓰는 동작을 실행하고 탭 바와 코드를 확인하세요.',
    '激活客户管理': '고객 관리 활성화',
    '关闭当前标签': '현재 탭 닫기',
    '关闭所有右侧': '오른쪽 탭 모두 닫기',
    '切换工作分组': '업무 그룹으로 전환',
    '切换学习分组': '학습 그룹으로 전환',
  },
};

function detectLocale(): ChromeTabsLocale {
  const requestedLocale = new URLSearchParams(window.location.search)
    .get('locale');
  if (requestedLocale === 'en' || requestedLocale === 'ko') {
    return requestedLocale;
  }
  if (requestedLocale === 'zh') return 'zh';

  const savedLocale = localStorage.getItem(localeStorageKey);
  if (savedLocale === 'zh' || savedLocale === 'en' || savedLocale === 'ko') {
    return savedLocale;
  }

  const language = navigator.language.toLowerCase();
  if (language.startsWith('en')) return 'en';
  if (language.startsWith('ko')) return 'ko';
  return 'zh';
}

let locale: ChromeTabsLocale = detectLocale();

function t(text: string) {
  return locale === 'zh' ? text : translations[locale][text] ?? text;
}

function markTranslation(element: HTMLElement, text: string) {
  element.dataset.zh = text;
  element.textContent = t(text);
}

let groups: DemoGroup[] = [
  { id: 'work', name: '工作', activeTabId: 'dashboard' },
  { id: 'study', name: '学习', activeTabId: 'docs' },
];
let tabs: DemoTab[] = [
  { id: 'dashboard', groupId: 'work', title: '仪表盘' },
  { id: 'orders', groupId: 'work', title: '订单中心' },
  { id: 'customers', groupId: 'work', title: '客户管理' },
  { id: 'reports', groupId: 'work', title: '数据报表' },
  { id: 'settings', groupId: 'work', title: '系统设置' },
  { id: 'docs', groupId: 'study', title: '组件文档' },
  { id: 'notes', groupId: 'study', title: '学习笔记' },
];
let activeGroupId = 'work';

host.append(tabsElement);

const iconTabsElement = document.createElement(CHROME_TABS_TAG) as ChromeTabsElement;
iconTabsElement.hideAddButton = true;
iconTabsElement.hideGroupButton = true;
const iconTabsHost = document.querySelector<HTMLDivElement>('#icon-tabs-host')!;
const svgImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb"/><path d="m7 12 3 3 7-7" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
)}`;
const iconDemoTabs: ChromeTabItem[] = [
  { id: 'image', title: 'SVG 图片', icon: { type: 'image', src: svgImage } },
  { id: 'favicon', title: '默认 Favicon', icon: { type: 'favicon', url: 'https://github.com/qlynick' } },
  { id: 'png', title: '指定 PNG', icon: { type: 'favicon', url: 'https://github.com', path: '/fluidicon.png' } },
  { id: 'custom', title: '自定义 SVG' },
];
let iconActiveTabId = 'image';

iconTabsElement.renderTabIcon = (tab) => {
  if (tab.id !== 'custom') return null;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '9');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '2');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'm8 12 2.5 2.5L16 9');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  svg.append(circle, path);
  return svg;
};
iconTabsElement.addEventListener(chromeTabsEvents.activate, (event) => {
  iconActiveTabId = detail<ChromeTabEventDetail>(event).tabId;
  iconTabsElement.activeTabId = iconActiveTabId;
});
iconTabsHost.append(iconTabsElement);

function renderIconDemo() {
  iconTabsElement.locale = locale;
  iconTabsElement.tabs = iconDemoTabs.map((tab) => ({ ...tab, title: t(tab.title) }));
  iconTabsElement.activeTabId = iconActiveTabId;
}

const themeDefinitions = [
  { variable: '--chrome-tabs-height', label: '标签栏高度', type: 'range', default: 38, min: 32, max: 54, unit: 'px' },
  { variable: '--chrome-tab-min-width', label: '标签最小宽度', type: 'range', default: 52, min: 40, max: 120, unit: 'px' },
  { variable: '--chrome-tab-max-width', label: '标签最大宽度', type: 'range', default: 120, min: 90, max: 240, unit: 'px' },
  { variable: '--chrome-tab-radius', label: '标签圆角', type: 'range', default: 8, min: 0, max: 18, unit: 'px' },
  { variable: '--chrome-tabs-background', label: '标签栏背景', type: 'color', default: '#dee1e6' },
  { variable: '--chrome-tab-text-color', label: '普通文字', type: 'color', default: '#5f6368' },
  { variable: '--chrome-tab-active-text-color', label: '活动文字', type: 'color', default: '#202124' },
  { variable: '--chrome-tab-hover-background', label: '悬停背景', type: 'color', default: '#f4f5f6' },
  { variable: '--chrome-tab-active-background', label: '活动背景', type: 'color', default: '#ffffff' },
  { variable: '--chrome-tab-divider-color', label: '分隔线', type: 'color', default: '#a9adb0' },
  { variable: '--chrome-tab-close-hover-background', label: '关闭按钮高亮', type: 'color', default: '#dadce0' },
  { variable: '--chrome-tabs-accent-color', label: '强调色', type: 'color', default: '#1a73e8' },
  { variable: '--chrome-tabs-menu-background', label: '菜单背景', type: 'color', default: '#ffffff' },
  { variable: '--chrome-tabs-menu-border-color', label: '菜单边框', type: 'color', default: '#dadce0' },
  { variable: '--chrome-tabs-menu-hover-background', label: '菜单高亮', type: 'color', default: '#f1f3f4' },
  { variable: '--chrome-tabs-menu-text-color', label: '菜单文字', type: 'color', default: '#5f6368' },
  { variable: '--chrome-tabs-menu-icon-color', label: '菜单图标', type: 'color', default: '#5f6368' },
  { variable: '--chrome-tabs-menu-icon-background', label: '菜单图标背景', type: 'color', default: '#f2f3f5' },
] as const;

const themePresets = [
  {
    name: '海盐蓝',
    description: '清爽明亮',
    values: {
      '--chrome-tabs-height': 44,
      '--chrome-tab-min-width': 58,
      '--chrome-tab-max-width': 148,
      '--chrome-tab-radius': 10,
      '--chrome-tabs-background': '#dbeafe',
      '--chrome-tab-text-color': '#475569',
      '--chrome-tab-active-text-color': '#0f172a',
      '--chrome-tab-hover-background': '#bfdbfe',
      '--chrome-tab-active-background': '#ffffff',
      '--chrome-tab-divider-color': '#93c5fd',
      '--chrome-tab-close-hover-background': '#bfdbfe',
      '--chrome-tabs-accent-color': '#2563eb',
      '--chrome-tabs-menu-background': '#ffffff',
      '--chrome-tabs-menu-border-color': '#bfdbfe',
      '--chrome-tabs-menu-hover-background': '#eff6ff',
      '--chrome-tabs-menu-text-color': '#334155',
      '--chrome-tabs-menu-icon-color': '#2563eb',
      '--chrome-tabs-menu-icon-background': '#eff6ff',
    },
  },
  {
    name: '午夜紫',
    description: '沉稳高对比',
    values: {
      '--chrome-tabs-height': 46,
      '--chrome-tab-min-width': 64,
      '--chrome-tab-max-width': 156,
      '--chrome-tab-radius': 12,
      '--chrome-tabs-background': '#182230',
      '--chrome-tab-text-color': '#98a2b3',
      '--chrome-tab-active-text-color': '#101828',
      '--chrome-tab-hover-background': '#344054',
      '--chrome-tab-active-background': '#f9fafb',
      '--chrome-tab-divider-color': '#475467',
      '--chrome-tab-close-hover-background': '#d6bbfb',
      '--chrome-tabs-accent-color': '#7f56d9',
      '--chrome-tabs-menu-background': '#ffffff',
      '--chrome-tabs-menu-border-color': '#d0d5dd',
      '--chrome-tabs-menu-hover-background': '#f4ebff',
      '--chrome-tabs-menu-text-color': '#344054',
      '--chrome-tabs-menu-icon-color': '#7f56d9',
      '--chrome-tabs-menu-icon-background': '#f4ebff',
    },
  },
  {
    name: '樱雾粉',
    description: '柔和轻盈',
    values: {
      '--chrome-tabs-height': 42,
      '--chrome-tab-min-width': 56,
      '--chrome-tab-max-width': 142,
      '--chrome-tab-radius': 14,
      '--chrome-tabs-background': '#fce7f3',
      '--chrome-tab-text-color': '#9d174d',
      '--chrome-tab-active-text-color': '#831843',
      '--chrome-tab-hover-background': '#fbcfe8',
      '--chrome-tab-active-background': '#fff7fb',
      '--chrome-tab-divider-color': '#f9a8d4',
      '--chrome-tab-close-hover-background': '#f9a8d4',
      '--chrome-tabs-accent-color': '#db2777',
      '--chrome-tabs-menu-background': '#fff7fb',
      '--chrome-tabs-menu-border-color': '#fbcfe8',
      '--chrome-tabs-menu-hover-background': '#fce7f3',
      '--chrome-tabs-menu-text-color': '#9d174d',
      '--chrome-tabs-menu-icon-color': '#db2777',
      '--chrome-tabs-menu-icon-background': '#fce7f3',
    },
  },
  {
    name: '森屿绿',
    description: '自然舒展',
    values: {
      '--chrome-tabs-height': 44,
      '--chrome-tab-min-width': 60,
      '--chrome-tab-max-width': 150,
      '--chrome-tab-radius': 11,
      '--chrome-tabs-background': '#d1fae5',
      '--chrome-tab-text-color': '#3f6555',
      '--chrome-tab-active-text-color': '#064e3b',
      '--chrome-tab-hover-background': '#a7f3d0',
      '--chrome-tab-active-background': '#f0fdf4',
      '--chrome-tab-divider-color': '#6ee7b7',
      '--chrome-tab-close-hover-background': '#6ee7b7',
      '--chrome-tabs-accent-color': '#059669',
      '--chrome-tabs-menu-background': '#f0fdf4',
      '--chrome-tabs-menu-border-color': '#a7f3d0',
      '--chrome-tabs-menu-hover-background': '#d1fae5',
      '--chrome-tabs-menu-text-color': '#065f46',
      '--chrome-tabs-menu-icon-color': '#059669',
      '--chrome-tabs-menu-icon-background': '#d1fae5',
    },
  },
  {
    name: '琥珀橙',
    description: '温暖醒目',
    values: {
      '--chrome-tabs-height': 43,
      '--chrome-tab-min-width': 58,
      '--chrome-tab-max-width': 146,
      '--chrome-tab-radius': 9,
      '--chrome-tabs-background': '#fef3c7',
      '--chrome-tab-text-color': '#92400e',
      '--chrome-tab-active-text-color': '#78350f',
      '--chrome-tab-hover-background': '#fde68a',
      '--chrome-tab-active-background': '#fffbeb',
      '--chrome-tab-divider-color': '#fcd34d',
      '--chrome-tab-close-hover-background': '#fcd34d',
      '--chrome-tabs-accent-color': '#d97706',
      '--chrome-tabs-menu-background': '#fffbeb',
      '--chrome-tabs-menu-border-color': '#fde68a',
      '--chrome-tabs-menu-hover-background': '#fef3c7',
      '--chrome-tabs-menu-text-color': '#92400e',
      '--chrome-tabs-menu-icon-color': '#d97706',
      '--chrome-tabs-menu-icon-background': '#fef3c7',
    },
  },
  {
    name: '黑白直角',
    description: '克制利落',
    values: {
      '--chrome-tabs-height': 40,
      '--chrome-tab-min-width': 56,
      '--chrome-tab-max-width': 138,
      '--chrome-tab-radius': 3,
      '--chrome-tabs-background': '#e5e7eb',
      '--chrome-tab-text-color': '#4b5563',
      '--chrome-tab-active-text-color': '#111827',
      '--chrome-tab-hover-background': '#d1d5db',
      '--chrome-tab-active-background': '#ffffff',
      '--chrome-tab-divider-color': '#6b7280',
      '--chrome-tab-close-hover-background': '#d1d5db',
      '--chrome-tabs-accent-color': '#111827',
      '--chrome-tabs-menu-background': '#ffffff',
      '--chrome-tabs-menu-border-color': '#9ca3af',
      '--chrome-tabs-menu-hover-background': '#f3f4f6',
      '--chrome-tabs-menu-text-color': '#111827',
      '--chrome-tabs-menu-icon-color': '#111827',
      '--chrome-tabs-menu-icon-background': '#e5e7eb',
    },
  },
] as const;

const themeControls = document.querySelector<HTMLDivElement>('#theme-controls')!;
const themePresetsContainer =
  document.querySelector<HTMLDivElement>('#theme-presets')!;
const themeCode = document.querySelector<HTMLElement>('#theme-code')!;
const themeInputs = new Map<string, HTMLInputElement>();
let applyingPreset = false;
const themeCategories = [
  {
    name: '标签栏',
    description: '栏高度、背景和分隔线',
    variables: [
      '--chrome-tabs-height',
      '--chrome-tabs-background',
      '--chrome-tab-divider-color',
      '--chrome-tabs-accent-color',
    ],
  },
  {
    name: '标签',
    description: '标签尺寸、圆角和状态颜色',
    variables: [
      '--chrome-tab-min-width',
      '--chrome-tab-max-width',
      '--chrome-tab-radius',
      '--chrome-tab-text-color',
      '--chrome-tab-active-text-color',
      '--chrome-tab-hover-background',
      '--chrome-tab-active-background',
      '--chrome-tab-close-hover-background',
    ],
  },
  {
    name: '菜单与操作',
    description: '分组菜单和右键菜单',
    variables: [
      '--chrome-tabs-menu-background',
      '--chrome-tabs-menu-border-color',
      '--chrome-tabs-menu-hover-background',
      '--chrome-tabs-menu-text-color',
      '--chrome-tabs-menu-icon-color',
      '--chrome-tabs-menu-icon-background',
    ],
  },
] as const;
const categoryTargets = new Map<string, HTMLDivElement>();

function themeValue(definition: typeof themeDefinitions[number]) {
  const input = themeInputs.get(definition.variable);
  const value = input?.value ?? String(definition.default);
  return definition.type === 'range' ? `${value}${definition.unit}` : value;
}

function updateThemeCode() {
  themeCode.textContent = [
    'qn-chrome-tabs {',
    ...themeDefinitions.map(
      (definition) => `  ${definition.variable}: ${themeValue(definition)};`,
    ),
    '}',
  ].join('\n');
}

function saveThemeSettings() {
  localStorage.setItem(
    themeStorageKey,
    JSON.stringify(Object.fromEntries(
      themeDefinitions.map((definition) => [
        definition.variable,
        themeInputs.get(definition.variable)?.value ?? String(definition.default),
      ]),
    )),
  );
}

const categoryTabs = document.createElement('div');
categoryTabs.className = 'theme-category-tabs';
categoryTabs.setAttribute('role', 'tablist');
themeControls.append(categoryTabs);

for (const [categoryIndex, category] of themeCategories.entries()) {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.setAttribute('role', 'tab');
  markTranslation(tab, category.name);
  tab.toggleAttribute('data-active', categoryIndex === 0);

  const section = document.createElement('section');
  section.className = 'theme-category';
  section.id = `theme-category-${categoryIndex}`;
  section.hidden = categoryIndex !== 0;
  tab.setAttribute('aria-controls', section.id);
  tab.setAttribute('aria-selected', String(categoryIndex === 0));
  tab.addEventListener('click', () => {
    for (const item of categoryTabs.querySelectorAll('button')) {
      const active = item === tab;
      item.toggleAttribute('data-active', active);
      item.setAttribute('aria-selected', String(active));
    }
    for (const item of themeControls.querySelectorAll<HTMLElement>('.theme-category')) {
      item.hidden = item !== section;
    }
  });

  const heading = document.createElement('div');
  heading.className = 'theme-category-heading';
  const headingTitle = document.createElement('strong');
  const headingDescription = document.createElement('span');
  markTranslation(headingTitle, category.name);
  markTranslation(headingDescription, category.description);
  heading.append(headingTitle, headingDescription);
  const controls = document.createElement('div');
  controls.className = 'theme-category-controls';
  section.append(heading, controls);
  categoryTabs.append(tab);
  themeControls.append(section);
  for (const variable of category.variables) {
    categoryTargets.set(variable, controls);
  }
}

for (const definition of themeDefinitions) {
  const control = document.createElement('div');
  control.className = 'theme-control';
  const label = document.createElement('label');
  label.htmlFor = `theme-${definition.variable}`;
  markTranslation(label, definition.label);
  const output = document.createElement('output');
  const input = document.createElement('input');
  input.id = `theme-${definition.variable}`;
  input.type = definition.type;
  input.value = String(definition.default);
  if (definition.type === 'range') {
    input.min = String(definition.min);
    input.max = String(definition.max);
  }
  output.textContent = themeValue(definition);
  input.addEventListener('input', () => {
    const value = themeValue(definition);
    tabsElement.style.setProperty(definition.variable, value);
    output.textContent = value;
    if (!applyingPreset) {
      localStorage.removeItem(presetStorageKey);
      saveThemeSettings();
      for (const preset of themePresetsContainer.querySelectorAll('.theme-preset')) {
        preset.removeAttribute('data-active');
      }
    }
    updateThemeCode();
  });
  themeInputs.set(definition.variable, input);
  control.append(label, output, input);
  categoryTargets.get(definition.variable)?.append(control);
  output.textContent = themeValue(definition);
}

for (const preset of themePresets) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-preset';
  button.dataset.preset = preset.name;
  const preview = document.createElement('span');
  preview.className = 'theme-preset-preview';
  preview.style.background = preset.values['--chrome-tabs-background'];
  preview.innerHTML = `<i style="background:${preset.values['--chrome-tab-active-background']}"></i><b style="background:${preset.values['--chrome-tabs-accent-color']}"></b>`;
  const copy = document.createElement('span');
  copy.className = 'theme-preset-copy';
  const name = document.createElement('strong');
  const description = document.createElement('span');
  markTranslation(name, preset.name);
  markTranslation(description, preset.description);
  copy.append(name, description);
  button.append(preview, copy);
  button.addEventListener('click', () => {
    applyingPreset = true;
    for (const definition of themeDefinitions) {
      const value =
        preset.values[definition.variable as keyof typeof preset.values] ??
        definition.default;
      const input = themeInputs.get(definition.variable)!;
      input.value = String(value);
      input.dispatchEvent(new Event('input'));
    }
    applyingPreset = false;
    for (const item of themePresetsContainer.querySelectorAll('.theme-preset')) {
      item.toggleAttribute('data-active', item === button);
    }
    localStorage.removeItem(themeStorageKey);
    localStorage.setItem(presetStorageKey, preset.name);
  });
  themePresetsContainer.append(button);
}

const savedPreset = localStorage.getItem(presetStorageKey);
const savedPresetButton = [
  ...themePresetsContainer.querySelectorAll<HTMLButtonElement>('.theme-preset'),
].find((button) => button.dataset.preset === savedPreset);
if (savedPresetButton) {
  savedPresetButton.click();
} else {
  const savedTheme = localStorage.getItem(themeStorageKey);
  if (savedTheme) {
    try {
      const values = JSON.parse(savedTheme) as Record<string, unknown>;
      applyingPreset = true;
      for (const definition of themeDefinitions) {
        const value = values[definition.variable];
        if (typeof value !== 'string') continue;
        const input = themeInputs.get(definition.variable)!;
        input.value = value;
        input.dispatchEvent(new Event('input'));
      }
      applyingPreset = false;
      saveThemeSettings();
    } catch {
      applyingPreset = false;
      localStorage.removeItem(themeStorageKey);
    }
  }
}

document.querySelector<HTMLButtonElement>('#reset-theme')!
  .addEventListener('click', () => {
    for (const preset of themePresetsContainer.querySelectorAll('.theme-preset')) {
      preset.removeAttribute('data-active');
    }
    for (const definition of themeDefinitions) {
      const input = themeInputs.get(definition.variable)!;
      input.value = String(definition.default);
      tabsElement.style.removeProperty(definition.variable);
      input.dispatchEvent(new Event('input'));
    }
    localStorage.removeItem(presetStorageKey);
    localStorage.removeItem(themeStorageKey);
  });

document.querySelector<HTMLButtonElement>('#copy-theme')!
  .addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    await navigator.clipboard.writeText(themeCode.textContent ?? '');
    button.textContent = t('已复制');
    window.setTimeout(() => {
      button.textContent = t('复制配置');
    }, 1200);
  });

function activeGroup() {
  return groups.find((group) => group.id === activeGroupId)!;
}

function visibleTabs() {
  return tabs.filter((tab) => tab.groupId === activeGroupId);
}

function render() {
  const group = activeGroup();
  tabsElement.locale = locale;
  tabsElement.tabs = visibleTabs().map((tab) => ({ ...tab, title: t(tab.title) }));
  tabsElement.activeTabId = group.activeTabId;
  tabsElement.groups = groups.map((group) => ({ ...group, name: t(group.name) }));
  tabsElement.activeGroupId = activeGroupId;
  activeTitle.textContent =
    t(tabs.find((tab) => tab.id === group.activeTabId)?.title ?? '空标签页');
  stateOutput.textContent = JSON.stringify({
    activeGroupId,
    groups: groups.map((item) => ({ ...item, name: t(item.name) })),
    tabs: tabs.map((item) => ({ ...item, title: t(item.title) })),
  }, null, 2);
}

function log(name: string, detail?: unknown) {
  const item = document.createElement('li');
  item.dataset.logName = name;
  if (detail) item.dataset.logDetail = JSON.stringify(detail);
  item.textContent = detail ? `${t(name)} ${item.dataset.logDetail}` : t(name);
  eventLog.prepend(item);
}

function detail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}

function activate(tabId: string) {
  groups = groups.map((group) =>
    group.id === activeGroupId ? { ...group, activeTabId: tabId } : group,
  );
  render();
}

function closeMany(tabId: string, range: 'left' | 'right' | 'others') {
  const current = visibleTabs();
  const index = current.findIndex((tab) => tab.id === tabId);
  const closing = new Set(current.filter((tab, tabIndex) => {
    if (range === 'left') return tabIndex < index;
    if (range === 'right') return tabIndex > index;
    return tab.id !== tabId;
  }).map((tab) => tab.id));
  tabs = tabs.filter((tab) => !closing.has(tab.id));
  activate(tabId);
}

tabsElement.addEventListener(chromeTabsEvents.activate, (event) => {
  const { tabId } = detail<ChromeTabEventDetail>(event);
  log('激活标签', { tabId });
  activate(tabId);
});

tabsElement.addEventListener(chromeTabsEvents.editAddress, (event) => {
  const { tabId } = detail<ChromeTabEventDetail>(event);
  const tab = tabs.find((item) => item.id === tabId);
  if (!tab) return;
  const title = window.prompt(t('修改标签名称'), t(tab.title))?.trim();
  if (!title) return;
  tab.title = title;
  log('修改名称', { tabId, title });
  render();
});

tabsElement.addEventListener(chromeTabsEvents.add, () => {
  const tab = {
    id: crypto.randomUUID(),
    groupId: activeGroupId,
    title: `${t('新标签')} ${visibleTabs().length + 1}`,
  };
  tabs.push(tab);
  log('新增标签', { tabId: tab.id });
  activate(tab.id);
});

tabsElement.addEventListener(chromeTabsEvents.close, (event) => {
  const { tabId } = detail<ChromeTabEventDetail>(event);
  const current = visibleTabs();
  const index = current.findIndex((tab) => tab.id === tabId);
  tabs = tabs.filter((tab) => tab.id !== tabId);
  if (current.length === 1) {
    groups = groups.map((group) =>
      group.id === activeGroupId ? { ...group, activeTabId: '' } : group,
    );
    render();
    log('关闭标签', { tabId });
    return;
  }
  if (activeGroup().activeTabId === tabId) {
    activate(current[Math.max(0, index - 1)].id);
  } else {
    render();
  }
  log('关闭标签', { tabId });
});

for (const [eventName, range] of [
  [chromeTabsEvents.closeRight, 'right'],
  [chromeTabsEvents.closeOthers, 'others'],
  [chromeTabsEvents.closeLeft, 'left'],
] as const) {
  tabsElement.addEventListener(eventName, (event) => {
    const { tabId } = detail<ChromeTabEventDetail>(event);
    log(eventName, { tabId });
    closeMany(tabId, range);
  });
}

tabsElement.addEventListener(chromeTabsEvents.reorder, (event) => {
  const { tabId, targetTabId, position } =
    detail<ChromeTabReorderEventDetail>(event);
  const current = visibleTabs();
  const sourceIndex = current.findIndex((tab) => tab.id === tabId);
  const [source] = current.splice(sourceIndex, 1);
  const targetIndex = current.findIndex((tab) => tab.id === targetTabId);
  current.splice(targetIndex + (position === 'after' ? 1 : 0), 0, source);
  let index = 0;
  tabs = tabs.map((tab) =>
    tab.groupId === activeGroupId ? current[index++] : tab,
  );
  log('拖拽排序', { tabId, targetTabId, position });
  render();
});

tabsElement.addEventListener(chromeTabsEvents.switchGroup, (event) => {
  activeGroupId = detail<ChromeTabGroupEventDetail>(event).groupId;
  log('切换分组', { activeGroupId });
  render();
});

tabsElement.addEventListener(chromeTabsEvents.addGroup, () => {
  const name = window.prompt(t('新分组名称'))?.trim();
  if (!name) return;
  const groupId = crypto.randomUUID();
  const tabId = crypto.randomUUID();
  groups.push({ id: groupId, name, activeTabId: tabId });
  tabs.push({ id: tabId, groupId, title: t('新标签页') });
  activeGroupId = groupId;
  log('新建分组', { groupId, name });
  render();
});

tabsElement.addEventListener(chromeTabsEvents.renameGroup, (event) => {
  const { groupId } = detail<ChromeTabGroupEventDetail>(event);
  const group = groups.find((item) => item.id === groupId);
  if (!group) return;
  const name = window.prompt(t('修改分组名称'), t(group.name))?.trim();
  if (!name) return;
  group.name = name;
  log('重命名分组', { groupId, name });
  render();
});

tabsElement.addEventListener(chromeTabsEvents.deleteGroup, (event) => {
  const { groupId } = detail<ChromeTabGroupEventDetail>(event);
  if (groups.length === 1 || !window.confirm(t('删除该分组及其中所有标签页？'))) return;
  groups = groups.filter((group) => group.id !== groupId);
  tabs = tabs.filter((tab) => tab.groupId !== groupId);
  if (activeGroupId === groupId) activeGroupId = groups[0].id;
  log('删除分组', { groupId });
  render();
});

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-script-action]')) {
  button.addEventListener('click', () => {
    const action = button.dataset.scriptAction;
    if (action === 'activate') {
      activeGroupId = 'work';
      groups = groups.map((group) =>
        group.id === 'work' ? { ...group, activeTabId: 'customers' } : group,
      );
      scriptCode.textContent =
        "tabsElement.activeGroupId = 'work';\ntabsElement.activeTabId = 'customers';";
      log('Script API', { action: 'activate', tabId: 'customers' });
      render();
      return;
    }

    if (action === 'add') {
      const tab = {
        id: crypto.randomUUID(),
        groupId: activeGroupId,
        title: `${t('新标签')} ${visibleTabs().length + 1}`,
      };
      tabs.push(tab);
      scriptCode.textContent =
        "tabsElement.tabs = [...tabsElement.tabs, {\n  id: crypto.randomUUID(),\n  title: 'New tab',\n}];";
      log('Script API', { action: 'add', tabId: tab.id });
      activate(tab.id);
      return;
    }

    if (action === 'close') {
      const current = visibleTabs();
      if (current.length === 1) return;
      const tabId = activeGroup().activeTabId;
      const index = current.findIndex((tab) => tab.id === tabId);
      const remaining = current.filter((tab) => tab.id !== tabId);
      tabs = tabs.filter((tab) => tab.id !== tabId);
      scriptCode.textContent =
        `tabsElement.tabs = tabsElement.tabs.filter(\n  tab => tab.id !== '${tabId}',\n);`;
      log('Script API', { action: 'close', tabId });
      activate(remaining[Math.max(0, index - 1)].id);
      return;
    }

    if (action === 'closeRight') {
      const tabId = activeGroup().activeTabId;
      scriptCode.textContent =
        `const index = tabsElement.tabs.findIndex(\n  tab => tab.id === '${tabId}',\n);\ntabsElement.tabs = tabsElement.tabs.slice(0, index + 1);`;
      log('Script API', { action: 'closeRight', tabId });
      closeMany(tabId, 'right');
      return;
    }

    if (action === 'groupWork') {
      activeGroupId = 'work';
      scriptCode.textContent =
        "tabsElement.activeGroupId = 'work';\ntabsElement.tabs = workTabs;";
      log('Script API', { action: 'switchGroup', groupId: 'work' });
      render();
      return;
    }

    activeGroupId = 'study';
    scriptCode.textContent =
      "tabsElement.activeGroupId = 'study';\ntabsElement.tabs = studyTabs;";
    log('Script API', { action: 'switchGroup', groupId: 'study' });
    render();
  });
}

function applyLocale(nextLocale: ChromeTabsLocale) {
  locale = nextLocale;
  localStorage.setItem(localeStorageKey, locale);
  languageSelect.value = locale;
  document.documentElement.lang =
    locale === 'zh' ? 'zh-CN' : locale === 'ko' ? 'ko-KR' : 'en';
  document.title = locale === 'zh'
    ? 'Qn Chrome Tabs 组件演示'
    : locale === 'ko'
      ? 'Qn Chrome Tabs 컴포넌트 데모'
      : 'Qn Chrome Tabs Component Demo';
  for (const element of document.querySelectorAll<HTMLElement>('[data-zh]')) {
    element.textContent = t(element.dataset.zh!);
  }
  for (
    const code of document.querySelectorAll<HTMLElement>(
      '.usage-code code',
    )
  ) {
    const source = code.dataset.source ?? code.textContent ?? '';
    code.dataset.source = source;
    code.textContent = source
      .replaceAll("'首页'", `'${t('首页')}'`)
      .replaceAll("'文档'", `'${t('文档')}'`);
  }
  for (const item of eventLog.querySelectorAll<HTMLElement>('[data-log-name]')) {
    item.textContent = item.dataset.logDetail
      ? `${t(item.dataset.logName!)} ${item.dataset.logDetail}`
      : t(item.dataset.logName!);
  }
  languageSelect.setAttribute('aria-label', t('语言'));
  render();
  renderIconDemo();
}

languageSelect.addEventListener('change', () => {
  applyLocale(languageSelect.value as ChromeTabsLocale);
});

window.addEventListener('message', (event) => {
  if (event.source !== window.parent) return;
  const message = event.data as {
    type?: string;
    locale?: ChromeTabsLocale;
  };
  if (
    message.type === 'qn-chrome-tabs-locale'
    && ['zh', 'en', 'ko'].includes(message.locale ?? '')
  ) {
    applyLocale(message.locale!);
  }
});

window.addEventListener('keydown', (event) => {
  if (
    window.parent === window
    || !(event.metaKey || event.ctrlKey)
    || event.key.toLowerCase() !== 'k'
  ) {
    return;
  }

  event.preventDefault();
  const parentOrigin = document.referrer
    ? new URL(document.referrer).origin
    : window.location.origin;
  window.parent.postMessage(
    { type: 'qn-chrome-tabs-open-search' },
    parentOrigin,
  );
});

updateThemeCode();
applyLocale(locale);
