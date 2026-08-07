export declare const CHROME_TABS_TAG = "qn-chrome-tabs";
export declare const chromeTabsEvents: {
    readonly activate: "tab-activate";
    readonly editAddress: "tab-edit-address";
    readonly close: "tab-close";
    readonly add: "tab-add";
    readonly switchGroup: "group-switch";
    readonly addGroup: "group-add";
    readonly renameGroup: "group-rename";
    readonly deleteGroup: "group-delete";
    readonly reorder: "tab-reorder";
    readonly closeLeft: "tab-close-left";
    readonly closeRight: "tab-close-right";
    readonly closeOthers: "tab-close-others";
};
export interface ChromeTabItem {
    id: string;
    title: string;
    backgroundColor?: string;
    icon?: ChromeTabIcon;
}
export type ChromeTabIcon = {
    type: 'image';
    src: string;
    alt?: string;
} | {
    type: 'favicon';
    url: string;
    path?: string;
    alt?: string;
};
export type ChromeTabIconRenderer = (tab: ChromeTabItem) => Node | null;
export type ChromeTabTooltipRenderer = (tab: ChromeTabItem) => Node | string | null;
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
export declare class ChromeTabsElement extends HTMLElement {
    #private;
    renderTabIcon: ChromeTabIconRenderer | null;
    renderTabTooltip: ChromeTabTooltipRenderer | null;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    set tabs(value: ChromeTabItem[]);
    get tabs(): ChromeTabItem[];
    set activeTabId(value: string);
    get activeTabId(): string;
    set groups(value: ChromeTabGroup[]);
    get groups(): ChromeTabGroup[];
    set activeGroupId(value: string);
    get activeGroupId(): string;
    set locale(value: ChromeTabsLocale);
    get locale(): ChromeTabsLocale;
    set tabTooltipMode(value: ChromeTabTooltipMode);
    get tabTooltipMode(): ChromeTabTooltipMode;
    set hideAddButton(value: boolean);
    get hideAddButton(): boolean;
    set hideGroupButton(value: boolean);
    get hideGroupButton(): boolean;
}
