// ============ NAV: scrolled state + mobile menu ============
const nav = document.getElementById('nav');
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

const onScroll = () => {
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

navBurger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  navBurger.classList.toggle('active');
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// ============ SCROLL REVEAL ============
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => io.observe(el));

// ============ FOOTER YEAR ============
document.getElementById('year').textContent = new Date().getFullYear();

// ============ BIO MODAL ============
const bioModal = document.getElementById('bioModal');
const readMoreBtn = document.getElementById('readMoreBtn');

function openModal() {
  bioModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  bioModal.classList.remove('open');
  document.body.style.overflow = '';
}
if (readMoreBtn) readMoreBtn.addEventListener('click', openModal);
bioModal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && bioModal.classList.contains('open')) closeModal();
});

// ============ REEL: sound toggle + fullscreen ============
const reelVideo = document.getElementById('reelVideo');
const soundToggle = document.getElementById('soundToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const unmuteBtn = document.getElementById('unmuteBtn');

function setSoundIcon() {
  if (!soundToggle) return;
  soundToggle.querySelector('use').setAttribute('href', reelVideo.muted ? '#i-mute' : '#i-sound');
}
function unmuteReel() {
  reelVideo.muted = false;
  reelVideo.play().catch(() => {});
  setSoundIcon();
}
if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    reelVideo.muted = !reelVideo.muted;
    if (!reelVideo.muted) reelVideo.play().catch(() => {});
    setSoundIcon();
  });
}
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    unmuteReel();
    const el = reelVideo;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  });
}
if (unmuteBtn) {
  unmuteBtn.addEventListener('click', () => {
    unmuteReel();
    const el = reelVideo;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  });
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    reelVideo.muted = true;
    setSoundIcon();
  }
});

// ============ CONTACT FORM ============
// No backend is wired up yet, so this opens the visitor's email client with
// the message prefilled, addressed to info@octaviamarch.com. To get true
// silent form-to-inbox delivery (no email client required), hook this form
// up to a service like Formspree / Web3Forms / Netlify Forms instead —
// that just needs an account + endpoint from Octavia, then a one-line swap
// of this handler for a fetch() POST to that endpoint.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);

    // honeypot — if a bot filled this hidden field, silently drop it
    if (data.get('_gotcha')) return;

    const name = (data.get('name') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    const subject = encodeURIComponent(`New inquiry from ${name || 'your website'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:info@octaviamarch.com?subject=${subject}&body=${body}`;

    const note = document.getElementById('formNote');
    if (note) note.textContent = 'Opening your email app to send this to info@octaviamarch.com…';
  });
}
