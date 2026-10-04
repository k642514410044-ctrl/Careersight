/* Trang quản trị nội bộ (dữ liệu minh họa) */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const root = document.getElementById("admin-root");
  const groups = [...new Set(Object.values(D.skills).map(s => s.group))];
  const seedQueue = [
    { name: "Looker Studio", date: "29/09/2026", count: 14, suggest: "Nhóm bi (gộp với Power BI/Tableau?)" },
    { name: "power query", date: "28/09/2026", count: 9, suggest: "Bí danh của Power BI" },
    { name: "Kỹ năng đàm phán", date: "27/09/2026", count: 4, suggest: "Kỹ năng mềm mới" }
  ];
  const versions = [
    { v: "v0.3-demo", date: "28/09/2026", jd: 6060, p: 91, r: 82, status: "Đang dùng" },
    { v: "v0.2", date: "14/09/2026", jd: 5480, p: 88, r: 79, status: "Lưu trữ" },
    { v: "v0.1", date: "31/08/2026", jd: 4120, p: 84, r: 74, status: "Lưu trữ" }
  ];
  const reports = [
    { skill: "Excel", type: "Nhận diện sai", desc: "“Excel” trong “excellent communication” bị nhận nhầm", date: "30/09/2026", status: "Mới" },
    { skill: "SQL", type: "Số liệu bất thường", desc: "Tần suất SQL cho BA có vẻ cao", date: "26/09/2026", status: "Đang xử lý" }
  ];

  function render() {
    const userQ = store.get().proposals.map(p => ({ name: p.name, date: p.date, count: 1, suggest: "Từ người dùng (phiên này)" }));
    const queue = userQ.concat(seedQueue);
    document.getElementById("kpis").innerHTML = `
      <div class="card kpi"><small>Kỹ năng trong danh mục</small><b>${Object.keys(D.skills).length}</b><small>${groups.length} nhóm cha</small></div>
      <div class="card kpi"><small>Hàng chờ duyệt</small><b>${queue.length}</b><small>đề xuất từ người dùng</small></div>
      <div class="card kpi"><small>Precision / Recall</small><b>${versions[0].p}% / ${versions[0].r}%</b><small>mục tiêu ≥ 90% / ≥ 80%</small></div>
      <div class="card kpi"><small>Phiên bản dữ liệu</small><b>${D.meta.version}</b><small>${D.meta.totalJD.toLocaleString("vi-VN")} JD · ${D.meta.updated}</small></div>`;

    root.innerHTML = `
      <section class="card card--pad" id="queue">
        <div class="card__head"><h2>Hàng chờ kỹ năng người dùng đề xuất</h2><span class="xs muted">Duyệt / gộp tên gọi</span></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Tên người dùng gõ</th><th class="num">Lượt</th><th>Gợi ý hệ thống</th><th>Ngày</th><th>Thao tác</th></tr></thead>
        <tbody>${queue.map((q, i) => `<tr><td><b>${CS.esc(q.name)}</b></td><td class="num">${q.count}</td><td class="small muted">${CS.esc(q.suggest)}</td><td class="xs">${q.date}</td>
          <td><div class="row" style="flex-wrap:nowrap"><button class="btn btn--primary btn--xs" data-act="Đã duyệt">Duyệt</button>
          <select class="select select--sm" aria-label="Gộp vào" data-merge="${i}"><option value="">Gộp vào…</option>${Object.values(D.skills).map(s => `<option>${CS.esc(s.name)}</option>`).join("")}</select>
          <button class="btn btn--ghost btn--xs" data-act="Đã từ chối">Từ chối</button></div></td></tr>`).join("")}</tbody></table></div>
      </section>

      <section class="card card--pad" id="catalog">
        <div class="card__head"><h2>Danh mục kỹ năng & nhóm cha</h2><button class="btn btn--outline btn--sm" data-act="Mở form thêm kỹ năng (placeholder)">+ Thêm kỹ năng</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Kỹ năng</th><th>Loại</th><th>Nhóm cha</th><th>Tên gọi khác</th><th>Xu hướng</th></tr></thead>
        <tbody>${Object.values(D.skills).map(s => `<tr><td><a class="skill-link" href="skill.html?id=${s.id}">${CS.esc(s.name)}</a></td><td class="xs">${D.types[s.type]}</td>
          <td><span class="badge badge--slate">${s.group}</span></td><td class="xs muted">${s.aliases.map(CS.esc).join(", ") || "—"}</td><td>${CS.trendTag(s.trend)}</td></tr>`).join("")}</tbody></table></div>
      </section>

      <section class="card card--pad" id="hours">
        <div class="card__head"><h2>Bảng giờ học & đồ thị tiên quyết</h2><span class="xs muted">Do chuyên gia ngành nhập, chỉnh theo phản hồi</span></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Kỹ năng</th><th class="num">Giờ học</th><th>Tiên quyết</th><th>Dự án gợi ý</th></tr></thead>
        <tbody>${Object.values(D.skills).filter(s => s.prereq.length || s.project).map(s => `<tr><td><b>${CS.esc(s.name)}</b></td>
          <td class="num"><input class="input" type="number" value="${s.hours}" style="width:80px;min-height:34px;padding:.3rem .5rem" aria-label="Giờ học ${CS.esc(s.name)}"></td>
          <td class="small">${s.prereq.map(id => E.skill(id).name).join(" → ") || "—"}</td><td class="xs muted">${CS.esc(s.project) || "—"}</td></tr>`).join("")}</tbody></table></div>
      </section>

      <section class="card card--pad" id="versions">
        <div class="card__head"><h2>Phiên bản dữ liệu & kết quả đo trích xuất</h2><span class="xs muted">Đo trên bộ mẫu gán nhãn tay (~200 JD/nhóm ngành)</span></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Phiên bản</th><th>Ngày</th><th class="num">Số JD</th><th class="num">Precision</th><th class="num">Recall</th><th>Trạng thái</th></tr></thead>
        <tbody>${versions.map(v => `<tr><td><b>${v.v}</b></td><td class="xs">${v.date}</td><td class="num">${v.jd.toLocaleString("vi-VN")}</td>
          <td class="num"><span class="${v.p >= 90 ? "match-co" : "match-thieu"}">${v.p}%</span></td><td class="num"><span class="${v.r >= 80 ? "match-co" : "match-thieu"}">${v.r}%</span></td>
          <td><span class="badge ${v.status === "Đang dùng" ? "badge--conf-cao" : "badge--slate"}">${v.status}</span></td></tr>`).join("")}</tbody></table></div>
      </section>

      <section class="card card--pad" id="resources">
        <div class="card__head"><h2>Quản lý tài nguyên học</h2><button class="btn btn--outline btn--sm" data-act="Mở form thêm tài nguyên (placeholder)">+ Thêm tài nguyên</button></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Kỹ năng</th><th>Tài nguyên</th><th>Loại</th><th>Kiểm duyệt</th></tr></thead>
        <tbody>${["sql", "tableau", "dbt"].map(id => D.resources(id).map((r, i) => `<tr><td>${i ? "" : `<b>${CS.esc(E.skill(id).name)}</b>`}</td><td class="small">${CS.esc(r.title)}</td><td><span class="badge badge--navy">${r.kind}</span></td>
          <td><span class="badge ${i === 2 ? "badge--conf-thap" : "badge--conf-cao"}">${i === 2 ? "Cần xem lại" : "Đã duyệt"}</span></td></tr>`).join("")).join("")}</tbody></table></div>
      </section>

      <section class="card card--pad" id="reports">
        <div class="card__head"><h2>Theo dõi phản hồi lỗi</h2></div>
        <div class="table-wrap"><table class="table"><thead><tr><th>Kỹ năng</th><th>Loại</th><th>Mô tả</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
        <tbody>${reports.map(r => `<tr><td><b>${CS.esc(r.skill)}</b></td><td class="xs">${r.type}</td><td class="small muted">${CS.esc(r.desc)}</td><td class="xs">${r.date}</td>
          <td><span class="badge ${r.status === "Mới" ? "badge--conf-thap" : "badge--navy"}">${r.status}</span></td></tr>`).join("")}</tbody></table></div>
      </section>`;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    CS.toast(b.dataset.act + ".");
    const tr = b.closest("tr");
    if (tr && /duyệt|từ chối/i.test(b.dataset.act)) tr.style.opacity = .4;
  });
  root.addEventListener("change", e => {
    if (e.target.dataset.merge !== undefined && e.target.value) { CS.toast(`Đã gộp vào “${e.target.value}”.`); e.target.closest("tr").style.opacity = .4; }
    if (e.target.type === "number") CS.toast("Đã cập nhật giờ học (giả lập).");
  });
  render();
})();
