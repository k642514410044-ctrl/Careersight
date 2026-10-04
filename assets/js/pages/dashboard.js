/* Tổng quan / Theo dõi */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#dash-root");

  function render() {
    const p = store.get();
    if (!p.loggedIn) { root.innerHTML = CS.loginGate("theo dõi tiến độ học", "dashboard.html"); return; }
    $("#dash-actions").hidden = false;
    $("#hello").textContent = `Chào ${p.user.name.split(" ").slice(-1)[0]} 👋`;
    if (!p.positions.length) {
      root.innerHTML = CS.state("empty", { title: "Bạn chưa chọn vị trí mục tiêu", text: "Bắt đầu phân tích để có điểm tương thích và lộ trình.",
        action: `<a class="btn btn--primary" href="position.html">Bắt đầu phân tích</a>` });
      return;
    }
    const pos = (p.roadmap && p.positions.includes(p.roadmap.pos)) ? p.roadmap.pos : p.positions[0];
    const now = E.score(pos, p);
    const hist = p.history.filter(h => h.pos === pos);
    const first = hist.length ? hist[0].score : now.score;
    const series = hist.length && hist[hist.length - 1].score === now.score ? hist : hist.concat([{ date: store.today(), score: now.score }]);
    $("#dash-sub").textContent = `Mục tiêu chính: ${now.pos.name} · cập nhật ${store.today()}`;

    // Bước đang học
    const rm = p.roadmap && p.roadmap.pos === pos ? p.roadmap : null;
    const cur = rm && rm.steps.find(s => !s.done);
    const doneSteps = rm ? rm.steps.filter(s => s.done).length : 0;
    const stepCard = !rm
      ? CS.state("empty", { title: "Chưa có lộ trình", text: "Tạo lộ trình để hệ thống gợi ý bạn nên học gì trước.", action: `<a class="btn btn--primary btn--sm" href="roadmap.html?pos=${pos}">Tạo lộ trình</a>` })
      : !cur ? `<p class="small">🎉 Bạn đã hoàn thành cả ${rm.steps.length} bước của lộ trình.</p><a class="link" href="roadmap.html?pos=${pos}">Xem lại lộ trình</a>`
      : `<a class="row row--between" href="roadmap.html?pos=${pos}" style="margin-bottom:1rem">
          <span><span class="badge badge--navy">Bước ${cur.index}/${rm.steps.length} · ${cur.weeks} tuần</span></span>
          <span class="link">Mở lộ trình →</span></a>
        <div class="meter" style="margin-bottom:1rem"><i style="--w:${doneSteps / rm.steps.length * 100}%"></i></div>
        <form class="stack" id="tick-form">
          <p class="field__label">Tick kỹ năng đã học xong</p>
          ${cur.items.map((ch, i) => `<label class="check"><input type="checkbox" value="${i}"${ch.done ? " checked disabled" : ""}> <span>${CS.esc(E.skill(ch.id).name)}${ch.parts > 1 ? ` (phần ${ch.part}/${ch.parts})` : ""} <span class="xs muted">· ~${ch.hours} giờ</span></span></label>`).join("")}
          <label class="field"><span class="field__label xs">Ghi chú ngắn (tùy chọn)</span><input class="input" id="tick-note" maxlength="120" placeholder="VD: Xong khóa nhập môn, còn bài tập cuối"></label>
          <button class="btn btn--primary btn--sm" type="submit">Lưu tiến độ</button>
        </form>`;

    // Thay đổi thị trường liên quan
    const market = now.rows.filter(r => E.skill(r.id).trend).sort((a, b) => Math.abs(E.skill(b.id).trend) - Math.abs(E.skill(a.id).trend)).slice(0, 5);
    // Nhắc việc
    const reminders = [];
    if (cur) reminders.push({ icon: "clock", text: `Tuần này: dành ${rm.settings.hours} giờ cho ${E.skill((cur.items.find(ch => !ch.done) || cur.items[0]).id).name}`, sub: "Theo lộ trình đang học" });
    if (!rm) reminders.push({ icon: "route", text: "Tạo lộ trình để nhận nhắc việc hằng tuần", sub: "Gợi ý" });
    reminders.push({ icon: "target", text: "Cập nhật kỹ năng mỗi khi học xong để điểm luôn chính xác", sub: "Mẹo" });
    if (p.customJD) reminders.push({ icon: "file", text: "Bạn có một JD đã dán — xem lại mức tương thích", sub: "Kết quả" });

    root.innerHTML = `<div class="dash-grid">
      <section class="card card--pad span-8">
        <div class="card__head"><h2>Điểm tương thích — ${CS.esc(now.pos.name)}</h2><a class="link" href="results.html">Xem lại điểm</a></div>
        <div class="score-compare">
          ${CS.donut(now.score, "lg")}
          <div><p class="small muted">Ban đầu ${first}% → hiện tại ${now.score}%</p>
            <p class="score-compare__delta">${now.score - first >= 0 ? "+" : ""}${now.score - first} điểm</p>
            <p class="xs muted">Có ${now.coreHave}/${now.coreTotal} kỹ năng cốt lõi</p></div>
        </div>
        <div style="margin-top:1rem">${series.length > 1 ? CS.lineChart(series.map(h => h.score), series.map(h => h.date.slice(0, 5)), { min: 0, max: 100, label: "Điểm tương thích theo thời gian", fmt: v => Math.round(v) + "%" }) : `<p class="small muted">Biểu đồ sẽ hiện khi bạn có từ 2 lần tính điểm.</p>`}</div>
        ${CS.transparency(now.pos.jd)}
      </section>

      <section class="card card--pad span-4">
        <div class="card__head"><h2>${CS.icon("route", 18)} Bước đang học</h2></div>
        ${stepCard}
      </section>

      <section class="card card--pad span-4">
        <div class="card__head"><h2>${CS.icon("check", 18)} Vừa hoàn thành</h2></div>
        ${p.completed.length ? `<ul class="list-plain">${p.completed.slice(-5).reverse().map(c => `<li>${CS.icon("check", 16)}<div>${CS.skillLink(c.id)}<small>${c.date}${c.note ? " · " + CS.esc(c.note) : ""}</small></div></li>`).join("")}</ul>`
          : `<p class="small muted">Chưa có kỹ năng nào được đánh dấu hoàn thành.</p>`}
      </section>

      <section class="card card--pad span-4">
        <div class="card__head"><h2>${CS.icon("bell", 18)} Nhắc việc</h2>
          <span class="badge ${p.notifications ? "badge--conf-cao" : "badge--slate"}">${p.notifications ? "Đang bật" : "Đang tắt"}</span></div>
        <ul class="list-plain">${reminders.map(r => `<li>${CS.icon(r.icon, 16)}<div>${CS.esc(r.text)}<small>${r.sub}</small></div></li>`).join("")}</ul>
        <a class="link" href="profile.html#settings">Cài đặt thông báo</a>
      </section>

      <section class="card card--pad span-4">
        <div class="card__head"><h2>${CS.icon("trend", 18)} Thị trường thay đổi</h2></div>
        <ul class="list-plain">${market.map(r => `<li>${CS.trendTag(E.skill(r.id).trend)}<div>${CS.skillLink(r.id)} ${E.skill(r.id).trend > 0 ? "tăng" : "giảm"} tần suất trong tin ${CS.esc(now.pos.name)}
          <small>${r.m === 1 ? "Bạn đã có" : r.m ? "Bạn có kỹ năng tương đương" : "Bạn chưa có — "}${r.m < 1 ? `<a class="link" href="gap.html?pos=${pos}">xem khoảng trống</a>` : ""}</small></div></li>`).join("")}</ul>
      </section>
    </div>`;
    CS.hydrate(root);

    const tf = $("#tick-form");
    if (tf) tf.addEventListener("submit", e => {
      e.preventDefault();
      const idx = [...tf.querySelectorAll("input[type=checkbox]:checked:not(:disabled)")].map(i => +i.value);
      if (!idx.length) { CS.toast("Hãy tick ít nhất một kỹ năng.", "error"); return; }
      const note = $("#tick-note").value.trim();
      store.update(pp => {
        const s = pp.roadmap.steps.find(x => !x.done);
        idx.forEach(i => E.completeChunk(pp, s, s.items[i], note));
      });
      const sc = E.score(pos, store.get()).score;
      store.logScore(pos, sc);
      CS.toast(`Đã lưu tiến độ — điểm mới ${sc}%.`);
      render();
    });
  }
  render();
})();
