# The Sea's Crown — Frontend MVP

Frontend React + TypeScript + Vite cho hệ thống quản lý nhà hàng hải sản,
một thương hiệu, một chi nhánh. Cấu trúc dựa trên phần P0 của Project Overview
v1.2 ngày 09/11/2026. Tài liệu còn ở trạng thái dự thảo; các quyết định nghiệp vụ
đề xuất cần được nhóm duyệt khi triển khai.

Luồng chính: đặt bàn → xác nhận → mở lượt → gọi món → bếp → phục vụ →
thanh toán → trả bàn.

Các module nội bộ MVP hiện là khung thư mục. Đã có trang `/auth/login` và thực đơn công khai `/menu/combo`, dùng thương hiệu The Sea's Crown trên bố cục tham khảo The Pizza Company. Đăng nhập, tài khoản, làm mới phiên và đăng xuất đã nối backend; thực đơn và giỏ hàng vẫn dùng dữ liệu mẫu.

## Chạy dự án

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mặc định frontend gọi `/api/v1` qua proxy đến `http://localhost:8080`.
Đổi `VITE_API_PROXY_TARGET` trong `.env.local` nếu backend dùng địa chỉ khác.
Giữ `VITE_API_BASE_URL=/api/v1` khi dùng proxy để tránh lỗi CORS.
Khởi động lại Vite sau khi đổi biến môi trường.

```powershell
npm run lint
npm run build
npm run preview
```

## Cấu trúc MVP

```text
public/                      # File tĩnh phục vụ trực tiếp
src/
├── components/
│   ├── ui/                  # Thành phần dùng chung: Button, Modal, Table...
│   ├── auth/                # Đăng nhập nhân viên
│   ├── menu/                # Thành phần thực đơn công khai và dữ liệu mẫu
│   ├── reservations/        # Form đặt bàn, danh sách và xác nhận đặt bàn
│   ├── tables/              # Sơ đồ bàn, khu vực, mở/hủy lượt phục vụ
│   ├── orders/              # Giỏ tạm, đợt gọi món, hủy và xác nhận đã phục vụ
│   ├── kitchen/             # Hàng đợi bếp, cập nhật chế biến và tạm hết món
│   └── billing/             # Tạm tính, thanh toán, xem phiếu đã thu
├── pages/
│   ├── public/              # Giới thiệu, thực đơn, gửi yêu cầu đặt bàn
│   ├── auth/                # Trang đăng nhập; hiện dùng giao diện tham khảo
│   └── internal/
│       ├── reservations/    # Lễ tân xử lý đặt bàn, nhận khách
│       ├── tables/          # Sơ đồ bàn, lượt phục vụ, quản trị khu vực và bàn
│       ├── orders/          # Phục vụ nhập món và theo dõi phục vụ
│       ├── kitchen/         # Màn hình bếp
│       ├── menu/            # Quản lý danh mục món, món và giá
│       └── billing/         # Thu ngân thanh toán, tra cứu phiếu
├── layouts/                 # Bố cục công khai và nội bộ, điều chỉnh theo vai trò
├── routes/                  # Route và kiểm tra đăng nhập/quyền ở giao diện
├── api/                     # HTTP dùng chung và API theo nghiệp vụ
├── hooks/                   # Hook dùng lại, gồm polling màn hình 3–5 giây
├── App.tsx
├── index.css
└── main.tsx
```

## Quy ước

- `pages` ghép component thành màn hình; `components` chứa giao diện theo nghiệp vụ.
- Giới thiệu, xem thực đơn và gửi yêu cầu đặt bàn là các trang công khai,
  không cần tài khoản khách. Đăng nhập dành cho nhân viên.
- Màn hình nội bộ dùng chung theo nghiệp vụ và phân quyền cho năm vai trò:
  lễ tân, phục vụ, bếp, thu ngân, quản lý. Backend kiểm tra quyền cho mọi API nội bộ.
- Khu vực, bàn và lượt phục vụ đặt chung trong nhóm `tables`;
  danh mục món và món đặt chung trong `menu`.
- `billing` gồm tạm tính, thu tiền mặt/chuyển khoản và tra cứu phiếu đã thanh toán.
- Các thư mục trống có `.gitkeep`; xóa marker khi đã thêm file thực tế.
  Chỉ tạo file API, hook và thư mục con khi bắt đầu triển khai chức năng tương ứng.
- Báo cáo doanh thu và quản lý tài khoản nhân viên thuộc P1; tài khoản khách thuộc P2.
  Kho, khuyến mãi, thanh toán online và các mục ngoài phạm vi giữ theo tài liệu MVP.

## Giao diện đăng nhập tham khảo

Nguồn: https://thepizzacompany.vn/auth/login?returnUrl=https%3A%2F%2Fthepizzacompany.vn%2F

