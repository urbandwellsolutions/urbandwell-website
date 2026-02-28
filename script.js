/* script.js
   - Deal form -> Zapier webhook (CORS-safe)
   - Mobile menu toggle
   - Footer year
   - UX: loading state, inline status, validation, honeypot
*/

(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0oscvm/";

  const $ = (sel, root = document) => root.querySelector(sel);

  function setYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initMobileMenu() {
    const btn = $(".hamburger");
    const menu = $("#mobileMenu");
    if (!btn || !menu) return;

    const setState = (open) => {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      menu.hidden = !open;
    };

    // Toggle
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      setState(!isOpen);
    });

    // Close on nav click (mobile)
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setState(false);
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setState(false);
    });

    // Close if resized to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) setState(false);
    });
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
    return {
      name: getField(form, "name"),
      role: getField(form, "role"),
      email: getField(form, "email"),
      phone: getField(form, "phone"),
      summary: getField(form, "summary"),
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };
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
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

    // CORS-safe: browser can send, but response is opaque.
    await fetch(WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      body: fd,
    });
  }

  function initDealForm() {
    const form = $("#dealForm");
    if (!form) return;

    // Honeypot to block bots (hidden field)
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

  function init() {
    setYear();
    initMobileMenu();
    initDealForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
