/* Xu hướng thị trường */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#trend-root");
  const params = new URLSearchParams(location.search);
  let ind = D.industries.find(i => i.key === params.get("ind")) ? params.get("ind") : "data";
  let tab = "hot", colorMine = false, openCluster = null;
  const COLORS = { navy: "var(--color-primary)", teal: "var(--color-accent)", warm: "var(--color-warm)", slate: "var(--color-slate)" };

  const p0 = store.get();
  $("#f-loc").innerHTML = D.locations.map(l => `<option${p0.location === l ? " selected" : ""}>${l}</option>`).join("");
  $("#f-level").innerHTML = `<option value="">Mọi cấp độ</option>` + D.levels.map(l => `<option${p0.level === l ? " selected" : ""}>${l}</option>`).join("");
  ["#f-loc", "#f-level", "#f-time"].forEach(s => $(s).addEventListener("change", render));

  // Công tắc tô màu theo hồ sơ (chỉ khi đã đăng nhập)
  $("#color-toggle").innerHTML = p0.loggedIn
    ? `<label class="switch-row"><span class="switch"><input type="checkbox" id="mine"><span></span></span> Tô màu theo hồ sơ của tôi</label>`
    : `<a class="link" href="auth.html?next=trends.html">Đăng nhập để tô màu theo hồ sơ của bạn</a>`;
  if ($("#mine")) $("#mine").addEventListener("change", e => { colorMine = e.target.checked; render(); });

  $("#ind-chips").innerHTML = D.industries.map(i => `<button type="button" class="chip" data-ind="${i.key}" aria-pressed="${i.key === ind}">${i.label}</button>`).join("");
  $("#ind-chips").addEventListener("click", e => {
    const b = e.target.closest("[data-ind]");
    if (!b) return;
    ind = b.dataset.ind;
    document.querySelectorAll("#ind-chips .chip").forEach(c => c.setAttribute("aria-pressed", c === b));
    history.replaceState(null, "", "?ind=" + ind);
    render();
  });
  document.querySelectorAll("[data-tab]").forEach(t => t.addEventListener("click", () => {
    tab = t.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(x => x.setAttribute("aria-selected", x === t));
    render();
  }));

  const has = id => !!store.get().skills[id];
  const skillHref = id => (colorMine && !has(id) ? "gap.html" : `skill.html?id=${id}`);

  function hot(list) {
    const max = list[0] ? list[0].freq : 1;
    return `<section class="card card--pad">
      <div class="card__head"><h2>Top kỹ năng theo tỷ lệ tin yêu cầu</h2><span class="xs muted">Δ so với kỳ trước (điểm %)</span></div>
      <div class="trend-bars">${list.slice(0, 10).map(s => `<div class="trend-bar ${colorMine ? (has(s.id) ? "has" : "miss") : ""}">
        <a href="${skillHref(s.id)}">${CS.esc(s.name)}</a>
        <div class="meter"><i style="--w:${s.freq / max * 100}%"></i></div>
        <span class="num small">${Math.round(s.freq * 100)}%</span>${CS.trendTag(s.delta)}</div>`).join("")}</div>
      ${colorMine ? `<div class="legend" style="margin-top:1rem"><span><i style="background:var(--color-success)"></i>Bạn đã có</span><span><i style="background:var(--color-warm)"></i>Bạn còn thiếu — bấm để xem khoảng trống</span></div>` : ""}
    </section>`;
  }

  function movers(list) {
    const up = list.filter(s => s.delta > 0).sort((a, b) => b.delta - a.delta);
    const down = list.filter(s => s.delta < 0).sort((a, b) => a.delta - b.delta);
    const rising = up.filter(s => s.freq < .45 && s.delta >= 4);
    const item = s => `<div class="mover"><a class="skill-link" href="${skillHref(s.id)}">${CS.esc(s.name)}</a><span class="row"><span class="xs muted">${Math.round(s.freq * 100)}% tin</span>${CS.trendTag(s.delta)}</span></div>`;
    return `<div class="movers">
      <section class="card card--pad"><div class="card__head"><h2>${CS.icon("trend", 18)} Đang lên</h2></div>${up.length ? up.map(item).join("") : `<p class="small muted">Không có kỹ năng tăng.</p>`}</section>
      <section class="card card--pad"><div class="card__head"><h2>${CS.icon("down", 18)} Đang giảm</h2></div>${down.length ? down.map(item).join("") : `<p class="small muted">Không có kỹ năng giảm đáng kể.</p>`}</section>
    </div>
    <section class="card card--pad" style="margin-top:1.25rem">
      <div class="card__head"><h2>${CS.icon("sparkle", 18)} Mới nổi</h2><span class="xs muted">Tần suất còn nhỏ nhưng tăng nhanh</span></div>
      <div class="chip-row">${rising.length ? rising.map(s => `<a class="tag tag--plain" href="skill.html?id=${s.id}">${CS.esc(s.name)} ${CS.trendTag(s.delta)}</a>`).join("") : `<span class="small muted">Chưa có kỹ năng mới nổi ở ngành này.</span>`}</div>
    </section>`;
  }

  function network(list) {
    const cls = D.clusters[ind] || [];
    const freq = {};
    list.forEach(s => (freq[s.id] = s.freq));
    const W = 680, H = 560, cx = W / 2, cy = H / 2 + 10;
    const R = cls.length > 1 ? 150 : 0;
    const nodes = {}, out = [];
    cls.forEach((c, ci) => {
      const a = -Math.PI / 2 + ci * 2 * Math.PI / cls.length;
      const ccx = cx + R * Math.cos(a) * 1.25, ccy = cy + R * Math.sin(a);
      c.cx = ccx; c.cy = ccy;
      c.skills.forEach((id, si) => {
        const b = a + si * 2 * Math.PI / c.skills.length;
        const rr = c.skills.length > 1 ? 58 : 0;
        if (!nodes[id]) nodes[id] = { id, x: ccx + rr * Math.cos(b), y: ccy + rr * Math.sin(b), c, r: 16 + (freq[id] || .2) * 26 };
      });
    });
    const edges = [];
    cls.forEach(c => c.skills.forEach((a, i) => c.skills.slice(i + 1).forEach(b => edges.push([a, b, 2]))));
    Object.values(nodes).forEach(n => E.skill(n.id).related.forEach(r => { if (nodes[r] && nodes[r].c !== n.c && n.id < r) edges.push([n.id, r, 1]); }));
    const fill = n => colorMine ? (has(n.id) ? "var(--color-success)" : "var(--color-warm)") : COLORS[n.c.color];
    out.push(`<svg class="network" viewBox="0 0 ${W} ${H}" role="img" aria-label="Đồ thị cụm kỹ năng đi kèm">`);
    edges.forEach(([a, b, w]) => out.push(`<line class="edge" x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke-width="${w}" opacity="${w > 1 ? .9 : .45}"/>`));
    cls.forEach((c, i) => out.push(`<text class="label" x="${c.cx}" y="${c.cy - 108}" text-anchor="middle" style="cursor:pointer" data-cluster="${i}">${CS.esc(c.name)} ›</text>`));
    Object.values(nodes).forEach(n => out.push(`<g class="node" tabindex="0" role="link" data-node="${n.id}" aria-label="${CS.esc(E.skill(n.id).name)}">
      <circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${fill(n)}"/><text x="${n.x}" y="${n.y + 4}" text-anchor="middle">${CS.esc(E.skill(n.id).name.split(" ")[0].slice(0, 9))}</text>
      <title>${CS.esc(E.skill(n.id).name)} · ${Math.round((freq[n.id] || 0) * 100)}% tin</title></g>`));
    out.push("</svg>");
    return `<section class="card card--pad">
      <div class="card__head"><h2>Cụm kỹ năng thường được tuyển chung</h2><span class="xs muted">Đường nối = đồng xuất hiện trong cùng JD · bấm tên cụm để xem chi tiết</span></div>
      <div style="overflow-x:auto"><div style="min-width:520px">${out.join("")}</div></div>
      <div class="legend">${colorMine
        ? `<span><i style="background:var(--color-success)"></i>Bạn đã có</span><span><i style="background:var(--color-warm)"></i>Bạn còn thiếu</span>`
        : cls.map(c => `<span><i style="background:${COLORS[c.color]}"></i>${CS.esc(c.name)}</span>`).join("")}</div>
      <div class="chip-row" style="margin-top:1rem">${cls.map((c, i) => `<button class="chip" type="button" data-cluster="${i}">${CS.esc(c.name)} (${c.skills.length})</button>`).join("")}</div>
    </section>`;
  }

  function render() {
    const list = E.industryTrends(ind);
    const n = D.positions.filter(p => p.industry === ind).reduce((t, p) => t + p.jd, 0);
    const filt = [$("#f-loc").value, $("#f-level").value || "mọi cấp độ", $("#f-time").value.toLowerCase()].join(" · ");
    root.innerHTML = (list.length
      ? (tab === "hot" ? hot(list) : tab === "move" ? movers(list) : network(list))
      : CS.state("empty", { title: "Chưa có dữ liệu cho ngành này" }))
      + CS.transparency(n, filt);
  }

  root.addEventListener("click", e => {
    const c = e.target.closest("[data-cluster]");
    if (c) { showCluster(+c.dataset.cluster); return; }
    const nd = e.target.closest("[data-node]");
    if (nd) location.href = skillHref(nd.dataset.node);
  });
  root.addEventListener("keydown", e => {
    const nd = e.target.closest && e.target.closest("[data-node]");
    if (nd && e.key === "Enter") location.href = skillHref(nd.dataset.node);
  });

  function showCluster(i) {
    openCluster = D.clusters[ind][i];
    $("#cl-title").textContent = openCluster.name;
    $("#cl-list").innerHTML = openCluster.skills.map(id => `<li>${CS.icon(has(id) ? "check" : "plus", 16)}<div><a class="skill-link" href="skill.html?id=${id}">${CS.esc(E.skill(id).name)}</a>
      <small>${D.types[E.skill(id).type]} · ${E.skill(id).hours} giờ học · ${has(id) ? "bạn đã có" : "chưa có"}</small></div></li>`).join("");
    $("#cluster-dialog").showModal();
  }
  $("#cl-add").addEventListener("click", () => {
    const ids = openCluster.skills.filter(id => !has(id));
    ids.forEach(id => store.toggleList("roadmapPicks", id, true));
    $("#cluster-dialog").close();
    CS.toast(ids.length ? `Đã thêm ${ids.length} kỹ năng của cụm vào lộ trình.` : "Bạn đã có đủ kỹ năng trong cụm này.");
  });
  render();
})();
