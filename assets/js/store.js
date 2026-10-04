/* =========================================================
   Career Sight — hồ sơ người dùng (một nguồn dữ liệu duy nhất)
   Mọi trang đọc/ghi cùng một hồ sơ → đánh dấu "đã có"/"đã học" ở đâu
   thì các trang khác cập nhật theo. Prototype lưu ở localStorage;
   bản thật thay bằng API.
   ========================================================= */
(function () {
  const KEY = "cs_profile_v1";
  const DEFAULT = {
    loggedIn: false,
    user: null,              // { name, email, goal }
    positions: [],           // id vị trí đã chọn (1–3)
    level: "", location: "",
    skills: {},              // { skillId: "co-ban" | "thanh-thao" }
    excluded: [],            // kỹ năng không muốn học
    roadmapPicks: [],        // kỹ năng người dùng chủ động thêm vào lộ trình
    customJD: null,          // { text, skills: [] } — JD người dùng tự dán
    allowJD: false,          // đồng ý dùng JD đã dán vào thống kê
    roadmap: null,           // { pos, settings, steps, baseScore, createdAt }
    completed: [],           // [{ id, date, note }]
    history: [],             // [{ date, pos, score }]
    notifications: true,
    proposals: []            // kỹ năng đề xuất mới
  };

  let memory = null;
  function load() {
    if (memory) return memory;
    let data = null;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    memory = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), data || {});
    // Lộ trình lưu theo định dạng cũ (items là chuỗi) → bỏ để tạo lại
    if (memory.roadmap && memory.roadmap.steps && memory.roadmap.steps.some(st => typeof st.items[0] === "string")) memory.roadmap = null;
    return memory;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) { /* private mode: giữ trong bộ nhớ */ }
    document.dispatchEvent(new CustomEvent("cs:profile"));
  }

  const today = () => new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const store = {
    get: load,
    set(patch) { Object.assign(load(), patch); save(); },
    update(fn) { fn(load()); save(); },
    reset() { memory = JSON.parse(JSON.stringify(DEFAULT)); save(); },
    today,

    hasSkill: id => !!load().skills[id],
    addSkill(id, level) { load().skills[id] = level || load().skills[id] || "co-ban"; save(); },
    removeSkill(id) { delete load().skills[id]; save(); },
    toggleList(key, id, on) {
      const arr = load()[key];
      const i = arr.indexOf(id);
      if (on === undefined) on = i < 0;
      if (on && i < 0) arr.push(id);
      if (!on && i >= 0) arr.splice(i, 1);
      save();
      return on;
    },
    logScore(pos, score) {
      const p = load();
      const d = today();
      const last = p.history[p.history.length - 1];
      if (last && last.date === d && last.pos === pos) last.score = score;
      else p.history.push({ date: d, pos, score });
      save();
    },

    /* Dữ liệu mẫu để xem nhanh toàn bộ luồng */
    seedDemo() {
      memory = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), {
        loggedIn: true,
        user: { name: "Nguyễn Văn A", email: "user@example.com", goal: "Sinh viên" },
        positions: ["data-analyst", "business-analyst"],
        level: "Fresher", location: "TP.HCM",
        skills: { sql: "thanh-thao", python: "co-ban", excel: "thanh-thao", powerbi: "co-ban", git: "co-ban", pandas: "co-ban", communication: "thanh-thao", english: "co-ban" },
        history: [
          { date: "01/08/2026", pos: "data-analyst", score: 66 },
          { date: "22/08/2026", pos: "data-analyst", score: 70 },
          { date: "12/09/2026", pos: "data-analyst", score: 74 }
        ],
        completed: [{ id: "powerbi", date: "10/09/2026", note: "Xong khóa nhập môn" }]
      });
      save();
    }
  };

  window.CS = window.CS || {};
  window.CS.store = store;
})();
