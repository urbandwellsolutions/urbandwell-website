(() => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26580778/u0oscvm/";
  const form = document.getElementById("dealForm");
  if (!form) return;

  const submitBtn = form.querySelector("button[type='submit']");

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
    };

    const fd = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      fd.append(key, value);
    });

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Request failed");

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
