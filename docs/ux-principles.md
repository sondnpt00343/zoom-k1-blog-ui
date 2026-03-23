# Nguyên tắc UX & giao diện (blog-ui)

Tài liệu ngắn, mang tính **tổng quát** — không gắn với một file hay tính năng cụ thể.

## Copy cho người dùng cuối

- Viết **tiếng Việt**, ngắn, nhất quán giữa thành công và lỗi.
- Tránh thuật ngữ triển khai (API, máy chủ, xóa mềm, slug khi không cần thiết).
- Thông báo lỗi nên gợi ý **hành động tiếp theo** (thử lại, kiểm tra kết nối, đăng nhập lại).
- Chuỗi dùng cho `aria-label` vẫn phải đủ rõ.

## Bố cục đọc (LTR)

- Ưu tiên **chữ (tiêu đề, tóm tắt) trước**, yếu tố minh họa (ảnh bìa) **sau** trong luồng đọc; trên mobile, cột dọc phản ánh cùng thứ tự ưu tiên.

## Mật độ danh sách

- Feed dài: giảm padding/gap và độ cao thumbnail một cách có chủ đích; giữ cỡ chữ đọc được (không nhỏ hơn ~14px cho đoạn chính).

## Hành động phụ

- Nhiều thao tác trên một mục → gom vào **menu (overflow)**; hành động huỷ tác động lớn → **dialog** thay cho `window.confirm` khi đã có design system.

## Primitive UI

- Hành vi chung (ví dụ `spellCheck`) đặt ở **Input/Textarea** gốc; bật ngoại lệ từng ô (ví dụ ô tìm kiếm: `spellCheck`).

## Editor nặng / bundle

- Editor WYSIWYG hoặc chunk lớn → **`React.lazy` + `Suspense`**, tách khỏi bundle trang chủ.

## Lỗi từ API

- Map mã lỗi → câu người dùng tại **một helper**; tránh rải raw message tiếng Anh kỹ thuật ra toast.

## Skill thiết kế vs sản phẩm

- blog-ui hướng **đọc/viết, editorial**: ưu tiên rõ ràng và khả năng đọc; “aesthetic bold” chỉ trong phạm vi không phá hierarchy hay messaging.
