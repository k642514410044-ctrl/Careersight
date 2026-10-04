# Career Sight — prototype ứng dụng

Site tĩnh (HTML/CSS/JS thuần), **không cần cài đặt, không cần build**. Dữ liệu là **minh họa**; hồ sơ người dùng lưu trong trình duyệt (localStorage).

## Chạy thử

Nhấp đúp `index.html`, hoặc:

```bash
cd career-sight
python3 -m http.server 8000
```

Mở http://localhost:8000. Muốn xem nhanh toàn bộ luồng với dữ liệu mẫu: bấm **“Dùng dữ liệu mẫu”** ở bước Nhập kỹ năng.

## Các trang

| File | Trang | Tính năng |
|---|---|---|
| `index.html` | Trang chủ | — |
| `auth.html` | Đăng ký / Đăng nhập / Quên mật khẩu (`#register`, `#forgot`) | — |
| `position.html` | Bước 2 · Chọn mục tiêu & vị trí | 1. Matching Engine |
| `skills.html` | Bước 3 · Nhập kỹ năng (Nhập tay / Dán JD) | 1. Matching Engine |
| `results.html` | Bước 4 · Kết quả tương thích | 1. Matching Engine |
| `gap.html` | Bước 5 · Khoảng trống | 2. Skill Gap Analyzer |
| `trends.html` | Xu hướng thị trường | 3. Market Trends |
| `skill.html?id=…` | Chi tiết kỹ năng | nối 2 – 3 – 4 |
| `roadmap.html` | Lộ trình (Thiết lập → Kết quả) | 4. Personal Roadmap |
| `dashboard.html` | Tổng quan / Theo dõi | 4. Personal Roadmap |
| `profile.html` | Hồ sơ & quyền riêng tư | — |
| `method.html` | Phương pháp & nguồn dữ liệu | — |
| `admin.html` | Quản trị nội bộ (không có trong menu) | — |

Dùng thử không cần tài khoản: trang chủ → kết quả tương thích. Cần đăng ký khi lưu kết quả, tạo lộ trình, xem Tổng quan / Hồ sơ.

## Cấu trúc code

```
assets/css/styles.css        Design system — token màu/font/spacing ở :root
assets/js/data.js            Dữ liệu minh họa: kỹ năng, vị trí, ngành, cụm kỹ năng
assets/js/store.js           Hồ sơ người dùng — MỘT nguồn dữ liệu cho mọi trang
assets/js/engine.js          Tính điểm, khoảng trống, lộ trình, trích kỹ năng từ JD
assets/js/components.js      Header, bottom nav, stepper, dòng minh bạch, donut, autocomplete, biểu đồ…
assets/js/main.js            Khởi động chung + validation form
assets/js/pages/<trang>.js   Logic riêng từng trang
```

- Công thức: Điểm = Σ(trọng số × mức khớp) ÷ Σ trọng số × 100; trọng số = tần suất × hệ số (bắt buộc 1,0 · ưu tiên 0,5).
- Đổi màu: biến `--color-*` (và `--prio-*` cho mức ưu tiên) trong `:root`.
- Thêm kỹ năng / vị trí: sửa `data.js`.
- Nối API thật: thay `store.js` (lưu hồ sơ) và các chỗ ghi “Giả lập” trong `main.js`.