- Route local: `/auth/login`. `/` là đường dẫn mở nhanh trang này; `returnUrl` chỉ nhận đường dẫn cùng origin của nhà hàng.
- Chạy `npm run dev`, mở `http://localhost:5173/auth/login`.
- Trang: `src/pages/auth/LoginPage.tsx` và `LoginPage.css`.
- Component: `src/components/auth/AuthHeader.tsx`, `LoginForm.tsx`.
- Font, nền và icon tham khảo được lưu tại `public/sites/thepizzacompany-vn/`. Logo chữ và biểu tượng vương miện/sóng dùng tên The Sea's Crown; favicon đặt trong `public/branding/`.
- Đăng nhập bằng email và mật khẩu theo Swagger backend, có kiểm tra dữ liệu, hiện/ẩn mật khẩu, trạng thái đang xử lý và lỗi đăng nhập.
- Đăng nhập thành công chuyển đến `/menu/combo`, hiện thông báo nền trắng/viền xanh ở giữa phía trên và tự ẩn sau 5 giây. Tải lại trang không lặp thông báo.
- Token chỉ lưu trong `sessionStorage` của tab; không lưu mật khẩu. Tự lấy thông tin tài khoản và làm mới access token khi hết hạn, tối đa một lần thử lại sau lỗi 401.
- Biểu tượng tài khoản trên menu hiển thị tên/email và nút đăng xuất, kể cả trên mobile. Đăng xuất thành công thu hồi refresh token phía backend và xóa phiên ở frontend.
- Các nút đăng ký, quên mật khẩu và đăng nhập mạng xã hội hiển thị thông báo khi chưa có tính năng tương ứng; không dẫn người dùng sang website nguồn. Bản tiếng Anh hiện chưa khả dụng.
- Bằng chứng khảo sát, so sánh và kiểm tra trình duyệt: [docs/research/thepizzacompany-vn/brief.md](docs/research/thepizzacompany-vn/brief.md).

## API hiện có

Swagger local: http://localhost:8080/swagger-ui/index.html

| Endpoint | Giao diện sử dụng |
| --- | --- |
| `POST /api/v1/auth/login` | Form email/mật khẩu |
| `GET /api/v1/auth/me` | Tên và email trong menu tài khoản, khôi phục phiên khi tải lại |
| `POST /api/v1/auth/refresh` | Tự làm mới phiên và lưu refresh token mới |
| `POST /api/v1/auth/logout` | Nút đăng xuất trong menu tài khoản |

Swagger hiện chưa có endpoint cho thực đơn, giỏ hàng, đăng ký hoặc mạng xã hội,
nên các phần này chưa gọi backend. Chi tiết triển khai và kiểm tra thật:
[docs/verification/auth-api/README.md](docs/verification/auth-api/README.md).

`npm run dev` và `npm run preview` đã cấu hình proxy `/api`. Khi deploy bản
`dist`, web server cần chuyển tiếp `/api` đến backend. Nếu đặt
`VITE_API_BASE_URL` thành URL khác origin, backend phải cho phép CORS tương ứng.

## Giao diện thực đơn tham khảo

Nguồn: https://thepizzacompany.vn/menu/combo

- Chạy `npm run dev`, mở `http://localhost:5173/menu/combo`.
- Trang: `src/pages/public/ComboMenuPage.tsx`; các thành phần nằm trong `src/components/menu/`.
- Có carousel 6 banner, thanh danh mục cuộn ngang và ghim khi cuộn, lọc nhóm, tìm món, đánh dấu yêu thích, chọn thành phần/biến thể và giỏ hàng minh họa.
- Các đường dẫn `/menu/pizza`, `/menu/pizza-caro`, `/menu/my-y`, `/menu/ga-ngon-vibe`, `/menu/khai-vi`, `/menu/salad`, `/menu/nui-bo-lo`, `/menu/thuc-uong` mở vị trí tương ứng trong cùng thực đơn. Truy vấn `?tag=moi`, `ban-chay`, `chay`, `cay` lọc nhãn món.
- `menuData.ts` chứa dữ liệu tĩnh trích từ nguồn: 8 danh mục, 121 thẻ món (119 món riêng biệt), gồm 11 combo và lựa chọn bắt buộc của từng combo. Ảnh, tên món, giá và chương trình là nội dung mẫu của website nguồn, cần thay bằng thực đơn của nhà hàng khi tích hợp API.
- Chi tiết món mở trong hộp thoại tại local. Giỏ hàng và yêu thích chỉ tồn tại trong phiên trang; nút đặt hàng thông báo chưa hỗ trợ và không gửi đơn.
- Liên kết thông tin, mạng xã hội và hỗ trợ ngoài phạm vi dẫn sang website nguồn, có ghi chú tham khảo ở footer. Thông tin liên hệ nhà hàng đang chờ cập nhật.
- Đã đối chiếu desktop/mobile, kiểm tra 6 kích thước màn hình, luồng giỏ hàng và điều hướng đăng nhập. Xem [khảo sát và bằng chứng kiểm tra](docs/research/thepizzacompany-vn/menu-combo/brief.md).
