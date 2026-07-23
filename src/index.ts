import styles from './styles.css?inline';

export const CHROME_TABS_TAG = 'qn-chrome-tabs';

export const chromeTabsEvents = {
  activate: 'tab-activate',
  editAddress: 'tab-edit-address',
  close: 'tab-close',
  add: 'tab-add',
  switchGroup: 'group-switch',
  addGroup: 'group-add',
  renameGroup: 'group-rename',
  deleteGroup: 'group-delete',
  reorder: 'tab-reorder',
  closeLeft: 'tab-close-left',
  closeRight: 'tab-close-right',
  closeOthers: 'tab-close-others',
} as const;

export interface ChromeTabItem {
  id: string;
  title: string;
  backgroundColor?: string;
}

export interface ChromeTabEventDetail {
  tabId: string;
}

export interface ChromeTabGroup {
  id: string;
  name: string;
}

export interface ChromeTabGroupEventDetail {
  groupId: string;
}

export interface ChromeTabReorderEventDetail {
  tabId: string;
  targetTabId: string;
  position: 'before' | 'after';
}

export type ChromeTabsLocale = 'zh' | 'en' | 'ko';

const messages = {
  zh: {
    close: '关闭',
    addTab: '添加标签页',
    addTabTitle: '添加标签页后，可再次打开同一个模块',
    selectGroup: '选择分组',
    rename: '重命名',
    delete: '删除',
    addGroup: '＋ 新建分组',
    closeLeft: '关闭左侧所有',
    closeRight: '关闭右侧所有',
    closeOthers: '关闭其他所有',
    scrollLeft: '向左滚动标签',
    scrollRight: '向右滚动标签',
  },
  en: {
    close: 'Close',
    addTab: 'Add tab',
    addTabTitle: 'Add a tab to open the same module again',
    selectGroup: 'Select group',
    rename: 'Rename',
    delete: 'Delete',
    addGroup: '＋ New group',
    closeLeft: 'Close all to the left',
    closeRight: 'Close all to the right',
    closeOthers: 'Close other tabs',
    scrollLeft: 'Scroll tabs left',
    scrollRight: 'Scroll tabs right',
  },
  ko: {
    close: '닫기',
    addTab: '탭 추가',
    addTabTitle: '탭을 추가하면 같은 모듈을 다시 열 수 있습니다',
    selectGroup: '그룹 선택',
    rename: '이름 변경',
    delete: '삭제',
    addGroup: '＋ 새 그룹',
    closeLeft: '왼쪽 탭 모두 닫기',
    closeRight: '오른쪽 탭 모두 닫기',
    closeOthers: '다른 탭 모두 닫기',
    scrollLeft: '탭을 왼쪽으로 스크롤',
    scrollRight: '탭을 오른쪽으로 스크롤',
  },
} as const;

function browserLocale(): ChromeTabsLocale {
  const language = navigator.language.toLowerCase();
  if (language.startsWith('en')) return 'en';
  if (language.startsWith('ko')) return 'ko';
  return 'zh';
}

