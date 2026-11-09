# Nối API đăng nhập

Nguồn hợp đồng: `http://localhost:8080/v3/api-docs`, ngày 09/11/2026.
Swagger có đúng bốn endpoint xác thực; chưa có API thực đơn/giỏ hàng.

## Tệp triển khai

- `src/api/client.ts`: base URL, JSON, lỗi HTTP/network, giới hạn chờ 15 giây.
- `src/api/auth.ts`: login, me, refresh, logout, lưu phiên trong sessionStorage,
  gộp các yêu cầu refresh đồng thời và ngăn phản hồi cũ ghi đè phiên mới.
- `src/hooks/useAuth.ts`: đồng bộ tài khoản từ API với giao diện.
- `LoginForm.tsx`: email/mật khẩu, kiểm tra dữ liệu, chống gửi trùng, pending/error.
- `MenuHeader.tsx`: tài khoản và đăng xuất trên desktop/mobile.
- `Toast.tsx`, `.css`: thông báo giữa phía trên, nền trắng, viền xanh nhạt,
  có nút đóng, tự ẩn sau 5 giây; lỗi dùng màu đỏ.

Login gửi `{email, password}` và nhận `{accessToken, refreshToken, tokenType,
expiresIn}`. Sau khi lấy được `/me`, frontend chuyển tới `/menu/combo` và hiện
thông báo thành công một lần. Mật khẩu không được lưu ở storage.

Phiên được giữ trong tab khi chuyển trang/tải lại. Access token sắp hết hạn
hoặc bị `/me` trả 401 sẽ được làm mới; refresh token luân chuyển được lưu lại.
Nếu token mới vẫn bị từ chối, dừng thử lại và xóa phiên. Lỗi mạng hoặc 5xx
khi refresh giữ token để có thể thử lại khi tải lại trang. Lỗi logout không
giả vờ đăng xuất thành công và không xóa phiên trước khi backend xác nhận.

## Cấu hình

```dotenv
VITE_API_BASE_URL=/api/v1
VITE_API_PROXY_TARGET=http://localhost:8080
```

Backend hiện không cho phép preflight từ frontend. Vite dev/preview dùng proxy
`/api`, không thay đổi backend. Khi triển khai production, cấu hình reverse proxy
`/api` hoặc thiết lập CORS ở backend nếu dùng URL API khác origin.

## Kiểm tra

`npm run lint` và `npm run build` đạt. Script `verify-auth.cjs` kiểm tra bằng
Chrome/Playwright với tài khoản test do người dùng cung cấp. Script chỉ nhận
credentials qua biến môi trường, không ghi mật khẩu hay token vào báo cáo.

```powershell
# Cấp AUTH_TEST_EMAIL và AUTH_TEST_PASSWORD trong môi trường chạy.
node docs/verification/auth-api/verify-auth.cjs <duong-dan-module-playwright>
```

Có thể đổi `AUTH_TEST_ORIGIN` (mặc định `http://localhost:5173`) và `CHROME_PATH`.
Backend phải đang chạy; test login/refresh/logout thật sẽ tạo và thu hồi phiên
của tài khoản test. Các trường hợp giả lập được ghi rõ trong kết quả.

Kiểm tra thật: form trống/email sai không gọi API, thông tin sai trả 401,
đăng nhập thành công, chống submit trùng, lấy tài khoản, chuyển trang, thông báo
giữa phía trên, không lặp thông báo khi reload, refresh token luân chuyển,
phục hồi sau access token bị từ chối, logout và mobile.

Kiểm tra giả lập: mất kết nối, logout 503, refresh 401/503, `/me` tiếp tục 401 sau
refresh. Kiểm tra header/dropdown ở 360, 390, 768, 1024, 1440 và 1920px.

Kết quả: [verification.json](verification.json).
Ảnh: [desktop](login-success-desktop.png), [mobile](login-success-mobile.png).

Thực đơn và giỏ hàng vẫn là mẫu local vì Swagger chưa cung cấp API tương ứng.
Không thêm màn hình hoặc API quản trị ngoài giao diện hiện có.
