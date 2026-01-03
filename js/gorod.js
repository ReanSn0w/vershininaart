const works = [
  {
    image: "assets/images/gorod-work-1.png",
    alt: "Графическая работа Серия Город — лист 1",
    title: "СЕРИЯ ГОРОД ЛИСТ 1",
    year: "2020",
    technique: "Офорт",
    size: "20 × 29",
  },
  {
    image: "assets/images/gorod-work-2.png",
    alt: "Графическая работа Серия Город — лист 2",
    title: "СЕРИЯ ГОРОД ЛИСТ 2",
    year: "2020",
    technique: "Офорт",
    size: "20 × 29",
  },
];

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
  activeIndex = (activeIndex + 1) % works.length;
  updateView(activeIndex);
}

function showPrev() {
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
  
  surface.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0]?.clientX ?? 0;
      startY = event.touches[0]?.clientY ?? 0;
      isSwiping = false;
    },
    { passive: true }
  );
  
  surface.addEventListener(
    "touchmove",
    (event) => {
      if (!startX) return;
      const currentX = event.touches[0]?.clientX ?? 0;
      const currentY = event.touches[0]?.clientY ?? 0;
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      // Если горизонтальное движение больше вертикального, это свайп
      if (deltaX > deltaY && deltaX > 10) {
        isSwiping = true;
      }
    },
    { passive: true }
  );
  
  surface.addEventListener(
    "touchend",
    (event) => {
      if (!startX || !isSwiping) {
        startX = 0;
        startY = 0;
        return;
      }
      
      const endX = event.changedTouches[0]?.clientX ?? 0;
      const deltaX = endX - startX;
      
      if (Math.abs(deltaX) >= 40) {
        if (deltaX < 0) {
          showNext();
        } else {
          showPrev();
        }
      }
      
      startX = 0;
      startY = 0;
      isSwiping = false;
    },
    { passive: true }
  );
}

attachSwipe(imageEl);

initDots();
updateView(activeIndex);

