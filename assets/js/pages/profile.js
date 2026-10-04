/* Hồ sơ & quyền riêng tư */
(function () {
  const D = CS_DATA, E = CS.engine, store = CS.store;
  const $ = s => document.querySelector(s);
  const root = $("#profile-root");

  function render() {
    const p = store.get();
    if (!p.loggedIn) { root.innerHTML = CS.loginGate("xem hồ sơ của bạn", "profile.html"); return; }
    const ids = Object.keys(p.skills);
    root.innerHTML = `
      <section class="card card--pad">
        <div class="profile-head">
          <span class="avatar">${CS.esc(CS.initials(p.user.name))}</span>
          <div style="flex:1;min-width:200px"><h1>${CS.esc(p.user.name)}</h1><p class="muted small">${CS.esc(p.user.email)} · ${CS.esc(p.user.goal)}</p></div>
          <button class="btn btn--outline btn--sm" type="button" id="edit">${CS.icon("edit", 16)} Sửa thông tin</button>
        </div>
      </section>

      <section class="card card--pad" style="margin-top:1.25rem">
        <div class="card__head"><h2>${CS.icon("layers", 18)} Hồ sơ kỹ năng (${ids.length})</h2><a class="link" href="skills.html">Cập nhật kỹ năng</a></div>
        <div class="chip-row">${ids.length ? ids.map(id => `<span class="tag">${CS.esc(E.skill(id).name)} <span class="xs" style="opacity:.75">· ${p.skills[id] === "thanh-thao" ? "thành thạo" : "cơ bản"}</span>
          <button type="button" data-remove="${id}" aria-label="Xóa ${CS.esc(E.skill(id).name)}">${CS.icon("close", 12)}</button></span>`).join("") : `<span class="small muted">Chưa có kỹ năng nào.</span>`}</div>
        <p class="xs muted" style="margin-top:.75rem">Mọi trang dùng chung hồ sơ này — thay đổi ở đây cập nhật ngay điểm, khoảng trống và lộ trình.</p>
      </section>

      <section class="card card--pad" style="margin-top:1.25rem">
        <div class="card__head"><h2>${CS.icon("target", 18)} Vị trí đã chọn</h2><a class="link" href="position.html">Thay đổi</a></div>
        ${p.positions.length ? `<ul class="list-plain">${p.positions.map(id => `<li>${CS.donut(E.score(id, p).score, "sm")}<div><b>${CS.esc(E.position(id).name)}</b><small>${E.position(id).jd.toLocaleString("vi-VN")} tin${p.level ? " · " + p.level : ""}${p.location ? " · " + p.location : ""}</small></div></li>`).join("")}</ul>`
          : `<p class="small muted">Chưa chọn vị trí nào.</p>`}
      </section>

      <section class="card card--pad" style="margin-top:1.25rem" id="settings">
        <div class="card__head"><h2>${CS.icon("shield", 18)} Quyền riêng tư & thông báo</h2></div>
        <div class="settings-list">
          <div><span><b>Thông báo nhắc học</b><small>Nhắc việc hằng tuần theo lộ trình</small></span>
            <label class="switch"><input type="checkbox" id="s-notif"${p.notifications ? " checked" : ""} aria-label="Thông báo nhắc học"><span></span></label></div>
          <div><span><b>Dùng JD tôi đã dán vào thống kê</b><small>JD được ẩn danh; tắt bất kỳ lúc nào</small></span>
            <label class="switch"><input type="checkbox" id="s-jd"${p.allowJD ? " checked" : ""} aria-label="Cho phép dùng JD vào thống kê"><span></span></label></div>
          <div><span><b>Xem dữ liệu của tôi</b><small>Toàn bộ dữ liệu Career Sight đang lưu</small></span>
            <button class="btn btn--outline btn--sm" type="button" id="view-data">Xem</button></div>
          <div><span><b>Xuất dữ liệu</b><small>Tải về tệp JSON</small></span>
            <button class="btn btn--outline btn--sm" type="button" id="export">${CS.icon("download", 16)} Xuất</button></div>
          <div><span><b style="color:var(--color-danger)">Xóa dữ liệu cá nhân</b><small>Xóa vĩnh viễn hồ sơ và tài khoản</small></span>
            <button class="btn btn--danger btn--sm" type="button" id="delete">${CS.icon("trash", 16)} Xóa</button></div>
        </div>
        <p class="xs muted" style="margin-top:.75rem">Quyền của bạn theo Luật Bảo vệ dữ liệu cá nhân 2025. <a class="link" href="method.html#privacy">Chính sách đầy đủ</a></p>
      </section>

      <div class="action-bar"><span></span><button class="btn btn--danger" type="button" id="logout">${CS.icon("logout", 16)} Đăng xuất</button></div>`;
  }

  root.addEventListener("click", e => {
    const t = e.target;
    const rm = t.closest("[data-remove]");
    if (rm) { store.removeSkill(rm.dataset.remove); render(); return; }
    if (t.closest("#edit")) {
      const u = store.get().user;
      $("#ep-name").value = u.name; $("#ep-email").value = u.email; $("#ep-goal").value = u.goal;
      $("#edit-dialog").showModal();
    }
    if (t.closest("#view-data")) { $("#data-pre").textContent = JSON.stringify(store.get(), null, 2); $("#data-dialog").showModal(); }
    if (t.closest("#export")) {
      const blob = new Blob([JSON.stringify(store.get(), null, 2)], { type: "application/json" });
      const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "career-sight-du-lieu-cua-toi.json" });
      a.click();
      URL.revokeObjectURL(a.href);
      CS.toast("Đã xuất dữ liệu.");
    }
    if (t.closest("#delete")) $("#delete-dialog").showModal();
    if (t.closest("#logout")) { store.set({ loggedIn: false }); CS.toast("Đã đăng xuất."); setTimeout(() => (location.href = "index.html"), 600); }
  });
  root.addEventListener("change", e => {
    if (e.target.id === "s-notif") { store.set({ notifications: e.target.checked }); CS.toast(e.target.checked ? "Đã bật nhắc học." : "Đã tắt nhắc học."); }
    if (e.target.id === "s-jd") { store.set({ allowJD: e.target.checked }); CS.toast("Đã cập nhật quyền dùng JD."); }
  });
  $("#edit-form").addEventListener("cs:valid", () => {
    store.set({ user: { name: $("#ep-name").value.trim(), email: $("#ep-email").value.trim(), goal: $("#ep-goal").value } });
    $("#edit-dialog").close();
    CS.toast("Đã lưu thông tin.");
    location.reload();
  });
  $("#confirm-delete").addEventListener("click", () => {
    store.reset();
    $("#delete-dialog").close();
    CS.toast("Đã xóa toàn bộ dữ liệu.");
    setTimeout(() => (location.href = "index.html"), 700);
  });
  render();
})();
