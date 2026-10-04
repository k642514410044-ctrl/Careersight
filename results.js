/* Bước 4 — Kết quả tương thích */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#res-root");
  const MATCH = { co: "Có", "tuong-duong": "Tương đương", thieu: "Thiếu" };
  let viewing = null;

  function targets(p) { return p.positions.concat(p.customJD ? ["custom-jd"] : []); }

  function card(r) {
    const missing = r.missing.slice(0, 4).map(m => `<span class="tag ${m.m ? "tag--eq" : "tag--missing"}">${CS.esc(m.name)}</span>`).join("");
    return `<article class="card result-card${r.pos.id === viewing ? " is-viewing" : ""}" data-gap="${r.pos.id}">
      <div class="result-card__top">
        ${CS.donut(r.score)}
        <div>
          <h3>${CS.esc(r.pos.name)}</h3>
          <div class="pos-card__meta">${r.pos.jd ? r.pos.jd.toLocaleString("vi-VN") + " tin" : "JD đơn lẻ"} ${CS.confBadge(r.pos.jd)}</div>
        </div>
      </div>
      <p class="result-card__summary">Có <b>${r.coreHave}/${r.coreTotal}</b> kỹ năng cốt lõi.${r.missing.length ? " Còn thiếu:" : " Bạn đã có đủ kỹ năng cốt lõi!"}</p>
      ${missing ? `<div class="chip-row">${missing}${r.missing.length > 4 ? `<span class="xs muted">+${r.missing.length - 4} kỹ năng</span>` : ""}</div>` : ""}
      <div class="btn-row">
        <a class="btn btn--primary btn--sm" href="gap.html?pos=${r.pos.id}">Xem khoảng trống <span data-icon="arrow" data-size="16"></span></a>
        <button class="btn btn--ghost btn--sm" type="button" data-view="${r.pos.id}">Xem bảng đóng góp</button>
      </div>
    </article>`;
  }

  function table(r) {
    return `<div class="table-wrap"><table class="table">
      <thead><tr><th>Kỹ năng</th><th class="hide-sm">Loại</th><th class="num">Tần suất</th><th>Yêu cầu</th><th class="num">Trọng số</th><th>Mức khớp</th><th class="num">Đóng góp</th></tr></thead>
      <tbody>${r.rows.map(x => `<tr>
        <td>${CS.skillLink(x.id)}</td>
        <td class="xs muted nowrap hide-sm">${D.types[x.type]}</td>
        <td class="num">${r.pos.jd ? Math.round(x.freq * 100) + "%" : "—"}</td>
        <td><span class="badge ${x.req === "bat-buoc" ? "badge--req" : "badge--opt"}">${x.req === "bat-buoc" ? "Bắt buộc" : "Ưu tiên"}</span></td>
        <td class="num">${x.w.toFixed(2).replace(".", ",")}</td>
        <td><span class="match-${x.kind}">${MATCH[x.kind]}</span>${x.via ? `<br><small class="muted">qua ${CS.esc(x.via)}</small>` : ""}</td>
        <td class="num">${x.contrib ? "+" + x.contrib.toFixed(1).replace(".", ",") : "0"}</td></tr>`).join("")}
      </tbody></table></div>`;
  }

  function render() {
    const p = store.get();
    const ts = targets(p);
    if (!ts.length || !Object.keys(p.skills).length) {
      $("#res-sub").textContent = "";
      root.innerHTML = CS.state("empty", {
        title: "Chưa đủ thông tin để tính điểm",
        text: !ts.length ? "Bạn chưa chọn vị trí nào hoặc dán JD." : "Bạn chưa nhập kỹ năng nào.",
        action: `<div class="btn-row btn-row--center"><a class="btn btn--primary" href="${!ts.length ? "position.html" : "skills.html"}">${!ts.length ? "Chọn vị trí" : "Nhập kỹ năng"}</a>
          <button class="btn btn--ghost" type="button" data-demo>Xem với dữ liệu mẫu</button></div>`
      });
      return;
    }
    const results = ts.map(id => E.score(id, p));
    if (!viewing || !ts.includes(viewing)) viewing = ts[0];
    const cur = results.find(r => r.pos.id === viewing);
    const others = E.suggest(p, p.positions, 3);
    const totalN = results.filter(r => r.pos.jd).reduce((t, r) => t + r.pos.jd, 0);

    $("#res-sub").textContent = `${Object.keys(p.skills).length} kỹ năng của bạn so với ${ts.length} mục tiêu${p.level ? " · " + p.level : ""}${p.location ? " · " + p.location : ""}`;
    if (p.loggedIn) results.filter(r => r.pos.jd).forEach(r => store.logScore(r.pos.id, r.score));

    root.innerHTML = `
      <div class="grid grid--3">${results.map(card).join("")}</div>
      ${CS.transparency(totalN || null)}
      <p class="disclaimer">${CS.icon("info", 14)} Điểm là ước tính từ dữ liệu thị trường, không phải cam kết trúng tuyển.</p>

      <div class="split-layout" style="margin-top:2rem">
        <section class="card card--pad" aria-labelledby="contrib-title">
          <div class="card__head">
            <h2 id="contrib-title">Đóng góp của từng kỹ năng</h2>
            <label class="row small"><span class="muted">Đang xem</span>
              <select class="select select--sm" id="view-sel">${results.map(r => `<option value="${r.pos.id}"${r.pos.id === viewing ? " selected" : ""}>${CS.esc(r.pos.name)} · ${r.score}%</option>`).join("")}</select></label>
          </div>
          ${table(cur)}
          <p class="xs muted" style="margin-top:1rem">Trọng số = tần suất × hệ số (bắt buộc 1,0 · ưu tiên 0,5). Mức khớp: có = 1 · tương đương cùng nhóm = 0,5 · thiếu = 0. <a class="link" href="method.html#score">Cách tính điểm</a></p>
        </section>

        <aside class="card card--pad" aria-labelledby="other-title">
          <h2 class="h3" id="other-title" style="margin-bottom:.25rem">Vị trí khác có thể phù hợp</h2>
          <p class="xs muted" style="margin-bottom:.75rem">Vị trí có bộ kỹ năng tương tự với hồ sơ của bạn</p>
          ${others.map(o => `<div class="suggest-item">${CS.donut(o.score, "sm")}
            <div><b>${CS.esc(o.pos.name)}</b><small class="xs muted">${o.pos.jd.toLocaleString("vi-VN")} tin</small></div>
            <button class="btn btn--outline btn--xs" type="button" data-add-pos="${o.pos.id}"${p.positions.length >= 3 ? ' aria-disabled="true" title="Đã chọn tối đa 3 vị trí"' : ""}>+ Thêm</button></div>`).join("")}
        </aside>
      </div>

      <div class="action-bar">
        <a class="btn btn--ghost" href="skills.html"><span data-icon="back" data-size="16"></span>Sửa kỹ năng</a>
        <a class="btn btn--primary btn--lg" href="gap.html?pos=${viewing}">Xem khoảng trống của ${CS.esc(cur.pos.name)} <span data-icon="arrow" data-size="18"></span></a>
      </div>`;
    CS.hydrate(root);
    $("#view-sel").addEventListener("change", e => { viewing = e.target.value; render(); });
  }

  root.addEventListener("click", e => {
    const v = e.target.closest("[data-view]");
    if (v) { viewing = v.dataset.view; render(); document.getElementById("contrib-title").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    const add = e.target.closest("[data-add-pos]");
    if (add) {
      if (store.get().positions.length >= 3) { CS.toast("Đã chọn tối đa 3 vị trí — bỏ bớt ở bước Vị trí.", "error"); return; }
      store.update(p => p.positions.push(add.dataset.addPos));
      viewing = add.dataset.addPos;
      CS.toast("Đã thêm vị trí và tính lại điểm.");
      render();
      return;
    }
    if (e.target.closest("a, button, select")) return;
    const c = e.target.closest("[data-gap]");
    if (c) location.href = "gap.html?pos=" + c.dataset.gap;
  });

  $("#save").addEventListener("click", () => {
    if (!CS.requireLogin("results.html")) return;
    const p = store.get();
    targets(p).filter(id => id !== "custom-jd").forEach(id => store.logScore(id, E.score(id, p).score));
    CS.toast("Đã lưu kết quả vào hồ sơ.");
  });
  render();
})();
