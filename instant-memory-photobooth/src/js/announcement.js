const messages = [
  'Theo dõi chúng tôi trên Instagram @photobooth_io và TikTok @photoboothio ♡',
  'Chia sẻ ảnh và đừng quên gắn thẻ @photobooth_io!'
];

const announcementText = document.getElementById('header-announcement-text');
let announcementIndex = 0;

function showNextAnnouncement() {
  if (!announcementText) return;
  announcementText.classList.remove('fade');
  void announcementText.offsetWidth;
  announcementText.classList.add('fade');
  announcementText.innerHTML = `<a href="https://www.instagram.com/photobooth_io/" target="_blank" rel="noopener">${messages[announcementIndex]}</a>`;
  announcementIndex = (announcementIndex + 1) % messages.length;
}

showNextAnnouncement();
setInterval(showNextAnnouncement, 4000);
