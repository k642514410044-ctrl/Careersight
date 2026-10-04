/* Bước 3 — Nhập kỹ năng (Nhập tay / Dán JD) */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const MIN = 3;
  const SAMPLE_JD = "Chúng tôi tuyển Data Analyst. Yêu cầu: thành thạo SQL và Excel, có kinh nghiệm Power BI hoặc Tableau, hiểu thống kê cơ bản, biết Python là lợi thế. Tiếng Anh đọc hiểu tài liệu. Ưu tiên ứng viên từng làm việc với BigQuery, dbt.";

  // Tabs
  function tab(which) {
    $("#tab-manual").setAttribute("aria-selected", which === "manual");
    $("#tab-jd").setAttribute("aria-selected", which === "jd");
    $("#panel-manual").hidden = which !== "manual";
    $("#panel-jd").hidden = which !== "jd";
  }
  $("#tab-manual").addEventListener("click", () => tab("manual"));
  $("#tab-jd").addEventListener("click", () => tab("jd"));
  document.querySelector(".cv-btn").addEventListener("click", () => CS.toast("Tải CV sẽ có ở giai đoạn sau.", "error"));

  // --- Nhập tay ---
  function add(id) {
    store.addSkill(id);
    CS.toast(`Đã thêm ${CS.esc(E.skill(id).name)}.`);
    $("#skill-q").value = "";
    render();
  }
  CS.autocomplete($("#skill-q"), {
    source: q => E.search(q).map(s => ({ value: s.id, label: s.name, sub: (store.hasSkill(s.id) ? "Đã có · " : "") + D.types[s.type] })),
    onPick: it => add(it.value),
    empty: q => {
      const near = E.nearest(q);
      return `<span>Không tìm thấy “${CS.esc(q)}” trong danh mục.</span>
        ${near ? `<button type="button" class="btn btn--outline btn--xs" data-add="${near.id}">Ý bạn là: ${CS.esc(near.name)}?</button>` : ""}
        <button type="button" class="btn btn--ghost btn--xs" data-propose="${CS.esc(q)}">${CS.icon("plus", 14)} Gửi đề xuất kỹ năng mới</button>`;
    }
  });
  document.addEventListener("mousedown", e => { if (e.target.closest(".ac__empty")) e.preventDefault(); });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-add]");
    if (a) add(a.dataset.add);
    const pr = e.target.closest("[data-propose]");
    if (pr) {
      store.update(p => p.proposals.push({ name: pr.dataset.propose, date: store.today() }));
      CS.toast("Đã gửi đề xuất — kỹ năng sẽ vào hàng chờ duyệt.");
      $("#skill-q").value = "";
      $("#skill-q").blur();
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) { store.removeSkill(rm.dataset.remove); render(); }
  });
  document.addEventListener("change", e => {
    if (e.target.matches("[data-level]")) store.addSkill(e.target.dataset.level, e.target.value);
  });

  function quickIds(p) {
    const ids = [];
    p.positions.forEach(pid => E.position(pid).skills.slice().sort((a, b) => b.freq - a.freq).forEach(s => ids.push(s.id)));
    ["sql", "python", "excel", "powerbi", "english", "communication"].forEach(id => ids.push(id));
    return [...new Set(ids)].filter(id => !p.skills[id]).slice(0, 12);
  }

  // --- Dán JD ---
  let detected = [];
  $("#jd-sample").addEventListener("click", () => { $("#jd-text").value = SAMPLE_JD; });
  $("#jd-extract").addEventListener("click", () => {
    const text = $("#jd-text").value.trim();
    if (text.length < 30) { CS.toast("JD quá ngắn — hãy dán đầy đủ phần yêu cầu.", "error"); return; }
    const btn = $("#jd-extract");
    btn.classList.add("is-loading");
    setTimeout(() => {
      btn.classList.remove("is-loading");
      detected = E.extract(text);
      renderJD(text);
    }, 600);
  });
  function renderJD(text) {
    $("#jd-result").innerHTML = detected.length ? `
      <div class="card card--pad jd-result fade-in" style="background:var(--color-surface-2);box-shadow:none">
        <p class="field__label">Đã nhận diện ${detected.length} kỹ năng — bỏ tick kỹ năng nhận sai:</p>
        <div class="chip-row">${detected.map(id => `<label class="check"><input type="checkbox" value="${id}" checked> ${CS.esc(E.skill(id).name)}</label>`).join("")}</div>
        <div class="btn-row">
          <button class="btn btn--primary btn--sm" type="button" id="jd-confirm">Xác nhận — so sánh với JD này</button>
          <button class="btn btn--ghost btn--sm" type="button" id="jd-mine">Thêm những kỹ năng tôi đã có</button>
        </div>
      </div>` : CS.state("empty", { title: "Chưa nhận diện được kỹ năng nào", text: "Hãy dán phần “Yêu cầu” của JD, hoặc nhập kỹ năng ở tab Nhập tay." });
    const ticked = () => [...document.querySelectorAll("#jd-result input:checked")].map(i => i.value);
    const c = $("#jd-confirm");
    if (c) c.addEventListener("click", () => {
      const ids = ticked();
      if (!ids.length) { CS.toast("Hãy giữ ít nhất 1 kỹ năng.", "error"); return; }
      store.set({ customJD: { text: $("#jd-text").value.trim(), skills: ids }, allowJD: $("#jd-consent").checked });
      CS.toast("Đã lưu JD — kết quả sẽ có thêm thẻ “JD bạn đã dán”.");
      render();
    });
    const m = $("#jd-mine");
    if (m) m.addEventListener("click", () => { ticked().forEach(id => store.addSkill(id)); tab("manual"); render(); CS.toast("Đã thêm vào kỹ năng của bạn."); });
  }

  // --- Render chung ---
  function render() {
    const p = store.get();
    const names = p.positions.map(id => E.position(id).name);
    $("#target-line").innerHTML = names.length
      ? `So sánh với: <b>${names.map(CS.esc).join(", ")}</b>${p.customJD ? " + JD bạn đã dán" : ""}${p.level ? " · " + p.level : ""}${p.location ? " · " + p.location : ""}`
      : `Chưa chọn vị trí. <a class="link" href="position.html">Chọn vị trí</a> hoặc dán một JD ở tab “Dán JD”.`;

    const ids = Object.keys(p.skills);
    $("#picked-count").textContent = ids.length;
    $("#picked").innerHTML = ids.map(id => `<span class="tag">${CS.esc(E.skill(id).name)}
      <select data-level="${id}" aria-label="Mức độ ${CS.esc(E.skill(id).name)}">
        <option value="co-ban"${p.skills[id] === "co-ban" ? " selected" : ""}>Cơ bản</option>
        <option value="thanh-thao"${p.skills[id] === "thanh-thao" ? " selected" : ""}>Thành thạo</option></select>
      <button type="button" data-remove="${id}" aria-label="Xóa ${CS.esc(E.skill(id).name)}">${CS.icon("close", 12)}</button></span>`).join("");
    $("#quick").innerHTML = quickIds(p).map(id => `<button type="button" class="chip chip--add" data-add="${id}">${CS.esc(E.skill(id).name)}</button>`).join("") || `<span class="small muted">Bạn đã thêm hết gợi ý.</span>`;

    $("#summary").innerHTML = `
      <li>${CS.icon("target", 18)}<div>${names.length || p.customJD ? `${names.length} vị trí${p.customJD ? " + 1 JD đã dán" : ""}` : "Chưa có vị trí"}<small>Mục tiêu so sánh</small></div></li>
      <li>${CS.icon("layers", 18)}<div>${ids.length} kỹ năng<small>${ids.filter(i => p.skills[i] === "thanh-thao").length} thành thạo</small></div></li>
      ${p.customJD ? `<li>${CS.icon("file", 18)}<div>JD đã dán · ${p.customJD.skills.length} kỹ năng <button class="link" type="button" id="jd-clear">Xóa</button><small>${p.allowJD ? "Cho phép dùng vào thống kê" : "Chỉ dùng để so sánh"}</small></div></li>` : ""}`;
    const clr = $("#jd-clear");
    if (clr) clr.addEventListener("click", () => { store.set({ customJD: null, allowJD: false }); render(); });
    $("#few-warn").innerHTML = ids.length && ids.length < MIN
      ? `<div class="notice notice--warn">${CS.icon("info", 16)}<span>Mới có ${ids.length} kỹ năng — nhập thêm để kết quả chính xác hơn.</span></div>` : "";
  }

  $("#go").addEventListener("click", () => {
    const p = store.get();
    const n = Object.keys(p.skills).length;
    if (!p.positions.length && !p.customJD) { CS.toast("Hãy chọn vị trí hoặc dán một JD trước.", "error"); return; }
    if (!n) { CS.toast("Hãy nhập ít nhất 1 kỹ năng.", "error"); $("#skill-q").focus(); return; }
    if (n < MIN) {
      $("#few-text").textContent = `Bạn mới nhập ${n} kỹ năng. Điểm có thể thấp hơn thực tế nếu bạn còn kỹ năng chưa khai báo.`;
      $("#few-dialog").showModal();
      return;
    }
    location.href = "results.html";
  });
  $("#few-go").addEventListener("click", () => (location.href = "results.html"));

  if (store.get().customJD) $("#jd-text").value = store.get().customJD.text;
  $("#jd-consent").checked = store.get().allowJD;
  render();
})();
