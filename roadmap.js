/* Lộ trình cá nhân hóa — Trạng thái 1: Thiết lập · Trạng thái 2: Kết quả */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#rm-root");
  const params = new URLSearchParams(location.search);
  let mode = "result";

  const p0 = store.get();
  if (!p0.loggedIn) {
    $("#pos-wrap").hidden = true;
    root.innerHTML = CS.loginGate("tạo và lưu lộ trình học", "roadmap.html");
    return;
  }
  const positions = p0.positions;
  if (!positions.length || !Object.keys(p0.skills).length) {
    $("#pos-wrap").hidden = true;
    root.innerHTML = CS.state("empty", { title: "Chưa có khoảng trống kỹ năng để lập lộ trình", text: "Hãy chọn vị trí và nhập kỹ năng trước.",
      action: `<a class="btn btn--primary" href="position.html">Bắt đầu phân tích</a>` });
    return;
  }
  let pos = [params.get("pos"), p0.roadmap && p0.roadmap.pos, positions[0]].find(x => x && positions.includes(x));
  $("#pos-sel").innerHTML = positions.map(id => `<option value="${id}"${id === pos ? " selected" : ""}>${CS.esc(E.position(id).name)}</option>`).join("");
  $("#pos-sel").addEventListener("change", e => { pos = e.target.value; history.replaceState(null, "", "?pos=" + pos); start(); });

  function start() {
    const rm = store.get().roadmap;
    mode = rm && rm.pos === pos ? "result" : "setup";
    render();
  }

  /* ---------- Trạng thái 1: Thiết lập ---------- */
  function setup() {
    const p = store.get();
    const s = (p.roadmap && p.roadmap.settings) || { hours: 6, mode: "score", target: 90, weeks: 8 };
    const base = E.score(pos, p);
    const ex = p.excluded.filter(id => base.missing.some(m => m.id === id));
    const picks = p.roadmapPicks.filter(id => base.missing.some(m => m.id === id));
    return `<div class="split-layout">
      <form class="card card--pad form" id="setup-form" data-validate data-reset="off">
        <h2 class="h3">Thiết lập lộ trình</h2>
        <div class="field">
          <label class="field__label" for="hours">Số giờ rảnh có thể học mỗi tuần <span class="req">*</span></label>
          <div class="row"><input class="input" id="hours" type="number" min="1" max="40" required value="${s.hours}" style="max-width:120px"><span class="muted small">giờ/tuần</span></div>
          <p class="field__error"></p>
        </div>
        <fieldset class="field" style="border:0;padding:0;margin:0">
          <legend class="field__label" style="margin-bottom:.4rem">Mục tiêu (chọn một)</legend>
          <div class="choice-group" style="--cols:2">
            <label class="choice"><input type="radio" name="mode" value="score"${s.mode === "score" ? " checked" : ""}><span>Đạt điểm mục tiêu</span></label>
            <label class="choice"><input type="radio" name="mode" value="deadline"${s.mode === "deadline" ? " checked" : ""}><span>Theo hạn chót</span></label>
          </div>
        </fieldset>
        <div class="form-row">
          <label class="field" id="f-target"><span class="field__label">Điểm mục tiêu</span>
            <select class="select" id="target">${[80, 85, 90, 95, 100].map(v => `<option value="${v}"${+s.target === v ? " selected" : ""}>${v}%</option>`).join("")}</select></label>
          <label class="field" id="f-weeks"><span class="field__label">Hạn chót</span>
            <select class="select" id="weeks">${[4, 8, 12, 24].map(v => `<option value="${v}"${+s.weeks === v ? " selected" : ""}>${v === 4 ? "1 tháng" : v === 8 ? "2 tháng" : v === 12 ? "3 tháng" : "6 tháng"}</option>`).join("")}</select></label>
        </div>
        <div class="field">
          <span class="field__label">Kỹ năng loại trừ <span class="xs muted">(từ trang Khoảng trống — bấm × để học lại)</span></span>
          <div class="chip-row">${ex.length ? ex.map(id => `<span class="tag tag--eq">${CS.esc(E.skill(id).name)}<button type="button" data-unexclude="${id}" aria-label="Bỏ loại trừ">${CS.icon("close", 12)}</button></span>`).join("") : `<span class="small muted">Không loại trừ kỹ năng nào. <a class="link" href="gap.html?pos=${pos}">Chỉnh ở Khoảng trống</a></span>`}</div>
        </div>
        ${picks.length ? `<div class="field"><span class="field__label">Ưu tiên học trước <span class="xs muted">(bạn đã thêm vào lộ trình)</span></span>
          <div class="chip-row">${picks.map(id => `<span class="tag">${CS.esc(E.skill(id).name)}<button type="button" data-unpick="${id}" aria-label="Bỏ">${CS.icon("close", 12)}</button></span>`).join("")}</div></div>` : ""}
        <button class="btn btn--primary btn--lg" type="submit">Tạo lộ trình <span data-icon="arrow" data-size="18"></span></button>
      </form>
      <aside class="card card--pad stack">
        <div class="row">${CS.donut(base.score)}<div><b>${CS.esc(base.pos.name)}</b><p class="xs muted">Điểm hiện tại · thiếu ${base.missing.length} kỹ năng</p></div></div>
        <div class="notice">${CS.icon("info", 16)}<span>Thuật toán chọn kỹ năng có <b>mức tăng điểm trên mỗi giờ học</b> cao nhất, luôn học kỹ năng tiên quyết trước, rồi gom thành các bước 2–3 tuần.</span></div>
      </aside>
    </div>`;
  }

  /* ---------- Trạng thái 2: Kết quả ---------- */
  function result() {
    const p = store.get();
    const rm = p.roadmap;
    if (!rm.steps.length) return CS.state("empty", { title: "Bạn đã đạt mục tiêu 🎉", text: "Không cần học thêm kỹ năng nào với thiết lập hiện tại.",
      action: `<button class="btn btn--outline" type="button" id="edit">Chỉnh thiết lập</button>` });
    const now = E.score(pos, p).score;
    const ms = [{ label: "Hiện tại", score: rm.baseScore, done: true }].concat(rm.steps.map(s => ({ label: `Sau bước ${s.index}`, score: s.scoreAfter, done: s.done })));
    return `
      <section class="card forecast" aria-label="Dự báo kết quả">
        <div class="row row--between"><h2 class="h3">Dự báo điểm tương thích</h2>
          <span class="small muted">${rm.totalWeeks} tuần · ${rm.settings.hours} giờ/tuần · ${rm.totalHours} giờ học</span></div>
        <div class="forecast__track">${ms.map(m => `<div class="milestone${m.done ? " is-done" : ""}"><b>${m.score}%</b><small>${m.label}</small></div>`).join("")}</div>
        <p class="xs muted">Điểm hiện tại thực tế: <b>${now}%</b>${rm.settings.mode === "score" ? ` · mục tiêu ${rm.settings.target}%` : ` · hạn chót ${rm.settings.weeks} tuần`}</p>
      </section>
      <div class="grid grid--3" style="margin-top:1.25rem">${rm.steps.map(step).join("")}</div>
      ${CS.transparency(E.position(pos).jd)}
      <p class="disclaimer">${CS.icon("info", 14)} Điểm dự kiến là ước tính từ dữ liệu thị trường, không phải cam kết trúng tuyển.</p>
      <div class="action-bar">
        <button class="btn btn--ghost" type="button" id="edit"><span data-icon="edit" data-size="16"></span>Chỉnh thiết lập</button>
        <div class="btn-row">
          <button class="btn btn--outline" type="button" data-print><span data-icon="download" data-size="16"></span>Xuất PDF</button>
          <a class="btn btn--primary" href="dashboard.html">Theo dõi tiến độ <span data-icon="arrow" data-size="18"></span></a>
        </div>
      </div>`;
  }

  function step(s) {
    const prio = s.index === 1 ? `<span class="badge badge--prio-cao">Ưu tiên cao</span>` : s.index === 2 ? `<span class="badge badge--prio-tb">Trung bình</span>` : `<span class="badge badge--slate">Bổ sung</span>`;
    return `<article class="card step-card${s.done ? " is-done" : ""}">
      <div class="step-card__head"><span class="badge badge--navy">Bước ${s.index} · ${s.weeks} tuần</span>${s.done ? `<span class="badge badge--conf-cao">✓ Hoàn thành</span>` : prio}</div>
      <ul class="step-card__skills">${s.items.map(ch => `<li><span>${ch.done ? "✓ " : ""}${CS.skillLink(ch.id)}${ch.parts > 1 ? ` <span class="xs muted">(phần ${ch.part}/${ch.parts})</span>` : ""}</span><span class="xs muted">~${ch.hours} giờ</span></li>`).join("")}</ul>
      <p class="step-card__score">Điểm dự kiến sau bước: ${s.scoreAfter}%</p>
      <div class="step-card__project"><b>Dự án thực hành cho CV</b>${CS.esc(s.project)}</div>
      <details><summary>Tài nguyên học</summary>
        <ul>${[...new Set(s.items.map(ch => ch.id))].map(id => D.resources(id).map(r => `<li>${r.kind}: ${CS.esc(r.title)} · ~${r.hours} giờ</li>`).join("")).join("")}</ul></details>
      ${s.done ? "" : `<button class="btn btn--primary btn--sm" type="button" data-done="${s.index}">${CS.icon("check", 16)} Đánh dấu hoàn thành</button>`}
    </article>`;
  }

  function render() {
    const name = E.position(pos).name;
    $("#rm-title").textContent = `Lộ trình — ${name}`;
    $("#rm-sub").textContent = mode === "setup" ? "Trạng thái 1/2 · Thiết lập thời gian và mục tiêu của bạn" : "Trạng thái 2/2 · Kế hoạch học từng bước 2–3 tuần";
    root.innerHTML = mode === "setup" ? setup() : result();
    CS.hydrate(root);
    CS.forms.init(root);
    const form = $("#setup-form");
    if (form) {
      const sync = () => {
        const m = form.querySelector('input[name="mode"]:checked').value;
        $("#f-target").hidden = m !== "score";
        $("#f-weeks").hidden = m !== "deadline";
      };
      form.addEventListener("change", sync);
      sync();
      form.addEventListener("cs:valid", () => {
        const settings = { hours: +$("#hours").value, mode: form.querySelector('input[name="mode"]:checked').value, target: +$("#target").value, weeks: +$("#weeks").value };
        const plan = E.roadmap(pos, store.get(), settings);
        store.set({ roadmap: Object.assign(plan, { settings, createdAt: store.today() }) });
        CS.toast("Đã tạo lộ trình.");
        mode = "result";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  root.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("#edit")) { mode = "setup"; render(); return; }
    const ux = t.closest("[data-unexclude]");
    if (ux) { store.toggleList("excluded", ux.dataset.unexclude, false); render(); return; }
    const up = t.closest("[data-unpick]");
    if (up) { store.toggleList("roadmapPicks", up.dataset.unpick, false); render(); return; }
    const d = t.closest("[data-done]");
    if (d) {
      store.update(p => {
        const s = p.roadmap.steps[+d.dataset.done - 1];
        s.items.forEach(ch => E.completeChunk(p, s, ch));
      });
      const sc = E.score(pos, store.get()).score;
      store.logScore(pos, sc);
      CS.toast(`Tuyệt! Điểm tương thích mới: ${sc}%.`);
      render();
    }
  });
  start();
})();
