// Run before the page is parsed so a refresh does not jump to a saved anchor.
(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (!navigation || navigation.type !== 'reload') return;

  const previousRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  if (location.hash) {
    history.replaceState(history.state, '', location.pathname + location.search);
  }
  window.addEventListener('pageshow', () => {
    // The browser can restore persisted scroll state after the pageshow event.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      history.scrollRestoration = previousRestoration;
    });
  }, { once: true });
})();
