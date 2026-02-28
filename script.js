/* main.js
   - Handles Deal Form submission to Zapier webhook (CORS-safe)
   - Adds UX: loading state, inline status messages, validation, anti-spam honeypot
*/

(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0oscvm/";

  function $(sel, root = document) {
    return root.querySelector(sel);
  }

  function setStatus(form, type, msg) {
    let box = $(".formStatus", form);
    if (!box) {
      box = document.createElement("div");
      box.className = "formStatus";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      form.appendChild(box);
    }

    box.classList.remove("formStatus--success", "formStatus--error");
    if (type === "success") box.classList.add("formStatus--success");
    if (type === "error") box.classList.add("formStatus--error");
    box.textContent = msg;
  }

  function clearStatus(form) {
    const box = $(".formStatus", form);
    if (box) box.remove();
  }

  function getField(form, name) {
    return form.elements[name] ? String(form.elements[name].value || "").trim() : "";
  }

  function isValidEmail(email) {
    // Simple + reliable enough for frontend
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function disableButton(btn, on, loadingText = "Sending…") {
    if (!btn) return;
    if (on) {
      btn.dataset.originalText = btn.textContent;
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.textContent = loadingText;
    } else {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      btn.textContent = btn.dataset.originalText || "Send Deal";
    }
  }

  function buildPayload(form) {
    const payload = {
      name: getField(form, "name"),
      role: getField(form, "role"),
      email: getField(form, "email"),
      phone: getField(form, "phone"),
      summary: getField(form, "summary"),
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    // Optional extra fields if you add them later
    // payload.company = getField(form, "company");
    // payload.state = getField(form, "state");

    return payload;
  }

  function validate(payload) {
    const errors = [];

    if (!payload.name) errors.push("Please enter your name.");
    if (!payload.role) errors.push("Please select your role.");
    if (!payload.email) errors.push("Please enter your email.");
    if (payload.email && !isValidEmail(payload.email)) errors.push("Please enter a valid email.");
    if (!payload.summary) errors.push("Please add a short deal summary.");

    return errors;
  }

  async function sendToZapier(payload) {
    // Zapier Catch Hook + browsers often require no-cors
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: fd,
    });
  }

  function attachDealForm() {
    const form = document.getElementById("dealForm");
    if (!form) return;

    // Add honeypot input if not present (anti-spam)
    // Bots fill it, humans don't.
    if (!form.querySelector('input[name="company_website"]')) {
      const hp = document.createElement("input");
      hp.type = "text";
      hp.name = "company_website";
      hp.tabIndex = -1;
      hp.autocomplete = "off";
      hp.className = "hp";
      hp.setAttribute("aria-hidden", "true");
      form.appendChild(hp);
    }

    const submitBtn = form.querySelector('button[type="submit"]');

    let inFlight = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (inFlight) return;

      clearStatus(form);

      // Honeypot check
      const hpVal = getField(form, "company_website");
      if (hpVal) {
        // quietly pretend success to avoid tipping off bots
        form.reset();
        setStatus(form, "success", "✅ Thanks — received!");
        return;
      }

      const payload = buildPayload(form);
      const errors = validate(payload);

      if (errors.length) {
        setStatus(form, "error", "⚠️ " + errors[0]);
        return;
      }

      try {
        inFlight = true;
        disableButton(submitBtn, true);

        await sendToZapier(payload);

        form.reset();
        setStatus(form, "success", "✅ Deal sent successfully! We’ll review and follow up shortly.");
      } catch (err) {
        console.error(err);
        setStatus(form, "error", "❌ Submission failed. Please try again in a moment.");
      } finally {
        inFlight = false;
        disableButton(submitBtn, false);
      }
    });
  }

  // Safe init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachDealForm);
  } else {
    attachDealForm();
  }
})();
