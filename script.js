/* ─── Scroll-to-top button ─── */
const scrollTop = document.createElement('button');
scrollTop.id = 'scroll-top';
scrollTop.innerHTML = '↑';
scrollTop.setAttribute('aria-label','Back to top');
scrollTop.style.cssText = `
  position:fixed;bottom:110px;right:28px;z-index:98;
  width:44px;height:44px;border-radius:50%;
  background:var(--primary);color:#fff;font-size:1.1rem;font-weight:700;
  box-shadow:0 8px 24px rgba(29,78,216,0.3);
  cursor:pointer;border:none;transition:all 0.3s;opacity:0;transform:translateY(10px);
`;
document.body.appendChild(scrollTop);
scrollTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

// ─── Navbar scroll ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  navbar.classList.toggle('scrolled', s > 40);
  scrollTop.style.opacity = s > 400 ? '1' : '0';
  scrollTop.style.transform = s > 400 ? 'translateY(0)' : 'translateY(10px)';
});

// ─── Hamburger & Mobile Menu ───
const ham = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const menuOverlay = document.createElement('div');
menuOverlay.className = 'menu-overlay';
document.body.appendChild(menuOverlay);

function toggleMenu(forceClose = false) {
  const willOpen = forceClose ? false : !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', willOpen);
  menuOverlay.classList.toggle('active', willOpen);
  document.body.style.overflow = willOpen ? 'hidden' : '';
  ham.setAttribute('aria-expanded', willOpen);
}

ham.addEventListener('click', () => toggleMenu());
menuOverlay.addEventListener('click', () => toggleMenu(true));

// close on link click
navLinks.querySelectorAll('a').forEach(l => {
  l.addEventListener('click', () => {
    if (navLinks.classList.contains('open')) toggleMenu(true);
  });
});

// ─── Particle System ───
const particleContainer = document.getElementById('particles');
function createParticle() {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 6 + 3;
  p.style.cssText = `
    width:${size}px;height:${size}px;
    left:${Math.random()*100}%;
    animation-duration:${Math.random()*12+8}s;
    animation-delay:${Math.random()*8}s;
    opacity:${Math.random()*0.3+0.05};
  `;
  particleContainer.appendChild(p);
}
for (let i = 0; i < 25; i++) createParticle();

// ─── Service Tabs ───
const serviceTabs = document.querySelectorAll('.stab');
const servicePanels = document.querySelectorAll('.service-panel');

serviceTabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    serviceTabs.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    });

    servicePanels.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    btn.setAttribute('tabindex', '0');

    const panel = document.getElementById(`panel-${tab}`);
    if (panel) {
      panel.classList.add('active');
      panel.setAttribute('aria-hidden', 'false');
      // re-trigger animations
      panel.querySelectorAll('[data-anim]').forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), 50);
      });
    }
  });
});

// ─── Intersection Observer (scroll animations) ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.style.getPropertyValue('--delay');
      if (delay) {
        setTimeout(() => el.classList.add('visible'), parseFloat(delay) * 1000);
      } else {
        el.classList.add('visible');
      }
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

