# Bàn giao bản dựng The Sandwich Bar

Nguồn: https://www.thesandwichbar.nl/ — khảo sát ngày 09/11/2026.

## Kết quả

Đã thay giao diện cũ bằng mã React có thể chỉnh sửa; xóa component/trang
đăng nhập, thực đơn Pizza Company và các font/ảnh/thương hiệu cũ.
Không thay đổi mã kết nối API và cấu hình proxy backend.

| Nguồn | Local | Mã chính |
| --- | --- | --- |
| `/`, `/nl`, `/en` | Giữ nguyên | `HomePage.tsx` |
| `/menu`, `/nl/menu`, `/en/menu` | Giữ nguyên | `MenuPage.tsx` |
| `/catering`, `/nl/catering`, `/en/catering` | Giữ nguyên | `CateringPage.tsx` |
| `/privacy`, `/nl/privacy`, `/en/privacy` | Giữ nguyên | `LegalPage.tsx` |
| `/terms`, `/nl/terms`, `/en/terms` | Giữ nguyên | `LegalPage.tsx` |

Mã giao diện nằm trong `src/components/sites/sandwich-bar/`.
Header/Footer dùng `Shared.tsx`; định tuyến nằm tại `src/App.tsx`.
Các URL đăng nhập/danh mục thực đơn cũ chuyển về `/`.

Dùng 78 file tài nguyên local (~24.8MB), gồm ảnh, logo, font Poppins và
Tomatoes, ba video thật, hai PDF và ảnh preview dựng từ PDF.
`asset-manifest.json` và `extra-asset-manifest.json` lưu URL nguồn, đường dẫn
local, định dạng/dimensions. Các bản preview PDF được kiểm tra bằng ảnh.

## Hành vi đã triển khai

- Menu/Catering và chuyển NL/EN điều hướng tới route local tương ứng.
- Header cố định, logo đi theo con trỏ; intro xe giao hàng một lần mỗi phiên.
- Slogan theo vị trí cuộn, Lenis cuộn mượt với duration1.2 và easing nguồn.
- Dải ảnh chạy45px/s, slider sandwich ba trang có kéo/thả, nút và chấm chọn;
  giới hạn đầu/cuối; FAQ đóng/mở, hoạt động bằng bàn phím.
- Thành viên, video TikTok thực, Google Maps, email/điện thoại và giờ mở cửa
  tính theo múi giờ Amsterdam. Hai menu PDF hiển thị nội dung gốc;
  click mở bản đầy đủ để zoom/in.
- Trang Catering có luồng ảnh, logo thay phiên và form bắt buộc8 trường.
  Ngày giao sớm nhất là ngày kế tiếp theo Amsterdam. Submit tạo bản nháp
  email; khách bấm mở ứng dụng email để tự kiểm tra/gửi. Có ghi rõ chưa gửi.
- Footer có các logo tròn rơi, va chạm và kéo bằng con trỏ. Canvas nằm sau
  nội dung và liên kết. Tôn trọng reduced-motion và dọn event/timer khi unmount.

Liên kết đặt hàng vẫn tới https://catering.thesandwichbar.nl; số dư thành
viên vẫn tới Piggy; mạng xã hội/Maps vẫn tới đích gốc. Các dịch vụ ngoài
origin này không được dựng lại. Không tích hợp backend nhận form hoặc CMS.

## Kiểm tra thực tế

- `npm run build`: thành công sau khi tích hợp tất cả trang/canvas/Lenis.
  TypeScript + Vite production. Bản cập nhật hiệu ứng dùng GSAP và Matter.js;
  Matter được tải theo module riêng.
- Render React phía server của18 đường dẫn: tất cả có h1 và main target,
  không có ngoại lệ, không thiếu file media được tham chiếu. Chi tiết tại
  `route-verification.json`. Đây là kiểm tra cấu trúc/mã, không phải render
  trong trình duyệt hay kiểm thử click.
- Vite local chạy thành công tại http://127.0.0.1:5173/.
- HTTP local: trang chủ,EN,Menu,Catering,Privacy,module App,logo,PDF,font,
  video đều trả200 với content-type và dữ liệu tương ứng.
- `git diff --check`: thành công. Không còn tham chiếu giao diện/tài nguyên
  cũ trong `src/` hay `index.html`.

## Đối chiếu và phần chưa xác minh

Không có trình duyệt trong inventory của công cụ UI; cả Chrome và trình
 duyệt tích hợp đều báo không khả dụng. Vì vậy không tạo được bộ ảnh
so sánh desktop/mobile của website nguồn và local, chưa kiểm tra trực quan
layout, tràn ngang, click/drag hoặc runtime trình duyệt. Không gọi kết quả
là pixel-perfect. Đã đối chiếu số đo/breakpoint/CSS và nội dung thực tế;
`source-brief.md` ghi bằng chứng.

Các khác biệt chủ động: PDF được hiển thị bằng ảnh render độ phân giải cao
thay canvas pdf.js; form dùng email nháp thay API production. Vật lý footer
đã chuyển sang Matter.js0.20.0 đúng engine và tham số nguồn. Các chuyển
động GSAP đã đối chiếu duration/easing/trigger với mã nguồn tham khảo;
hình ảnh so sánh chưa khả dụng để tinh chỉnh sai khác còn lại.
Xem `effects-update.md` và `motion-test-results.json` cho đợt kiểm tra mới.

## Chạy xem

```powershell
npm install
npm run dev
```

Mở URL Local Vite in ra; dùng `/en`, `/nl/menu`, `/nl/catering` để xem các
trang chính. `npm run build` tạo `dist/`; `npm run preview` xem bản production.
Web server khi deploy cần fallback mọi route SPA về `index.html`.
