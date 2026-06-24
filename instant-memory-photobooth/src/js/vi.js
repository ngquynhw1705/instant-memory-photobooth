document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = 'vi';
  const textMap = new Map([
    ['home', 'trang chủ'], ['about', 'giới thiệu'], ['privacy policy', 'chính sách riêng tư'],
    ['spotlight', 'nổi bật'], ['contact', 'liên hệ'], ['choose frame', 'chọn khung'], ['choose layout', 'chọn bố cục'],
    ["What's New", 'Có gì mới'], ['Got it!', 'Đã hiểu!'],
    ['Check out the latest features and improvements we\'ve added to make your photobooth experience even better!', 'Khám phá các tính năng và cải tiến mới nhất của Instant Memory!'], ['Date Updated: 06/12/2026', 'Cập nhật: 12/06/2026'],
    ['Est. February 9, 2025', 'Ra mắt ngày 09/02/2025'], ['days', 'ngày'], ['hours', 'giờ'], ['mins', 'phút'], ['secs', 'giây'],
    ['Capture the moment, cherish the magic,', 'Ghi lại khoảnh khắc, lưu giữ diệu kỳ,'], ['relive the love', 'sống lại những yêu thương'], ['START', 'BẮT ĐẦU'],
    ['Choose your frame', 'Chọn khung ảnh'], ['Select from our collection of photo booth layouts', 'Chọn mẫu yêu thích từ bộ sưu tập của chúng tôi'],
    ['Layout A', 'Bố cục A'], ['Layout B', 'Bố cục B'], ['Hearts Filter Layout', 'Bố cục trái tim'], ['Dog Filter Layout', 'Bố cục cún con'], ['Vintage Layout', 'Bố cục cổ điển'],
    ['Size 6 × 2 Strip', 'Dải ảnh 6 × 2'], ['3 Pose', '3 kiểu tạo dáng'], ['4 Pose', '4 kiểu tạo dáng'], ['(3 Pose)', '(3 kiểu tạo dáng)'], ['(4 Pose)', '(4 kiểu tạo dáng)'], ['Square Grid', 'Lưới vuông'], ['2 × 2 Grid', 'Lưới 2 × 2'], ['Back home', 'Về trang chủ'], ['← Back home', '← Về trang chủ'],
    ['instant memory studio', 'studio Instant Memory'], ['Turn on your camera or upload a photo to begin.', 'Bật camera hoặc tải ảnh lên để bắt đầu.'],
    ['Normal', 'Bình thường'], ['Sepia', 'Nâu cổ'], ['B&W', 'Đen trắng'], ['Vintage', 'Cổ điển'], ['Default camera', 'Camera mặc định'],
    ['Enable camera', 'Bật camera'], ['Upload photo', 'Tải ảnh lên'], ['Take photo', 'Chụp ảnh'],
    ['Press Take photo once — the remaining shots are captured automatically. Photos are not uploaded.', 'Chỉ cần nhấn Chụp ảnh một lần — các ảnh còn lại sẽ được chụp tự động. Ảnh không được tải lên máy chủ.'],
    ['edit your photo strip ♡', 'chỉnh sửa dải ảnh ♡'], ['Customize', 'Tùy chỉnh'], ['Layout', 'Bố cục'], ['Photo strip', 'Dải ảnh'], ['2 × 2 grid', 'Lưới 2 × 2'],
    ['Filter', 'Bộ lọc'], ['Vivid', 'Rực rỡ'], ['Bright', 'Tươi sáng'], ['Frame Color', 'Màu khung'], ['Photo Shape', 'Hình dạng ảnh'],
    ['Photo Order', 'Thứ tự ảnh'], ['Stickers', 'Nhãn dán'], ['Place on Face', 'Đặt lên khuôn mặt'], ['Place on Frame', 'Đặt lên khung'],
    ['Click a sticker to add it instantly, or click the preview to position another copy.', 'Chọn nhãn dán để thêm ngay, hoặc bấm lên ảnh xem trước để đặt thêm ở vị trí tùy ý.'],
    ['Undo sticker', 'Hoàn tác nhãn dán'], ['Clear', 'Xóa hết'], ['Logo', 'Biểu trưng'], ['Retake', 'Chụp lại'], ['Download', 'Tải ảnh'],
    ['Choose a sticker, then click the preview to place it.', 'Chọn nhãn dán rồi bấm lên ảnh xem trước để đặt vị trí.'],
    ['TRY IT NOW', 'THỬ NGAY'], ['NEW LAYOUT', 'MẪU MỚI']
  ]);

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const original = node.nodeValue;
    const trimmed = original.trim();
    if (!textMap.has(trimmed)) return;
    node.nodeValue = original.replace(trimmed, textMap.get(trimmed));
  });

  const attributeMap = new Map([
    ['Previous frames', 'Khung trước'], ['Next frames', 'Khung tiếp theo'], ['Camera', 'Camera'],
    ['Select Layout A, 3 poses', 'Chọn bố cục A, 3 kiểu tạo dáng'], ['Select Layout B, 4 poses', 'Chọn bố cục B, 4 kiểu tạo dáng'],
    ['Select Hearts Filter Layout, 4 poses', 'Chọn bố cục trái tim, 4 kiểu tạo dáng'], ['Select Dog Filter Layout, 4 poses', 'Chọn bố cục cún con, 4 kiểu tạo dáng'],
    ['Select Vintage Layout, 4 poses', 'Chọn bố cục cổ điển, 4 kiểu tạo dáng'], ['Select 2 by 2 Grid, 4 poses', 'Chọn lưới 2 × 2, 4 kiểu tạo dáng'],
    ['Mirror', 'Lật gương'], ['Flash', 'Đèn flash'], ['No photo shape', 'Không tạo hình'],
    ['Rounded square photos', 'Ảnh vuông bo góc'], ['Circle photos', 'Ảnh tròn'], ['Heart photos', 'Ảnh trái tim'],
    ['Move earlier', 'Chuyển về trước'], ['Move later', 'Chuyển về sau']
  ]);
  document.querySelectorAll('[aria-label],[title]').forEach(element => {
    ['aria-label', 'title'].forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (attributeMap.has(value)) element.setAttribute(attribute, attributeMap.get(value));
    });
  });

  const path = location.pathname;
  if (path.endsWith('/index.html') || path.endsWith('/instant-memory-photobooth-clean/') || path.endsWith('/')) document.title = 'Instant Memory | Ghi lại khoảnh khắc, lưu giữ kỷ niệm';
  else if (path.endsWith('/choose-layout.html')) document.title = 'Chọn khung | Instant Memory';
  else if (path.endsWith('/studio.html')) document.title = 'Studio | Instant Memory';
});
