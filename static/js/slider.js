const imageEl = document.querySelector("[data-artwork-image]");
const navPrev = document.querySelector(".nav--prev");
const navNext = document.querySelector(".nav--next");
const stage = document.querySelector(".series__stage");
const dotsContainer = document.querySelector("[data-slider-dots]");
const infoFields = {
  title: document.querySelector('[data-meta="title"]'),
  year: document.querySelector('[data-meta="year"]'),
  technique: document.querySelector('[data-meta="technique"]'),
  size: document.querySelector('[data-meta="size"]'),
  edition: document.querySelector('[data-meta="edition"]'),
};

let activeIndex = 0;

function runAnimation(element) {
  if (!element) return;
  element.classList.remove("is-animating");
  void element.offsetWidth;
  element.classList.add("is-animating");
}

function updateView(index) {
  const current = works[index];
  if (!current || !imageEl) return;

  imageEl.src = current.image;
  imageEl.alt = current.alt;
  runAnimation(imageEl);

  Object.entries(infoFields).forEach(([key, element]) => {
    if (!element) return;
    element.textContent = current[key] || "";
  });

  updateDots(index);
}

function updateDots(index) {
  if (!dotsContainer) return;
  const dots = dotsContainer.querySelectorAll(".slider-dot");
  dots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function initDots() {
  if (!dotsContainer || works.length <= 1) return;
  dotsContainer.innerHTML = "";
  works.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    if (index === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", `Перейти к изображению ${index + 1}`);
    dot.addEventListener("click", () => {
      activeIndex = index;
      updateView(activeIndex);
    });
    dotsContainer.appendChild(dot);
  });
}

function showNext() {
  console.log("showNext вызвана, activeIndex:", activeIndex, "→", (activeIndex + 1) % works.length);
  activeIndex = (activeIndex + 1) % works.length;
  updateView(activeIndex);
}

function showPrev() {
  console.log("showPrev вызвана, activeIndex:", activeIndex, "→", (activeIndex - 1 + works.length) % works.length);
  activeIndex = (activeIndex - 1 + works.length) % works.length;
  updateView(activeIndex);
}

navNext?.addEventListener("click", showNext);
navPrev?.addEventListener("click", showPrev);

function attachSwipe(surface) {
  if (!surface || works.length <= 1) return;
  let startX = 0;
  let startY = 0;
  let isSwiping = false;
  let isStarted = false;

  surface.addEventListener("touchstart", (event) => {
    startX = event.touches[0]?.clientX ?? 0;
    startY = event.touches[0]?.clientY ?? 0;
    isSwiping = false;
    isStarted = true;  // ✅
  }, { passive: true });

  surface.addEventListener("touchmove", (event) => {
    if (!isStarted) return;
    const currentX = event.touches[0]?.clientX ?? 0;
    const currentY = event.touches[0]?.clientY ?? 0;
    const deltaX = Math.abs(currentX - startX);
    const deltaY = Math.abs(currentY - startY);

    if (deltaX > deltaY && deltaX > 10) {
      isSwiping = true;
    }
  }, { passive: true });

  surface.addEventListener("touchend", (event) => {
    if (!isStarted || !isSwiping) {
      isStarted = false;
      startX = 0;
      startY = 0;
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? 0;
    const deltaX = endX - startX;

    const minSwipeDistance = window.innerWidth < 720 ? 25 : 40;
    if (Math.abs(deltaX) >= minSwipeDistance) {
      if (deltaX < 0) {
        showNext();
      } else {
        showPrev();
      }
    }

    isStarted = false;
    startX = 0;
    startY = 0;
    isSwiping = false;
  }, { passive: true });
}

function initSlider() {
  attachSwipe(stage);
  initDots();
  updateView(activeIndex);
}
