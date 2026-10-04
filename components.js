/* =========================================================
   Career Sight — thành phần dùng chung
   Header (thanh trên) · Bottom nav (điện thoại) · Footer
   Stepper (thanh tiến trình) · Dòng minh bạch · Donut · Badge
   State (rỗng/lỗi) · Toast · Bottom-sheet · Dialog · Login gate
   Dùng trong HTML: <div data-component="header|footer|stepper"></div>
   ========================================================= */
(function () {
  const D = window.CS_DATA;
  const store = () => window.CS.store.get();

  /* ---------- Icons ---------- */
  const P = {
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    gap: '<path d="M4 20V10M10 20V4M16 20v-6M22 20H2"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    down: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
    route: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
    flag: '<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    google: '<path d="M21 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5a4.3 4.3 0 0 1-1.9 2.8v2.3h3A9 9 0 0 0 21 12.2z"/><path d="M12 21a8.9 8.9 0 0 0 6.1-2.2l-3-2.3a5.5 5.5 0 0 1-8.2-2.9H3.8v2.4A9 9 0 0 0 12 21zM6.9 13.6a5.4 5.4 0 0 1 0-3.4V7.8H3.8a9 9 0 0 0 0 8.2zM12 6.6a4.9 4.9 0 0 1 3.5 1.4l2.6-2.6A8.8 8.8 0 0 0 12 3a9 9 0 0 0-8.2 4.8l3.1 2.4A5.4 5.4 0 0 1 12 6.6z"/>'
  };
  function icon(name, size) {
    const s = size || 20;
    return `<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
  }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Navigation ---------- */
  const NAV = [
    { key: "analyze", href: "position.html", label: "Phân tích", icon: "target", pages: ["position", "skills", "results"] },
    { key: "gap", href: "gap.html", label: "Khoảng trống", icon: "gap", pages: ["gap"] },
    { key: "trends", href: "trends.html", label: "Xu hướng", icon: "trend", pages: ["trends", "skill"] },
    { key: "roadmap", href: "roadmap.html", label: "Lộ trình", icon: "route", pages: ["roadmap"] },
    { key: "dashboard", href: "dashboard.html", label: "Tổng quan", icon: "grid", pages: ["dashboard"] }
  ];

  function logo() {
    return `<a class="logo" href="index.html" aria-label="Career Sight — Trang chủ">
      <span class="logo__mark" aria-hidden="true">${icon("eye", 18)}</span>
      <span class="logo__text">Career <b>Sight</b></span></a>`;
  }
  function initials(name) {
    return (name || "?").trim().split(/\s+/).slice(-2).map(w => w[0]).join("").toUpperCase();
  }

  function header(page) {
    const p = store();
    const links = NAV.map(n => {
      const on = n.pages.includes(page);
      return `<li><a class="nav__link${on ? " is-active" : ""}" href="${n.href}"${on ? ' aria-current="page"' : ""}>${n.label}</a></li>`;
    }).join("");
    const right = p.loggedIn
      ? `<a class="avatar avatar--sm avatar--link${page === "profile" ? " is-active" : ""}" href="profile.html" aria-label="Hồ sơ & quyền riêng tư" title="Hồ sơ & quyền riêng tư">${esc(initials(p.user && p.user.name))}</a>`
      : `<a class="btn btn--ghost btn--sm" href="auth.html">Đăng nhập</a><a class="btn btn--primary btn--sm" href="auth.html#register">Đăng ký</a>`;
    return `<header class="site-header"><div class="container site-header__inner">
      ${logo()}
      <nav class="nav" aria-label="Điều hướng chính"><ul class="nav__list">${links}</ul></nav>
      <div class="site-header__actions">${right}</div>
    </div></header>`;
  }

  function bottomNav(page) {
    return `<nav class="bottom-nav" aria-label="Điều hướng chính (di động)">${NAV.map(n => {
      const on = n.pages.includes(page);
      return `<a href="${n.href}" class="${on ? "is-active" : ""}"${on ? ' aria-current="page"' : ""}>${icon(n.icon, 20)}<span>${n.label}</span></a>`;
    }).join("")}</nav>`;
  }

  function footer() {
    return `<footer class="site-footer"><div class="container site-footer__inner">
      <div class="site-footer__brand">${logo()}<p>Chỉ số kỹ năng rút ra từ tin tuyển dụng — không hiển thị nguyên văn JD.</p></div>
      <ul class="site-footer__links">
        <li><a href="method.html">Phương pháp & nguồn dữ liệu</a></li>
        <li><a href="method.html#privacy">Điều khoản & quyền riêng tư</a></li>
        <li><a href="method.html#feedback">Góp ý dữ liệu</a></li>
      </ul>
      <p class="site-footer__note">Điểm số là ước tính từ dữ liệu thị trường, không phải cam kết trúng tuyển. · Dữ liệu ${D.meta.version} · Cập nhật ${D.meta.updated}</p>
    </div></footer>`;
  }

  /* ---------- Thanh tiến trình (bước 2–5) ---------- */
  const STEPS = [
    { label: "Vị trí", href: "position.html" },
    { label: "Kỹ năng", href: "skills.html" },
    { label: "Tương thích", href: "results.html" },
    { label: "Khoảng trống", href: "gap.html" },
    { label: "Lộ trình", href: "roadmap.html" }
  ];
  function stepper(current) {
    return `<nav class="stepper" aria-label="Tiến trình phân tích"><ol>${STEPS.map((s, i) => {
      const st = i < current ? "is-done" : i === current ? "is-current" : "";
      return `<li class="${st}"><a href="${s.href}"${i === current ? ' aria-current="step"' : ""}>
        <span class="stepper__dot">${i < current ? icon("check", 14) : i + 1}</span><span class="stepper__label">${s.label}</span></a></li>`;
    }).join("")}</ol></nav>`;
  }

  /* ---------- Dòng minh bạch dưới mọi kết quả ---------- */
  function transparency(n, extra) {
    const conf = window.CS.engine.confidence(n);
    const nTxt = n == null ? "Dựa trên JD bạn đã dán" : `Dựa trên ${n.toLocaleString("vi-VN")} tin`;
    return `<p class="transparency">${icon("database", 14)}
      <span>${nTxt} · phiên bản dữ liệu ${D.meta.version} · cập nhật ngày ${D.meta.updated}${extra ? " · " + extra : ""}</span>
      ${conf.level === "thap" ? `<span class="badge badge--conf-thap">${conf.label}</span>` : ""}
      <a href="method.html">Cách tính</a></p>`;
  }
  function confBadge(n) {
    const c = window.CS.engine.confidence(n);
    return `<span class="badge badge--conf-${c.level}">${c.label}</span>`;
  }
  function prioBadge(level) {
    return `<span class="badge badge--prio-${level.key}">${level.label}</span>`;
  }
  function trendTag(delta) {
    if (!delta) return `<span class="trend trend--flat" title="Không đổi">→ 0</span>`;
    return delta > 0
      ? `<span class="trend trend--up" title="Tăng so với kỳ trước">▲ ${delta}</span>`
      : `<span class="trend trend--down" title="Giảm so với kỳ trước">▼ ${Math.abs(delta)}</span>`;
  }

  /* ---------- Donut ---------- */
  function donut(v, size) {
    const c = v >= 75 ? "var(--color-accent)" : v >= 55 ? "var(--color-primary)" : "var(--color-warm)";
    return `<div class="donut ${size ? "donut--" + size : ""}" style="--v:${v};--c:${c}" role="img" aria-label="Điểm tương thích ${v}%"><span>${v}%</span></div>`;
  }

  function skillLink(id) {
    return `<a class="skill-link" href="skill.html?id=${id}">${esc(D.skills[id].name)}</a>`;
  }

  /* ---------- State / gate / toast ---------- */
  function state(type, o) {
    const ic = { empty: "inbox", error: "alert", lock: "shield" }[type] || "info";
    return `<div class="state state--${type}" role="${type === "error" ? "alert" : "status"}">
      <span class="state__icon">${icon(ic, 28)}</span><h3 class="state__title">${o.title}</h3>
      ${o.text ? `<p class="state__text">${o.text}</p>` : ""}${o.action ? `<div class="state__action">${o.action}</div>` : ""}</div>`;
  }
  function loginGate(what, next) {
    return state("lock", {
      title: `Đăng ký để ${what}`,
      text: "Bạn vẫn dùng thử phân tích mà không cần tài khoản. Chỉ cần đăng ký khi muốn lưu kết quả, tạo lộ trình và theo dõi tiến độ.",
      action: `<div class="btn-row btn-row--center">
        <a class="btn btn--primary" href="auth.html?next=${encodeURIComponent(next)}#register">Đăng ký miễn phí</a>
        <a class="btn btn--outline" href="auth.html?next=${encodeURIComponent(next)}">Đăng nhập</a>
        <button class="btn btn--ghost" type="button" data-demo>Xem với dữ liệu mẫu</button></div>`
    });
  }
  function toast(msg, type) {
    let wrap = document.querySelector(".toasts");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toasts";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = `toast toast--${type || "success"}`;
    t.innerHTML = `${icon(type === "error" ? "alert" : "check", 18)}<span>${msg}</span>`;
    wrap.appendChild(t);
    setTimeout(() => { t.classList.add("is-leaving"); setTimeout(() => t.remove(), 300); }, 3000);
  }

  /* Chặn thao tác cần tài khoản (lưu kết quả, tạo lộ trình) */
  function requireLogin(next) {
    if (store().loggedIn) return true;
    toast("Vui lòng đăng ký hoặc đăng nhập để tiếp tục.", "error");
    const n = next || location.pathname.split("/").pop() + location.search;
    setTimeout(() => (location.href = `auth.html?next=${encodeURIComponent(n)}#register`), 800);
    return false;
  }

  /* ---------- Autocomplete (gợi ý khi gõ) ----------
     autocomplete(input, { source(q) → [{ value, label, sub }], onPick(item), empty(q) → html, onEnter(q) }) */
  function autocomplete(input, o) {
    const wrap = input.closest(".ac");
    const list = document.createElement("div");
    list.className = "ac__list";
    list.id = input.id + "-list";
    list.setAttribute("role", "listbox");
    list.hidden = true;
    wrap.appendChild(list);
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("autocomplete", "off");
    let items = [], active = -1;

    function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); active = -1; }
    function render() {
      const q = input.value.trim();
      if (!q) { close(); return; }
      items = o.source(q).slice(0, 8);
      list.innerHTML = items.length
        ? items.map((it, i) => `<button type="button" class="ac__item${i === active ? " is-active" : ""}" role="option" data-i="${i}">
            <span>${esc(it.label)}</span>${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</button>`).join("")
        : `<div class="ac__empty">${o.empty ? o.empty(q) : "Không có gợi ý."}</div>`;
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }
    function pick(i) { const it = items[i]; if (!it) return; o.onPick(it); close(); }

    input.addEventListener("input", () => { active = -1; render(); });
    input.addEventListener("focus", render);
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(items.length - 1, active + 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); render(); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (active >= 0) pick(active);
        else if (items.length === 1) pick(0);
        else if (o.onEnter) { o.onEnter(input.value.trim(), items); close(); }
      } else if (e.key === "Escape") close();
    });
    list.addEventListener("mousedown", e => e.preventDefault());
    list.addEventListener("click", e => {
      const b = e.target.closest("[data-i]");
      if (b) pick(+b.dataset.i);
    });
    input.addEventListener("blur", () => setTimeout(close, 120));
    return { close, refresh: render };
  }

  /* ---------- SVG line chart ---------- */
  function lineChart(values, labels, opts) {
    const o = Object.assign({ w: 560, h: 200, min: null, max: null, fmt: v => Math.round(v) }, opts);
    const pad = { l: 36, r: 12, t: 14, b: 26 };
    const min = o.min != null ? o.min : Math.min(...values) * .9;
    const max = o.max != null ? o.max : Math.max(...values) * 1.05;
    const x = i => pad.l + (values.length === 1 ? 0 : i * (o.w - pad.l - pad.r) / (values.length - 1));
    const y = v => o.h - pad.b - (v - min) / (max - min || 1) * (o.h - pad.t - pad.b);
    const pts = values.map((v, i) => `${x(i)},${y(v)}`);
    const ticks = [0, .5, 1].map(k => min + (max - min) * k);
    return `<svg class="line-chart" viewBox="0 0 ${o.w} ${o.h}" role="img" aria-label="${esc(o.label || "Biểu đồ")}">
      ${ticks.map(t => `<line class="grid-line" x1="${pad.l}" x2="${o.w - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${pad.l - 6}" y="${y(t) + 4}" text-anchor="end">${o.fmt(t)}</text>`).join("")}
      <path class="area" d="M${x(0)},${o.h - pad.b} L${pts.join(" L")} L${x(values.length - 1)},${o.h - pad.b} Z"/>
      <path class="line" d="M${pts.join(" L")}"/>
      ${values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4"><title>${esc(labels[i])}: ${o.fmt(v)}</title></circle>`).join("")}
      ${labels.map((l, i) => `<text class="axis" x="${x(i)}" y="${o.h - 6}" text-anchor="middle">${esc(l)}</text>`).join("")}
    </svg>`;
  }

  /* ---------- Mount ---------- */
  function hydrate(root) {
    (root || document).querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon, el.dataset.size); });
  }

  function mount() {
    const page = document.body.dataset.page;
    const $$ = s => document.querySelectorAll(s);
    $$('[data-component="header"]').forEach(el => { el.outerHTML = header(page); });
    $$('[data-component="footer"]').forEach(el => { el.outerHTML = footer(); });
    $$('[data-component="stepper"]').forEach(el => { el.outerHTML = stepper(+el.dataset.step); });
    if (document.body.dataset.bottomNav !== "off") {
      document.body.insertAdjacentHTML("beforeend", bottomNav(page));
      document.body.classList.add("has-bottom-nav");
    }
    document.body.insertAdjacentHTML("beforeend", '<div class="sheet-backdrop" aria-hidden="true"></div>');

    const h = document.querySelector(".site-header");
    if (h) {
      const onScroll = () => h.classList.toggle("is-scrolled", window.scrollY > 8);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Uỷ quyền sự kiện cho các thao tác dùng chung
    document.addEventListener("click", e => {
      const t = e.target;
      const open = t.closest("[data-sheet-open]");
      if (open) {
        document.querySelector(open.dataset.sheetOpen).classList.add("is-open");
        document.body.classList.add("sheet-open");
      }
      if (t.closest("[data-sheet-close]") || t.classList.contains("sheet-backdrop")) {
        $$(".sheet.is-open").forEach(s => s.classList.remove("is-open"));
        document.body.classList.remove("sheet-open");
      }
      if (t.closest("[data-demo]")) { window.CS.store.seedDemo(); toast("Đã nạp dữ liệu mẫu."); setTimeout(() => location.reload(), 500); }
      if (t.closest("[data-close-dialog]")) t.closest("dialog").close();
      if (t.closest("[data-print]")) window.print();
      if (t.closest("[data-back]")) { e.preventDefault(); history.length > 1 ? history.back() : (location.href = "index.html"); }
    });
    $$("dialog").forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));
    hydrate();
  }

  Object.assign(window.CS, { icon, esc, initials, header, footer, stepper, transparency, confBadge, prioBadge, trendTag, donut, skillLink, state, loginGate, toast, requireLogin, autocomplete, lineChart, hydrate, mount, NAV });
})();
