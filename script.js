document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dealForm");
  if (!form) {
    console.error("Form with id='dealForm' not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("https://hooks.zapier.com/hooks/catch/26580778/u0y1k4j/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Webhook failed");

      alert("Submitted — we’ll be in touch soon.");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    }
  });
});
