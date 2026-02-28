(() => {
  // ✅ HARD-WIRED BUYERS WEBHOOK (per your instruction)
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u06o7xe/";

  const form = document.getElementById("buyerForm");
  if (!form) return;

  const submitBtn = document.getElementById("buyerSubmitBtn");
  const resetBtn = document.getElementById("buyerResetBtn");
  const statusBox = document.getElementById("buyerStatus");

  const DRAFT_KEY = "uds_buyer_intake_draft_v1";

  const showStatus = (type, msg) => {
    statusBox.className = "status " + (type === "ok" ? "is-ok" : "is-err");
    statusBox.textContent = msg;
    statusBox.style.display = "block";
  };

  const hideStatus = () => {
    statusBox.style.display = "none";
    statusBox.textContent = "";
    statusBox.className = "status";
  };

  const sanitizeNumber = (v) => {
    if (!v) return "";
    return String(v).replace(/[^\d]/g, "");
  };

  const saveDraft = () => {
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {}
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      Object.entries(data).forEach(([k, v]) => {
        const el = form.elements[k];
        if (!el) return;
        el.value = v ?? "";
      });
    } catch (e) {}
  };

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  };

  // Load saved draft on open
  loadDraft();

  // Save draft on any change
  form.addEventListener("input", () => {
    hideStatus();
    saveDraft();
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    clearDraft();
    hideStatus();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideStatus();

    const fd = new FormData(form);

    const fullName = (fd.get("fullName") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim();

    if (!fullName || !email) {
      showStatus("err", "Please add your Full Name and Email.");
      return;
    }

    const payload = {
      fullName,
      email,
      phone: (fd.get("phone") || "").toString().trim(),
      preferredContact: (fd.get("preferredContact") || "").toString().trim(),
      buyerType: (fd.get("buyerType") || "").toString().trim(),
      timeline: (fd.get("timeline") || "").toString().trim(),
      minPrice: sanitizeNumber(fd.get("minPrice")),
      maxPrice: sanitizeNumber(fd.get("maxPrice")),
      minPads: sanitizeNumber(fd.get("minPads")),
      assetType: (fd.get("assetType") || "").toString().trim(),
      targetStates: (fd.get("targetStates") || "").toString().trim(),
      strategyNotes: (fd.get("strategyNotes") || "").toString().trim(),
      pofNotes: (fd.get("pofNotes") || "").toString().trim(),
      entityCompany: (fd.get("entityCompany") || "").toString().trim(),
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
      source: "buyers-intake",
    };

    const lock = (on) => {
      submitBtn.disabled = on;
      submitBtn.textContent = on ? "Submitting…" : "Submit Buy Box";
    };

    lock(true);

    try {
      // First attempt (readable response)
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Webhook non-200");

      showStatus("ok", "✅ Buy box submitted. We’ll reach out when a match fits.");
      saveDraft(); // keep the latest
    } catch (err1) {
      // CORS-safe fallback (Zapier still receives it; browser can’t read response)
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        showStatus("ok", "✅ Buy box submitted. (Browser can’t verify due to CORS.)");
        saveDraft();
      } catch (err2) {
        console.error("buyers.js submit failed:", err1, err2);
        showStatus("err", "❌ Submission failed. Verify your Zap is ON and the webhook URL is correct.");
      }
    } finally {
      lock(false);
    }
  });
})();
