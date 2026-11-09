# The Sea's Crown — Website nhà hàng hải sản

Frontend thuộc dự án RestoSphere, xây dựng bằng React, TypeScript và Vite.
Website giới thiệu món hải sản, thực đơn và dịch vụ đặt tiệc của **The Sea's Crown**,
với tiếng Việt mặc định và lựa chọn tiếng Anh.

## Chức năng hiện có

- Trang chủ giới thiệu nhà hàng, cua hoàng đế, tôm hùm, tôm, mực và các món dùng chung.
- Thực đơn món ăn, đồ uống và đặt tiệc bằng SVG, có thể mở xem ở kích thước đầy đủ.
- Biểu mẫu tư vấn đặt tiệc có kiểm tra thông tin và tạo email nháp để khách tự gửi.
- Chuyển ngôn ngữ VI / EN, thông tin chi nhánh, giờ hoạt động và câu hỏi thường gặp.
- Cuộn mượt, chuyển trang, slider kéo thả, ảnh chạy ngang, video và bong bóng tương tác ở footer.

Bảng màu chủ đạo là trắng, đỏ và vàng, theo định hướng 65% / 25% / 10%.
Bố cục và hiệu ứng được phát triển từ bản dựng tham khảo The Sandwich Bar.

## Công nghệ

| Công nghệ | Vai trò |
| --- | --- |
| React 19, TypeScript 6 | Giao diện và kiểm tra kiểu dữ liệu |
| Vite 8 | Máy chủ phát triển và build production |
| GSAP | Chuyển trang, hoạt ảnh cuộn và kéo slider |
| Lenis | Cuộn mượt |
| Matter.js | Hiệu ứng vật lý của bong bóng footer |

## Cài đặt và chạy local

Yêu cầu Node.js đáp ứng cấu hình của Vite: `^20.19.0 || >=22.12.0`, cùng npm.
Chạy các lệnh sau tại thư mục gốc dự án:

```powershell
npm ci
npm run dev
```

Mở địa chỉ **Local** mà Vite in ra, thường là `http://localhost:5173`.
Giao diện nhà hàng hiện tại có thể chạy mà không cần backend.

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Kiểm tra TypeScript và tạo bản build trong `dist/` |
| `npm run preview` | Xem bản build hiện có trên máy local |
| `npm run lint` | Kiểm tra mã bằng ESLint |
| `node scripts/generate-seafood-menus.mjs` | Tạo lại sáu bảng thực đơn SVG VI / EN |

## Cấu trúc thư mục

```text
src/
  App.tsx                         # Chọn trang, ngôn ngữ và tiêu đề
  index.css                       # Font chữ, màu sắc và kiểu chung
  components/sites/sea-crown/      # Trang, nội dung, CSS và hiệu ứng
  api/                            # Mã kết nối API được giữ lại
  hooks/useAuth.ts                # Hook xác thực, chưa dùng trong giao diện nhà hàng
public/sites/sea-crown/
  images/                         # Ảnh món ăn và logo nhà hàng
  videos/                         # Video hải sản
  fonts/                          # Font và các giấy phép đi kèm
  logos/                          # Logo đối tác tại trang đặt tiệc
  illustrations/                  # Hình minh họa của hiệu ứng mở trang
  menus/                          # Thực đơn SVG tiếng Việt và tiếng Anh
scripts/
  generate-seafood-menus.mjs        # Nội dung và cách tạo bảng thực đơn
docs/
  verification/sea-crown/          # Nguồn tài nguyên và kết quả kiểm tra
  research/                       # Tài liệu khảo sát lịch sử
```

Mã nguồn và tài nguyên đang chạy đã được chuyển sang `sea-crown`.
Các thư mục `src/components/sites/sandwich-bar/` và `public/sites/sandwich-bar/`
đã được dọn. Tài liệu trong `docs/research/sandwich-bar/` được giữ làm tham khảo lịch sử.

## Chỉnh sửa nội dung

Các file dưới đây nằm trong `src/components/sites/sea-crown/`, trừ khi ghi đường dẫn khác.

| Nội dung cần thay đổi | File |
| --- | --- |
| Giới thiệu, món nổi bật, thành viên, FAQ bằng VI / EN | `homeContent.json` |
| Ảnh, video, chi nhánh và giờ mở cửa ở trang chủ | `HomePage.tsx` |
| Header, footer, ảnh footer và thông tin liên hệ chung | `Shared.tsx` |
| Nội dung, trường nhập và email nhận tư vấn đặt tiệc | `CateringPage.tsx` |
| Các bảng thực đơn được hiển thị | `MenuPage.tsx` |
| Chính sách bảo mật và điều khoản | `LegalPage.tsx` |
| Liên kết mạng xã hội, đặt tiệc, tài khoản thành viên và hàm tạo URL tài nguyên | `siteData.ts` |
| Hiệu ứng và thứ tự lớp của bong bóng footer | `FooterPlayground.tsx`, `FooterPlayground.css` |
| Bảng màu, font tiếng Việt và kiểu chung | `src/index.css` |
| Tiêu đề, mô tả mặc định, favicon | `index.html`, `src/App.tsx` |

