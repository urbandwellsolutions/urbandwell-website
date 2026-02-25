(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0y1k4j/";

  const form = document.getElementById("dealForm");
  if (!form) return;

  const submitBtn = form.querySelector("button[type='submit']");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: form.elements["name"]?.value || "",
      role: form.elements["role"]?.value || "",
      email: form.elements["email"]?.value || "",
      phone: form.elements["phone"]?.value || "",
      summary: form.elements["summary"]?.value || "",
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      // IMPORTANT: no headers object
      await fetch(WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("✅ Deal sent successfully!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Deal";
      }
    }
  });
})();
