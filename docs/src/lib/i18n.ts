export type DocsLocale = 'zh' | 'en' | 'ko';

export const docsLocales: DocsLocale[] = ['zh', 'en', 'ko'];

export const localeItems = [
  { locale: 'zh', name: '中文' },
  { locale: 'en', name: 'English' },
  { locale: 'ko', name: '한국어' },
] satisfies Array<{ locale: DocsLocale; name: string }>;

export const localeText = {
  zh: {
    home: '首页',
    start: '快速开始',
    guide: '使用指南',
    examples: '使用案例',
    search: '搜索文档',
    loadingSearch: '正在加载搜索…',
    close: '关闭',
    language: '语言',
    document: '文档',
  },
  en: {
    home: 'Home',
    start: 'Quick Start',
    guide: 'Guide',
    examples: 'Examples',
    search: 'Search documentation',
    loadingSearch: 'Loading search…',
    close: 'Close',
    language: 'Language',
    document: 'Documentation',
  },
  ko: {
    home: '홈',
    start: '빠른 시작',
    guide: '사용 가이드',
    examples: '사용 예제',
    search: '문서 검색',
    loadingSearch: '검색을 불러오는 중…',
    close: '닫기',
    language: '언어',
    document: '문서',
  },
} satisfies Record<DocsLocale, Record<string, string>>;

export const uiTranslations: Record<
  DocsLocale,
  Partial<Record<string, string>>
> = {
  zh: {
    'Choose a language(language switcher)': '选择语言',
    'Close Search(search dialog)(aria-label)': '关闭搜索',
    'Next Page(pagination)': '下一页',
    'No results found(search dialog)': '没有搜索结果',
    'On this page(table of contents)': '本页目录',
    'Open Search(search trigger)(aria-label)': '打开搜索',
    'Previous Page(pagination)': '上一页',
    'Search(search trigger)': '搜索',
    'Toggle Menu(home layout header)(aria-label)': '切换菜单',
  },
  en: {},
  ko: {
    'Choose a language(language switcher)': '언어 선택',
    'Close Search(search dialog)(aria-label)': '검색 닫기',
    'Next Page(pagination)': '다음 페이지',
    'No results found(search dialog)': '검색 결과가 없습니다',
    'On this page(table of contents)': '이 페이지의 목차',
    'Open Search(search trigger)(aria-label)': '검색 열기',
    'Previous Page(pagination)': '이전 페이지',
    'Search(search trigger)': '검색',
    'Toggle Menu(home layout header)(aria-label)': '메뉴 전환',
  },
};

export function getDocsLocale(pathname: string): DocsLocale {
  if (/^\/en(?:\/|$)/.test(pathname)) return 'en';
  if (/^\/ko(?:\/|$)/.test(pathname)) return 'ko';
  return 'zh';
}

export function localePrefix(locale: DocsLocale) {
  return locale === 'zh' ? '' : `/${locale}`;
}

export function localizePath(pathname: string, locale: DocsLocale) {
  const pathWithoutLocale = pathname.replace(/^\/(?:en|ko)(?=\/|$)/, '') || '/';
  const prefix = localePrefix(locale);
  return pathWithoutLocale === '/' ? prefix || '/' : `${prefix}${pathWithoutLocale}`;
}
