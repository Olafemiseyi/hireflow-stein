document.addEventListener("DOMContentLoaded", () => {
  function getCurrentDate() {
    const date = new Date();
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  const form = document.getElementById("post-job-form");
  const formMessage = document.getElementById("form-message");
  if (!form || !formMessage) {
    console.error("Error: #post-job-form or #form-message not found in DOM");
    return;
  }

  console.log("post-job.js loaded successfully");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formMessage.textContent = "";

    const formData = {
      "Job Title": document.getElementById("job-title").value.trim(),
      "Company": document.getElementById("company").value.trim(),
      "Location": document.getElementById("location").value.trim(),
      "Job Type": document.getElementById("job-type").value,
      "Salary": document.getElementById("salary").value.trim() || "",
      "Description": document.getElementById("description").value.trim() || "",
      "Apply Link": document.getElementById("apply-link").value.trim() || "",
      "Logo URL": document.getElementById("logo-url").value.trim() || "",
      "Posted Date": getCurrentDate(),
      "Deadline": document.getElementById("deadline")?.value.trim() || ""
    };

    if (!formData["Job Title"] || !formData["Company"] || !formData["Location"] || !formData["Job Type"]) {
      formMessage.textContent = "Please fill all required fields.";
      formMessage.style.color = "red";
      console.error("Validation failed: Missing required fields", formData);
      return;
    }

    const isLocal = window.location.hostname.includes("localhost") ||
                    window.location.hostname.includes("127.0.0.1") ||
                    window.location.hostname === "" ||
                    window.location.protocol === "file:" ||
                    window.location.hostname.includes("bs-local.com");
    console.log("Is local preview:", isLocal,
                "Hostname:", window.location.hostname,
                "Protocol:", window.location.protocol,
                "URL:", window.location.href);

    if (isLocal) {
      console.log("Using mock response for BSS preview");
      formMessage.textContent = "Mock: Job posted successfully";
      formMessage.style.color = "green";
      form.reset();
      return;
    }

    try {
      console.log("Submitting job to Netlify:", formData);
      const response = await fetch("https://hireflow-stein.netlify.app/.netlify/functions/stein?sheet=Jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData) // Send single object
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      const result = await response.json();
      console.log("Response data:", result);
      formMessage.textContent = `Job posted successfully! Job ID: ${result.jobId || 'N/A'}`;
      formMessage.style.color = "green";
      form.reset();
    } catch (error) {
      console.error("Error posting job:", error.message);
      formMessage.textContent = `Failed to post job: ${error.message}`;
      formMessage.style.color = "red";
    }
  });
});