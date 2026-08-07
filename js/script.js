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

// ============ MODALS (generic — supports any [data-modal-target] trigger) ============
function openModal(modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('[data-modal-target]').forEach((trigger) => {
  const modal = document.getElementById(trigger.dataset.modalTarget);
  if (modal) trigger.addEventListener('click', () => openModal(modal));
});
document.querySelectorAll('.modal').forEach((modal) => {
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => closeModal(modal)));
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.modal.open').forEach((modal) => closeModal(modal));
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
// Submits directly to Web3Forms, which emails the submission to Octavia.
// No page reload, no visitor email client required — real delivery with a
// real success/error message shown right here on the page.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = contactForm.querySelector('.submit-btn');
  const submitLabel = contactForm.querySelector('.submit-btn-label');
  const statusEl = document.getElementById('formStatus');

  const setStatus = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (kind ? ` form-status--${kind}` : '');
  };

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);

    // honeypot — if a bot checked this hidden field, silently drop it
    if (data.get('botcheck')) return;

    submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Sending…';
    setStatus('', '');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data,
      });
      const result = await res.json();

      if (result.success) {
        contactForm.reset();
        setStatus("Thanks — your message is on its way. I'll get back to you within 24 hours.", 'success');
        if (submitLabel) submitLabel.textContent = 'Sent';
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('Something went wrong sending that — please email info@octaviamarch.com directly instead.', 'error');
      if (submitLabel) submitLabel.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });
}
