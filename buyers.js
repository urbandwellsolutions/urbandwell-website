(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u06o7xe/";

  const form = document.getElementById("dealForm");
  const submitBtn = document.getElementById("submitBtn");
  const statusText = document.getElementById("statusText");

  // If the buyers form isn't on the page, do nothing.
  if (!form) return;

  const setStatus = (msg) => {
    if (statusText) statusText.textContent = msg;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: (form.elements["name"]?.value || "").trim(),
      role: (form.elements["role"]?.value || "").trim(),
      email: (form.elements["email"]?.value || "").trim(),
      phone: (form.elements["phone"]?.value || "").trim(),
      summary: (form.elements["summary"]?.value || "").trim(),
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    // Simple validation
    if (!payload.name || !payload.role || !payload.email || !payload.summary) {
      setStatus("Please complete required fields.");
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
      }
      setStatus("Sending to our team…");

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);

      setStatus("Submitted successfully. We’ll be in touch soon.");
      form.reset();
      alert("✅ Submitted! We'll be in touch shortly.");
    } catch (err) {
      console.error(err);
      setStatus("Submission failed. Please try again.");
      alert("❌ Submission failed. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Buy Box";
      }
    }
  });
})();
