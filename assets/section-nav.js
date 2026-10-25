(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.section-nav');
  if (!header || !nav) return;

  const items = [...nav.querySelectorAll('a[href^="#"]')]
    .map(link => ({ link, heading: document.getElementById(link.hash.slice(1)) }))
    .filter(item => item.heading);
  if (!items.length) return;

  let scheduled = false;
  const setActive = active => {
    const current = items.find(({ link }) => link.getAttribute('aria-current') === 'location');
    if (current === active) return;
    items.forEach(({ link }) => link.removeAttribute('aria-current'));
    if (!active) return;
    active.link.setAttribute('aria-current', 'location');

    // Scroll only the menu horizontally; never move the page or keyboard focus.
    const linkBounds = active.link.getBoundingClientRect();
    const menuBounds = nav.getBoundingClientRect();
    if (linkBounds.left < menuBounds.left) nav.scrollLeft -= menuBounds.left - linkBounds.left;
    else if (linkBounds.right > menuBounds.right) nav.scrollLeft += linkBounds.right - menuBounds.right;
  };
  const atReadingPosition = minimumOffset => {
    const threshold = Math.max(minimumOffset, parseFloat(getComputedStyle(items[0].heading).scrollMarginTop) || 0) + 2;
    let active = items[0];
    for (const item of items) {
      if (item.heading.getBoundingClientRect().top <= threshold) active = item;
    }
    return active;
  };
  const update = () => {
    scheduled = false;
    const headerBottom = header.getBoundingClientRect().bottom;
    let active = atReadingPosition(headerBottom + 24);
    // A short final section may never reach the top of the viewport.
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = items[items.length - 1];
    }
    setActive(active);
  };
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(header);
  }
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  update();
})();
