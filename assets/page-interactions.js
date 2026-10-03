(() => {
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const yearNav = document.querySelector('.publication-years');

  const updateHeaderAppearance = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
  window.addEventListener('pageshow', updateHeaderAppearance);
  updateHeaderAppearance();

  const updateLayout = () => {
    if (header) root.style.setProperty('--site-header-height', `${header.getBoundingClientRect().height}px`);
    if (yearNav) root.style.setProperty('--year-nav-height', `${yearNav.getBoundingClientRect().height}px`);
  };

  // Measure actual bar heights so anchor headings remain visible when text is enlarged.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(updateLayout);
    [header, yearNav].filter(Boolean).forEach(el => observer.observe(el));
  }
  window.addEventListener('resize', updateLayout);
  window.addEventListener('pageshow', updateLayout);
  window.addEventListener('load', updateLayout);
  if (document.fonts) document.fonts.ready.then(updateLayout);
  updateLayout();

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

  document.querySelectorAll('.tldr-toggle').forEach(button => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;

    let previewTimer;
    const isOpen = () => button.getAttribute('aria-expanded') === 'true';

    const showPreview = () => {
      if (isOpen()) return;
      clearTimeout(previewTimer);
      panel.hidden = false;
      panel.classList.add('is-preview');
      panel.classList.remove('is-open');
    };

    const hidePreview = () => {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => {
        if (isOpen()) return;
        panel.hidden = true;
        panel.classList.remove('is-preview');
      }, 100);
    };

    const openPanel = () => {
      clearTimeout(previewTimer);
      button.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      panel.classList.remove('is-preview');
      panel.classList.add('is-open');
    };

    const closePanel = () => {
      clearTimeout(previewTimer);
      button.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      panel.classList.remove('is-preview', 'is-open');
    };

    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') showPreview();
    });
    button.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse') hidePreview();
    });
    panel.addEventListener('pointerenter', () => clearTimeout(previewTimer));
    panel.addEventListener('pointerleave', hidePreview);
    button.addEventListener('focus', showPreview);
    button.addEventListener('blur', hidePreview);
    button.addEventListener('click', () => {
      if (isOpen()) closePanel();
      else openPanel();
    });
    button.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !isOpen()) return;
      event.preventDefault();
      closePanel();
    });
  });
})();
