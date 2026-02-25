// script.js
(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0y1k4j/";

  const form = document.getElementById("dealForm");
  if (!form) {
    console.warn("dealForm not found. Make sure your form has id='dealForm'.");
    return;
  }

  const submitBtn = form.querySelector("button[type='submit']");

  // Create a small status line under the buttons
  let statusEl = form.querySelector(".form_status");
  if (!statusEl) {
    statusEl = document.createElement("div");
    statusEl.className = "form_status micro";
    statusEl.style.marginTop = "10px";
    form.appendChild(statusEl);
  }

  const setStatus = (msg, ok = true) => {
    statusEl.textContent = msg;
    statusEl.style.color = ok ? "#9ff3d7" : "#ffb4b4";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Pull values using your exact field names
    const payload = {
      name: form.elements["name"]?.value?.trim() || "",
      role: form.elements["role"]?.value?.trim() || "",
      email: form.elements["email"]?.value?.trim() || "",
      phone: form.elements["phone"]?.value?.trim() || "",
      summary: form.elements["summary"]?.value?.trim() || "",
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    // Basic validation (HTML already requires name/role/email)
    if (!payload.name || !payload.role || !payload.email) {
      setStatus("Please complete Name, Role, and Email.", false);
      return;
    }

    try {
      // UI lock
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
      }
      setStatus("Sending...", true);

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Webhook failed (${res.status}): ${text}`);
      }

      setStatus("✅ Deal sent! We’ll be in touch shortly.", true);
      form.reset();
    } catch (err) {
      console.error(err);
      setStatus("❌ Error sending. Please try again.", false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.originalText || "Send Deal";
      }
    }
  });
})();
