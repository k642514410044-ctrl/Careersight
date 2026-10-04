/* =========================================================
   Career Sight — khởi động chung + validation form dùng chung
   Thứ tự script: data.js → store.js → engine.js → components.js → main.js → pages/<trang>.js
   ========================================================= */
(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* <form data-validate> ; mỗi trường: .field > label + input + .field__error
     Hỗ trợ: required, type=email, minlength, data-match="#id", radio group required */
  function validateField(input) {
    const field = input.closest(".field");
    if (!field) return true;
    let v;
    if (input.type === "radio") v = !!$$(`input[name="${input.name}"]:checked`, input.form).length;
    else v = input.type === "checkbox" ? input.checked : input.value.trim();
    const required = input.type === "radio" ? $$(`input[name="${input.name}"]`, input.form).some(r => r.required) : input.required;
    let msg = "";
    if (required && !v) msg = input.type === "checkbox" ? "Bạn cần đồng ý để tiếp tục." : input.type === "radio" ? "Vui lòng chọn một mục." : "Vui lòng nhập trường này.";
    else if (v && input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Email chưa đúng định dạng.";
    else if (v && input.minLength > 0 && v.length < input.minLength) msg = `Cần ít nhất ${input.minLength} ký tự.`;
    else if (input.dataset.match && v !== $(input.dataset.match).value.trim()) msg = "Mật khẩu xác nhận không khớp.";
    const err = $(".field__error", field);
    field.classList.toggle("is-invalid", !!msg);
    field.classList.toggle("is-valid", !msg && !!v && !["checkbox", "radio"].includes(input.type));
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg;
    return !msg;
  }

  function initForms(root) {
    $$("form[data-validate]", root).forEach(form => {
      if (form.dataset.bound) return;
      form.dataset.bound = "1";
      form.noValidate = true;
      $$("input, textarea, select", form).forEach(inp => {
        inp.addEventListener("blur", () => { if (inp.value || ["checkbox", "radio"].includes(inp.type)) validateField(inp); });
        inp.addEventListener("input", () => { if (inp.closest(".field.is-invalid")) validateField(inp); });
        inp.addEventListener("change", () => { if (inp.closest(".field.is-invalid")) validateField(inp); });
      });
      form.addEventListener("submit", e => {
        e.preventDefault();
        const ok = $$("input, textarea, select", form).map(validateField).every(Boolean);
        if (!ok) {
          const first = $(".is-invalid input, .is-invalid textarea, .is-invalid select", form);
          if (first) first.focus();
          CS.toast("Vui lòng kiểm tra lại các trường được đánh dấu.", "error");
          return;
        }
        const btn = $('[type="submit"]', form);
        btn.classList.add("is-loading");
        btn.disabled = true;
        // Giả lập gọi API — thay bằng fetch() thật
        setTimeout(() => {
          btn.classList.remove("is-loading");
          btn.disabled = false;
          form.dispatchEvent(new CustomEvent("cs:valid"));
          if (form.dataset.success) CS.toast(form.dataset.success);
          if (form.dataset.reset !== "off") {
            form.reset();
            $$(".field", form).forEach(f => f.classList.remove("is-valid", "is-invalid"));
          }
        }, 700);
      });
    });

    $$("[data-toggle-password]", root).forEach(btn => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", () => {
        const inp = $(btn.dataset.togglePassword);
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        btn.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
        btn.classList.toggle("is-on", show);
      });
    });
  }

  CS.forms = { init: initForms, validateField };
  CS.mount();
  // Trang tự render xong (script trang chạy đồng bộ) → gắn form + icon
  document.addEventListener("DOMContentLoaded", () => { initForms(); CS.hydrate(); });
})();
