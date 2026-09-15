(() => {
  'use strict';

  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  const openGift = document.querySelector('#openGift');
  const opening = document.querySelector('.opening');
  const progress = document.querySelector('.progress span');
  const petalsLayer = document.querySelector('.petals');
  const cursorGlow = document.querySelector('.cursor-glow');

  const unlockPage = () => {
    body.classList.remove('is-locked');
    body.classList.add('is-ready');
    opening?.setAttribute('aria-hidden', 'true');
  };

  const createBurst = (originX, originY, amount = 24) => {
    const palette = ['#f08b98', '#f4b4ba', '#e5b865', '#fff1dc', '#c75f70'];
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < amount; index += 1) {
      const heart = document.createElement('span');
      const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.35;
      const distance = 90 + Math.random() * 210;
      heart.className = 'heart-burst';
      heart.textContent = Math.random() > 0.25 ? '♥' : '✦';
      heart.style.left = `${originX}px`;
      heart.style.top = `${originY}px`;
      heart.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      heart.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      heart.style.setProperty('--r', `${Math.round(Math.random() * 180 - 90)}deg`);
      heart.style.setProperty('--size', `${14 + Math.random() * 24}px`);
      heart.style.setProperty('--color', palette[Math.floor(Math.random() * palette.length)]);
      fragment.appendChild(heart);
      heart.addEventListener('animationend', () => heart.remove(), { once: true });
    }

    document.body.appendChild(fragment);
  };

  if (openGift && opening) {
    openGift.focus({ preventScroll: true });
    openGift.addEventListener('click', () => {
      openGift.disabled = true;
      opening.classList.add('is-opening');
      const rect = openGift.getBoundingClientRect();
      if (!reduceMotion) {
        createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 32);
      }

      window.setTimeout(() => {
        opening.classList.add('is-open');
        unlockPage();
        document.querySelector('.hero__content')?.focus?.({ preventScroll: true });
      }, reduceMotion ? 0 : 720);
    });
  } else {
    unlockPage();
  }

  // Безопасный запасной выход: интерфейс никогда не останется заблокированным.
  window.setTimeout(() => {
    if (!openGift || !opening) unlockPage();
  }, 1500);

  document.querySelectorAll('[data-scroll-to]').forEach((control) => {
    control.addEventListener('click', () => {
      const target = document.getElementById(control.dataset.scrollTo);
      target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  let scrollTicking = false;
  const updateScrollEffects = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;

    if (!reduceMotion) {
      const offset = Math.min(window.scrollY, window.innerHeight) * 0.055;
      document.querySelectorAll('.parallax').forEach((element, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        element.style.setProperty('--scroll-y', `${offset * direction}px`);
      });
    }
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  if (finePointer && !reduceMotion) {
    window.addEventListener('pointermove', (event) => {
      if (cursorGlow) {
        cursorGlow.style.left = `${event.clientX}px`;
        cursorGlow.style.top = `${event.clientY}px`;
      }
      const normalizedX = event.clientX / window.innerWidth - 0.5;
      const normalizedY = event.clientY / window.innerHeight - 0.5;
      document.querySelectorAll('.parallax').forEach((element) => {
        const depth = Number.parseFloat(element.dataset.depth || '0.08');
        element.style.setProperty('--pointer-x', `${normalizedX * depth * 110}px`);
        element.style.setProperty('--pointer-y', `${normalizedY * depth * 80}px`);
      });
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', () => {
      if (cursorGlow) cursorGlow.style.opacity = '0';
    });
    document.documentElement.addEventListener('mouseenter', () => {
      if (cursorGlow) cursorGlow.style.opacity = '.25';
    });
  }

  if (petalsLayer && !reduceMotion) {
    const fragment = document.createDocumentFragment();
    const petalCount = window.innerWidth < 700 ? 12 : 20;
    for (let index = 0; index < petalCount; index += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.setProperty('--duration', `${10 + Math.random() * 12}s`);
      petal.style.setProperty('--delay', `${Math.random() * -20}s`);
      petal.style.setProperty('--drift', `${Math.round(Math.random() * 220 - 110)}px`);
      petal.style.setProperty('--turn', `${Math.round(420 + Math.random() * 720)}deg`);
      petal.style.transform = `scale(${0.65 + Math.random() * 0.8})`;
      fragment.appendChild(petal);
    }
    petalsLayer.appendChild(fragment);
  }

  const galleryButtons = [...document.querySelectorAll('.photo-card')];
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('figcaption');
  const lightboxCount = lightbox?.querySelector('.lightbox__count');
  const closeButton = lightbox?.querySelector('.lightbox__close');
  const previousButton = lightbox?.querySelector('.lightbox__nav--prev');
  const nextButton = lightbox?.querySelector('.lightbox__nav--next');
  let activePhoto = 0;
  let previousFocus = null;
  let touchStartX = 0;

  const renderPhoto = (index, animate = true) => {
    if (!lightboxImage || galleryButtons.length === 0) return;
    activePhoto = (index + galleryButtons.length) % galleryButtons.length;
    const source = galleryButtons[activePhoto];
    if (animate) lightboxImage.classList.add('is-changing');

    const applyImage = () => {
      lightboxImage.src = source.dataset.full || '';
      lightboxImage.alt = source.querySelector('img')?.alt || 'Семейная фотография';
      if (lightboxCaption) lightboxCaption.textContent = source.dataset.caption || '';
      if (lightboxCount) lightboxCount.textContent = `${activePhoto + 1} / ${galleryButtons.length}`;
      window.setTimeout(() => lightboxImage.classList.remove('is-changing'), 60);
    };
    window.setTimeout(applyImage, animate && !reduceMotion ? 150 : 0);
  };

  const openLightbox = (index, trigger) => {
    if (!lightbox) return;
    previousFocus = trigger;
    renderPhoto(index, false);
    lightbox.classList.add('is-active');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox?.classList.contains('is-active')) return;
    lightbox.classList.remove('is-active');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('is-locked');
    previousFocus?.focus?.();
  };

  galleryButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index, button)));
  closeButton?.addEventListener('click', closeLightbox);
  previousButton?.addEventListener('click', () => renderPhoto(activePhoto - 1));
  nextButton?.addEventListener('click', () => renderPhoto(activePhoto + 1));
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox?.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  lightbox?.addEventListener('touchend', (event) => {
    const delta = (event.changedTouches[0]?.clientX || 0) - touchStartX;
    if (Math.abs(delta) < 45) return;
    renderPhoto(activePhoto + (delta < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('is-active')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') renderPhoto(activePhoto - 1);
    if (event.key === 'ArrowRight') renderPhoto(activePhoto + 1);
    if (event.key === 'Tab') {
      const controls = [closeButton, previousButton, nextButton].filter(Boolean);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const sendLove = document.querySelector('#sendLove');
  const loveNote = document.querySelector('#loveNote');
  let loveClicks = 0;
  sendLove?.addEventListener('click', () => {
    const rect = sendLove.getBoundingClientRect();
    createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, window.innerWidth < 600 ? 34 : 56);
    loveClicks += 1;
    const notes = [
      'Для тебя — вся моя любовь ❤️',
      'И ещё миллион объятий!',
      'Пусть это желание обязательно сбудется ✨',
      'С Днём рождения, мама!'
    ];
    if (loveNote) loveNote.textContent = notes[Math.min(loveClicks - 1, notes.length - 1)];
  });

  const canvas = document.querySelector('.sparkles');
  if (canvas && !reduceMotion) {
    const context = canvas.getContext('2d', { alpha: true });
    if (context) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let particles = [];

      const resizeCanvas = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const count = Math.min(48, Math.max(20, Math.round(width / 30)));
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.6 + Math.random() * 1.5,
          speed: 0.08 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
          gold: Math.random() > 0.55
        }));
      };

      const draw = (time) => {
        context.clearRect(0, 0, width, height);
        particles.forEach((particle) => {
          particle.y -= particle.speed;
          if (particle.y < -5) {
            particle.y = height + 5;
            particle.x = Math.random() * width;
          }
          const alpha = 0.18 + (Math.sin(time * 0.0015 + particle.phase) + 1) * 0.16;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle = particle.gold ? `rgba(203,151,75,${alpha})` : `rgba(197,96,112,${alpha})`;
          context.fill();
        });
        window.requestAnimationFrame(draw);
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.requestAnimationFrame(draw);
    }
  }
})();
