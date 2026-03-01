(() => {
  const $ = (s) => document.querySelector(s);

  // Year
  const yr = $("#yr");
  if (yr) yr.textContent = new Date().getFullYear();

  // Drawer nav
  const menuBtn = $("#menuBtn");
  const drawer = $("#mobileDrawer");
  const overlay = $("#drawerOverlay");
  const closeBtn = $("#drawerClose");

  const open = () => {
    drawer?.classList.add("is-open");
    drawer?.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    menuBtn?.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  };

  const close = () => {
    drawer?.classList.remove("is-open");
    drawer?.setAttribute("aria-hidden", "true");
    if (overlay) overlay.hidden = true;
    menuBtn?.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  };

  if (menuBtn && drawer && overlay && closeBtn) {
    menuBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  // Bottom nav "active" (auto)
  const page = document.body.getAttribute("data-page") || "";
  document.querySelectorAll(".bottom-nav__item").forEach(a => a.classList.remove("is-active"));
  if (page === "buyers") {
    document.querySelector('.bottom-nav__item[data-nav="buyers"]')?.classList.add("is-active");
  } else {
    document.querySelector('.bottom-nav__item[data-nav="home"]')?.classList.add("is-active");
  }
})();
