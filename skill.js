/* Chi tiết kỹ năng — nối Khoảng trống, Xu hướng và Lộ trình */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const root = document.getElementById("skill-root");
  const id = new URLSearchParams(location.search).get("id");
  const s = D.skills[id];

  if (!s) {
    root.innerHTML = CS.state("error", { title: "Không tìm thấy kỹ năng", text: "Đường dẫn có thể đã thay đổi hoặc kỹ năng chưa có trong danh mục.",
      action: `<a class="btn btn--primary btn--sm" href="trends.html">Xem xu hướng</a>` });
    return;
  }
  document.title = `${s.name} — Career Sight`;
  const MONTHS = ["T4", "T5", "T6", "T7", "T8", "T9"];

  function chips(ids, empty) {
    const owned = store.get().skills;
    return ids.length ? `<div class="chip-row">${ids.map(x => `<a class="tag tag--plain ${owned[x] ? "" : "tag--missing"}" href="skill.html?id=${x}">${owned[x] ? "✓ " : ""}${CS.esc(E.skill(x).name)}</a>`).join("")}</div>` : `<p class="small muted">${empty}</p>`;
  }

  function render() {
    const p = store.get();
    const st = E.skillStats(id);
    const mine = !!p.skills[id];
    const inRoad = p.roadmapPicks.includes(id);
    const n = st.per.reduce((t, x) => t + E.position(x.id).jd, 0);
    root.innerHTML = `
      <div class="skill-hero">
        <div>
          <span class="eyebrow">${D.types[s.type]}</span>
          <h1 class="h2" style="margin-block:.25rem .5rem">${CS.esc(s.name)} ${mine ? `<span class="badge badge--conf-cao">Bạn đã có</span>` : ""}</h1>
          <p class="lead" style="max-width:640px">${CS.esc(s.desc)}</p>
        </div>
        <div class="btn-row">
          <button class="btn ${mine ? "btn--outline" : "btn--dark"}" type="button" id="toggle-mine">${mine ? "✓ Có trong hồ sơ · Bỏ" : "+ Thêm vào hồ sơ của tôi"}</button>
          <button class="btn btn--primary" type="button" id="add-road">${inRoad ? "✓ Trong lộ trình" : "Thêm vào lộ trình"}</button>
        </div>
      </div>

      <dl class="kv" style="margin-block:1.5rem">
        <div><dt>Giờ học ước tính</dt><dd>${s.hours} giờ</dd></div>
        <div><dt>Xu hướng kỳ này</dt><dd>${CS.trendTag(s.trend)}</dd></div>
        <div><dt>Xuất hiện ở</dt><dd>${st.per.length} vị trí</dd></div>
      </dl>

      <div class="grid grid--2">
        <section class="card card--pad">
          <div class="card__head"><h2>Tần suất theo từng vị trí</h2></div>
          ${st.per.length ? `<ul class="preview-list">${st.per.map(x => `<li><a class="skill-link" href="position.html?pos=${x.id}">${CS.esc(x.name)}</a>
            <div class="meter"><i style="--w:${x.freq * 100}%"></i></div><span class="num small">${Math.round(x.freq * 100)}%</span></li>`).join("")}</ul>`
            : `<p class="small muted">Chưa đủ dữ liệu.</p>`}
        </section>
        <section class="card card--pad">
          <div class="card__head"><h2>Tần suất theo thời gian</h2><span class="badge badge--soon">Minh họa</span></div>
          ${CS.lineChart(st.series.map(v => v * 100), MONTHS, { min: 0, max: 100, label: "Tỷ lệ tin yêu cầu theo tháng", fmt: v => Math.round(v) + "%" })}
          <p class="xs muted">Hiển thị chính thức khi dữ liệu đủ kỳ (chuỗi thời gian từ data feed).</p>
        </section>
        <section class="card card--pad">
          <div class="card__head"><h2>Kỹ năng hay đi kèm</h2></div>
          ${chips(s.related.filter(x => D.skills[x]), "Chưa có dữ liệu đồng xuất hiện.")}
          <div class="card__head" style="margin-top:1.5rem"><h2>Kỹ năng tiên quyết</h2></div>
          ${chips(s.prereq, "Không cần kỹ năng tiên quyết.")}
        </section>
        <section class="card card--pad">
          <div class="card__head"><h2>${CS.icon("book", 18)} Tài nguyên học đã tuyển chọn</h2></div>
          <ul class="res-list">${D.resources(id).map(r => `<li><span class="badge badge--navy">${r.kind}</span><b>${CS.esc(r.title)}</b><span class="xs muted">~${r.hours} giờ</span></li>`).join("")}</ul>
          <p class="xs muted" style="margin-top:.75rem">Danh sách do đội ngũ tuyển chọn, được kiểm duyệt và cập nhật định kỳ.</p>
        </section>
      </div>
      ${CS.transparency(n)}`;
    document.getElementById("toggle-mine").addEventListener("click", () => {
      mine ? store.removeSkill(id) : store.addSkill(id);
      CS.toast(mine ? "Đã bỏ khỏi hồ sơ." : "Đã thêm vào hồ sơ — điểm tương thích sẽ được tính lại.");
      render();
    });
    document.getElementById("add-road").addEventListener("click", () => {
      const on = store.toggleList("roadmapPicks", id);
      CS.toast(on ? "Đã thêm vào lộ trình." : "Đã bỏ khỏi lộ trình.");
      render();
    });
  }
  render();
})();
