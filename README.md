# Typer Shark Deluxe 3D (Bản tiếng Việt)

Phiên bản web tiếng Việt của trò chơi luyện gõ Typer Shark Deluxe được dựng lại bằng **React**, **Three.js** và **Tailwind CSS**. Bạn sẽ đối đầu với bầy cá mập 3D, gõ chính xác từng từ tiếng Việt để bảo vệ tàu lặn khỏi bị nhấn chìm.

## Điểm nổi bật

- 🦈 **Chiến đấu 3D**: Three.js tạo nên không gian biển sâu, đàn cá mập hoạt họa và bong bóng sinh động.
- ⌨️ **Gõ tiếng Việt chuẩn xác**: Hỗ trợ đầy đủ dấu tiếng Việt, combo tăng điểm và cấp độ tự động nâng khi tiêu diệt nhiều cá mập.
- ⚙️ **Giao diện React**: Logic trò chơi đóng gói trong component React, dễ dàng mở rộng và bảo trì.
- 🎨 **Tailwind CSS**: Thiết kế HUD, overlay và bảng hướng dẫn với phong cách đại dương hiện đại, có hỗ trợ `prefers-reduced-motion`.

## Cấu trúc dự án

```
Typer-Shark-Deluxe/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    └── components/
        ├── Hud.jsx
        ├── OceanScene.jsx
        └── Overlay.jsx
```

## Cách chạy

1. Cài đặt phụ thuộc: `npm install`
2. Khởi động môi trường phát triển: `npm run dev`
3. Tạo bản build sản xuất: `npm run build`
4. Xem trước bản build: `npm run preview`

> **Lưu ý:** Nếu môi trường CI không truy cập được registry của npm, hãy đảm bảo cache phụ thuộc hoặc sử dụng mirror phù hợp.

## Điều khiển

- Gõ chính xác từ hiển thị trên cá mập để phóng lao âm thanh tiêu diệt chúng.
- Nhấn <kbd>Backspace</kbd> để xóa ký tự, <kbd>Esc</kbd> để tạm dừng.
- Nhấn <kbd>Enter</kbd> ở màn hình bắt đầu hoặc kết thúc để chơi ngay.

## Giấy phép

Mục đích giáo dục và trình diễn. Tất cả tài sản hình ảnh 3D được tạo bằng Three.js trong thời gian thực.
