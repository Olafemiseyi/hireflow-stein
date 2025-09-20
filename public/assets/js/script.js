let jobs = []; // Store all jobs
  let displayedJobs = 0; // Track displayed jobs
  const jobsPerLoad = 6; // Load 6 jobs at a time
  const jobContainer = document.getElementById('job-container');
  const loading = document.getElementById('loading');

  async function fetchJobs() {
    try {
      const response = await fetch('/.netlify/functions/stein?sheet=Jobs');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      jobs = await response.json();
      // Sort by Posted Date (index 9, YYYY-MM-DD) in descending order
      jobs.sort((a, b) => new Date(b[9]) - new Date(a[9]));
      if (!Array.isArray(jobs) || jobs.length === 0) {
        jobContainer.innerHTML = '<p class="text-center">No jobs available.</p>';
        loading.style.display = 'none';
        return;
      }
      jobContainer.innerHTML = ''; // Clear previous content
      displayedJobs = 0; // Reset displayed jobs
      renderJobs();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      jobContainer.innerHTML = '<p class="text-center">Failed to load jobs. Please try again later.</p>';
      loading.style.display = 'none';
    }
  }

  function renderJobs() {
    const nextJobs = jobs.slice(displayedJobs, displayedJobs + jobsPerLoad);
    nextJobs.forEach(job => {
      const [jobId, title, company, location, jobType, salary, , applyLink, logoUrl] = job;
      const card = document.createElement('div');
      card.className = 'col-lg-4 col-md-6';
      card.innerHTML = `
        <div class="job-card">
          <div class="job-header">
            <span class="job-type">${jobType || 'N/A'}</span>
            <span class="job-location">${location || 'N/A'}</span>
          </div>
          <div class="job-company">
            <img src="${logoUrl || 'https://via.placeholder.com/40x40.png?text=?'}" alt="${company || 'Company'} Logo" class="company-logo">
            <span class="company-name">${company || 'N/A'}</span>
          </div>
          <div class="job-info">
            <span class="job-title">${title || 'Untitled'}</span>
            <span class="job-salary">${salary || 'N/A'}</span>
          </div>
          <a href="/job-details.html?id=${jobId}" class="btn btn-apply">Apply Now</a>
        </div>
      `;
      jobContainer.appendChild(card);
    });
    displayedJobs += nextJobs.length;
    loading.style.display = displayedJobs >= jobs.length ? 'none' : 'block';
  }

  function handleScroll() {
    if (loading.style.display === 'none') return;
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loading.style.display = 'block';
      setTimeout(renderJobs, 1000); // Simulate loading delay
    }
  }

  // Initialize
  fetchJobs();
  window.addEventListener('scroll', handleScroll);

  // Sidebar toggle fallback
  document.getElementById('toggleFiltersBtn').addEventListener('click', () => {
    const collapse = document.getElementById('filtersCollapse');
    collapse.classList.toggle('show');
  });
