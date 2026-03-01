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

  // Bottom nav active state (page-based default)
  const page = document.body.getAttribute("data-page") || "";
  const allBottom = document.querySelectorAll(".bottom-nav__item");
  allBottom.forEach(a => a.classList.remove("is-active"));

  const setActive = (key) => {
    allBottom.forEach(a => a.classList.remove("is-active"));
    document.querySelector(`.bottom-nav__item[data-nav="${key}"]`)?.classList.add("is-active");
  };

  if (page === "buyers") setActive("buyers");
  else setActive("home");

  // Premium: highlight Submit when #submit is in view (home only)
  if (page === "home") {
    const submitEl = document.getElementById("submit");
    if (submitEl && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          const inView = entries.some(e => e.isIntersecting);
          setActive(inView ? "submit" : "home");
        },
        { threshold: 0.35 }
      );
      io.observe(submitEl);
    }
  }

  // Premium: close drawer after tapping a drawer link
  drawer?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });
})();
