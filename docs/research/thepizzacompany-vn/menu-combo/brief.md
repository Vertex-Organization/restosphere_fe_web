# Thực đơn combo — The Sea's Crown

Nguồn: https://thepizzacompany.vn/menu/combo, khảo sát ngày 09/11/2026.
Triển khai trong React + TypeScript + Vite, giữ giao diện đăng nhập đã có.

## Đường dẫn và tệp

| Nguồn | Local | Tệp sở hữu |
| --- | --- | --- |
| `/menu/combo` | `/menu/combo` và `/menu` | `src/pages/public/ComboMenuPage.tsx`, `.css` |
| Các danh mục `/menu/pizza`, `/menu/pizza-caro`, `/menu/my-y`, `/menu/ga-ngon-vibe`, `/menu/khai-vi`, `/menu/salad`, `/menu/nui-bo-lo`, `/menu/thuc-uong` | Giữ đường dẫn, cuộn đến nhóm trong cùng trang | `src/App.tsx`, `ComboMenuPage.tsx` |
| Nhãn món | `/menu/combo?tag=moi`, `ban-chay`, `chay`, `cay` | `ComboMenuPage.tsx`, `MenuCategoryBar.tsx` |
| Đăng nhập | `/auth/login?returnUrl=%2Fmenu%2Fcombo` | Trang đăng nhập hiện có |

Chạy `npm ci` rồi `npm run dev`; mở `http://localhost:5173/menu/combo`.
Các thành phần nằm trong `src/components/menu/`: header, hero, danh mục, thẻ món,
chi tiết món, hộp thoại tìm kiếm/giỏ hàng và footer. `menuTypes.ts` định nghĩa dữ liệu;
`menuData.ts` chứa dữ liệu tĩnh. Không thêm thư viện runtime.

## Nội dung và tài nguyên

Thứ tự trang: thanh tiện ích → điều hướng → carousel → danh mục → combo
(French Croissant, Pizza Caro, sinh nhật) → pizza → mỳ Ý → gà → khai vị → salad →
nui bỏ lò → thức uống → footer và hỗ trợ nổi.

Sau khi cuộn tải hết trang nguồn có 121 thẻ, 119 mã món riêng biệt, gồm 11 combo.
Dữ liệu lấy từ props công khai của trang và cấu hình công khai của từng combo;
giữ đúng lựa chọn tối thiểu/tối đa, số lượng lặp và phụ thu. Khi nguồn có nhiều
bản ghi collection cùng slug, dùng bản cuối như trang nguồn, tránh 9 thẻ thừa.

Ảnh thật, banner, icon được lưu dưới `public/sites/thepizzacompany-vn/menu/`.
Ánh xạ URL gốc, tệp local, định dạng và kích thước nằm trong `assets.json`.
Font Poppins 400/500/600, font điều hướng, nền mờ và viền caro tái sử dụng từ
trang đăng nhập tại `public/sites/thepizzacompany-vn/`. Font dùng chung đặt trong
`src/index.css`; logo riêng dùng `RestaurantBrand.tsx` và `.css`.

Ảnh chương trình và dữ liệu món vẫn là nội dung tham khảo The Pizza Company;
chưa phải thực đơn hoặc chương trình đã xác nhận của The Sea's Crown.

## Quy tắc bố cục và tương tác đã quan sát

| Thành phần | Desktop 1440 × 1000 | Mobile 390 × 844 |
| --- | --- | --- |
| Hero | x120, y141, 1200 × 480 | x16, y111, 358 × 143,19 |
| Tiêu đề combo | y762, cao48 | y358,19, cao32 |
| Tab nhóm | y842, cao58 | y408,19, cao40 |
| Banner đầu | y1004, 1200 × 200 | y517,19, 358 × 59,66 |
| Thẻ combo đầu | y1228, 588 × 533,75 | y588,84, 358 × 329,63 |

- Nội dung rộng tối đa 1200px; dưới 1280px có đệm ngang 16px.
- Carousel có 6 ảnh, tự chạy mỗi 4000ms, chuyển 600ms, nối vòng hai chiều;
  có nút trước/sau, bàn phím, vuốt và tạm dừng khi hover/focus hoặc giảm chuyển động.
