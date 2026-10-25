(() => {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const current = () => root.dataset.theme || (systemDark.matches ? 'dark' : 'light');
  const render = () => {
    const theme = current();
    root.dataset.themeCurrent = theme;
    const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    render();
  });
  // Without a saved choice, keep following the system setting as it changes.
  systemDark.addEventListener('change', render);
  render();
})();
