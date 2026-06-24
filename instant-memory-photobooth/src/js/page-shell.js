document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const pages = { home:'index.html', about:'pages/about.html', privacy:'pages/privacy.html', spotlight:'pages/spotlight.html', contact:'pages/contact.html', layout:'pages/choose-layout.html' };
      location.href = pages[link.dataset.page] || 'index.html';
    });
  });
  const trigger = document.getElementById('hamburger-home-trigger');
  const menu = document.getElementById('hamburger-nav');
  const close = document.getElementById('hamburgerBtn');
  const openMenu = open => { if(!menu||!trigger)return; menu.style.display=open?'block':'none'; menu.style.opacity=open?'1':'0'; trigger.style.display=open?'none':'flex'; };
  trigger?.addEventListener('click',()=>openMenu(true));
  close?.addEventListener('click',()=>openMenu(false));
});
