(() => {
  // =========================
  // CONFIG
  // =========================
  const DEAL_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0oscvm/";

  const qs = (s, root = document) => root.querySelector(s);

  // =========================
  // MOBILE MENU (matches your index.html)
  // =========================
  const hamburger = qs(".hamburger");
  const mobileMenu = qs("#mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!isOpen));
      mobileMenu.hidden = isOpen;
    });

    // close menu after clicking any link
    mobileMenu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        hamburger.setAttribute("aria-expanded", "false");
        mobileMenu.hidden = true;
      });
    });

    // close if user taps outside (mobile friendly)
    document.addEventListener("click", (e) => {
      if (mobileMenu.hidden) return;
      const t = e.target;
      if (hamburger.contains(t) || mobileMenu.contains(t)) return;
      hamburger.setAttribute("aria-expanded", "false");
      mobileMenu.hidden = true;
    });
  }

  // =========================
  // FOOTER YEAR
  // =========================
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================
  // FORM SUBMIT -> ZAPIER WEBHOOK
  // =========================
  const form = qs("#dealForm");
  const status = qs("#dealStatus");
  const submitBtn = qs("#dealSubmitBtn");

  const showStatus = (type, msg) => {
    if (!status) return;
    status.style.display = "block";
    status.className = "status " + (type === "ok" ? "is-ok" : "is-err");
    status.textContent = msg;
  };

  const hideStatus = () => {
    if (!status) return;
    status.style.display = "none";
    status.className = "status";
    status.textContent = "";
  };

  const lock = (on) => {
    if (!submitBtn) return;
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : "Send Deal";
  };

  if (form) {
    // Make sure the form never tries to navigate anywhere
    form.setAttribute("action", "#");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideStatus();

      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const role = (fd.get("role") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const summary = (fd.get("summary") || "").toString().trim();

      if (!name || !role || !email || !summary) {
        showStatus("err", "Please complete Name, Role, Email, and Deal Summary.");
        return;
      }

      const payload = {
        name,
        role,
        email,
        phone,
        summary,
        pageUrl: window.location.href,
        submittedAt: new Date().toISOString(),
        source: "home_submit_a_deal"
      };

      lock(true);
      showStatus("ok", "Sending your deal…");

      try {
        // Primary attempt (best case)
        const res = await fetch(DEAL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);

        showStatus("ok", "✅ Deal submitted. We’ll respond quickly.");
        form.reset();

      } catch (err) {
        // Fallback: some browsers block reading response due to CORS; still sends
        try {
          await fetch(DEAL_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          showStatus("ok", "✅ Deal submitted. (Browser can’t verify due to CORS, but it was sent.)");
          form.reset();
        } catch (err2) {
          console.error(err, err2);
          showStatus("err", "Submit failed. Please try again or email Solutions@urbandwell.io.");
        }
      } finally {
        lock(false);
      }
    });
  }
})();
