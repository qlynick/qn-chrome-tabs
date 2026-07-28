//#region src/styles.css?inline
var e = "qn-chrome-tabs", t = {
	activate: "tab-activate",
	editAddress: "tab-edit-address",
	close: "tab-close",
	add: "tab-add",
	switchGroup: "group-switch",
	addGroup: "group-add",
	renameGroup: "group-rename",
	deleteGroup: "group-delete",
	reorder: "tab-reorder",
	closeLeft: "tab-close-left",
	closeRight: "tab-close-right",
	closeOthers: "tab-close-others"
}, n = {
	zh: {
		close: "关闭",
		addTab: "添加标签页",
		addTabTitle: "添加标签页后，可再次打开同一个模块",
		selectGroup: "选择分组",
		rename: "重命名",
		delete: "删除",
		addGroup: "＋ 新建分组",
		closeLeft: "关闭左侧所有",
		closeRight: "关闭右侧所有",
		closeOthers: "关闭其他所有",
		scrollLeft: "向左滚动标签",
		scrollRight: "向右滚动标签"
	},
	en: {
		close: "Close",
		addTab: "Add tab",
		addTabTitle: "Add a tab to open the same module again",
		selectGroup: "Select group",
		rename: "Rename",
		delete: "Delete",
		addGroup: "＋ New group",
		closeLeft: "Close all to the left",
		closeRight: "Close all to the right",
		closeOthers: "Close other tabs",
		scrollLeft: "Scroll tabs left",
		scrollRight: "Scroll tabs right"
	},
	ko: {
		close: "닫기",
		addTab: "탭 추가",
		addTabTitle: "탭을 추가하면 같은 모듈을 다시 열 수 있습니다",
		selectGroup: "그룹 선택",
		rename: "이름 변경",
		delete: "삭제",
		addGroup: "＋ 새 그룹",
		closeLeft: "왼쪽 탭 모두 닫기",
		closeRight: "오른쪽 탭 모두 닫기",
		closeOthers: "다른 탭 모두 닫기",
		scrollLeft: "탭을 왼쪽으로 스크롤",
		scrollRight: "탭을 오른쪽으로 스크롤"
	}
};
function r() {
	let e = navigator.language.toLowerCase();
	return e.startsWith("en") ? "en" : e.startsWith("ko") ? "ko" : "zh";
}
var i = class extends HTMLElement {
	#e = [];
	#t = "";
	#n = [];
	#r = "";
	#i = r();
	#a = /* @__PURE__ */ new Map();
	#o = /* @__PURE__ */ new Set();
	#s = !1;
	#c;
	#l;
	#u;
	#d;
	#f;
	#p;
	#m;
	#h = new ResizeObserver(() => this.#S());
	#g = (e) => {
		let t = e.composedPath(), n = this.shadowRoot?.querySelector(".group-menu");
		n && !t.includes(n) && (n.open = !1), t.includes(this.#m) || (this.#m.hidden = !0);
	};
	constructor() {
		super();
		let e = this.attachShadow({ mode: "open" });
		e.innerHTML = "<style>:host{--chrome-tabs-height:38px;--chrome-tabs-background:#dee1e6;--chrome-tabs-font:12px Arial, sans-serif;--chrome-tab-height:max(var(--chrome-tabs-height), 28px);--chrome-tab-min-width:52px;--chrome-tab-max-width:120px;--chrome-tab-radius:8px;--chrome-tab-text-color:#5f6368;--chrome-tab-active-text-color:#202124;--chrome-tab-hover-background:#f4f5f6;--chrome-tab-active-background:#fff;--chrome-tab-divider-color:#aeb5c64f;--chrome-tab-close-hover-background:#dadce0;--chrome-tabs-accent-color:#1a73e8;--chrome-tabs-menu-background:#fff;--chrome-tabs-menu-border-color:#dadce0;--chrome-tabs-menu-hover-background:#f1f3f4;--chrome-tabs-menu-text-color:var(--chrome-tab-text-color);--chrome-tabs-menu-icon-color:var(--chrome-tab-text-color);--chrome-tabs-menu-icon-background:#ffffff9e;--chrome-tabs-menu-shadow:0 6px 18px #3c40433d;z-index:1000;min-width:0;display:block;position:relative}.tab-strip{height:var(--chrome-tabs-height);background:var(--chrome-tabs-background);align-items:stretch;display:flex}.tab-navigation{flex:1;min-width:0;display:flex}.chrome-tabs{min-width:0;font:var(--chrome-tabs-font);overscroll-behavior-x:contain;scrollbar-width:none;flex:1;position:relative;overflow:auto hidden}.chrome-tabs::-webkit-scrollbar{display:none}.chrome-tabs-content{align-items:flex-end;width:100%;height:100%;display:flex}.tab-scroll-button{z-index:5;width:26px;height:var(--chrome-tab-height);color:var(--chrome-tab-text-color);background:var(--chrome-tabs-background);cursor:pointer;border:0;flex:0 0 26px;align-self:flex-end;place-items:center;padding:0;display:grid}.tab-scroll-button[hidden]{display:none}.tab-scroll-button:hover:not(:disabled){color:var(--chrome-tabs-accent-color);background:var(--chrome-tab-hover-background)}.tab-scroll-button:disabled{cursor:default;opacity:.35}.tab-scroll-button svg{fill:none;stroke:currentColor;stroke-width:2.5px;stroke-linecap:round;stroke-linejoin:round;width:16px;height:16px;transform:translateY(1px)}.chrome-tab{min-width:var(--chrome-tab-min-width);max-width:var(--chrome-tab-max-width);height:var(--chrome-tab-height);flex:0 1 var(--chrome-tab-max-width);cursor:default;-webkit-user-select:none;user-select:none;position:relative}.chrome-tab[data-entering]{animation:.16s ease-out chrome-tab-enter}.chrome-tab[data-closing]{pointer-events:none;animation:.14s ease-in forwards chrome-tab-close}@keyframes chrome-tab-enter{0%{opacity:0;transform:scaleX(.88)}}@keyframes chrome-tab-close{to{opacity:0;transform:scaleX(.88)}}@media (prefers-reduced-motion:reduce){.chrome-tab[data-entering],.chrome-tab[data-closing]{animation-duration:1ms}}.chrome-tab[data-dragging]{opacity:.45}.chrome-tab[data-drop-position=before]:before,.chrome-tab[data-drop-position=after]:after{content:\"\";z-index:4;background:var(--chrome-tabs-accent-color);border-radius:1px;width:2px;position:absolute;top:5px;bottom:5px}.chrome-tab[data-drop-position=before]:before{left:0}.chrome-tab[data-drop-position=after]:after{right:0}.chrome-tab-dividers:after{content:\"\";z-index:1;background:var(--chrome-tab-divider-color);border-radius:999px;width:2px;height:18px;position:absolute;top:50%;right:0;transform:translateY(-50%)}.chrome-tab[data-active] .chrome-tab-dividers:after,.chrome-tab:hover .chrome-tab-dividers:after{opacity:0}.chrome-tab:has(+.chrome-tab[data-active]) .chrome-tab-dividers:after{opacity:0}.chrome-tab:has(+.chrome-tab:hover) .chrome-tab-dividers:after{opacity:0}.chrome-tab:has(+.new-tab-divider) .chrome-tab-dividers:after{opacity:0}.chrome-tab-background{border-radius:var(--chrome-tab-radius);background:var(--chrome-tab-hover-background);opacity:0;position:absolute;inset:0 4px}.chrome-tab:hover .chrome-tab-background,.chrome-tab[data-active] .chrome-tab-background{opacity:1}.chrome-tab:not([data-active]):hover .chrome-tab-background{inset:5px 3px}.chrome-tab[data-active] .chrome-tab-background{border-radius:calc(var(--chrome-tab-radius) + 2px) calc(var(--chrome-tab-radius) + 2px) 0 0;background:var(--chrome-tab-active-background);inset:4px 2px 0}.chrome-tab[data-active] .chrome-tab-background:before,.chrome-tab[data-active] .chrome-tab-background:after{content:\"\";width:calc(var(--chrome-tab-radius) + 2px);height:calc(var(--chrome-tab-radius) + 2px);position:absolute;bottom:0}.chrome-tab[data-active] .chrome-tab-background:before{left:calc(-1 * (var(--chrome-tab-radius) + 2px));border-bottom-right-radius:calc(var(--chrome-tab-radius) + 2px);box-shadow:4px 4px 0 4px}.chrome-tab[data-active] .chrome-tab-background:after{right:calc(-1 * (var(--chrome-tab-radius) + 2px));border-bottom-left-radius:calc(var(--chrome-tab-radius) + 2px);box-shadow:-4px 4px 0 4px}.chrome-tab-content{z-index:2;align-items:center;min-width:0;padding:0 6px;display:flex;position:absolute;inset:0 4px}.chrome-tab-title{color:var(--chrome-tab-text-color);text-overflow:ellipsis;white-space:nowrap;flex:1;overflow:hidden}.chrome-tab[data-active] .chrome-tab-title{color:var(--chrome-tab-active-text-color)}.chrome-tab-close{cursor:pointer;opacity:0;pointer-events:none;background:0 0;border:0;border-radius:50%;width:30px;height:18px;padding:0;position:absolute;right:4px}.chrome-tab-close:before,.chrome-tab-close:after{content:\"\";background:var(--chrome-tab-text-color);width:9px;height:1px;position:absolute;top:50%;right:4px;transform:translateY(-50%)rotate(45deg)}.chrome-tab-close:after{transform:translateY(-50%)rotate(-45deg)}.chrome-tab:hover .chrome-tab-close{background:linear-gradient(90deg, transparent, var(--chrome-tab-hover-background) 45%);opacity:1;pointer-events:auto}.chrome-tab:not([data-active]):hover .chrome-tab-close:hover{background:radial-gradient(circle 9px at calc(100% - 8px) 50%, var(--chrome-tab-close-hover-background) 95%, transparent), linear-gradient(90deg, transparent, var(--chrome-tab-hover-background) 45%)}.chrome-tab[data-active]:hover .chrome-tab-close{background:linear-gradient(90deg, transparent, var(--tab-background) 45%)}.chrome-tab[data-active]:hover .chrome-tab-close:hover{background:radial-gradient(circle 9px at calc(100% - 8px) 50%, var(--chrome-tab-close-hover-background) 95%, transparent), linear-gradient(90deg, transparent, var(--tab-background) 45%)}.new-tab-button-slot{height:var(--chrome-tab-height);flex-shrink:0;align-self:flex-end;place-items:center;display:grid}.new-tab-button{width:30px;height:30px;color:var(--chrome-tab-text-color);cursor:pointer;background:0 0;border:0;border-radius:50%;flex-shrink:0;place-items:center;margin:0 4px;font-size:22px;line-height:0;display:grid}.new-tab-button:hover{background:#00000014}.new-tab-divider{width:2px;height:var(--chrome-tab-height);background:0 0;flex-shrink:0;align-self:flex-end;place-items:center;display:grid}.new-tab-divider:after{content:\"\";background:var(--chrome-tab-divider-color);border-radius:999px;width:2px;height:18px}.chrome-tab:hover+.new-tab-divider,.chrome-tab[data-active]+.new-tab-divider{opacity:0}.group-content{flex-shrink:0;align-items:center;padding-right:8px;display:flex;position:relative}.group-menu{position:relative}.group-menu summary{width:30px;height:30px;color:var(--chrome-tabs-menu-icon-color);background:var(--chrome-tabs-menu-icon-background);cursor:pointer;border-radius:9px;place-items:center;line-height:0;list-style:none;display:grid;position:relative}.group-menu summary::-webkit-details-marker{display:none}.group-menu summary svg{fill:none;stroke:currentColor;stroke-width:2.5px;stroke-linecap:round;stroke-linejoin:round;width:16px;height:16px;display:block;transform:translateY(1px)}.group-menu summary:hover,.group-menu[open] summary{background:var(--chrome-tabs-menu-hover-background)}.group-dropdown{z-index:1001;border:1px solid var(--chrome-tabs-menu-border-color);background:var(--chrome-tabs-menu-background);width:210px;box-shadow:var(--chrome-tabs-menu-shadow);border-radius:8px;padding:6px;display:grid;position:absolute;top:34px;right:0}.group-row{min-width:0;position:relative}.group-option,.group-actions button{width:100%;color:var(--chrome-tabs-menu-text-color);text-align:left;cursor:pointer;background:0 0;border:0;border-radius:5px;padding:7px 9px}.group-row:hover .group-option,.group-option[data-active]{background:var(--chrome-tabs-menu-hover-background)}.group-option[data-active]{color:var(--chrome-tabs-accent-color);font-weight:600}.group-row-actions{background:linear-gradient(90deg, transparent, var(--chrome-tabs-menu-hover-background) 22%);opacity:0;pointer-events:none;border-radius:0 5px 5px 0;align-items:center;height:100%;padding-left:20px;display:flex;position:absolute;top:0;right:0}.group-row:hover .group-row-actions,.group-row:focus-within .group-row-actions{opacity:1;pointer-events:auto}.group-row-action{width:27px;height:27px;color:var(--chrome-tabs-menu-icon-color);cursor:pointer;background:0 0;border:0;border-radius:50%;place-items:center;padding:0;line-height:0;display:grid}.group-row-action:hover{background:var(--chrome-tab-close-hover-background)}.group-row-action svg{fill:currentColor;width:15px;height:15px;display:block}.group-actions{border-top:1px solid #e8eaed;margin-top:5px;padding-top:5px}.group-actions button{text-align:left}.group-actions button:hover{background:var(--chrome-tabs-menu-hover-background)}.tab-context-menu{z-index:1100;border:1px solid var(--chrome-tabs-menu-border-color);background:var(--chrome-tabs-menu-background);width:172px;box-shadow:var(--chrome-tabs-menu-shadow);border-radius:8px;padding:6px;display:grid;position:fixed}.tab-context-menu[hidden]{display:none}.tab-context-menu button{color:var(--chrome-tabs-menu-text-color);text-align:left;cursor:pointer;background:0 0;border:0;border-radius:5px;padding:8px 10px}.tab-context-menu button:hover{background:var(--chrome-tabs-menu-hover-background)}.tab-context-menu button:first-child{border-bottom:1px solid #e8eaed;border-radius:5px 5px 0 0;margin-bottom:4px}</style><div class=\"tab-strip\" part=\"strip\"><div class=\"tab-navigation\"><button class=\"tab-scroll-button\" data-direction=\"left\" part=\"scroll-left-button\" type=\"button\" hidden><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m14 7-5 5 5 5\"/></svg></button><div class=\"chrome-tabs\" part=\"tab-list\" role=\"tablist\"><div class=\"chrome-tabs-content\"></div></div><button class=\"tab-scroll-button\" data-direction=\"right\" part=\"scroll-right-button\" type=\"button\" hidden><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m10 7 5 5-5 5\"/></svg></button></div><div class=\"group-content\"></div></div><div class=\"tab-context-menu\" part=\"context-menu\" hidden></div>", this.#c = e.querySelector(".tab-navigation"), this.#l = e.querySelector(".chrome-tabs"), this.#u = e.querySelector(".chrome-tabs-content"), this.#d = e.querySelector("[data-direction=\"left\"]"), this.#f = e.querySelector("[data-direction=\"right\"]"), this.#p = e.querySelector(".group-content"), this.#m = e.querySelector(".tab-context-menu"), this.#c.addEventListener("pointerleave", () => this.#b()), this.#l.addEventListener("scroll", () => this.#S()), this.#l.addEventListener("wheel", (e) => {
			this.#l.scrollWidth <= this.#l.clientWidth || (e.preventDefault(), this.#l.scrollLeft += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
		}, { passive: !1 });
		for (let e of [this.#d, this.#f]) e.addEventListener("click", () => {
			let t = e === this.#d ? -1 : 1;
			this.#l.scrollBy({
				left: t * Math.max(160, this.#l.clientWidth * .7),
				behavior: "smooth"
			});
		});
	}
	connectedCallback() {
		document.addEventListener("pointerdown", this.#g), this.#h.observe(this.#l);
	}
	disconnectedCallback() {
		document.removeEventListener("pointerdown", this.#g), this.#h.disconnect();
	}
	set tabs(e) {
		if (this.#s) {
			let t = new Set(this.#e.map((e) => e.id));
			for (let n of e) t.has(n.id) || this.#o.add(n.id);
		}
		this.#s = !0, this.#e = e, this.#v();
	}
	get tabs() {
		return this.#e;
	}
	set activeTabId(e) {
		this.#t = e, this.#v();
	}
	get activeTabId() {
		return this.#t;
	}
	set groups(e) {
		this.#n = e, this.#v();
	}
	get groups() {
		return this.#n;
	}
	set activeGroupId(e) {
		this.#r = e, this.#v();
	}
	get activeGroupId() {
		return this.#r;
	}
	set locale(e) {
		this.#i = e in n ? e : "zh", this.#v();
	}
	get locale() {
		return this.#i;
	}
	#_(e, t) {
		this.dispatchEvent(new CustomEvent(e, {
			bubbles: !0,
			composed: !0,
			detail: t
		}));
	}
	#v() {
		let e = n[this.#i];
		this.#d.setAttribute("aria-label", e.scrollLeft), this.#d.title = e.scrollLeft, this.#f.setAttribute("aria-label", e.scrollRight), this.#f.title = e.scrollRight;
		let r = document.createDocumentFragment();
		for (let n of this.#e) {
			let i = n.id === this.#t, a = document.createElement("div");
			a.className = "chrome-tab", a.setAttribute("part", i ? "tab active-tab" : "tab"), a.dataset.tabId = n.id, a.toggleAttribute("data-active", i), a.setAttribute("role", "tab"), a.setAttribute("aria-selected", String(i)), a.draggable = !0, this.#o.has(n.id) && (a.toggleAttribute("data-entering", !0), a.addEventListener("animationend", () => {
				this.#o.delete(n.id), a.removeAttribute("data-entering");
			}, { once: !0 }));
			let o = this.#a.get(n.id);
			o !== void 0 && (a.style.flex = `0 0 ${o}px`, a.style.maxWidth = `${o}px`), i && a.style.setProperty("--tab-background", n.backgroundColor ?? "var(--chrome-tab-active-background)"), a.addEventListener("click", () => {
				this.#C(), this.#_(t.activate, { tabId: n.id });
			}), a.addEventListener("dblclick", () => {
				this.#_(t.editAddress, { tabId: n.id });
			}), a.addEventListener("contextmenu", (e) => {
				e.preventDefault(), this.#E(e, n.id);
			}), a.addEventListener("dragstart", (e) => {
				this.#w(), e.dataTransfer?.setData("text/plain", n.id), e.dataTransfer && (e.dataTransfer.effectAllowed = "move"), a.toggleAttribute("data-dragging", !0);
			}), a.addEventListener("dragend", () => {
				a.removeAttribute("data-dragging"), this.#T();
			}), a.addEventListener("dragover", (e) => {
				e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
				let t = e.clientX < a.getBoundingClientRect().left + a.offsetWidth / 2 ? "before" : "after";
				this.#T(), a.dataset.dropPosition = t;
			}), a.addEventListener("drop", (e) => {
				e.preventDefault();
				let r = e.dataTransfer?.getData("text/plain"), i = a.dataset.dropPosition;
				this.#T(), !(!r || r === n.id || !i) && this.#_(t.reorder, {
					tabId: r,
					targetTabId: n.id,
					position: i
				});
			});
			let s = document.createElement("div");
			s.className = "chrome-tab-dividers";
			let c = document.createElement("div");
			c.className = "chrome-tab-background", c.setAttribute("aria-hidden", "true"), i && (c.style.backgroundColor = "var(--tab-background)", c.style.color = "var(--tab-background)");
			let l = document.createElement("div");
			l.className = "chrome-tab-content";
			let u = document.createElement("span");
			u.className = "chrome-tab-title", u.setAttribute("part", "title"), u.textContent = n.title;
			let d = document.createElement("button");
			d.type = "button", d.className = "chrome-tab-close", d.setAttribute("part", "close-button"), d.setAttribute("aria-label", `${e.close} ${n.title}`), d.addEventListener("dblclick", (e) => e.stopPropagation()), d.addEventListener("click", (e) => {
				if (e.stopPropagation(), a.hasAttribute("data-closing")) return;
				this.#y(n.id), a.toggleAttribute("data-closing", !0);
				let r = !1, i = () => {
					r || (r = !0, this.#_(t.close, { tabId: n.id }));
				};
				a.addEventListener("animationend", i, { once: !0 }), window.setTimeout(i, 200);
			}), l.append(u, d), a.append(s, c, l), r.append(a);
		}
		let i = document.createElement("div");
		i.className = "new-tab-divider", i.setAttribute("aria-hidden", "true");
		let a = document.createElement("button");
		a.type = "button", a.className = "new-tab-button", a.setAttribute("part", "add-button"), a.setAttribute("aria-label", e.addTab), a.title = e.addTabTitle, a.textContent = "+", a.addEventListener("click", () => {
			this.#C(), this.#_(t.add);
		});
		let o = document.createElement("div");
		o.className = "new-tab-button-slot", o.append(a);
		let s = document.createElement("details");
		s.className = "group-menu";
		let c = document.createElement("summary");
		c.setAttribute("aria-label", e.selectGroup), c.setAttribute("part", "group-toggle"), c.title = e.selectGroup, c.innerHTML = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m7 9 5 5 5-5\"/></svg>";
		let l = document.createElement("div");
		l.className = "group-dropdown", l.setAttribute("part", "group-menu");
		for (let n of this.#n) {
			let r = document.createElement("div");
			r.className = "group-row";
			let i = document.createElement("button");
			i.type = "button", i.className = "group-option", i.setAttribute("part", n.id === this.#r ? "group-option active-group-option" : "group-option"), i.toggleAttribute("data-active", n.id === this.#r), i.textContent = n.name, i.addEventListener("click", () => {
				s.open = !1, this.#_(t.switchGroup, { groupId: n.id });
			});
			let a = document.createElement("div");
			a.className = "group-row-actions";
			for (let [r, i, o] of [[
				e.rename,
				t.renameGroup,
				"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m4 16.5-.5 4 4-.5L18.7 8.8l-3.5-3.5L4 16.5Zm13-12.9 3.4 3.4-1.2 1.2-3.4-3.4L17 3.6Z\"/></svg>"
			], [
				e.delete,
				t.deleteGroup,
				"<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M8 3h8l1 2h4v2H3V5h4l1-2Zm-2 6h12l-1 12H7L6 9Zm4 2v7h2v-7h-2Zm4 0v7h2v-7h-2Z\"/></svg>"
			]]) {
				let e = document.createElement("button");
				e.type = "button", e.className = "group-row-action", e.setAttribute("aria-label", `${r} ${n.name}`), e.title = r, e.innerHTML = o, e.addEventListener("click", () => {
					s.open = !1, this.#_(i, { groupId: n.id });
				}), a.append(e);
			}
			r.append(i, a), l.append(r);
		}
		let u = document.createElement("div");
		u.className = "group-actions";
		let d = document.createElement("button");
		d.type = "button", d.textContent = e.addGroup, d.addEventListener("click", () => {
			s.open = !1, this.#_(t.addGroup);
		}), u.append(d), l.append(u), s.append(c, l), r.append(i, o), this.#u.replaceChildren(r), this.#p.replaceChildren(s), requestAnimationFrame(() => {
			this.#S(), this.#a.size === 0 && this.#x();
		});
	}
	#y(e) {
		let t = [...this.#u.querySelectorAll(".chrome-tab")];
		if (this.#a.size === 0) for (let e of t) e.dataset.tabId && this.#a.set(e.dataset.tabId, e.getBoundingClientRect().width);
		let n = t.findIndex((t) => t.dataset.tabId === e);
		if (n === t.length - 1 && n > 0) {
			let r = this.#a.get(e) / n;
			for (let e of t.slice(0, n)) {
				let t = e.dataset.tabId;
				t && this.#a.set(t, this.#a.get(t) + r);
			}
		}
	}
	#b() {
		if (this.#a.size !== 0) {
			this.#a.clear();
			for (let e of this.#u.querySelectorAll(".chrome-tab")) e.style.removeProperty("flex"), e.style.removeProperty("max-width");
			this.#S();
		}
	}
	#x() {
		let e = this.#u.querySelector("[data-active]");
		if (!e) return;
		let t = e.offsetLeft, n = t + e.offsetWidth;
		t < this.#l.scrollLeft ? this.#l.scrollLeft = t : n > this.#l.scrollLeft + this.#l.clientWidth && (this.#l.scrollLeft = n - this.#l.clientWidth);
	}
	#S() {
		if (this.#a.size > 0) return;
		let e = this.#d.hidden ? 0 : this.#d.offsetWidth + this.#f.offsetWidth, t = this.#l.clientWidth + e, n = this.#l.scrollWidth > t + 1;
		this.#d.hidden = !n, this.#f.hidden = !n;
		let r = this.#l.scrollWidth - this.#l.clientWidth;
		this.#d.disabled = this.#l.scrollLeft <= 1, this.#f.disabled = this.#l.scrollLeft >= r - 1;
	}
	#C() {
		this.#w();
	}
	#w() {
		this.shadowRoot?.querySelector(".group-menu")?.removeAttribute("open"), this.#m.hidden = !0;
	}
	#T() {
		for (let e of this.#u.querySelectorAll(".chrome-tab")) e.removeAttribute("data-drop-position");
	}
	#E(e, r) {
		this.#w();
		let i = n[this.#i], a = document.createDocumentFragment();
		for (let [e, n] of [
			[i.close, t.close],
			[i.closeLeft, t.closeLeft],
			[i.closeRight, t.closeRight],
			[i.closeOthers, t.closeOthers]
		]) {
			let t = document.createElement("button");
			t.type = "button", t.textContent = e, t.addEventListener("click", () => {
				this.#w(), this.#_(n, { tabId: r });
			}), a.append(t);
		}
		this.#m.replaceChildren(a), this.#m.style.left = `${Math.min(e.clientX, window.innerWidth - 176)}px`, this.#m.style.top = `${Math.min(e.clientY, window.innerHeight - 150)}px`, this.#m.hidden = !1;
	}
};
customElements.get("qn-chrome-tabs") || customElements.define(e, i);
//#endregion
export { e as CHROME_TABS_TAG, i as ChromeTabsElement, t as chromeTabsEvents };
