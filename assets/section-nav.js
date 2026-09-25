(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.section-nav');
  if (!header || !nav) return;

  const getItems = element => element
    ? [...element.querySelectorAll('a[href^="#"]')]
      .map(link => ({ link, heading: document.getElementById(link.hash.slice(1)) }))
      .filter(item => item.heading)
    : [];
  const items = getItems(nav);
  const yearNav = document.querySelector('.publication-years');
  const years = getItems(yearNav);
  if (!items.length) return;

  let scheduled = false;
  const setActive = (menu, entries, active) => {
    if (!menu) return;
    const current = entries.find(({ link }) => link.getAttribute('aria-current') === 'location');
    if (current === active) return;
    entries.forEach(({ link }) => link.removeAttribute('aria-current'));
    if (!active) return;
    active.link.setAttribute('aria-current', 'location');

    // Scroll only the menu horizontally; never move the page or keyboard focus.
    const linkBounds = active.link.getBoundingClientRect();
    const menuBounds = menu.getBoundingClientRect();
    if (linkBounds.left < menuBounds.left) menu.scrollLeft -= menuBounds.left - linkBounds.left;
    else if (linkBounds.right > menuBounds.right) menu.scrollLeft += linkBounds.right - menuBounds.right;
  };
  const atReadingPosition = (entries, minimumOffset) => {
    const threshold = Math.max(minimumOffset, parseFloat(getComputedStyle(entries[0].heading).scrollMarginTop) || 0) + 2;
    let active = entries[0];
    for (const item of entries) {
      if (item.heading.getBoundingClientRect().top <= threshold) active = item;
    }
    return active;
  };
  const update = () => {
    scheduled = false;
    const headerBottom = header.getBoundingClientRect().bottom;
    let active = atReadingPosition(items, headerBottom + 24);
    let focusedYear;
    // A short final section may never reach the top of the viewport.
    if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      // A final-year anchor can also land at the page bottom. Preserve that explicit destination.
      focusedYear = years.find(({ heading }) => {
        const top = heading.getBoundingClientRect().top;
        return heading === document.activeElement && top >= headerBottom && top < window.innerHeight;
      });
      active = focusedYear
        ? items.find(({ link }) => link.hash === '#publications') || active
        : items[items.length - 1];
    }
    setActive(nav, items, active);
    const activeYear = years.length && active.link.hash === '#publications'
      ? focusedYear || atReadingPosition(years, headerBottom + yearNav.getBoundingClientRect().height + 24)
      : undefined;
    setActive(yearNav, years, activeYear);
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
    [header, yearNav].filter(Boolean).forEach(el => observer.observe(el));
  }
  if (document.fonts) document.fonts.ready.then(scheduleUpdate);
  update();
})();
