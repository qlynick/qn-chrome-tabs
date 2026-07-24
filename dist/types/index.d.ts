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
export declare class ChromeTabsElement extends HTMLElement {
    #private;
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
}
