(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const sectionNav = document.querySelector('.section-nav');

  // On phones, slide the header away while reading down and bring it back on any upward scroll.
  const compact = window.matchMedia('(max-width: 680px)');
  let lastScrollY = window.scrollY;
  const setHeaderHidden = hidden => {
    header.classList.toggle('is-hidden', hidden);
  };
  const updateHeaderAppearance = () => {
    if (!header) return;
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (!compact.matches || header.querySelector(':focus-visible') || y <= header.offsetHeight) {
      setHeaderHidden(false);
    } else if (Math.abs(y - lastScrollY) > 6) {
      setHeaderHidden(y > lastScrollY);
    } else {
      return;
    }
    lastScrollY = y;
  };
  // Keyboard users tabbing into the hidden header should always see it.
  if (header) header.addEventListener('focusin', () => {
    if (header.querySelector(':focus-visible')) setHeaderHidden(false);
  });
  compact.addEventListener('change', updateHeaderAppearance);
  window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
  window.addEventListener('pageshow', updateHeaderAppearance);
  updateHeaderAppearance();

  // Show which edge of the section menu still hides links on narrow screens.
  const updateNavFade = () => {
    if (!sectionNav) return;
    const hidden = sectionNav.scrollWidth - sectionNav.clientWidth;
    sectionNav.classList.toggle('fade-start', sectionNav.scrollLeft > 1);
    sectionNav.classList.toggle('fade-end', sectionNav.scrollLeft < hidden - 1);
  };
  if (sectionNav) sectionNav.addEventListener('scroll', updateNavFade, { passive: true });

  const updateLayout = () => {
    updateNavFade();
    if (header) root.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
  };

  // Measure actual bar heights so anchor headings remain visible when text is enlarged.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(updateLayout);
    if (header) observer.observe(header);
  }
  window.addEventListener('resize', updateLayout);
  window.addEventListener('pageshow', updateLayout);
  window.addEventListener('load', updateLayout);
  if (document.fonts) document.fonts.ready.then(updateLayout);
  updateLayout();

  const revealTargets = [...document.querySelectorAll('.content-section > *')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    // Leave anything already on screen alone so the first paint never flickers.
    revealTargets
      .filter(el => el.getBoundingClientRect().top > window.innerHeight)
      .forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
  }

  const status = document.getElementById('copy-status');
  document.querySelectorAll('.copy-email').forEach(button => {
    const fallback = button.closest('.contact-item').querySelector('.copy-fallback');
    let resetTimer;
    button.hidden = false;
    button.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      button.disabled = true;
      if (status) status.textContent = '';
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.email);
        button.setAttribute('data-copied', '');
        button.title = 'Copied';
        fallback.hidden = true;
        if (status) status.textContent = `${button.dataset.email} copied to clipboard.`;
        resetTimer = setTimeout(() => {
          button.removeAttribute('data-copied');
          button.title = 'Copy email address';
        }, 2000);
      } catch {
        button.removeAttribute('data-copied');
        button.title = 'Copy email address';
        fallback.hidden = false;
        const input = fallback.querySelector('input');
        input.focus();
        input.select();
        if (status) status.textContent = 'Automatic copying is unavailable. The email address is selected for manual copying.';
      } finally {
        button.disabled = false;
      }
    });
  });

})();
