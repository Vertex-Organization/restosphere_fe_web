# AGENTS.md - restophere-fe-web

## Dự án và cấu trúc

Frontend RestoSphere dùng React 19, TypeScript và Vite. Đọc hướng dẫn này trước khi sửa; giữ thay đổi nhỏ, đúng phạm vi và không ghi đè công việc hiện có.

- `src/api/`: giao tiếp backend; tái sử dụng client và cách xử lý lỗi hiện có.
- `src/pages/`, `src/routes/`, `src/layouts/`: trang, định tuyến và bố cục.
- `src/components/`, `src/hooks/`: UI và hook dùng lại; không nhân bản logic nghiệp vụ.
- `src/App.tsx`, `src/main.tsx`, `src/index.css`: khởi tạo ứng dụng và style chung.
- `public/`: tài nguyên tĩnh; `scripts/`: tiện ích, kiểm thử và `fixtures/`; `docs/`: tài liệu dùng chung.

## Lệnh và kiểm tra

- `npm run dev`: chạy Vite; `npm run preview`: xem bản build.
- `npm run lint`: ESLint; `npm run build`: `tsc -b` rồi Vite build.
- Dùng Prettier đã cài với `.prettierrc.json` và `.prettierignore`; kiểm tra file đã sửa bằng `npx --no-install prettier --check <file>`. Không format hàng loạt ngoài phạm vi.
- Chưa có script `npm test`; chọn test phù hợp trong `scripts/*.test.mjs`, đọc yêu cầu môi trường trước khi chạy bằng `node --test <file>`. Không chạy kiểm thử ghi dữ liệu lên backend đang dùng nếu chưa được phép.
- Logic mới hoặc sửa lỗi phải có test phù hợp; không nới điều kiện hay xóa test để pass. Chạy lint, build và test liên quan; báo rõ lệnh đã chạy, lỗi và phần chưa kiểm tra.

## Code sạch, API và bảo mật

- Theo mẫu sẵn có, hàm ngắn và trách nhiệm rõ ràng; ưu tiên helper/component hiện có. Hỏi trước khi thêm thư viện, đổi kiến trúc hoặc xóa chức năng. Kiểm tra caller trước khi đổi API hay xóa code.
- Giữ hợp đồng `/api/v1/...` với backend; không tự đổi tên/kiểu field. Phối hợp BE/mobile nếu thay đổi phá vỡ tương thích. Kiểm tra dữ liệu ở biên và hiển thị lỗi rõ ràng, không nuốt lỗi.
- Kiểm quyền trên UI không thay thế kiểm quyền backend. Không hardcode bí mật; biến `VITE_*` được đưa vào client nên không chứa token riêng hay khóa bí mật. Không log token, mật khẩu hoặc dữ liệu thanh toán.
- Không đọc/in bí mật hoặc sửa `.env`; `.env.example` chỉ chứa giá trị mẫu an toàn.
- Giữ accessibility và trạng thái loading/error hiện có. Tên code, log, commit bằng tiếng Anh; nội dung cho người dùng bằng tiếng Việt có dấu, UTF-8.

## Git và quyền agent

- Nhánh `feat/<name>`, `fix/<name>`, `refactor/<name>` tạo từ `develop`; `main` dành cho release. Không tự chuyển nhánh khi có thay đổi chưa lưu.
- Commit dạng `<type>(<scope>): <description>` bằng tiếng Anh. Mỗi commit một việc; mặc định mọi thay đổi qua PR, cần ít nhất **1 người review** duyệt và các kiểm tra pass. PR nêu mục đích, ảnh hưởng API/BE/mobile và cách kiểm tra. Chỉ push thẳng nhánh dùng chung khi người dùng yêu cầu rõ ràng.
- Agent chỉ commit hoặc push khi được yêu cầu rõ ràng và chỉ push đúng remote/nhánh đã được chỉ định; **không force-push** hoặc đổi lịch sử. Không tự stage, xóa hay ghi đè thay đổi của người khác. Không báo hoàn thành khi kiểm tra bắt buộc chưa pass.

## File cá nhân và file dùng chung

- File cá nhân gồm thiết lập IDE riêng, cấu hình agent riêng, cache, báo cáo chạy thử, file tạm và file hệ điều hành. Đặt báo cáo/cache cá nhân trong `/.local/`, file tạm trong `/.tmp/`; cấu hình agent riêng dùng `opencode.local.json`, `opencode.local.jsonc`, `.opencode/*.local.json`, `.opencode/*.local.jsonc` hoặc `AGENTS.local.md`. Đây là quy ước đặt tên để ignore, không bảo đảm công cụ tự nạp cấu hình.
- File dùng chung phải giữ khả năng theo dõi: `AGENTS.md`, `README.md`, `.env.example`, cấu hình formatter, lockfile, source, test, seed, `scripts/`, `docs/`, cấu hình opencode dùng chung và workflow GitHub. Không ignore cả thư mục chỉ vì có một file cá nhân; không mở rộng ignore cũ để che file dùng chung.
- Không coi script chưa rõ mục đích (như `api-performance-probe.mjs`, `runtime-performance-probe.mjs`) là file cá nhân. Không thêm ngoại lệ để đưa bí mật vào Git.
- `.gitignore` không bỏ theo dõi file đã tracked. Kiểm tra bằng `git ls-files -ci --exclude-standard` ở từng repo và báo các đường dẫn cần xem xét; **không chạy `git rm --cached` nếu chưa được chấp thuận rõ ràng**.
- Khi sửa ignore, dùng `git check-ignore -v --no-index <đường-dẫn>` để kiểm tra cả file cá nhân và file dùng chung; xem diff trước khi kết luận.
