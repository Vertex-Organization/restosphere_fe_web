# The Sandwich Bar — React clone

Giao diện React + TypeScript + Vite dựng lại từ https://www.thesandwichbar.nl/.
Giao diện đăng nhập/thực đơn cũ và tài nguyên thương hiệu cũ đã được thay thế.

## Chạy local

```powershell
npm install
npm run dev
```

Mở địa chỉ Local mà Vite in ra (thường là http://localhost:5173).

```powershell
npm run build
npm run preview
```

## Đường dẫn

| Trang | Tiếng Hà Lan | Tiếng Anh |
| --- | --- | --- |
| Trang chủ | `/`, `/nl` | `/en` |
| Menu | `/menu`, `/nl/menu` | `/en/menu` |
| Catering | `/catering`, `/nl/catering` | `/en/catering` |
| Privacy | `/privacy`, `/nl/privacy` | `/en/privacy` |
| Terms | `/terms`, `/nl/terms` | `/en/terms` |

Các đường dẫn đăng nhập và danh mục menu cũ chuyển về trang chủ mới.
Trang pháp lý giữ nội dung tiếng Anh theo website nguồn.

## Mã nguồn và tài nguyên

- `src/components/sites/sandwich-bar/`: trang và thành phần React có thể chỉnh sửa.
- `public/sites/sandwich-bar/`: font, ảnh, video, logo và PDF gốc lưu local.
- `docs/research/sandwich-bar/`: khảo sát, nguồn tài nguyên, ánh xạ route và kết quả kiểm tra.
- `src/api/` và `src/hooks/useAuth.ts`: phần kết nối backend cũ được giữ riêng; giao diện mới không gọi API đăng nhập.

Có chuyển ngôn ngữ NL/EN, slider kéo/chuyển bằng nút, FAQ đóng/mở,
ảnh/video chuyển động và liên kết Maps, mạng xã hội, membership.
Nút đặt hàng dẫn tới hệ thống catering gốc. Form Catering kiểm tra dữ liệu
và chuẩn bị email nháp để khách tự xem lại/gửi trong ứng dụng email;
không gửi yêu cầu tới backend production. Không tích hợp CMS Sanity.

## Kiểm tra và giới hạn

Chi tiết: [bàn giao](docs/research/sandwich-bar/implementation.md),
[cập nhật hiệu ứng](docs/research/sandwich-bar/effects-update.md).
Đã dùng HTML/CSS/nội dung và các file media thực tế của nguồn.
Phiên làm việc không có trình duyệt khả dụng nên chưa có so sánh ảnh
render desktop/mobile; không tuyên bố khớp từng pixel.

Giữ nguyên cấu hình proxy `/api` tới backend trong `vite.config.ts`.
Khi deploy static, server cần fallback đường dẫn SPA về `index.html`.
