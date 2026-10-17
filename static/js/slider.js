// A swipe follows the same link as an arrow. The browser owns navigation/history.
(() => {
  const surface = document.querySelector('.series__stage');
  if (!surface || !surface.querySelector('[data-work-direction]')) return;
  let start = null;
  let horizontal = false;
  let navigating = false;
  let suppressClickUntil = 0;
  let unlockTimer;

  function resetGesture() {
    start = null;
    horizontal = false;
  }
  function unlock() {
    navigating = false;
    clearTimeout(unlockTimer);
    resetGesture();
  }
  window.addEventListener('pageshow', unlock);
  window.navigation?.addEventListener('navigateerror', unlock);

  surface.addEventListener('touchstart', (event) => {
    resetGesture();
    if (navigating || event.touches.length !== 1 || document.body.classList.contains('viewer-open')) return;
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  surface.addEventListener('touchmove', (event) => {
    if (!start) return;
    if (event.touches.length !== 1) return resetGesture();
    const dx = Math.abs(event.touches[0].clientX - start.x);
    const dy = Math.abs(event.touches[0].clientY - start.y);
    // Once vertical scrolling wins, this gesture cannot become a page turn.
    if (dy > 10 && dy >= dx) return resetGesture();
    horizontal = dx > dy && dx > 10;
  }, { passive: true });

  surface.addEventListener('touchend', (event) => {
    if (!start || !horizontal || navigating || document.body.classList.contains('viewer-open')) return resetGesture();
    const point = event.changedTouches[0];
    const dx = point ? point.clientX - start.x : 0;
    const dy = point ? point.clientY - start.y : 0;
    resetGesture();
    if (Math.abs(dx) < (window.innerWidth < 720 ? 25 : 40) || Math.abs(dx) <= Math.abs(dy)) return;
    const link = surface.querySelector(`[data-work-direction="${dx < 0 ? 'next' : 'prev'}"]`);
    if (!link) return;
    navigating = true;
    // link.click() preserves the common click/transition handling and URL semantics.
    link.click();
    suppressClickUntil = Date.now() + 750;
    // Also release the guard if a browser/user cancels the load.
    unlockTimer = setTimeout(unlock, 2000);
  }, { passive: true });
  surface.addEventListener('touchcancel', resetGesture, { passive: true });
  surface.addEventListener('click', (event) => {
    if (Date.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
