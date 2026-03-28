/**
 * main.js
 * ScholarSetu — Landing Page JavaScript
 *
 * Modules:
 *  1. Scroll Reveal
 *  2. Navbar Scroll Effect
 *  3. Counter Animation
 */

document.addEventListener("DOMContentLoaded", function () {

  /* ════════════════════════════
     1. SCROLL REVEAL
  ════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));


  /* ════════════════════════════
     2. NAVBAR SCROLL EFFECT
  ════════════════════════════ */
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  });


  /* ════════════════════════════
     3. COUNTER ANIMATION
  ════════════════════════════ */
  const counters = document.querySelectorAll('[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el = e.target;
      const target = +el.dataset.count;
      const duration = 1400;
      const start = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => countObserver.observe(c));

});
