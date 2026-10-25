(() => {
  const section = document.querySelector('.publications');
  const filter = section?.querySelector('.publication-filter');
  if (!filter || !section.querySelector('.publication.is-selected')) return;

  const list = section.querySelector('.publication-list');
  const toggles = [...filter.querySelectorAll('button[data-view]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const FADE_MS = 150;
  let fadeTimer;

  // Size and place the sliding thumb under the pressed option.
  const placeThumb = () => {
    const pressed = toggles.find(button => button.getAttribute('aria-pressed') === 'true');
    if (!pressed || !pressed.offsetWidth) return;
    filter.style.setProperty('--thumb-x', `${pressed.offsetLeft}px`);
    filter.style.setProperty('--thumb-width', `${pressed.offsetWidth}px`);
    filter.classList.add('has-thumb');
  };
  const setPressed = view => {
    toggles.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === view)));
    placeThumb();
  };

  // Fade the list out, swap views, then fade back in. `then` runs once the new view is in place.
  const switchView = (view, then) => {
    setPressed(view);
    clearTimeout(fadeTimer);
    if (reducedMotion.matches) {
      section.dataset.view = view;
      then?.();
      return;
    }
    list.classList.add('is-switching', 'is-fading');
    fadeTimer = setTimeout(() => {
      section.dataset.view = view;
      then?.();
      list.classList.remove('is-fading');
      fadeTimer = setTimeout(() => list.classList.remove('is-switching'), FADE_MS);
    }, FADE_MS);
  };

  toggles.forEach(button => button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') !== 'true') switchView(button.dataset.view);
  }));
  // The list length changes under the reader, so return to the top of the section.
  section.querySelectorAll('.publication-more button').forEach(more => more.addEventListener('click', () => {
    switchView(more.dataset.view, () => {
      document.getElementById('publications').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      toggles.find(button => button.dataset.view === more.dataset.view)?.focus({ preventScroll: true });
    });
  }));

  // Without JavaScript every paper stays visible; with it, start on the curated list.
  filter.hidden = false;
  section.classList.add('is-filterable');
  section.dataset.view = 'selected';
  setPressed('selected');
  // Button widths change with font loading and text size, so keep the thumb measured.
  if ('ResizeObserver' in window) new ResizeObserver(placeThumb).observe(filter);
  if (document.fonts) document.fonts.ready.then(placeThumb);
  // Enable the slide only after the first placement so the thumb never animates in.
  requestAnimationFrame(() => requestAnimationFrame(() => filter.classList.add('is-ready')));
})();