- Header thu nhỏ khi cuộn; danh mục ghim dưới header (64px desktop, 50px mobile).
  Danh mục trượt ngang với nút trước/sau và tự đưa mục đang chọn vào tầm nhìn.
- Tab nhóm combo thực sự ẩn các nhóm còn lại, không đổi URL hoặc cuộn về đầu.
  Danh mục chính đổi URL và cuộn trong cùng trang; Back/Forward khôi phục vị trí nhóm.
- Có tìm kiếm không phân biệt dấu, trạng thái không tìm thấy, yêu thích, biến thể,
  lựa chọn bắt buộc, số lượng, ghi chú, tổng tiền và sửa/xóa dòng trong giỏ.
- Hộp thoại khóa cuộn nền, hỗ trợ Escape, click ngoài và trả focus khi đóng.

## Kiểm tra và so sánh

- `npm run lint`, `npm run build`: đạt sau khi tích hợp.
- Kiểm tra trình duyệt thật ở 1440×1000, 390×844, 1920×1080, 360×800,
  768×1024, 1024×900: không tràn ngang; tải được ảnh; không lỗi runtime hoặc 404.
- Luồng hoàn chỉnh: đổi slide, lọc nhóm, chuyển danh mục (kể cả Pizza Caro), lọc nhãn,
  tìm kiếm, yêu thích, kiểm tra lựa chọn thiếu, chọn combo, đổi số lượng và giỏ,
  thông báo đặt hàng, chuyển qua đăng nhập/kiểm tra form và quay lại thực đơn.
- Đối chiếu phụ thu: combo 336.000đ + pizza Pesto 40.000đ, số lượng 2 = 752.000đ;
  tăng giỏ lên 3 = 1.128.000đ.
- Kiểm tra riêng 11 combo ở desktop/mobile (22 trường hợp), bao gồm nhóm có
  2/3/5/10 lựa chọn và cho phép lặp: `dialog-all-combos-verification.json`.
- Báo cáo tổng hợp: `verification.json`; thông số nguồn rút gọn: `reference.json`.

Ảnh trái là nguồn, phải là bản local:

- [So sánh desktop](comparison-desktop.png).
- [So sánh mobile](comparison-mobile.png).
- [Chi tiết món đã chọn](local-item-selected.png), [giỏ hàng](local-cart.png).

Kiểm tra trình duyệt có thể chạy lại khi dev server đang mở:

```powershell
node docs/research/thepizzacompany-vn/menu-combo/verify-menu.cjs <duong-dan-module-playwright>
```

Script nhận `CLONE_ORIGIN` (mặc định `http://127.0.0.1:5173`), dùng Chrome tại
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Playwright chỉ dùng kiểm tra,
không phải dependency của ứng dụng.

## Các khác biệt còn lại

- Header, biểu tượng tiêu đề, footer và tiêu đề trình duyệt dùng The Sea's Crown.
  Không lấy hotline, mã số thuế hoặc thông tin pháp nhân của nguồn làm thông tin nhà hàng.
- Trang nguồn mở đường dẫn chi tiết `/combo/...` hoặc `/product/...`; local mở
  hộp thoại để chọn món ngay trong thực đơn. Chi tiết chương trình trình bày lại
  trong hộp thoại đơn giản, không sao chép toàn bộ các trang chiến dịch ngoài phạm vi.
- Giỏ và yêu thích chỉ lưu trong bộ nhớ trang. Chưa tích hợp tài khoản, địa chỉ,
  tồn kho, thanh toán hoặc đặt hàng; thao tác local không gửi yêu cầu nghiệp vụ.
  Các tiện ích chọn địa điểm, tra cứu đơn, tin tức và ngôn ngữ chưa hỗ trợ
  hiển thị trạng thái phù hợp; chưa triển khai thêm các trang ngoài phạm vi.
- Footer mobile được sắp xếp lại để đọc được, tránh phần cột bị cắt ở nguồn.
  Các liên kết thông tin, mạng xã hội và hỗ trợ ngoài phạm vi vẫn tới nguồn,
  có chú thích tham khảo và mở tab mới. Thông tin liên hệ riêng chờ cập nhật.