export class ChromeTabsElement extends HTMLElement {
  #tabs: ChromeTabItem[] = [];
  #activeTabId = '';
  #groups: ChromeTabGroup[] = [];
  #activeGroupId = '';
  #locale: ChromeTabsLocale = browserLocale();
  #frozenTabWidths = new Map<string, number>();
  #enteringTabIds = new Set<string>();
  #tabsInitialized = false;
  readonly #navigation: HTMLDivElement;
  readonly #viewport: HTMLDivElement;
  readonly #content: HTMLDivElement;
  readonly #scrollLeftButton: HTMLButtonElement;
  readonly #scrollRightButton: HTMLButtonElement;
  readonly #groupContent: HTMLDivElement;
  readonly #contextMenu: HTMLDivElement;
  readonly #resizeObserver = new ResizeObserver(() => this.#updateScrollControls());
  readonly #closeMenuOnOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    const groupMenu =
      this.shadowRoot?.querySelector<HTMLDetailsElement>('.group-menu');
    if (groupMenu && !path.includes(groupMenu)) groupMenu.open = false;
    if (!path.includes(this.#contextMenu)) this.#contextMenu.hidden = true;
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${styles}</style><div class="tab-strip" part="strip"><div class="tab-navigation"><button class="tab-scroll-button" data-direction="left" part="scroll-left-button" type="button" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"/></svg></button><div class="chrome-tabs" part="tab-list" role="tablist"><div class="chrome-tabs-content"></div></div><button class="tab-scroll-button" data-direction="right" part="scroll-right-button" type="button" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5"/></svg></button></div><div class="group-content"></div></div><div class="tab-context-menu" part="context-menu" hidden></div>`;
    this.#navigation = root.querySelector('.tab-navigation')!;
    this.#viewport = root.querySelector('.chrome-tabs')!;
    this.#content = root.querySelector('.chrome-tabs-content')!;
    this.#scrollLeftButton = root.querySelector('[data-direction="left"]')!;
    this.#scrollRightButton = root.querySelector('[data-direction="right"]')!;
    this.#groupContent = root.querySelector('.group-content')!;
    this.#contextMenu = root.querySelector('.tab-context-menu')!;
    this.#navigation.addEventListener('pointerleave', () => this.#releaseTabWidths());
    this.#viewport.addEventListener('scroll', () => this.#updateScrollControls());
    this.#viewport.addEventListener('wheel', (event) => {
      if (this.#viewport.scrollWidth <= this.#viewport.clientWidth) return;
      event.preventDefault();
      this.#viewport.scrollLeft +=
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
    }, { passive: false });
    for (const button of [this.#scrollLeftButton, this.#scrollRightButton]) {
      button.addEventListener('click', () => {
        const direction = button === this.#scrollLeftButton ? -1 : 1;
        this.#viewport.scrollBy({
          left: direction * Math.max(160, this.#viewport.clientWidth * 0.7),
          behavior: 'smooth',
        });
      });
    }
  }

  connectedCallback() {
    document.addEventListener('pointerdown', this.#closeMenuOnOutsideClick);
    this.#resizeObserver.observe(this.#viewport);
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this.#closeMenuOnOutsideClick);
    this.#resizeObserver.disconnect();
  }

  set tabs(value: ChromeTabItem[]) {
    if (this.#tabsInitialized) {
      const currentTabIds = new Set(this.#tabs.map((tab) => tab.id));
      for (const tab of value) {
        if (!currentTabIds.has(tab.id)) this.#enteringTabIds.add(tab.id);
      }
    }
    this.#tabsInitialized = true;
    this.#tabs = value;
    this.#render();
  }

  get tabs(): ChromeTabItem[] {
    return this.#tabs;
  }

  set activeTabId(value: string) {
    this.#activeTabId = value;
    this.#render();
  }

  get activeTabId(): string {
    return this.#activeTabId;
  }

  set groups(value: ChromeTabGroup[]) {
    this.#groups = value;
    this.#render();
  }

  get groups(): ChromeTabGroup[] {
    return this.#groups;
  }

  set activeGroupId(value: string) {
    this.#activeGroupId = value;
    this.#render();
  }

  get activeGroupId(): string {
    return this.#activeGroupId;
  }

  set locale(value: ChromeTabsLocale) {
    this.#locale = value in messages ? value : 'zh';
    this.#render();
  }

  get locale(): ChromeTabsLocale {
    return this.#locale;
  }

  #emit(
    name: string,
    detail?:
      | ChromeTabEventDetail
      | ChromeTabGroupEventDetail
      | ChromeTabReorderEventDetail,
  ) {
    this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
    }));
  }

  #render() {
    const text = messages[this.#locale];
    this.#scrollLeftButton.setAttribute('aria-label', text.scrollLeft);
    this.#scrollLeftButton.title = text.scrollLeft;
    this.#scrollRightButton.setAttribute('aria-label', text.scrollRight);
    this.#scrollRightButton.title = text.scrollRight;
    const fragment = document.createDocumentFragment();

    for (const tab of this.#tabs) {
      const active = tab.id === this.#activeTabId;
      const element = document.createElement('div');
      element.className = 'chrome-tab';
      element.setAttribute('part', active ? 'tab active-tab' : 'tab');
      element.dataset.tabId = tab.id;
      element.toggleAttribute('data-active', active);
      element.setAttribute('role', 'tab');
      element.setAttribute('aria-selected', String(active));
      element.draggable = true;
      if (this.#enteringTabIds.has(tab.id)) {
        element.toggleAttribute('data-entering', true);
        element.addEventListener('animationend', () => {
          this.#enteringTabIds.delete(tab.id);
          element.removeAttribute('data-entering');
        }, { once: true });
      }
      const frozenWidth = this.#frozenTabWidths.get(tab.id);
      if (frozenWidth !== undefined) {
        element.style.flex = `0 0 ${frozenWidth}px`;
        element.style.maxWidth = `${frozenWidth}px`;
      }
      if (active) {
        element.style.setProperty(
          '--tab-background',
          tab.backgroundColor ?? 'var(--chrome-tab-active-background)',
        );
      }
      element.addEventListener('click', () => {
        this.#closeMenu();
        this.#emit(chromeTabsEvents.activate, { tabId: tab.id });
      });
      element.addEventListener('dblclick', () => {
        this.#emit(chromeTabsEvents.editAddress, { tabId: tab.id });
      });
      element.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        this.#showContextMenu(event, tab.id);
      });
      element.addEventListener('dragstart', (event) => {
        this.#closeMenus();
        event.dataTransfer?.setData('text/plain', tab.id);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        element.toggleAttribute('data-dragging', true);
      });
      element.addEventListener('dragend', () => {
        element.removeAttribute('data-dragging');
        this.#clearDropIndicators();
      });
      element.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
        const position =
          event.clientX < element.getBoundingClientRect().left + element.offsetWidth / 2
            ? 'before'
            : 'after';
        this.#clearDropIndicators();
        element.dataset.dropPosition = position;
      });
      element.addEventListener('drop', (event) => {
        event.preventDefault();
        const tabId = event.dataTransfer?.getData('text/plain');
        const position = element.dataset.dropPosition as 'before' | 'after' | undefined;
        this.#clearDropIndicators();
        if (!tabId || tabId === tab.id || !position) return;
        this.#emit(chromeTabsEvents.reorder, {
          tabId,
          targetTabId: tab.id,
          position,
        });
      });

      const dividers = document.createElement('div');
      dividers.className = 'chrome-tab-dividers';

      const background = document.createElement('div');
      background.className = 'chrome-tab-background';
      background.setAttribute('aria-hidden', 'true');
      if (active) {
        background.style.backgroundColor = 'var(--tab-background)';
        background.style.color = 'var(--tab-background)';
      }

      const content = document.createElement('div');
      content.className = 'chrome-tab-content';

      const title = document.createElement('span');
      title.className = 'chrome-tab-title';
      title.setAttribute('part', 'title');
      title.textContent = tab.title;

      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'chrome-tab-close';
      close.setAttribute('part', 'close-button');
      close.setAttribute('aria-label', `${text.close} ${tab.title}`);
      close.addEventListener('dblclick', (event) => event.stopPropagation());
      close.addEventListener('click', (event) => {
        event.stopPropagation();
        if (element.hasAttribute('data-closing')) return;
        this.#freezeTabWidths(tab.id);
        element.toggleAttribute('data-closing', true);
        let emitted = false;
        const finish = () => {
          if (emitted) return;
          emitted = true;
          this.#emit(chromeTabsEvents.close, { tabId: tab.id });
        };
        element.addEventListener('animationend', finish, { once: true });
        window.setTimeout(finish, 200);
      });

      content.append(title, close);
      element.append(dividers, background, content);
      fragment.append(element);
    }

    const divider = document.createElement('div');
    divider.className = 'new-tab-divider';
    divider.setAttribute('aria-hidden', 'true');

    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'new-tab-button';
    add.setAttribute('part', 'add-button');
    add.setAttribute('aria-label', text.addTab);
    add.title = text.addTabTitle;
    add.textContent = '+';
    add.addEventListener('click', () => {
      this.#closeMenu();
      this.#emit(chromeTabsEvents.add);
    });
    const addSlot = document.createElement('div');
    addSlot.className = 'new-tab-button-slot';
    addSlot.append(add);

    const groupMenu = document.createElement('details');
    groupMenu.className = 'group-menu';

    const groupSummary = document.createElement('summary');
    groupSummary.setAttribute('aria-label', text.selectGroup);
    groupSummary.setAttribute('part', 'group-toggle');
    groupSummary.title = text.selectGroup;
    groupSummary.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"/></svg>';

    const groupDropdown = document.createElement('div');
    groupDropdown.className = 'group-dropdown';
    groupDropdown.setAttribute('part', 'group-menu');

    for (const group of this.#groups) {
      const row = document.createElement('div');
      row.className = 'group-row';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'group-option';
      button.setAttribute(
        'part',
        group.id === this.#activeGroupId
          ? 'group-option active-group-option'
          : 'group-option',
      );
      button.toggleAttribute('data-active', group.id === this.#activeGroupId);
      button.textContent = group.name;
      button.addEventListener('click', () => {
        groupMenu.open = false;
        this.#emit(chromeTabsEvents.switchGroup, { groupId: group.id });
      });

      const actions = document.createElement('div');
      actions.className = 'group-row-actions';
      for (const [label, eventName, icon] of [
        [
          text.rename,
          chromeTabsEvents.renameGroup,
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.5 4 4-.5L18.7 8.8l-3.5-3.5L4 16.5Zm13-12.9 3.4 3.4-1.2 1.2-3.4-3.4L17 3.6Z"/></svg>',
        ],
        [
          text.delete,
          chromeTabsEvents.deleteGroup,
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8l1 2h4v2H3V5h4l1-2Zm-2 6h12l-1 12H7L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z"/></svg>',
        ],
      ] as const) {
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'group-row-action';
        action.setAttribute('aria-label', `${label} ${group.name}`);
        action.title = label;
        action.innerHTML = icon;
        action.addEventListener('click', () => {
          groupMenu.open = false;
          this.#emit(eventName, { groupId: group.id });
        });
        actions.append(action);
      }

      row.append(button, actions);
      groupDropdown.append(row);
    }

    const groupActions = document.createElement('div');
    groupActions.className = 'group-actions';
    const addGroup = document.createElement('button');
    addGroup.type = 'button';
    addGroup.textContent = text.addGroup;
    addGroup.addEventListener('click', () => {
      groupMenu.open = false;
      this.#emit(chromeTabsEvents.addGroup);
    });
    groupActions.append(addGroup);

    groupDropdown.append(groupActions);
    groupMenu.append(groupSummary, groupDropdown);
    fragment.append(divider, addSlot);
    this.#content.replaceChildren(fragment);
    this.#groupContent.replaceChildren(groupMenu);
    requestAnimationFrame(() => {
      this.#updateScrollControls();
      if (this.#frozenTabWidths.size === 0) this.#scrollActiveTabIntoView();
    });
  }

  #freezeTabWidths(closingTabId: string) {
    const tabs = [...this.#content.querySelectorAll<HTMLElement>('.chrome-tab')];
    if (this.#frozenTabWidths.size === 0) {
      for (const tab of tabs) {
        if (tab.dataset.tabId) {
          this.#frozenTabWidths.set(tab.dataset.tabId, tab.getBoundingClientRect().width);
        }
      }
    }
    const closingIndex = tabs.findIndex((tab) => tab.dataset.tabId === closingTabId);
    if (closingIndex === tabs.length - 1 && closingIndex > 0) {
      const extraWidth =
        this.#frozenTabWidths.get(closingTabId)! / closingIndex;
      for (const tab of tabs.slice(0, closingIndex)) {
        const tabId = tab.dataset.tabId;
        if (tabId) {
          this.#frozenTabWidths.set(
            tabId,
            this.#frozenTabWidths.get(tabId)! + extraWidth,
          );
        }
      }
    }
  }

  #releaseTabWidths() {
    if (this.#frozenTabWidths.size === 0) return;
    this.#frozenTabWidths.clear();
    for (const tab of this.#content.querySelectorAll<HTMLElement>('.chrome-tab')) {
      tab.style.removeProperty('flex');
      tab.style.removeProperty('max-width');
    }
    this.#updateScrollControls();
  }

  #scrollActiveTabIntoView() {
    const active = this.#content.querySelector<HTMLElement>('[data-active]');
    if (!active) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    if (left < this.#viewport.scrollLeft) {
      this.#viewport.scrollLeft = left;
    } else if (right > this.#viewport.scrollLeft + this.#viewport.clientWidth) {
      this.#viewport.scrollLeft = right - this.#viewport.clientWidth;
    }
  }

  #updateScrollControls() {
    if (this.#frozenTabWidths.size > 0) return;
    const buttonWidth = this.#scrollLeftButton.hidden
      ? 0
      : this.#scrollLeftButton.offsetWidth + this.#scrollRightButton.offsetWidth;
    const availableWidth = this.#viewport.clientWidth + buttonWidth;
    const overflow = this.#viewport.scrollWidth > availableWidth + 1;
    this.#scrollLeftButton.hidden = !overflow;
    this.#scrollRightButton.hidden = !overflow;
    const maxScrollLeft =
      this.#viewport.scrollWidth - this.#viewport.clientWidth;
    this.#scrollLeftButton.disabled = this.#viewport.scrollLeft <= 1;
    this.#scrollRightButton.disabled =
      this.#viewport.scrollLeft >= maxScrollLeft - 1;
  }

  #closeMenu() {
    this.#closeMenus();
  }

  #closeMenus() {
    this.shadowRoot?.querySelector<HTMLDetailsElement>('.group-menu')?.removeAttribute('open');
    this.#contextMenu.hidden = true;
  }

  #clearDropIndicators() {
    for (const tab of this.#content.querySelectorAll('.chrome-tab')) {
      tab.removeAttribute('data-drop-position');
    }
  }

  #showContextMenu(event: MouseEvent, tabId: string) {
    this.#closeMenus();
    const text = messages[this.#locale];
    const fragment = document.createDocumentFragment();
    for (const [label, eventName] of [
      [text.close, chromeTabsEvents.close],
      [text.closeLeft, chromeTabsEvents.closeLeft],
      [text.closeRight, chromeTabsEvents.closeRight],
      [text.closeOthers, chromeTabsEvents.closeOthers],
    ] as const) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.addEventListener('click', () => {
        this.#closeMenus();
        this.#emit(eventName, { tabId });
      });
      fragment.append(button);
    }
    this.#contextMenu.replaceChildren(fragment);
    this.#contextMenu.style.left =
      `${Math.min(event.clientX, window.innerWidth - 176)}px`;
    this.#contextMenu.style.top =
      `${Math.min(event.clientY, window.innerHeight - 150)}px`;
    this.#contextMenu.hidden = false;
  }
}

if (!customElements.get(CHROME_TABS_TAG)) {
  customElements.define(CHROME_TABS_TAG, ChromeTabsElement);
}
