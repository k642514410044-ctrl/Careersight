/* Bước 2 — Chọn mục tiêu & vị trí */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const MAX = 3;
  const params = new URLSearchParams(location.search);
  const p = store.get();
  let selected = p.positions.slice();
  let ind = "all";

  if (params.get("pos") && E.position(params.get("pos")) && !selected.includes(params.get("pos"))) {
    selected = [params.get("pos")].concat(selected).slice(0, MAX);
    store.set({ positions: selected });
  }
  if (params.get("q")) $("#pos-q").value = params.get("q");

  $("#sel-level").innerHTML = `<option value="">Mọi cấp độ</option>` + D.levels.map(l => `<option${p.level === l ? " selected" : ""}>${l}</option>`).join("");
  $("#sel-loc").innerHTML = D.locations.map(l => `<option${p.location === l ? " selected" : ""}>${l}</option>`).join("");
  $("#sel-level").addEventListener("change", e => store.set({ level: e.target.value }));
  $("#sel-loc").addEventListener("change", e => store.set({ location: e.target.value }));

  $("#ind-chips").innerHTML = [{ key: "all", label: "Tất cả" }].concat(D.industries)
    .map(i => `<button type="button" class="chip" data-ind="${i.key}" aria-pressed="${i.key === "all"}">${i.label}</button>`).join("");
  $("#ind-chips").addEventListener("click", e => {
    const b = e.target.closest("[data-ind]");
    if (!b) return;
    ind = b.dataset.ind;
    document.querySelectorAll("#ind-chips .chip").forEach(c => c.setAttribute("aria-pressed", c === b));
    render();
  });
  $("#pos-q").addEventListener("input", render);

  function card(pos) {
    const on = selected.includes(pos.id);
    const top = pos.skills.slice().sort((a, b) => b.freq - a.freq).slice(0, 3).map(s => E.skill(s.id).name).join(" · ");
    return `<div class="card pos-card${on ? " is-selected" : ""}" data-peek="${pos.id}" role="button" tabindex="0" aria-label="Xem nhanh ${CS.esc(pos.name)}">
      <h3>${CS.esc(pos.name)}</h3>
      <button type="button" class="pos-card__check" data-toggle="${pos.id}" aria-pressed="${on}" aria-label="${on ? "Bỏ chọn" : "Chọn"} ${CS.esc(pos.name)}">${CS.icon("check", 16)}</button>
      <div class="pos-card__meta">${CS.icon("database", 14)} ${pos.jd.toLocaleString("vi-VN")} tin ${CS.confBadge(pos.jd)}</div>
      <p class="small muted">${top}</p>
      <span class="pos-card__peek">Xem nhanh kỹ năng →</span>
    </div>`;
  }

  function render() {
    const q = $("#pos-q").value.trim();
    const list = (q ? E.searchPositions(q) : D.positions).filter(x => ind === "all" || x.industry === ind);
    const groups = D.industries.map(i => ({ i, items: list.filter(x => x.industry === i.key) })).filter(g => g.items.length);
    $("#pos-groups").innerHTML = groups.length
      ? groups.map(g => `<section class="ind-group"><h2>${g.i.label}</h2><div class="grid grid--4">${g.items.map(card).join("")}</div></section>`).join("")
      : CS.state("empty", { title: `Chưa có vị trí “${CS.esc(q)}”`, text: "Thử từ khóa khác, hoặc góp ý để chúng tôi bổ sung vị trí này.",
          action: `<a class="btn btn--outline btn--sm" href="method.html#feedback">Đề xuất vị trí</a>` });
    renderBar();
  }

  function renderBar() {
    $("#sel-count").textContent = selected.length;
    $("#sel-tags").innerHTML = selected.length
      ? selected.map(id => `<span class="tag">${CS.esc(E.position(id).name)}<button type="button" data-toggle="${id}" aria-label="Bỏ ${CS.esc(E.position(id).name)}">${CS.icon("close", 12)}</button></span>`).join("")
      : `<span class="small muted">Chưa chọn vị trí nào</span>`;
  }

  function toggle(id) {
    const i = selected.indexOf(id);
    if (i >= 0) selected.splice(i, 1);
    else if (selected.length >= MAX) { CS.toast(`Chỉ chọn tối đa ${MAX} vị trí.`, "error"); return; }
    else selected.push(id);
    store.set({ positions: selected.slice() });
    render();
  }

  // Xem trước vị trí
  let peekId = null;
  function peek(id) {
    const pos = E.position(id);
    peekId = id;
    $("#peek-title").textContent = pos.name;
    $("#peek-meta").innerHTML = `${pos.jd.toLocaleString("vi-VN")} tin · ${D.industries.find(i => i.key === pos.industry).label} ${CS.confBadge(pos.jd)}`;
    $("#peek-list").innerHTML = pos.skills.slice().sort((a, b) => b.freq - a.freq).slice(0, 8).map(s => `
      <li><span>${CS.esc(E.skill(s.id).name)} <span class="badge ${s.req === "bat-buoc" ? "badge--req" : "badge--opt"}">${s.req === "bat-buoc" ? "Bắt buộc" : "Ưu tiên"}</span></span>
      <div class="meter"><i style="--w:${s.freq * 100}%"></i></div><span class="num">${Math.round(s.freq * 100)}%</span></li>`).join("");
    $("#peek-transparency").innerHTML = CS.transparency(pos.jd);
    $("#peek-select").textContent = selected.includes(id) ? "Bỏ chọn vị trí này" : "Chọn vị trí này";
    $("#peek").showModal();
  }
  $("#peek-select").addEventListener("click", () => { toggle(peekId); $("#peek").close(); });

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-toggle]");
    if (t) { e.stopPropagation(); toggle(t.dataset.toggle); return; }
    const c = e.target.closest("[data-peek]");
    if (c) peek(c.dataset.peek);
  });
  document.addEventListener("keydown", e => {
    const c = e.target.closest && e.target.closest("[data-peek]");
    if (c && (e.key === "Enter" || e.key === " ") && e.target === c) { e.preventDefault(); peek(c.dataset.peek); }
  });

  $("#continue").addEventListener("click", () => {
    if (!selected.length) { CS.toast("Hãy chọn ít nhất 1 vị trí.", "error"); return; }
    location.href = "skills.html";
  });
  render();
})();
