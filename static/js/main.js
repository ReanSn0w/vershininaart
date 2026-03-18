// Placeholder for interactive enhancements.
// For now, the layout is static to mirror the Figma slide exactly.

const nav = document.querySelector(".site-nav");
const navToggle = document.querySelector(".site-nav__toggle");
const backToTop = document.querySelector(".back-to-top");

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

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      closeNav();
    });
  });

  const mq = window.matchMedia("(min-width: 1081px)");
  const handleMediaChange = (event) => {
    if (event.matches) {
      closeNav();
    }
  };

  mq.addEventListener("change", handleMediaChange);

// Back to top
if (backToTop) {
  const toggleBackToTop = () => {
    if (window.scrollY > 200) {
      backToTop.classList.add("is-visible");
    } else {
      backToTop.classList.remove("is-visible");
    }
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
}