// ─── Counter Animation ───
function animateCount(el, target) {
  const duration = 2000;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      animateCount(el, target);
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ─── Reviews Carousel ───
const track = document.getElementById('reviews-track');
const dotsContainer = document.getElementById('carousel-dots');
let currentSlide = 0;
let autoTimer;

const cards = track ? track.querySelectorAll('.review-card') : [];
const totalSlides = cards.length;

function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function goTo(idx) {
  if (totalSlides === 0) return;
  currentSlide = Math.max(0, Math.min(idx, totalSlides - 1));
  
  const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0;
  const containerWidth = track.parentElement.offsetWidth;
  const offset = (containerWidth - (cards[0] ? cards[0].offsetWidth : 0)) / 2;
  
  track.style.transform = `translateX(calc(-${currentSlide * cardWidth}px + ${offset}px))`;
  
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function next() { goTo(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1); }
function prev() { goTo(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1); }

document.getElementById('rev-next')?.addEventListener('click', () => { next(); resetAuto(); });
document.getElementById('rev-prev')?.addEventListener('click', () => { prev(); resetAuto(); });

function startAuto() { autoTimer = setInterval(next, 4500); }
function resetAuto() { clearInterval(autoTimer); startAuto(); }

buildDots();
startAuto();

// Handle resize
window.addEventListener('resize', () => goTo(currentSlide));

// ─── FAQ Accordion ───
document.querySelectorAll('.faq-q').forEach(btn => {
  const faqId = btn.dataset.faq;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `${faqId}-answer`);

  const answer = document.getElementById(`${faqId}-answer`);
  if (answer) {
    answer.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', () => {
    const item = document.getElementById(btn.dataset.faq);
    const answerEl = item?.querySelector('.faq-a');
    const isOpen = item?.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item').forEach(fi => {
      fi.classList.remove('open');
      const ans = fi.querySelector('.faq-a');
      const question = fi.querySelector('.faq-q');
      if (ans) {
        ans.style.maxHeight = '0';
        ans.setAttribute('aria-hidden', 'true');
      }
      if (question) {
        question.setAttribute('aria-expanded', 'false');
      }
    });

    if (!isOpen && answerEl) {
      item.classList.add('open');
      answerEl.style.maxHeight = answerEl.scrollHeight + 'px';
      answerEl.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ─── Appointment System (Modular) ───
const APPOINTMENT_CONFIG = {
  whatsappNumber: '919876543210',
  enableWhatsApp: true,
  enableEmail: false, // Placeholder for future
  enableSheets: false // Placeholder for future
};

function handleAppointment(data) {
  // 1. Internal Logic (Logging/Analytics)
  console.log('Processing appointment:', data);

  // 2. WhatsApp Integration
  if (APPOINTMENT_CONFIG.enableWhatsApp) {
    const name = data.name || 'Not provided';
    const phone = data.phone || 'Not provided';
    const service = data.service || 'Not provided';
    const date = data.date || 'Not provided';
    const time = data.time || 'Not provided';

    let text = `Hello 👋\n\nI would like to book an appointment.\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n🦷 Service: ${service}\n📅 Date: ${date}\n⏰ Time: ${time}`;
    
    if (data.message && data.message.trim() !== '') {
      text += `\n📝 Notes: ${data.message.trim()}`;
    }
    
    text += `\n\nPlease confirm availability.`;
    
    const waUrl = `https://wa.me/${APPOINTMENT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    
    // Update success button if it exists
    const successBtn = document.getElementById('success-wa-btn');
    if (successBtn) successBtn.href = waUrl;

    window.open(waUrl, '_blank');
  }

  // 3. Future Integrations
  if (APPOINTMENT_CONFIG.enableEmail) notifyEmail(data);
  if (APPOINTMENT_CONFIG.enableSheets) notifySheets(data);
}

// Future Notification Handlers
function notifyEmail(data) { /* logic to call backend / email service */ }
function notifySheets(data) { /* logic to append to Google Sheets */ }

const form = document.getElementById('appointment-form');
const successEl = document.getElementById('form-success');

// Set min date to today
const dateInput = document.getElementById('f-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Extract data
  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    service: formData.get('service'),
    date: formData.get('date'),
    time: formData.get('time'),
    message: formData.get('message')
  };

  const btn = document.getElementById('form-submit');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Redirecting to WhatsApp... ⏳';
  btn.disabled = true;
  btn.style.opacity = '0.8';

  // Add small delay (500ms) for better UX
  setTimeout(() => {
    handleAppointment(data);
    
    if (successEl) {
      form.style.display = 'none';
      successEl.style.display = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      form.reset();
    }
    
    // Reset button for if they come back
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 500);
});

// ─── Smooth scroll for all anchor links ───
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

// ─── Accessibility Enhancements ───
document.querySelectorAll('.trust-icon, .sc-icon, .wf-icon, .hygiene-icon, .bci-icon, .li-item > span, .brand-icon').forEach(el => {
  el.setAttribute('aria-hidden', 'true');
});

// ─── Active nav highlight on scroll ───
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(l => {
        l.classList.remove('active-nav');
        if (l.getAttribute('href') === `#${id}`) l.classList.add('active-nav');
      });
    }
  });
}, { threshold: 0.3 });
sections.forEach(s => sectionObserver.observe(s));
