// === Переменные ===
const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".site-nav__toggle");
const backToTop = document.querySelector(".back-to-top");
const navLinks = document.querySelectorAll('.site-nav__link[href^="#"]');
const sections = document.querySelectorAll(".slide[id]");

// === Функции управления меню ===

function closeNav() {
  if (!nav || !navToggle) return;
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Открыть меню");
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeyDown);
}

function openNav() {
  if (!nav || !navToggle) return;
  nav.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Закрыть меню");
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeyDown);
}

function handleDocumentClick(event) {
  if (!nav || !navToggle) return;
  if (nav.contains(event.target) || navToggle.contains(event.target)) return;
  closeNav();
}

function handleKeyDown(event) {
  if (event.key === "Escape") {
    closeNav();
  }
}

// === Функции активных ссылок (Scroll Spy) ===

/**
 * Устанавливает активный класс для ссылки в навигации
 * @param {string} id - ID секции без решетки
 */
function setActiveNavLink(id) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("site-nav__link--active", isActive);
  });
}

/**
 * Инициализация отслеживания прокрутки
 */
function initScrollSpy() {
  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    // Зона срабатывания: полоса от 15% до 25% высоты вьюпорта сверху
    rootMargin: "-15% 0px -75% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNavLink(entry.target.id);
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

// === Инициализация обработчиков ===

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    nav.classList.contains("is-open") ? closeNav() : openNav();
  });

  // Обработка кликов по ссылкам (закрытие меню + мгновенная активация класса)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        setActiveNavLink(href.slice(1));
      }
    });
  });

  // Закрытие мобильного меню при ресайзе экрана
  const mq = window.matchMedia("(min-width: 1081px)");
  mq.addEventListener("change", (event) => {
    if (event.matches) closeNav();
  });
}

// Back to top
if (backToTop) {
  const toggleBackToTop = () => {
    if (window.scrollY > 200) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Запуск Scroll Spy
initScrollSpy();
