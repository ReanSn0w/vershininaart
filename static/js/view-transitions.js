// Loaded synchronously in <head>: pagereveal runs before the first paint.
(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let localTransition;
  const transferKey = 'art-navigation';
  let pending = null;
  let arrival = null;
  let initialized = false;

  function route(value) {
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return null;
      const parts = url.pathname.split('/').filter(Boolean);
      const lang = parts[0] === 'en' ? parts.shift() : 'ru';
      let kind = 'other';
      if (!parts.length || (parts[0] === 'series' && parts.length === 1)) kind = 'gallery';
      else if (parts[0] === 'series' && parts.length >= 2) kind = 'work';
      else if (['about', 'cv', 'contacts'].includes(parts[0]) && parts.length === 1) kind = 'info';
      return { url, lang, kind, series: kind === 'work' ? parts[1] : null, work: parts[2] || null };
    } catch { return null; }
  }

  function readTransfer() {
    try { return JSON.parse(sessionStorage.getItem(transferKey)); } catch { return null; }
  }
  function writeTransfer(value) {
    try { sessionStorage.setItem(transferKey, JSON.stringify(value)); } catch { /* Private/disabled storage. */ }
  }
  function validContext(context) {
    const target = context && route(context.url);
    return target?.kind === 'gallery' && target.lang === root.lang &&
      Number.isFinite(context.y) && context.y >= 0;
  }
  function saveContext(context) {
    try { history.replaceState({ ...history.state, artReturn: context }, ''); } catch { /* Navigation still works. */ }
  }
  function departure(toURL, navigationType = 'push') {
    const from = route(location.href);
    const to = route(toURL);
    if (!from || !to || from.url.pathname === to.url.pathname || from.lang !== to.lang) return null;
    let context = history.state?.artReturn;
    if (from.kind === 'gallery') {
      context = { url: location.href, y: window.scrollY, selected: pending?.url || to.url.href };
    } else if (!(to.kind === 'gallery' || (from.kind === 'work' && to.kind === 'work' && from.series === to.series))) {
      context = null;
    }
    const value = {
      from: location.href, to: to.url.href, time: Date.now(), navigationType,
      context: validContext(context) ? context : null,
      direction: pending?.url === to.url.href ? pending.direction : null,
    };
    writeTransfer(value);
    return value;
  }

  function receive() {
    const value = readTransfer();
    if (!value || Date.now() - value.time > 30000 || value.to !== location.href) return null;
    const activation = window.navigation?.activation;
    const navigationType = performance.getEntriesByType('navigation')[0]?.type;
    if (activation?.navigationType === 'reload' || (!activation && navigationType === 'reload')) return null;
    const from = activation?.from?.url || document.referrer;
    const source = route(from);
    const recorded = route(value.from);
    if (!source || !recorded || source.url.pathname !== recorded.url.pathname) return null;
    return value;
  }

  function restoreGallery() {
    if (root.dataset.pageKind !== 'gallery' || !validContext(arrival?.context)) return;
    if (arrival.context.url !== location.href || arrival.navigationType === 'traverse') return;
    window.scrollTo({ top: arrival.context.y, behavior: 'instant' });
  }
  function initialize() {
    if (initialized) return;
    initialized = true;
    arrival = receive();
    const type = performance.getEntriesByType('navigation')[0]?.type;
    if (arrival) saveContext(arrival.context);
    else if (type !== 'reload' && type !== 'back_forward') saveContext(null);
    const context = history.state?.artReturn;
    const back = document.querySelector('[data-gallery-back]');
    if (back && validContext(context)) back.href = context.url;
    restoreGallery();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = route(link.href);
    if (!target || target.url.pathname === location.pathname) return;
    pending = { url: link.href, direction: link.dataset.workDirection || null };
    departure(link.href); // Fallback for browsers without pageswap.
  });
  document.addEventListener('DOMContentLoaded', initialize);

  function clearNames() {
    document.querySelectorAll('[data-transition-named]').forEach((element) => {
      element.style.removeProperty('view-transition-name');
      delete element.dataset.transitionNamed;
    });
    delete root.dataset.transition;
  }

  function settle(transition, cleanup = clearNames) {
    transition.ready.catch(() => {}); // Cancellation is normal, including BFCache.
    transition.finished.then(cleanup, cleanup);
  }

  // Same-document transitions are an enhancement; the mutation always runs.
  window.artTransitions = {
    run(update, setup, cleanup = clearNames) {
      localTransition?.skipTransition();
      if (!document.startViewTransition || reducedMotion.matches) {
        update();
        cleanup();
        return null;
      }
      setup?.();
      let updated = false;
      const apply = () => {
        if (updated) return;
        updated = true;
        update();
      };
      try {
        const transition = document.startViewTransition(apply);
        localTransition = transition;
        settle(transition, () => {
          if (localTransition !== transition) return;
          localTransition = null;
          cleanup();
        });
        transition.updateCallbackDone.catch(() => {});
        return transition;
      } catch {
        apply();
        cleanup();
        return null;
      }
    },
  };

  window.addEventListener('pageswap', (event) => {
    const destination = event.activation?.entry?.url || pending?.url;
    if (destination) departure(destination, event.activation?.navigationType || 'push');
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    settle(event.viewTransition);
  });
  window.addEventListener('pagereveal', (event) => {
    clearNames();
    initialize();
    restoreGallery();
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    settle(event.viewTransition);
  });
  window.addEventListener('pageshow', (event) => {
    pending = null;
    if (event.persisted) {
      clearNames();
      initialized = false;
      initialize();
    }
  });
})();
