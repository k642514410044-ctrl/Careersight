/* Trang chủ */
(function () {
  const D = CS_DATA, E = CS.engine;
  const $ = s => document.querySelector(s);
  const go = id => (location.href = "position.html" + (id ? "?pos=" + id : ""));

  // Ô "Bạn muốn làm vị trí nào?" — gợi ý khi gõ, chuyển sang bước Chọn vị trí đã điền sẵn
  const input = $("#hero-q");
  CS.autocomplete(input, {
    source: q => E.searchPositions(q).map(p => ({ value: p.id, label: p.name, sub: `${p.jd.toLocaleString("vi-VN")} tin` })),
    onPick: it => go(it.value),
    empty: q => `Chưa có vị trí “${CS.esc(q)}”. Bấm <b>Bắt đầu phân tích</b> để xem danh sách đầy đủ.`
  });
  $("#hero-form").addEventListener("submit", e => {
    e.preventDefault();
    const q = input.value.trim();
    const hit = q && E.searchPositions(q)[0];
    location.href = "position.html" + (hit ? "?pos=" + hit.id : q ? "?q=" + encodeURIComponent(q) : "");
  });
  $("#hero-popular").innerHTML = ["data-analyst", "business-analyst", "digital-marketing", "accountant"]
    .map(id => `<a class="chip" href="position.html?pos=${id}">${E.position(id).name}</a>`).join("");

  // Dòng uy tín dữ liệu
  $("#trust").innerHTML = `
    <span>${CS.icon("database", 16)}<b>${D.meta.totalJD.toLocaleString("vi-VN")}</b> tin tuyển dụng</span>
    <span>${CS.icon("target", 16)}<b>${D.positions.length}</b> vị trí · ${D.industries.length} nhóm ngành</span>
    <span>${CS.icon("clock", 16)}Cập nhật <b>${D.meta.updated}</b></span>`;

  // 3–5 kỹ năng đang lên
  const hot = Object.values(D.skills).filter(s => s.trend > 0).sort((a, b) => b.trend - a.trend).slice(0, 5);
  $("#hot-list").innerHTML = hot.map(s => {
    const st = E.skillStats(s.id);
    return `<a class="card card--hover hot" href="skill.html?id=${s.id}">
      <span class="row row--between"><b>${CS.esc(s.name)}</b>${CS.trendTag(s.trend)}</span>
      <small>${D.types[s.type]} · cao nhất ${Math.round(st.per[0].freq * 100)}% tin ${CS.esc(st.per[0].name)}</small></a>`;
  }).join("");
  $("#hot-meta").innerHTML = CS.transparency(D.meta.totalJD, "so với kỳ trước");
})();
