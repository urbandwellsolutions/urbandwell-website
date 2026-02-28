(() => {
  // HOME PAGE "Submit a Deal" WEBHOOK (optional)
  // If you don't want index page to send to Zapier, set this to "" and it will use mailto only.
  const DEAL_WEBHOOK_URL = ""; // optional

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

  // Modal controls
  const modal = qs("#dealModal");
  const open1 = qs("#openDealModal");
  const open2 = qs("#openDealModal2");
  const open3 = qs("#openDealModal3");
  const closeBtn = qs("#closeDealModal");
  const status = qs("#dealStatus");
  const form = qs("#dealForm");
  const submitBtn = qs("#dealSubmitBtn");

  const showStatus = (type, msg) => {
    if (!status) return;
    status.className = "status " + (type === "ok" ? "is-ok" : "is-err");
    status.textContent = msg;
    status.style.display = "block";
  };
  const hideStatus = () => {
    if (!status) return;
    status.style.display = "none";
    status.textContent = "";
    status.className = "status";
  };

  const openModal = () => {
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    hideStatus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  const bindOpen = (btn) => btn && btn.addEventListener("click", openModal);
  bindOpen(open1);
  bindOpen(open2);
  bindOpen(open3);

  closeBtn && closeBtn.addEventListener("click", closeModal);

  // Close on overlay/cancel
  modal && modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.dataset && t.dataset.close === "true") closeModal();
  });

  // Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("is-open")) closeModal();
  });

  // Form submit (webhook optional, mailto fallback always)
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      hideStatus();

      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const phone = (fd.get("phone") || "").toString().trim();
      const role = (fd.get("role") || "").toString().trim();
      const summary = (fd.get("summary") || "").toString().trim();

      if (!name || !email || !summary) {
        showStatus("err", "Please fill Name, Email, and Property Summary.");
        return;
      }

      const payload = {
        name, email, phone, role, summary,
        pageUrl: window.location.href,
        submittedAt: new Date().toISOString(),
        source: "submit-a-deal",
      };

      const lock = (on) => {
        if (!submitBtn) return;
        submitBtn.disabled = on;
        submitBtn.textContent = on ? "Sending…" : "Send Deal";
      };

      const openMailto = () => {
        const subject = encodeURIComponent("Submit a Deal — Urban Dwell Solutions");
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nRole: ${role}\n\nProperty Summary:\n${summary}\n\nPage: ${window.location.href}\nTime: ${payload.submittedAt}`
        );
        window.location.href = `mailto:Solutions@urbandwell.io?subject=${subject}&body=${body}`;
      };

      lock(true);

      // If no webhook configured, go mailto immediately
      if (!DEAL_WEBHOOK_URL) {
        showStatus("ok", "Opening your email client to send the deal…");
        openMailto();
        lock(false);
        form.reset();
        return;
      }

      // Try webhook first; if CORS blocks reading, still show success
      try {
        const res = await fetch(DEAL_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Webhook non-200");
        showStatus("ok", "✅ Deal sent. We’ll respond quickly.");
        form.reset();
      } catch (err1) {
        try {
          await fetch(DEAL_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          showStatus("ok", "✅ Deal sent. (Browser can’t verify due to CORS.)");
          form.reset();
        } catch (err2) {
          console.error(err1, err2);
          showStatus("err", "Webhook failed. Opening email client as fallback…");
          openMailto();
        }
      } finally {
        lock(false);
      }
    });
  }
})();