Tài nguyên trong `public/sites/sea-crown/` được phục vụ qua URL `/sites/sea-crown/`.
Ví dụ, `images/logo.png` tương ứng với `/sites/sea-crown/images/logo.png`.

Để đổi chữ trong các bảng thực đơn, sửa phần `copy.vi` và `copy.en` trong
`scripts/generate-seafood-menus.mjs`, sau đó chạy:

```powershell
node scripts/generate-seafood-menus.mjs
```

Script tạo lại `menu-vi.svg`, `menu-en.svg`, `drinks-vi.svg`, `drinks-en.svg`,
`event-vi.svg` và `event-en.svg` trong `public/sites/sea-crown/menus/`.
Chỉnh trực tiếp các file SVG này sẽ bị ghi đè khi chạy lại script.

## Đường dẫn trang

| Trang | Tiếng Việt | Tiếng Anh |
| --- | --- | --- |
| Trang chủ | `/`, `/vi` | `/en` |
| Thực đơn | `/menu`, `/vi/menu` | `/en/menu` |
| Đặt tiệc | `/catering`, `/vi/catering` | `/en/catering` |
| Bảo mật | `/privacy`, `/vi/privacy` | `/en/privacy` |
| Điều khoản | `/terms`, `/vi/terms` | `/en/terms` |

Các đường dẫn `/nl` cũ vẫn hiển thị tiếng Việt để giữ tương thích.
Các đường dẫn `/auth/*` và danh mục `/menu/*` cũ được đưa về trang chủ.

## Biểu mẫu và cấu hình API

Biểu mẫu đặt tiệc tạo email nháp bằng `mailto:`. Khách cần mở ứng dụng email,
kiểm tra và tự gửi; biểu mẫu chưa lưu yêu cầu đặt tiệc vào backend.

`src/api/` và `useAuth.ts` giữ mã tích hợp xác thực cũ. Nếu sử dụng lại phần này,
tạo `.env` dựa trên [.env.example](.env.example):

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:8080
```

`vite.config.ts` chuyển tiếp `/api` tới `VITE_API_PROXY_TARGET` trong chế độ dev
và preview. Máy chủ production cần cấu hình proxy riêng nếu sử dụng API.
`.env` được bỏ qua bởi Git; `.env.example` được giữ để chia sẻ cấu hình mẫu.

Thông tin liên hệ, địa chỉ, mạng xã hội, dịch vụ bên ngoài và thông tin pháp lý
hiện còn dùng cấu hình tham khảo. Cập nhật các file tương ứng trong bảng trên
khi có thông tin chính thức của nhà hàng. Giờ hoạt động và ngày đặt tiệc hiện
được tính theo múi giờ `Europe/Amsterdam`.

## Build và triển khai

```powershell
npm run build
npm run preview
```

Triển khai nội dung `dist/` lên máy chủ static. Cấu hình fallback các đường dẫn SPA
về `index.html` để mở trực tiếp hoặc tải lại các trang như `/vi/menu` và `/en/catering`.
Tài nguyên hiện dùng đường dẫn tuyệt đối từ gốc tên miền, `/sites/sea-crown/`.

`node_modules/`, `dist/`, `/tmp/` và các file môi trường riêng đã được liệt kê trong `.gitignore`.

## Tài liệu kiểm tra

- [Nguồn ảnh, video và logo](docs/verification/sea-crown/media-sources.md).
- [Nội dung nhà hàng và thực đơn](docs/verification/sea-crown/restaurant-copy.md).
- [Bản địa hóa tiếng Việt](docs/verification/sea-crown/localization.md).
- [Sắp xếp mã nguồn và dọn tài nguyên](docs/verification/sea-crown/asset-cleanup.md).
- [Danh sách tài nguyên đã chuyển và xóa](docs/verification/sea-crown/asset-cleanup.json).

Các đợt kiểm tra đã ghi nhận build production, kết xuất nội dung hai ngôn ngữ,
đường dẫn tài nguyên và kiểm tra trực quan bảng thực đơn. Việc kiểm tra tương tác
trực tiếp trong trình duyệt vẫn cần thực hiện khi có môi trường trình duyệt phù hợp.
