/* =========================================================
   Career Sight — bộ máy tính toán (chạy phía client cho prototype)
   Điểm   = Σ(trọng số × mức khớp) ÷ Σ trọng số × 100
   Trọng số = tần suất × hệ số yêu cầu (bắt buộc 1,0 · ưu tiên 0,5)
   Mức khớp = 1 có · 0,5 có kỹ năng tương đương cùng nhóm · 0 thiếu
   ========================================================= */
(function () {
  const D = window.CS_DATA;
  const CORE = 12;
  const COEF = { "bat-buoc": 1, "uu-tien": .5 };

  const skill = id => D.skills[id];
  const position = id => D.positions.find(p => p.id === id);
  const fold = s => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").trim();

  function confidence(n) {
    if (n == null) return { level: "jd", label: "JD đơn lẻ" };
    if (n < 100) return { level: "thap", label: "Độ tin cậy rất thấp" };
    if (n < 300) return { level: "thap", label: "Độ tin cậy thấp" };
    if (n < 1000) return { level: "tb", label: "Độ tin cậy trung bình" };
    return { level: "cao", label: "Độ tin cậy cao" };
  }

  function match(id, owned) {
    if (owned[id]) return { m: 1, kind: "co" };
    const g = skill(id).group;
    const eq = Object.keys(owned).find(o => o !== id && skill(o) && skill(o).group === g);
    if (eq) return { m: .5, kind: "tuong-duong", via: skill(eq).name };
    return { m: 0, kind: "thieu" };
  }

  /* Vị trí "ảo" từ JD người dùng dán: mọi kỹ năng coi như bắt buộc */
  function target(posId, profile) {
    if (posId === "custom-jd" && profile.customJD) {
      return { id: "custom-jd", name: "JD bạn đã dán", industry: null, jd: null, related: [],
        skills: profile.customJD.skills.map(id => ({ id, freq: 1, req: "bat-buoc" })) };
    }
    return position(posId);
  }

  function score(posId, profile) {
    const pos = target(posId, profile);
    if (!pos) return null;
    const owned = profile.skills;
    const rows = pos.skills.map(s => {
      const w = s.freq * COEF[s.req];
      const mt = match(s.id, owned);
      return Object.assign({ id: s.id, name: skill(s.id).name, type: skill(s.id).type, freq: s.freq, req: s.req, w }, mt);
    }).sort((a, b) => b.w - a.w);
    const totalW = rows.reduce((t, r) => t + r.w, 0);
    rows.forEach(r => (r.contrib = r.w * r.m / totalW * 100));
    const sc = Math.round(rows.reduce((t, r) => t + r.w * r.m, 0) / totalW * 100);
    const core = rows.slice(0, CORE);
    return {
      pos, score: sc, rows, totalW,
      coreTotal: core.length,
      coreHave: core.filter(r => r.m === 1).length,
      missing: rows.filter(r => r.m < 1),
      conf: confidence(pos.jd)
    };
  }

  function priority(freq, req) {
    const p = freq * COEF[req];
    return p >= .5 ? { key: "cao", label: "Cao" } : p >= .3 ? { key: "tb", label: "Trung bình" } : { key: "thap", label: "Thấp" };
  }

  function gap(posId, profile) {
    const r = score(posId, profile);
    if (!r) return null;
    const rows = r.missing.map(x => Object.assign({}, x, { prio: x.freq * COEF[x.req], level: priority(x.freq, x.req) }))
      .sort((a, b) => b.prio - a.prio);
    return Object.assign(r, { gap: rows });
  }

  /* Gợi ý vị trí khác có bộ kỹ năng tương tự */
  function suggest(profile, exclude, n) {
    return D.positions.filter(p => !exclude.includes(p.id))
      .map(p => ({ pos: p, score: score(p.id, profile).score }))
      .sort((a, b) => b.score - a.score).slice(0, n || 3);
  }

  /* Lộ trình: chọn kỹ năng có "điểm tăng / giờ học" cao nhất, học tiên quyết trước,
     dừng khi đạt mục tiêu hoặc hết quỹ thời gian, gom thành các bước 2–3 tuần. */
  function roadmap(posId, profile, settings) {
    const base = score(posId, profile);
    if (!base) return null;
    const perWeek = Math.max(1, +settings.hours || 6);
    const budget = settings.mode === "deadline" ? perWeek * (+settings.weeks || 8) : Infinity;
    const goal = settings.mode === "score" ? (+settings.target || 90) : 100;

    const gain = {};
    base.rows.forEach(r => { gain[r.id] = r.w * (1 - r.m) / base.totalW * 100; });
    const owned = Object.assign({}, profile.skills);
    const cand = base.missing.map(r => r.id).filter(id => !profile.excluded.includes(id));
    const picks = profile.roadmapPicks.filter(id => cand.includes(id));
    const order = [];
    const queued = new Set();

    function push(id) {
      if (queued.has(id) || owned[id]) return;
      skill(id).prereq.forEach(push); // tiên quyết trước
      queued.add(id);
      order.push({ id, gain: gain[id] || 0, hours: skill(id).hours, isPrereq: !cand.includes(id) });
    }
    picks.forEach(push); // kỹ năng người dùng chủ động thêm được ưu tiên
    cand.filter(id => !queued.has(id))
      .sort((a, b) => gain[b] / skill(b).hours - gain[a] / skill(a).hours)
      .forEach(push);

    let cur = base.score, spent = 0;
    const chosen = [];
    for (const it of order) {
      if (cur >= goal || spent + it.hours > budget) break;
      chosen.push(it);
      spent += it.hours;
      cur = Math.min(100, cur + it.gain);
    }

    // Kỹ năng lớn được chia thành nhiều phần để mỗi bước không quá 3 tuần
    const cap = perWeek * 3;
    const chunks = [];
    chosen.forEach(it => {
      const parts = Math.max(1, Math.ceil(it.hours / cap));
      for (let k = 1; k <= parts; k++) chunks.push({ id: it.id, part: k, parts, hours: Math.round(it.hours / parts), gain: it.gain / parts, done: false });
    });
    const steps = [];
    let step = null, running = base.score;
    chunks.forEach(ch => {
      if (!step || (step.hours + ch.hours > cap && step.items.length)) {
        step = { items: [], hours: 0 };
        steps.push(step);
      }
      step.items.push(ch);
      step.hours += ch.hours;
    });
    steps.forEach((s, i) => {
      running = Math.min(100, running + s.items.reduce((t, ch) => t + ch.gain, 0));
      s.weeks = Math.min(3, Math.max(2, Math.ceil(s.hours / perWeek)));
      s.scoreAfter = Math.round(running);
      s.index = i + 1;
      const ids = [...new Set(s.items.map(ch => ch.id))];
      const main = ids.find(id => skill(id).project) || ids[0];
      s.project = skill(main).project || `Dự án nhỏ áp dụng ${ids.map(id => skill(id).name).join(" + ")} trên dữ liệu thực tế.`;
      s.done = false;
    });
    return { pos: posId, baseScore: base.score, steps, totalHours: spent, totalWeeks: steps.reduce((t, s) => t + s.weeks, 0), reached: Math.round(running) };
  }

  /* Đánh dấu một phần học xong: kỹ năng chỉ vào hồ sơ khi xong phần cuối */
  function completeChunk(profile, step, ch, note) {
    if (ch.done) return;
    ch.done = true;
    if (ch.part === ch.parts) {
      profile.skills[ch.id] = profile.skills[ch.id] || "co-ban";
      profile.completed.push({ id: ch.id, date: window.CS.store.today(), note: note || "" });
    }
    step.done = step.items.every(x => x.done);
  }

  /* Trích kỹ năng từ JD người dùng dán (từ điển + bí danh) */
  function extract(text) {
    const t = " " + fold(text).replace(/[^a-z0-9+#/ ]/g, " ") + " ";
    return Object.values(D.skills).filter(s =>
      [s.name, s.id].concat(s.aliases).some(a => {
        const k = fold(a).replace(/[^a-z0-9+#/ ]/g, " ").trim();
        return k.length > 1 && t.includes(" " + k + " ");
      })).map(s => s.id);
  }

  function search(q) {
    const f = fold(q);
    if (!f) return [];
    return Object.values(D.skills).filter(s => [s.name].concat(s.aliases).some(a => fold(a).includes(f)));
  }

  function lev(a, b) {
    const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function nearest(q) {
    const f = fold(q);
    let best = null, bd = Infinity;
    Object.values(D.skills).forEach(s => [s.name].concat(s.aliases).forEach(a => {
      const d = lev(f, fold(a));
      if (d < bd) { bd = d; best = s; }
    }));
    return bd <= Math.max(2, Math.ceil(f.length * .45)) ? best : null;
  }

  function searchPositions(q) {
    const f = fold(q);
    return D.positions.filter(p => fold(p.name).includes(f));
  }

  /* Tổng hợp xu hướng theo ngành (trung bình có trọng số theo số JD) */
  function industryTrends(ind) {
    const ps = D.positions.filter(p => p.industry === ind);
    const total = ps.reduce((t, p) => t + p.jd, 0);
    const agg = {};
    ps.forEach(p => p.skills.forEach(s => { agg[s.id] = (agg[s.id] || 0) + s.freq * p.jd; }));
    return Object.keys(agg).map(id => ({ id, name: skill(id).name, freq: agg[id] / total, delta: skill(id).trend }))
      .sort((a, b) => b.freq - a.freq);
  }

  /* Tần suất của kỹ năng ở từng vị trí + chuỗi thời gian minh họa */
  function skillStats(id) {
    const per = D.positions.map(p => ({ pos: p, s: p.skills.find(x => x.id === id) })).filter(x => x.s)
      .map(x => ({ id: x.pos.id, name: x.pos.name, freq: x.s.freq, req: x.s.req })).sort((a, b) => b.freq - a.freq);
    const now = per.length ? per[0].freq : .2;
    const tr = skill(id).trend / 100;
    const series = [5, 4, 3, 2, 1, 0].map(k => Math.max(.02, now - tr * k / 2 + (k % 2 ? .01 : -.01)));
    return { per, series };
  }

  window.CS = window.CS || {};
  window.CS.engine = { skill, position, fold, confidence, score, gap, priority, suggest, roadmap, completeChunk, extract, search, nearest, searchPositions, industryTrends, skillStats, COEF, CORE };
})();
