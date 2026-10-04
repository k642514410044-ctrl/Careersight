/* Bước 5 — Skill Gap Analyzer */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#gap-root");
  const params = new URLSearchParams(location.search);
  const f = { type: "all", prio: "all" };
  let pos = null, selected = null;

  function positionsOf(p) { return p.positions.concat(p.customJD ? ["custom-jd"] : []); }

  function filters() {
    const types = [["all", "Tất cả loại"]].concat(Object.entries(D.types));
    const prios = [["all", "Mọi mức"], ["cao", "Cao"], ["tb", "Trung bình"], ["thap", "Thấp"]];
    return `<div class="sheet" id="gap-filters" aria-label="Bộ lọc">
      <div class="sheet__head"><b>Bộ lọc</b><button class="icon-btn icon-btn--sm" type="button" data-sheet-close aria-label="Đóng">${CS.icon("close", 16)}</button></div>
      <div class="filter-bar">
        <div class="field"><span class="field__label xs">Loại kỹ năng</span><div class="chip-scroll">${types.map(([k, l]) => `<button type="button" class="chip" data-ftype="${k}" aria-pressed="${f.type === k}">${l}</button>`).join("")}</div></div>
        <div class="field"><span class="field__label xs">Mức ưu tiên</span><div class="chip-scroll">${prios.map(([k, l]) => `<button type="button" class="chip" data-fprio="${k}" aria-pressed="${f.prio === k}">${l}</button>`).join("")}</div></div>
      </div>
    </div>`;
  }

  function row(x, excluded) {
    const p = store.get();
    const picked = p.roadmapPicks.includes(x.id);
    return `<tr class="gap-row prio-${x.level.key}${excluded ? " is-excluded" : ""}${selected === x.id ? " is-selected" : ""}" data-row="${x.id}" tabindex="0">
      <td class="gap-name"><b>${CS.esc(x.name)}</b>
        <small>${D.types[x.type]}${x.kind === "tuong-duong" ? " · có tương đương: " + CS.esc(x.via) : ""}</small>
        <span class="row" style="gap:.4rem;margin-top:.25rem"><span class="badge ${x.req === "bat-buoc" ? "badge--req" : "badge--opt"}">${x.req === "bat-buoc" ? "Bắt buộc" : "Ưu tiên"}</span>${CS.trendTag(E.skill(x.id).trend)}</span></td>
      <td><div class="row"><div class="meter"><i style="--w:${x.freq * 100}%;--c:var(--prio-${x.level.key === "cao" ? "high" : x.level.key === "tb" ? "mid" : "low"})"></i></div><span class="num xs">${pos.jd ? Math.round(x.freq * 100) + "%" : "—"}</span></div>
        ${pos.jd ? `<small class="xs muted">trong ${pos.jd.toLocaleString("vi-VN")} tin</small>` : ""}</td>
      <td>${CS.prioBadge(x.level)}</td>
      <td class="no-print"><div class="mini-checks">
        <label class="check"><input type="checkbox" data-exclude="${x.id}"${excluded ? " checked" : ""}> Loại trừ</label>
        <label class="check"><input type="checkbox" data-have="${x.id}"> Tôi đã có</label></div></td>
      <td class="no-print"><button class="btn ${picked ? "btn--dark" : "btn--outline"} btn--xs" type="button" data-pick="${x.id}" aria-pressed="${picked}">${picked ? "✓ Trong lộ trình" : "+ Lộ trình"}</button></td>
    </tr>`;
  }

  function drawer(r) {
    const x = r.gap.find(g => g.id === selected) || r.gap[0];
    if (!x) return `<div class="state state--empty" style="padding:2rem 1rem"><p class="state__text">Chọn một dòng để xem chi tiết.</p></div>`;
    const s = E.skill(x.id);
    const owned = store.get().skills;
    const rel = s.related.filter(id => D.skills[id]);
    const salaryOk = s.salary && pos.jd && pos.jd >= 300;
    return `<div class="sheet__head"><b>Chi tiết kỹ năng</b><button class="icon-btn icon-btn--sm drawer__close" type="button" data-sheet-close aria-label="Đóng">${CS.icon("close", 16)}</button></div>
      <span class="eyebrow">${D.types[s.type]}</span>
      <h3>${CS.esc(s.name)}</h3>
      <p class="small muted" style="margin-top:.35rem">${CS.esc(s.desc)}</p>
      <dl>
        <div><dt>Tần suất</dt><dd>${pos.jd ? `${Math.round(x.freq * 100)}% trong ${pos.jd.toLocaleString("vi-VN")} tin ${CS.esc(pos.name)}` : "Có trong JD bạn đã dán"} · ${CS.trendTag(s.trend)}</dd></div>
        <div><dt>Thường đi kèm</dt><dd class="chip-row">${rel.length ? rel.map(id => `<a class="tag ${owned[id] ? "" : "tag--missing"} tag--plain" href="skill.html?id=${id}">${owned[id] ? "✓ " : ""}${CS.esc(E.skill(id).name)}</a>`).join("") : "—"}</dd></div>
        <div><dt>Kỹ năng tiên quyết</dt><dd class="chip-row">${s.prereq.length ? s.prereq.map(id => `<a class="tag ${owned[id] ? "" : "tag--missing"} tag--plain" href="skill.html?id=${id}">${owned[id] ? "✓ " : ""}${CS.esc(E.skill(id).name)}</a>`).join("") : "Không có"}</dd></div>
        <div><dt>Giờ học ước tính</dt><dd><b>${s.hours} giờ</b> tham khảo</dd></div>
        <div><dt>Chênh lệch lương</dt><dd>${salaryOk ? `+${String(s.salary).replace(".", ",")} triệu/tháng (trung bình, tin yêu cầu so với không yêu cầu)` : `<span class="muted">Chưa đủ mẫu để hiển thị</span>`}</dd></div>
      </dl>
      <div class="btn-row">
        <a class="btn btn--outline btn--sm" href="skill.html?id=${s.id}">Xem xu hướng</a>
        <button class="btn btn--primary btn--sm" type="button" data-pick="${s.id}">${store.get().roadmapPicks.includes(s.id) ? "✓ Trong lộ trình" : "Thêm vào lộ trình"}</button>
      </div>`;
  }

  function render() {
    const p = store.get();
    const all = positionsOf(p);
    if (!all.length || !Object.keys(p.skills).length) {
      root.innerHTML = CS.state("empty", { title: "Chưa có kết quả để phân tích khoảng trống", text: "Hãy chọn vị trí và nhập kỹ năng trước.",
        action: `<div class="btn-row btn-row--center"><a class="btn btn--primary" href="position.html">Bắt đầu phân tích</a><button class="btn btn--ghost" type="button" data-demo>Xem với dữ liệu mẫu</button></div>` });
      $("#pos-sel").closest("label").hidden = true;
      return;
    }
    if (!pos || !all.includes(pos.id)) {
      const want = params.get("pos");
      pos = E.score(all.includes(want) ? want : all[0], p).pos;
    }
    $("#pos-sel").innerHTML = all.map(id => `<option value="${id}"${id === pos.id ? " selected" : ""}>${CS.esc(id === "custom-jd" ? "JD bạn đã dán" : E.position(id).name)}</option>`).join("");

    const r = E.gap(pos.id, Object.assign({}, p, { excluded: [] }));
    const visible = r.gap.filter(x => !p.excluded.includes(x.id));
    const excluded = r.gap.filter(x => p.excluded.includes(x.id));
    const pass = x => (f.type === "all" || x.type === f.type) && (f.prio === "all" || x.level.key === f.prio);
    const shown = visible.filter(pass);
    if (!selected || !r.gap.find(g => g.id === selected)) selected = visible[0] && visible[0].id;
    const count = k => visible.filter(x => x.level.key === k).length;

    $("#gap-title").textContent = `Khoảng trống — ${pos.name}`;
    $("#gap-sub").innerHTML = `Điểm hiện tại <b>${r.score}%</b> · thiếu ${r.gap.length} kỹ năng · xếp theo điểm ưu tiên = tần suất × hệ số mức yêu cầu`;

    root.innerHTML = `
      <div class="gap-summary">
        <div class="card is-cao"><b>${count("cao")}</b><small>Ưu tiên Cao · bắt buộc, có trong hầu hết tin</small></div>
        <div class="card is-tb"><b>${count("tb")}</b><small>Ưu tiên Trung bình · bổ trợ quan trọng</small></div>
        <div class="card is-thap"><b>${count("thap")}</b><small>Ưu tiên Thấp · điểm cộng</small></div>
      </div>
      <div class="gap-layout">
        <section class="card card--pad" aria-labelledby="gap-list-title">
          <div class="card__head">
            <h2 id="gap-list-title">Kỹ năng còn thiếu (${shown.length})</h2>
            <button class="btn btn--outline btn--sm filter-toggle" type="button" data-sheet-open="#gap-filters">${CS.icon("filter", 16)} Bộ lọc</button>
          </div>
          ${filters()}
          ${visible.length ? (shown.length ? `<div class="table-wrap" style="margin-top:1rem"><table class="table table--click">
            <thead><tr><th>Kỹ năng</th><th>Tỷ lệ tin yêu cầu</th><th>Ưu tiên</th><th class="no-print">Cập nhật</th><th class="no-print"></th></tr></thead>
            <tbody>${shown.map(x => row(x, false)).join("")}</tbody></table></div>`
            : CS.state("empty", { title: "Không có kỹ năng khớp bộ lọc", action: `<button class="btn btn--outline btn--sm" type="button" id="reset-f">Xóa bộ lọc</button>` }))
            : CS.state("empty", { title: "Bạn không còn thiếu kỹ năng nào 🎉", text: "Bạn đã có hoặc đã loại trừ toàn bộ kỹ năng của vị trí này." })}
          ${excluded.length ? `<details style="margin-top:1rem"><summary class="small" style="cursor:pointer;font-weight:600">Đã loại trừ (${excluded.length}) — bỏ tick để đưa lại vào danh sách</summary>
            <div class="table-wrap"><table class="table"><tbody>${excluded.map(x => row(x, true)).join("")}</tbody></table></div></details>` : ""}
          ${CS.transparency(pos.jd)}
        </section>
        <aside class="card drawer sheet sticky" id="drawer" aria-label="Chi tiết kỹ năng">${drawer(r)}</aside>
      </div>
      <div class="action-bar">
        <a class="btn btn--ghost" href="results.html"><span data-icon="back" data-size="16"></span>Quay lại kết quả</a>
        <div class="btn-row">
          <a class="btn btn--outline" href="trends.html">Xem xu hướng</a>
          <button class="btn btn--primary btn--lg" type="button" id="make-roadmap">Tạo lộ trình <span data-icon="arrow" data-size="18"></span></button>
        </div>
      </div>`;
    CS.hydrate(root);
  }

  $("#pos-sel").addEventListener("change", e => { pos = E.score(e.target.value, store.get()).pos; selected = null; history.replaceState(null, "", "?pos=" + pos.id); render(); });

  root.addEventListener("change", e => {
    const ex = e.target.dataset.exclude;
    if (ex) { store.toggleList("excluded", ex, e.target.checked); CS.toast(e.target.checked ? "Đã loại trừ và tính lại danh sách." : "Đã đưa lại vào danh sách."); render(); }
    const hv = e.target.dataset.have;
    if (hv) { store.addSkill(hv); CS.toast(`Đã cập nhật hồ sơ: bạn có ${CS.esc(E.skill(hv).name)}.`); selected = null; render(); }
  });
  root.addEventListener("click", e => {
    const t = e.target;
    const ft = t.closest("[data-ftype]"), fp = t.closest("[data-fprio]");
    if (ft) { f.type = ft.dataset.ftype; render(); return; }
    if (fp) { f.prio = fp.dataset.fprio; render(); return; }
    if (t.id === "reset-f") { f.type = f.prio = "all"; render(); return; }
    const pk = t.closest("[data-pick]");
    if (pk) { const on = store.toggleList("roadmapPicks", pk.dataset.pick); CS.toast(on ? "Đã thêm vào lộ trình." : "Đã bỏ khỏi lộ trình."); render(); return; }
    if (t.id === "make-roadmap" || t.closest("#make-roadmap")) {
      if (pos.id === "custom-jd") { CS.toast("Lộ trình cần một vị trí có dữ liệu thị trường — hãy chọn vị trí khác.", "error"); return; }
      if (CS.requireLogin("roadmap.html?pos=" + pos.id)) location.href = "roadmap.html?pos=" + pos.id;
      return;
    }
    if (t.closest("input, label, a, button")) return;
    const r = t.closest("[data-row]");
    if (r) {
      selected = r.dataset.row;
      render();
      if (window.matchMedia("(max-width: 900px)").matches) { $("#drawer").classList.add("is-open"); document.body.classList.add("sheet-open"); }
    }
  });
  root.addEventListener("keydown", e => {
    const r = e.target.closest && e.target.closest("[data-row]");
    if (r && e.key === "Enter" && e.target === r) { selected = r.dataset.row; render(); }
  });
  render();
})();
