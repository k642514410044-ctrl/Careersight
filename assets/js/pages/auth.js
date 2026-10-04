/* Đăng ký / Đăng nhập / Quên mật khẩu */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const next = new URLSearchParams(location.search).get("next");

  function show(which) {
    $$("#auth-tabs .tab").forEach(t => {
      const on = t.dataset.tab === which;
      t.setAttribute("aria-selected", on);
      $("#panel-" + t.dataset.tab).hidden = !on;
    });
    $("#panel-forgot").hidden = which !== "forgot";
    $("#auth-tabs").hidden = which === "forgot";
    $("#social-block").hidden = which === "forgot";
    $("#auth-title").textContent = which === "forgot" ? "Đặt lại mật khẩu" : which === "register" ? "Tạo tài khoản Career Sight" : "Chào mừng trở lại";
  }
  $$("#auth-tabs .tab").forEach(t => t.addEventListener("click", () => { history.replaceState(null, "", location.search + "#" + t.dataset.tab); show(t.dataset.tab); }));
  $$("[data-goto]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); show(a.dataset.goto); }));
  const h = location.hash.replace("#", "");
  show(["register", "forgot"].includes(h) ? h : "login");

  function signIn(user, dest) {
    CS.store.set({ loggedIn: true, user });
    CS.toast(`Xin chào, ${CS.esc(user.name)}!`);
    setTimeout(() => (location.href = next || dest), 700);
  }

  // Đăng ký → Chọn mục tiêu & vị trí (giữ hồ sơ dùng thử đã nhập)
  $("#register-form").addEventListener("cs:valid", () => {
    signIn({ name: $("#r-name").value.trim(), email: $("#r-email").value.trim(), goal: $('input[name="goal"]:checked').value }, "position.html");
  });
  // Đăng nhập (giả lập) → Tổng quan
  $("#login-form").addEventListener("cs:valid", () => {
    const email = $("#l-email").value.trim();
    signIn({ name: email.split("@")[0], email, goal: "Sinh viên" }, "dashboard.html");
  });
  $("#google-btn").addEventListener("click", () => signIn({ name: "Người dùng Google", email: "google.user@example.com", goal: "Sinh viên" }, "position.html"));
})();
