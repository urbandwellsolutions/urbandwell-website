(() => {
  const DEAL_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0oscvm/";
  const qs = (s) => document.querySelector(s);

  // Mobile nav
  const menuBtn = qs("#menuBtn");
  const nav = qs("#nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("nav--open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("nav--open")) return;
      if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
      nav.classList.remove("nav--open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  }

  // Footer year
  const year = qs("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Deal form submit
  const form = qs("#dealForm");
  const statusEl = qs("#status");
  const submitBtn = qs("#submitBtn");
  if (!form) return;

  const setStatus = (msg, type = "info") => {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.style.color =
      type === "ok" ? "var(--ok)" :
      type === "bad" ? "var(--danger)" :
      "var(--muted)";
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: form.elements["name"]?.value?.trim() || "",
      role: form.elements["role"]?.value?.trim() || "",
      email: form.elements["email"]?.value?.trim() || "",
      phone: form.elements["phone"]?.value?.trim() || "",
      summary: form.elements["summary"]?.value?.trim() || "",
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      source: "home_submit_a_deal",
    };

    if (!payload.name || !payload.role || !payload.email || !payload.summary) {
      setStatus("Please fill out Name, Role, Email, and Deal Summary.", "bad");
      return;
    }
    if (!validateEmail(payload.email)) {
      setStatus("Please enter a valid email address.", "bad");
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      setStatus("Sending…");

      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

      await fetch(DEAL_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: fd,
      });

      setStatus("Sent! If it fits, we’ll respond within 48 hours.", "ok");
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong. Please email Solutions@urbandwell.io.", "bad");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
