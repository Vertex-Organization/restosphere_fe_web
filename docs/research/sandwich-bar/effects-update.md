# Cập nhật hiệu ứng theo website nguồn

Nguồn: https://www.thesandwichbar.nl/. Giữ nguyên ánh xạ route tại
`source-brief.md`; chỉ cập nhật tương tác/chuyển động của bản clone hiện có.
Mã production nguồn được đọc làm bằng chứng, không được chạy trong app.

## Hiệu ứng đã đối chiếu và triển khai

| Khu vực | Quy tắc nguồn / bản local mới |
| --- | --- |
| Intro | Một lần/session `intro-seen`; xe chạy2.2s power3.in,nghiêng-7° rồi về0; đường ngang1.8s power2.in; panel rời sang phải x200%1.4s; t3.1 ẩn panel và bắt đầu hiện hero. |
| Hero | opacity0/y20 -> hiện,1s power3.inOut,stagger.2; không tự chạy sớm phía sau loader. |
| Chuyển trang | SVG và đường cong thực của nguồn; vẽ0->85% trong1s,độ dày5%->30% từt.25; trang mới rút nét100->100%1.25s; h1 hiện ởt.75 với expo.out1s. Điều hướng nội bộ không reload. |
| Header | Logo theo con trỏ±24/12px; nút hút theo35% khoảng cách,.4s power3.out; rời nút trả về.6s elastic.out(1,.4). |
| Cuộn | Lenis1.2s,easing nguồn; đồng bộ ScrollTrigger và reset quán tính khi đổi route/Back/Forward. |
| SVG trên trang | Độ dày nét sửa3->32px; slogan scrub.5; hai đường trang trí scrub1.5,start top80%,end bottom20%,cuộn ngược cũng đảo lại. |
| Marquee | Đo chiều dài thực,chạy45px/s,26ảnh nhân đôi; tính lại sau resize200ms. |
| Slider | GSAP Draggable,edgeResistance.85,bounds chính xác,không inertia,kéo15vw đổi1slide; snap.7s power3.out; nút/chấm/phím mũi tên. |
| Sticker | Kéo theo pointer,nghiêng theo deltaX*1.2 giới hạn±20°,scale1.08 khi giữ,shadow và z999; thả trả góc và z sau400ms. |
| Video hover | InertiaPlugin lấy vận tốc con trỏ,vị trí/rotation clamp đúng nguồn,resistance200,end0; bỏ rotate/scale cố định. |
| FAQ | Chỉ1câu mở cùng lúc,grid chuyển chiều cao300ms,icon chuyển300ms. |
| Catering | Luồng ảnh28s/22s tuyến tính,đo khoảng cách loop; tường logo16slot,8desktop/6mobile,shuffle lượt/thay thế,expo.inOut.9s,cadence1.5s. |
| Footer | Matter.js0.20.0,gravity mặc định1,restitution.5,friction.08,frictionAir.01,density.002,MouseConstraint stiffness.2; kích thước/count/spawn/walls/texture đúng nguồn; khởi động khi footer top90%. |

File sở hữu: `PageTransition.tsx/.css` cho điều hướng; `Shared.tsx/.css`
cho intro/header; `HomePage.tsx/.css` cho các hiệu ứng trang chủ;
`CateringPage.tsx/.css` cho Catering; `FooterPlayground.tsx` cho Matter.
Các module/tween/timer/listener/engine được dọn khi rời trang;
reduced-motion bỏ cuộn/tween tự động và dùng trạng thái tĩnh phù hợp.

## Kiểm tra

- Build production: thành công,TypeScript+Vite.
-16 tình huống mô phỏng Happy DOM/React StrictMode: intro một lần/session,
  hero hiện sau intro,đổi locale không reload,chuyển trang SVG hoàn tất,
  bỏ click điều hướng liên tiếp,Back,popstate giữa tween,fragment tới section,
  slider đầu/cuối/nút/chấm,FAQ chỉ1mục; không ghi nhận lỗi vòng đời DOM.
  Kết quả: `motion-test-results.json`.
-18route render React phía server,không thiếu media: `route-verification.json`.
- Matter engine mô phỏng60giây tại390px/1440px: vị trí hữu hạn,logo nằm
  trong biên,sau rơi ổn định. Chi tiết `footer-motion-update.md`.
- Bằng chứng từng khu vực: `home-motion-update.md`,
  `catering-motion-update.md`, `footer-motion-update.md`.

Happy DOM mô phỏng API DOM/SVG và không có layout/rasterization của trình
 duyệt. Các kiểm tra trên xác minh logic/vòng đời; không chứng minh hình ảnh,
crop,tràn ngang,cảm giác drag thật hay pixel-perfect. Cua báo apps/browsers
rỗng; vì vậy chưa có so sánh ảnh/ghi hình source-local desktop/mobile.

## Xem local

```powershell
npm install
npm run dev
```

Mở URL Local do Vite in ra; các route giữ nguyên `/`, `/nl`, `/en`,
`/nl/menu`, `/en/menu`, `/nl/catering`, `/en/catering`, Privacy và Terms.
Intro chỉ chạy ở lần đầu trong session; để xem lại khi phát triển có thể
xóa key `intro-seen` trong Session Storage rồi reload. Đặt hàng vẫn tới
hệ thống nguồn; form Catering vẫn chuẩn bị email nháp như bản trước.
