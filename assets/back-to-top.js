(() => {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  const updateVisibility = () => {
    button.hidden = window.scrollY <= 300;
  };

  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('pageshow', updateVisibility);
  updateVisibility();

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
    });
  });
})();
