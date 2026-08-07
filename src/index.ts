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
  icon?: ChromeTabIcon;
}

export type ChromeTabIcon =
  | {
    type: 'image';
    src: string;
    alt?: string;
  }
  | {
    type: 'favicon';
    url: string;
    path?: string;
    alt?: string;
  };

export type ChromeTabIconRenderer = (
  tab: ChromeTabItem,
) => Node | null;

export type ChromeTabTooltipRenderer = (
  tab: ChromeTabItem,
) => Node | string | null;

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
export type ChromeTabTooltipMode = 'truncated' | 'always' | 'never';

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
  renderTabIcon: ChromeTabIconRenderer | null = null;
  renderTabTooltip: ChromeTabTooltipRenderer | null = null;
  #tabs: ChromeTabItem[] = [];
  #activeTabId = '';
  #groups: ChromeTabGroup[] = [];
  #activeGroupId = '';
  #locale: ChromeTabsLocale = browserLocale();
  #tabTooltipMode: ChromeTabTooltipMode = 'truncated';
  #hideAddButton = false;
  #hideGroupButton = false;
  #frozenTabWidths = new Map<string, number>();
  #addAnchorRight: number | null = null;
  #enteringTabIds = new Set<string>();
  #tabsInitialized = false;
  readonly #navigation: HTMLDivElement;
  readonly #viewport: HTMLDivElement;
  readonly #content: HTMLDivElement;
  readonly #scrollLeftButton: HTMLButtonElement;
  readonly #scrollRightButton: HTMLButtonElement;
  readonly #groupContent: HTMLDivElement;
  readonly #contextMenu: HTMLDivElement;
  readonly #tabPopover: HTMLDivElement;
  #popoverAnchor: HTMLElement | null = null;
  #popoverAlignRight = false;
  #popoverCloseTimer: number | undefined;
  readonly #repositionTabPopover = () => {
    this.#tabPopover.removeAttribute('data-moving');
    this.#positionTabPopover();
  };
  readonly #resizeObserver = new ResizeObserver(() => {
    this.#updateScrollControls();
    this.#alignAddPosition();
  });
  readonly #closeMenuOnOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    const groupMenu =
      this.shadowRoot?.querySelector<HTMLDetailsElement>('.group-menu');
    if (groupMenu && !path.includes(groupMenu)) groupMenu.open = false;
    if (!path.includes(this.#contextMenu)) this.#contextMenu.hidden = true;
    if (!path.includes(this.#tabPopover)) this.#closeTabPopover();
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${styles}</style><div class="tab-strip" part="strip"><div class="tab-navigation"><button class="tab-scroll-button" data-direction="left" part="scroll-left-button" type="button" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 7-5 5 5 5"/></svg></button><div class="chrome-tabs" part="tab-list" role="tablist"><div class="chrome-tabs-content"></div></div><button class="tab-scroll-button" data-direction="right" part="scroll-right-button" type="button" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 7 5 5-5 5"/></svg></button></div><div class="group-content"></div></div><div class="tab-context-menu" part="context-menu" hidden></div><div class="tab-popover" part="tab-popover" hidden></div>`;
    this.#navigation = root.querySelector('.tab-navigation')!;
    this.#viewport = root.querySelector('.chrome-tabs')!;
    this.#content = root.querySelector('.chrome-tabs-content')!;
    this.#scrollLeftButton = root.querySelector('[data-direction="left"]')!;
    this.#scrollRightButton = root.querySelector('[data-direction="right"]')!;
    this.#groupContent = root.querySelector('.group-content')!;
    this.#contextMenu = root.querySelector('.tab-context-menu')!;
    this.#tabPopover = root.querySelector('.tab-popover')!;
    this.#tabPopover.addEventListener('pointerenter', () => this.#cancelPopoverClose());
    this.#tabPopover.addEventListener('pointerleave', () => this.#schedulePopoverClose());
    this.#navigation.addEventListener('pointerleave', () => {
      this.#releaseTabWidths();
      this.#releaseAddPosition();
    });
    this.#viewport.addEventListener('scroll', () => {
      this.#updateScrollControls();
      this.#alignAddPosition();
      this.#repositionTabPopover();
    });
    this.#viewport.addEventListener('wheel', (event) => {
      if (this.#viewport.scrollWidth <= this.#viewport.clientWidth) return;
      event.preventDefault();
      this.#viewport.scrollLeft +=
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
    }, { passive: false });
    for (const button of [this.#scrollLeftButton, this.#scrollRightButton]) {
      const direction = button === this.#scrollLeftButton ? 'left' : 'right';
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-expanded', 'false');
      button.addEventListener('pointerenter', () => {
        this.#showOverflowTabs(button, direction);
      });
      button.addEventListener('pointerleave', () => this.#schedulePopoverClose());
      button.addEventListener('click', () => {
        const offsetDirection = direction === 'left' ? -1 : 1;
        this.#closeTabPopover();
        this.#viewport.scrollBy({
          left: offsetDirection * Math.max(160, this.#viewport.clientWidth * 0.7),
          behavior: 'smooth',
        });
      });
    }
  }

  connectedCallback() {
    document.addEventListener('pointerdown', this.#closeMenuOnOutsideClick);
    window.addEventListener('scroll', this.#repositionTabPopover, true);
    window.addEventListener('resize', this.#repositionTabPopover);
    this.#resizeObserver.observe(this.#viewport);
  }

  disconnectedCallback() {
    document.removeEventListener('pointerdown', this.#closeMenuOnOutsideClick);
    window.removeEventListener('scroll', this.#repositionTabPopover, true);
    window.removeEventListener('resize', this.#repositionTabPopover);
    this.#resizeObserver.disconnect();
    this.#cancelPopoverClose();
  }

  set tabs(value: ChromeTabItem[]) {
    if (value.length < this.#tabs.length) {
      this.#addAnchorRight = null;
      this.#content.style.removeProperty('transform');
    }
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

  set tabTooltipMode(value: ChromeTabTooltipMode) {
    this.#tabTooltipMode =
      value === 'always' || value === 'never' ? value : 'truncated';
    if (this.#tabTooltipMode === 'never') this.#closeTabPopover();
  }

  get tabTooltipMode(): ChromeTabTooltipMode {
    return this.#tabTooltipMode;
  }

  set hideAddButton(value: boolean) {
    this.#hideAddButton = Boolean(value);
    if (this.#hideAddButton) {
      this.#addAnchorRight = null;
      this.#content.style.removeProperty('transform');
    }
    this.#render();
  }

  get hideAddButton(): boolean {
    return this.#hideAddButton;
  }

  set hideGroupButton(value: boolean) {
    this.#hideGroupButton = Boolean(value);
    this.#render();
  }

  get hideGroupButton(): boolean {
    return this.#hideGroupButton;
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
    this.#closeTabPopover();
    if (this.#tabs.length === 0) {
      this.#addAnchorRight = null;
      this.#content.style.removeProperty('transform');
      this.#viewport.scrollLeft = 0;
    }
    const text = messages[this.#locale];
    this.#scrollLeftButton.setAttribute('aria-label', text.scrollLeft);
    this.#scrollRightButton.setAttribute('aria-label', text.scrollRight);
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

      const icon = this.#createTabIcon(tab);

      const title = document.createElement('span');
      title.className = 'chrome-tab-title';
      title.setAttribute('part', 'title');
      title.textContent = tab.title;
      element.addEventListener('pointerenter', () => {
        const shouldShow = this.#tabTooltipMode === 'always'
          || (
            this.#tabTooltipMode === 'truncated'
            && title.scrollWidth > title.clientWidth
          );
        if (shouldShow) {
          this.#showTabTooltip(tab, element);
        } else {
          this.#closeTabPopover();
        }
      });
      element.addEventListener('pointerleave', () => this.#schedulePopoverClose());

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

      if (icon) content.append(icon);
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
    add.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      if (this.#content.querySelectorAll('.chrome-tab').length < 5) return;
      this.#addAnchorRight ??= this.#lastTabLayoutRight();
    });
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
    if (!this.#hideAddButton) fragment.append(divider, addSlot);
    this.#content.replaceChildren(fragment);
    if (this.#hideGroupButton) {
      this.#groupContent.replaceChildren();
    } else {
      this.#groupContent.replaceChildren(groupMenu);
    }
    requestAnimationFrame(() => {
      this.#updateScrollControls();
      if (this.#frozenTabWidths.size === 0) this.#scrollActiveTabIntoView();
      this.#alignAddPosition();
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

  #releaseAddPosition() {
    if (this.#addAnchorRight === null) return;
    this.#addAnchorRight = null;
    this.#content.style.removeProperty('transform');
    this.#updateScrollControls();
    this.#scrollActiveTabIntoView();
  }

  #alignAddPosition() {
    if (this.#addAnchorRight === null) return;
    const lastTabRight = this.#lastTabLayoutRight();
    if (lastTabRight === null) return;
    const offset = this.#addAnchorRight - lastTabRight;
    this.#content.style.transform = `translateX(${offset}px)`;
  }

  #lastTabLayoutRight() {
    const tabs = this.#content.querySelectorAll<HTMLElement>('.chrome-tab');
    const lastTab = tabs[tabs.length - 1];
    if (!lastTab) return null;
    return this.#viewport.getBoundingClientRect().left
      - this.#viewport.scrollLeft
      + lastTab.offsetLeft
      + lastTab.offsetWidth;
  }

  #scrollActiveTabIntoView() {
    const active = this.#content.querySelector<HTMLElement>('[data-active]');
    if (!active) return;
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    const radius = Number.parseFloat(
      getComputedStyle(this).getPropertyValue('--chrome-tab-radius'),
    );
    const cornerSpace = Number.isFinite(radius) ? radius + 2 : 10;
    const leftControlSpace = this.#scrollLeftButton.hidden
      ? 0
      : this.#scrollLeftButton.offsetWidth;
    const rightControlSpace = this.#scrollRightButton.hidden
      ? 0
      : this.#scrollRightButton.offsetWidth;
    if (left - cornerSpace < this.#viewport.scrollLeft + leftControlSpace) {
      this.#viewport.scrollLeft = Math.max(
        0,
        left - cornerSpace - leftControlSpace,
      );
    } else if (
      right + cornerSpace
      > this.#viewport.scrollLeft + this.#viewport.clientWidth - rightControlSpace
    ) {
      this.#viewport.scrollLeft =
        right + cornerSpace + rightControlSpace - this.#viewport.clientWidth;
    }
  }

  #updateScrollControls() {
    if (this.#frozenTabWidths.size > 0 || this.#addAnchorRight !== null) return;
    const overflow = this.#viewport.scrollWidth > this.#viewport.clientWidth + 1;
    const maxScrollLeft =
      this.#viewport.scrollWidth - this.#viewport.clientWidth;
    this.#scrollLeftButton.hidden =
      !overflow || this.#viewport.scrollLeft <= 1;
    this.#scrollRightButton.hidden =
      !overflow || this.#viewport.scrollLeft >= maxScrollLeft - 1;
    this.#scrollLeftButton.disabled = false;
    this.#scrollRightButton.disabled = false;
  }

  #showOverflowTabs(
    anchor: HTMLButtonElement,
    direction: 'left' | 'right',
  ) {
    this.#cancelPopoverClose();
    const elements = new Map(
      [...this.#content.querySelectorAll<HTMLElement>('.chrome-tab')]
        .map((element) => [element.dataset.tabId, element]),
    );
    const visibleLeft = this.#viewport.scrollLeft
      + (this.#scrollLeftButton.hidden ? 0 : this.#scrollLeftButton.offsetWidth);
    const visibleRight = this.#viewport.scrollLeft
      + this.#viewport.clientWidth
      - (this.#scrollRightButton.hidden ? 0 : this.#scrollRightButton.offsetWidth);
    const hiddenTabs = this.#tabs.filter((tab) => {
      const element = elements.get(tab.id);
      if (!element) return false;
      return direction === 'left'
        ? element.offsetLeft < visibleLeft
        : element.offsetLeft + element.offsetWidth > visibleRight;
    });
    if (hiddenTabs.length === 0) {
      this.#closeTabPopover();
      return;
    }

    const list = document.createElement('div');
    list.className = 'overflow-tab-list';
    list.setAttribute('role', 'menu');
    for (const tab of hiddenTabs) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'overflow-tab-option';
      item.setAttribute('part', 'overflow-tab-option');
      item.setAttribute('role', 'menuitem');
      item.textContent = tab.title;
      item.addEventListener('click', () => {
        this.#closeTabPopover();
        this.#emit(chromeTabsEvents.activate, { tabId: tab.id });
      });
      list.append(item);
    }

    this.#openTabPopover(anchor, list, 'overflow', direction === 'right');
    anchor.setAttribute('aria-expanded', 'true');
  }

  #createTabIcon(tab: ChromeTabItem) {
    const customIcon = this.renderTabIcon?.(tab);
    const image = customIcon ? null : this.#createTabIconImage(tab);
    if (!customIcon && !image) return null;

    const wrapper = document.createElement('span');
    wrapper.className = 'chrome-tab-icon';
    wrapper.setAttribute('part', 'icon');
    if (customIcon) {
      wrapper.append(customIcon);
    } else if (image) {
      image.addEventListener('error', () => wrapper.remove(), { once: true });
      wrapper.append(image);
    }
    return wrapper;
  }

  #createTabIconImage(tab: ChromeTabItem) {
    if (!tab.icon) return null;
    const image = document.createElement('img');
    image.alt = tab.icon.alt ?? '';
    image.decoding = 'async';
    if (tab.icon.type === 'image') {
      image.src = tab.icon.src;
      return image;
    }
    try {
      const pageUrl = new URL(tab.icon.url, document.baseURI);
      image.src = new URL(
        tab.icon.path ?? '/favicon.ico',
        `${pageUrl.origin}/`,
      ).href;
      return image;
    } catch {
      return null;
    }
  }

  #showTabTooltip(tab: ChromeTabItem, anchor: HTMLElement) {
    this.#cancelPopoverClose();
    const content = this.renderTabTooltip
      ? this.renderTabTooltip(tab)
      : tab.title;
    if (content === null) {
      this.#closeTabPopover();
      return;
    }
    const body = document.createElement('div');
    body.className = 'tab-tooltip-content';
    if (typeof content === 'string') {
      body.textContent = content;
    } else {
      body.append(content);
    }
    this.#openTabPopover(anchor, body, 'tooltip');
  }

  #openTabPopover(
    anchor: HTMLElement,
    content: Node,
    kind: 'overflow' | 'tooltip',
    alignRight = false,
  ) {
    const animatePosition =
      !this.#tabPopover.hidden
      && this.#tabPopover.dataset.kind === 'tooltip'
      && kind === 'tooltip';
    this.#tabPopover.removeAttribute('data-moving');
    if (this.#popoverAnchor instanceof HTMLButtonElement) {
      this.#popoverAnchor.setAttribute('aria-expanded', 'false');
    }
    this.#popoverAnchor = anchor;
    this.#popoverAlignRight = alignRight;
    this.#tabPopover.dataset.kind = kind;
    this.#tabPopover.setAttribute('role', kind === 'tooltip' ? 'tooltip' : 'presentation');
    this.#tabPopover.replaceChildren(content);
    this.#tabPopover.hidden = false;

    if (animatePosition) {
      void this.#tabPopover.offsetLeft;
      this.#tabPopover.toggleAttribute('data-moving', true);
    }
    this.#positionTabPopover();
  }

  #positionTabPopover() {
    const anchor = this.#popoverAnchor;
    if (!anchor || this.#tabPopover.hidden) return;
    if (!anchor.isConnected) {
      this.#closeTabPopover();
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const width = this.#tabPopover.offsetWidth;
    const height = this.#tabPopover.offsetHeight;
    const left = this.#popoverAlignRight
      ? anchorRect.right - width
      : anchorRect.left;
    this.#tabPopover.style.left =
      `${Math.max(8, Math.min(left, window.innerWidth - width - 8))}px`;
    const below = anchorRect.bottom + 6;
    this.#tabPopover.style.top =
      `${below + height <= window.innerHeight - 8
        ? below
        : Math.max(8, anchorRect.top - height - 6)}px`;
  }

  #schedulePopoverClose() {
    this.#cancelPopoverClose();
    this.#popoverCloseTimer = window.setTimeout(() => {
      this.#closeTabPopover();
    }, 120);
  }

  #cancelPopoverClose() {
    if (this.#popoverCloseTimer === undefined) return;
    window.clearTimeout(this.#popoverCloseTimer);
    this.#popoverCloseTimer = undefined;
  }

  #closeTabPopover() {
    this.#cancelPopoverClose();
    if (this.#popoverAnchor instanceof HTMLButtonElement) {
      this.#popoverAnchor.setAttribute('aria-expanded', 'false');
    }
    this.#popoverAnchor = null;
    this.#tabPopover.removeAttribute('data-moving');
    this.#tabPopover.hidden = true;
    this.#tabPopover.replaceChildren();
  }

  #closeMenu() {
    this.#closeMenus();
  }

  #closeMenus() {
    this.shadowRoot?.querySelector<HTMLDetailsElement>('.group-menu')?.removeAttribute('open');
    this.#contextMenu.hidden = true;
    this.#closeTabPopover();
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
      [text.closeRight, chromeTabsEvents.closeRight],
      [text.closeOthers, chromeTabsEvents.closeOthers],
      [text.closeLeft, chromeTabsEvents.closeLeft],
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
