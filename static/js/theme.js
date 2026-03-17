const THEME_BUTTONS = document.querySelectorAll(".theme-toggle");
const THEME_ASSETS = {
  dark: {
    icon: "/img/btn_light.svg",
    label: "Включить светлую тему",
  },
  light: {
    icon: "/img/btn_dark.svg",
    label: "Включить тёмную тему",
  },
};

function applyTheme(nextTheme) {
  const theme = nextTheme === "light" ? "light" : "dark";
  document.body.dataset.theme = theme;

  THEME_BUTTONS.forEach((button) => {
    const icon = button.querySelector("img");
    if (!icon) return;
    icon.src = THEME_ASSETS[theme].icon;
    button.setAttribute("aria-label", THEME_ASSETS[theme].label);
  });

  localStorage.setItem("artist-theme", theme);
}

function toggleTheme() {
  const current = document.body.dataset.theme || "dark";
  const nextTheme = current === "light" ? "dark" : "light";
  applyTheme(nextTheme);
}

if (THEME_BUTTONS.length) {
  THEME_BUTTONS.forEach((button) => {
    button.addEventListener("click", toggleTheme);
  });

  const savedTheme = localStorage.getItem("artist-theme");
  applyTheme(savedTheme || "dark");
}
