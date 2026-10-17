// Loaded synchronously in <head>: pagereveal runs before the first paint.
(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let localTransition;
  const transferKey = 'art-navigation';
  let pending = null;
  let arrival = null;
  let initialized = false;
  let imageWait = null;
  const imageWaitLimit = 1800;

  // Wait on the departing page: async pagereveal handlers cannot delay snapshots.
  function cancelImageWait() {
    imageWait?.cancel();
    imageWait = null;
    delete root.dataset.navigationLoading;
  }
  function prepareImage(src) {
    const image = new Image();
    let timer;
    let complete;
    const done = new Promise((resolve) => { complete = resolve; });
    const finish = () => {
      clearTimeout(timer);
      image.onload = image.onerror = null;
      complete();
    };
    timer = setTimeout(finish, imageWaitLimit);
    image.onerror = finish;
    image.onload = () => {
      if (image.decode) image.decode().then(finish, finish);
      else finish();
    };
    image.src = src;
    return { done, cancel: finish };
  }

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
  function traversalDirection(activation) {
    if (activation?.navigationType !== 'traverse') return null;
    const current = activation.from;
    const target = activation.entry;
    try {
      const departing = JSON.parse(sessionStorage.getItem(`art-entry-${current?.key}`));
      if (target?.index < current?.index && departing?.fromKey === target.key) {
        return departing.direction === 'next' ? 'prev' : departing.direction === 'prev' ? 'next' : null;
      }
      const entering = JSON.parse(sessionStorage.getItem(`art-entry-${target?.key}`));
      if (target?.index > current?.index && entering?.fromKey === current.key) return entering.direction;
    } catch { /* Unknown history edges use a neutral transition. */ }
    return null;
  }
  function departure(toURL, navigationType = 'push', activation = null) {
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
      direction: navigationType === 'traverse' ? traversalDirection(activation) :
        pending?.url === to.url.href ? pending.direction : null,
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
    if (arrival) {
      saveContext(arrival.context);
      try { sessionStorage.removeItem(transferKey); } catch { /* Optional storage. */ }
    }
    else if (type !== 'reload' && type !== 'back_forward') saveContext(null);
    const context = history.state?.artReturn;
    const back = document.querySelector('[data-gallery-back]');
    if (back && validContext(context)) back.href = context.url;
    const activation = window.navigation?.activation;
    if (arrival?.direction && activation?.navigationType === 'push' && activation.entry?.key && activation.from?.key) {
      try {
        sessionStorage.setItem(`art-entry-${activation.entry.key}`, JSON.stringify({ fromKey: activation.from.key, direction: arrival.direction }));
      } catch { /* Optional history animation metadata. */ }
    }
    restoreGallery();
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    cancelImageWait();
    const target = route(link.href);
    if (!target || target.url.pathname === location.pathname) return;
    const intent = { url: link.href, direction: link.dataset.workDirection || null };
    const src = link.dataset.transitionImage;
    if (!src || reducedMotion.matches || !('onpageswap' in window) || !document.startViewTransition) {
      pending = intent;
      departure(link.href); // Fallback for browsers without pageswap.
      return;
    }
    event.preventDefault();
    const wait = prepareImage(src);
    imageWait = wait;
    root.dataset.navigationLoading = '';
    wait.done.then(() => {
      if (imageWait !== wait) return; // A newer click, Escape or departure superseded this one.
      imageWait = null;
      delete root.dataset.navigationLoading;
      pending = intent;
      departure(intent.url);
      location.assign(intent.url);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') cancelImageWait();
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

  function name(element, value) {
    if (!element) return;
    element.style.viewTransitionName = value;
    element.dataset.transitionNamed = '';
  }
  function visibleImage(image) {
    if (!image?.complete || !image.naturalWidth) return false;
    const rect = image.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
  }
  function sharedArtwork(value, incoming, transition) {
    if (!value) return;
    const from = route(value.from);
    const to = route(value.to);
    if (!from || !to || from.lang !== to.lang) return;
    const other = incoming ? from : to;
    let image;
    if (root.dataset.pageKind === 'gallery' && other.kind === 'work' && !other.work) {
      const card = Array.from(document.querySelectorAll('.card[data-work-id]'))
        .find((link) => new URL(link.href).pathname === other.url.pathname);
      image = card?.querySelector('img');
    } else if (root.dataset.pageKind === 'work' && root.dataset.workIndex === '0' && other.kind === 'gallery') {
      image = document.querySelector('[data-artwork-image]');
    } else return;

    const restored = root.dataset.pageKind !== 'gallery' || !validContext(value.context) ||
      Math.abs(scrollY - value.context.y) < 3;
    const ready = visibleImage(image) && restored;
    if (!incoming) value.sharedArtwork = ready;
    if (incoming && !value.sharedArtwork) return;
    if (!ready) {
      if (incoming) transition.skipTransition();
      return;
    }
    root.dataset.transition = 'artwork';
    name(image, 'artwork');
  }

  function informationSlide(value) {
    if (!value) return;
    const from = route(value.from);
    const to = route(value.to);
    if (!from || !to || from.lang !== to.lang) return;
    if (from.kind === 'gallery' && to.kind === 'info') root.dataset.transition = 'info-open';
    if (from.kind === 'info' && to.kind === 'gallery') root.dataset.transition = 'info-close';
  }

  function workSlide(value, incoming, transition) {
    if (!value) return;
    const from = route(value.from);
    const to = route(value.to);
    if (from?.kind !== 'work' || to?.kind !== 'work' || from.lang !== to.lang || from.series !== to.series) return;
    if (!['next', 'prev'].includes(value.direction)) return;
    const image = document.querySelector('[data-artwork-image]');
    const ready = visibleImage(image);
    if (!incoming) value.workSlide = ready;
    if (incoming && !value.workSlide) return;
    if (!ready) {
      if (incoming) transition.skipTransition();
      return;
    }
    root.dataset.transition = `work-${value.direction}`;
    name(image, 'work-image');
    name(document.querySelector('.series__info'), 'work-info');
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
    const value = destination ? departure(destination, event.activation?.navigationType || 'push', event.activation) : null;
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    else {
      sharedArtwork(value, false, event.viewTransition);
      informationSlide(value);
      workSlide(value, false, event.viewTransition);
    }
    if (value) writeTransfer(value);
    settle(event.viewTransition);
  });
  window.addEventListener('pagereveal', (event) => {
    clearNames();
    initialize();
    restoreGallery();
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    else {
      sharedArtwork(arrival, true, event.viewTransition);
      informationSlide(arrival);
      workSlide(arrival, true, event.viewTransition);
    }
    settle(event.viewTransition);
  });
  window.addEventListener('pagehide', () => {
    cancelImageWait();
    initialized = false;
    arrival = null;
  });
  window.addEventListener('pageshow', () => {
    pending = null;
    initialize();
  });
})();
