# Instant Memory Photobooth

Đây là phiên bản đã dọn lại bố cục thư mục của website photobooth.

## Cấu trúc thư mục

```text
instant-memory-photobooth-clean/
├─ index.html                  # Trang chủ
├─ pages/                      # Các trang HTML phụ
│  ├─ about.html
│  ├─ choose-layout.html
│  ├─ contact.html
│  ├─ privacy.html
│  ├─ spotlight.html
│  └─ studio.html
├─ src/
│  ├─ css/                     # Toàn bộ CSS
│  ├─ js/                      # Toàn bộ JavaScript
│  └─ vendor/                  # Thư viện ngoài đã lưu local
├─ assets/
│  ├─ icons/                   # Icon/logo
│  ├─ filters/                 # Ảnh filter mẫu
│  ├─ frames/                  # Họa tiết khung ảnh
│  ├─ spotlight/               # Ảnh nổi bật
│  └─ templates/               # Template trang trí
└─ run.bat                     # Chạy web local trên Windows
```

## Cách chạy

Cách dễ nhất trên Windows: bấm đúp `run.bat`.

Hoặc mở terminal tại thư mục này và chạy:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Sau đó mở trình duyệt tại:

```text
http://127.0.0.1:4173/
```

## Ghi chú

- Không cần `npm install`.
- Không cần `npm run build`.
- Camera nên chạy qua `127.0.0.1` hoặc `localhost`, không nên mở trực tiếp bằng `file:///`.
- Đã xóa các thư mục mirror/cache/quảng cáo của HTTrack để dự án gọn hơn.
