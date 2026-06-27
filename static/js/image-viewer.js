const viewerOpenButtons = document.querySelectorAll(".artwork-open");
const viewerImageSource = document.querySelector("[data-artwork-image]");

if (viewerOpenButtons.length && viewerImageSource) {
  const labels = document.documentElement.lang === "ru"
    ? {
        viewer: "Просмотр работы",
        zoomOut: "Уменьшить",
        reset: "Сбросить масштаб",
        zoomIn: "Увеличить",
        close: "Закрыть",
      }
    : {
        viewer: "Artwork viewer",
        zoomOut: "Zoom out",
        reset: "Reset zoom",
        zoomIn: "Zoom in",
        close: "Close",
      };
  const viewer = document.createElement("div");
  viewer.className = "image-viewer";
  viewer.setAttribute("role", "dialog");
  viewer.setAttribute("aria-modal", "true");
  viewer.setAttribute("aria-label", labels.viewer);
  viewer.innerHTML = `
    <div class="image-viewer__stage" data-image-viewer-stage>
      <img class="image-viewer__image" alt="" data-image-viewer-image />
    </div>
    <div class="image-viewer__controls">
      <button class="image-viewer__button" type="button" aria-label="${labels.zoomOut}" data-image-viewer-zoom-out>-</button>
      <button class="image-viewer__button" type="button" aria-label="${labels.reset}" data-image-viewer-reset>1:1</button>
      <button class="image-viewer__button" type="button" aria-label="${labels.zoomIn}" data-image-viewer-zoom-in>+</button>
      <button class="image-viewer__button" type="button" aria-label="${labels.close}" data-image-viewer-close>x</button>
    </div>
  `;
  document.body.appendChild(viewer);

  const stage = viewer.querySelector("[data-image-viewer-stage]");
  const image = viewer.querySelector("[data-image-viewer-image]");
  const zoomInButton = viewer.querySelector("[data-image-viewer-zoom-in]");
  const zoomOutButton = viewer.querySelector("[data-image-viewer-zoom-out]");
  const resetButton = viewer.querySelector("[data-image-viewer-reset]");
  const closeButton = viewer.querySelector("[data-image-viewer-close]");

  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let lastPointer = null;
  let pinchStartDistance = 0;
  let pinchStartZoom = 1;
  const activePointers = new Map();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyTransform() {
    image.style.setProperty("--zoom", zoom);
    image.style.setProperty("--pan-x", `${panX}px`);
    image.style.setProperty("--pan-y", `${panY}px`);
  }

  function resetView() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function setZoom(nextZoom) {
    zoom = clamp(nextZoom, 1, 5);
    if (zoom === 1) {
      panX = 0;
      panY = 0;
    }
    applyTransform();
  }

  function openViewer() {
    image.src = viewerImageSource.currentSrc || viewerImageSource.src;
    image.alt = viewerImageSource.alt || "";
    resetView();
    viewer.classList.add("is-open");
    document.body.classList.add("viewer-open");
    closeButton.focus();
  }

  function closeViewer() {
    viewer.classList.remove("is-open");
    document.body.classList.remove("viewer-open");
    activePointers.clear();
    lastPointer = null;
  }

  function getPointerDistance() {
    const points = Array.from(activePointers.values());
    if (points.length < 2) return 0;
    const [first, second] = points;
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  }

  viewerOpenButtons.forEach((button) => {
    button.addEventListener("click", openViewer);
  });

  zoomInButton.addEventListener("click", () => setZoom(zoom + 0.5));
  zoomOutButton.addEventListener("click", () => setZoom(zoom - 0.5));
  resetButton.addEventListener("click", resetView);
  closeButton.addEventListener("click", closeViewer);

  viewer.addEventListener("click", (event) => {
    if (event.target === stage && zoom === 1) closeViewer();
  });

  viewer.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? -0.25 : 0.25;
    setZoom(zoom + direction);
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    activePointers.set(event.pointerId, event);
    stage.setPointerCapture(event.pointerId);
    stage.classList.add("is-dragging");

    if (activePointers.size === 1) {
      lastPointer = event;
    } else if (activePointers.size === 2) {
      pinchStartDistance = getPointerDistance();
      pinchStartZoom = zoom;
      lastPointer = null;
    }
  });

  stage.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, event);

    if (activePointers.size === 2) {
      const distance = getPointerDistance();
      if (pinchStartDistance > 0) {
        setZoom(pinchStartZoom * (distance / pinchStartDistance));
      }
      return;
    }

    if (!lastPointer || zoom === 1) {
      lastPointer = event;
      return;
    }

    panX += event.clientX - lastPointer.clientX;
    panY += event.clientY - lastPointer.clientY;
    lastPointer = event;
    applyTransform();
  });

  function releasePointer(event) {
    activePointers.delete(event.pointerId);
    if (activePointers.size === 0) {
      stage.classList.remove("is-dragging");
      lastPointer = null;
    } else if (activePointers.size === 1) {
      lastPointer = Array.from(activePointers.values())[0];
    }
  }

  stage.addEventListener("pointerup", releasePointer);
  stage.addEventListener("pointercancel", releasePointer);

  document.addEventListener("keydown", (event) => {
    if (!viewer.classList.contains("is-open")) return;

    if (event.key === "Escape") closeViewer();
    if (event.key === "+" || event.key === "=") setZoom(zoom + 0.5);
    if (event.key === "-") setZoom(zoom - 0.5);
    if (event.key === "0") resetView();
  });
}
