/* Phương pháp & nguồn dữ liệu */
(function () {
  const D = CS_DATA;
  document.getElementById("data-kv").innerHTML = `
    <div><dt>Số tin tuyển dụng</dt><dd>${D.meta.totalJD.toLocaleString("vi-VN")}</dd></div>
    <div><dt>Phiên bản dữ liệu</dt><dd>${D.meta.version}</dd></div>
    <div><dt>Cập nhật</dt><dd>${D.meta.updated}</dd></div>`;
  document.getElementById("data-sources").innerHTML =
    D.meta.sources.map(s => `<li>${CS.esc(s)}</li>`).join("") + `<li>Cửa sổ thời gian: ${D.meta.window}</li>`;
})();
