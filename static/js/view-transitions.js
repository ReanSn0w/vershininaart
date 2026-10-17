// Loaded synchronously in <head>: pagereveal runs before the first paint.
(() => {
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let localTransition;

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
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    settle(event.viewTransition);
  });
  window.addEventListener('pagereveal', (event) => {
    clearNames();
    if (!event.viewTransition) return;
    if (reducedMotion.matches) event.viewTransition.skipTransition();
    settle(event.viewTransition);
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) clearNames();
  });
})();
