let jobs = [];
let displayedJobs = 0;
const jobsPerLoad = 6;
const jobContainer = document.getElementById('job-container');
const loading = document.getElementById('loading');
let originalJobs = [];

// Display initial loading message immediately
loading.innerHTML = '<i>Loading jobs...</i>';
loading.style.display = 'block';

async function fetchJobs() {
  try {
    // Mock data for BSS local preview
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '';
    const response = isLocal
      ? {
          ok: true,
          json: async () => [
            ['Job ID', 'Job Title', 'Company', 'Location', 'Job Type', 'Salary', 'Description', 'Apply Link', 'Logo URL', 'Posted Date', ''],
            ['6', 'Developer', 'TechCorp', 'Lagos', 'Full-Time', '₦100,000', 'Build apps', 'mailto:hr@techcorp.com', '', '2025-09-20', ''],
            ['7', 'Web Designer', 'DesignCo', 'Abuja', 'Part-Time', '₦80,000', 'Create UI/UX', 'mailto:hr@designco.com', '', '2025-09-21', ''],
            ['3YC42', 'Web Designer', 'DesignCo', 'Abuja', 'Part-Time', '₦80,000', 'Create UI/UX', 'mailto:hr@designco.com', 'https://via.placeholder.com/40x40.png?text=D', '2025-09-20', ''],
            ['6KO23', 'Software Intern', 'InnoTech', 'Remote', 'Internship', 'Stipend', 'Learn coding', 'mailto:hr@innotech.com', 'https://thisisabrokenlink.com/40x40.png', '2025-09-22', ''],
            ['8', 'Data Analyst', 'DataSense', 'Lagos', 'Full-Time', '₦120,000', 'Analyze data', 'mailto:hr@datasense.com', '', '2025-09-23', ''],
            ['9', 'Product Manager', 'Innovate Ltd', 'Remote', 'Full-Time', '₦150,000', 'Manage products', 'mailto:hr@innovate.com', '', '2025-09-24', ''],
            ['10', 'UX Researcher', 'UserFocus', 'Lagos', 'Contract', '₦90,000', 'Conduct user research', 'mailto:hr@userfocus.com', '', '2025-09-25', ''],
            ['11', 'Mobile Developer', 'AppGenius', 'Abuja', 'Full-Time', '₦110,000', 'Develop mobile apps', 'mailto:hr@appgenius.com', '', '2025-09-26', ''],
            ['12', 'System Admin', 'SecureCorp', 'Port Harcourt', 'Full-Time', '₦130,000', 'Maintain systems', 'mailto:hr@securecorp.com', '', '2025-09-27', ''],
            ['13', 'UI Designer', 'Creative Hub', 'Lagos', 'Part-Time', '₦75,000', 'Design user interfaces', 'mailto:hr@creativehub.com', '', '2025-09-28', ''],
            ['14', 'DevOps Engineer', 'CloudOps', 'Remote', 'Full-Time', '₦160,000', 'Manage cloud infrastructure', 'mailto:hr@cloudops.com', '', '2025-09-29', ''],
          ]
        }
      : await fetch('https://hireflow-stein.netlify.app/.netlify/functions/stein?sheet=Jobs');

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    // Skip the first row which contains the header information
    originalJobs = data.slice(1);

    if (!Array.isArray(originalJobs) || originalJobs.length === 0) {
      jobContainer.innerHTML = '<p class="text-center">No jobs available.</p>';
      loading.style.display = 'none';
      return;
    }
    
    // Apply initial filters and sort to render the first batch
    applyFiltersAndSearch();
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
    
    // Default to the provided URL. The onerror attribute on the <img> tag will handle
    // cases where the URL is broken or invalid.
    const companyLogo = logoUrl || '';
    
    const firstLetter = (company && company.length > 0) ? company.charAt(0).toUpperCase() : '?';
    const placeholderUrl = `https://placehold.co/40x40/d1d5db/1f2937?text=${firstLetter}`;

    const card = document.createElement('div');
    card.className = 'col-lg-4 col-md-6';
    card.innerHTML = `
      <div class="job-card">
        <div class="job-header">
          <span class="job-type">${jobType || 'N/A'}</span>
          <span class="job-location">${location || 'N/A'}</span>
        </div>
        <div class="job-company">
          <img src="${companyLogo}" 
               alt="${company || 'Company'} Logo" 
               class="company-logo" 
               onerror="this.onerror=null; this.src='${placeholderUrl}';"
          >
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

  if (displayedJobs >= jobs.length) {
    loading.style.display = 'block';
    loading.innerHTML = 'No more jobs to load.';
  } else {
    loading.style.display = 'none';
  }
}

function handleScroll() {
  // Only try to load more if there are jobs left to display
  if (displayedJobs < jobs.length) {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loading.style.display = 'block';
      loading.innerHTML = '<i>Loading more jobs...</i>';
      setTimeout(renderJobs, 1000);
    }
  }
}

function applyFiltersAndSearch() {
  const keyword = document.getElementById('search-title').value.toLowerCase();
  const location = document.getElementById('search-location').value.toLowerCase();
  const typeFilters = Array.from(document.querySelectorAll('input[name="job-type"]:checked')).map(cb => cb.value);
  const locFilters = Array.from(document.querySelectorAll('input[name="location"]:checked')).map(cb => cb.value);
  const salaryFilters = Array.from(document.querySelectorAll('input[name="salary-range"]:checked')).map(cb => cb.value);

  // Start with the original unfiltered list
  let filteredJobs = [...originalJobs];

  // Apply all filters and search in a single pass
  filteredJobs = filteredJobs.filter(job => {
    const [id, title, company, loc, jtype, salary] = job;
    
    // Keyword and search location check
    const matchesKeyword = (!keyword || title.toLowerCase().includes(keyword) || company.toLowerCase().includes(keyword));
    const matchesSearchLocation = (!location || loc.toLowerCase().includes(location));
    
    // Checkbox filters
    const matchesTypeFilter = (typeFilters.length === 0 || typeFilters.includes(jtype));
    const matchesLocFilter = (locFilters.length === 0 || locFilters.includes(loc));

    const matchesSalaryFilter = (salaryFilters.length === 0) || salaryFilters.some(filter => {
      const numericSalary = parseInt(salary.replace('₦', '').replace(/,/g, ''));
      if (filter === '0-50000') {
        return numericSalary >= 0 && numericSalary <= 50000;
      }
      if (filter === '50000-100000') {
        return numericSalary > 50000 && numericSalary <= 100000;
      }
      if (filter === '100000+') {
        return numericSalary > 100000;
      }
      return false;
    });

    return matchesKeyword && matchesSearchLocation && matchesTypeFilter && matchesLocFilter && matchesSalaryFilter;
  });

  // Sort the final filtered list by posted date
  filteredJobs.sort((a, b) => {
    const dateA = a[9] && !isNaN(new Date(a[9])) ? new Date(a[9]) : new Date(0);
    const dateB = b[9] && !isNaN(new Date(b[9])) ? new Date(b[9]) : new Date(0);
    return dateB - dateA;
  });

  jobs = filteredJobs;
  jobContainer.innerHTML = '';
  displayedJobs = 0;
  renderJobs();
}

// Attach the new unified function to events
document.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  applyFiltersAndSearch();
});

document.querySelectorAll('input[type="checkbox"]').forEach(input => {
  input.addEventListener('change', () => {
    applyFiltersAndSearch();
  });
});

// Attach keyup event listeners for instant search
document.getElementById('search-title').addEventListener('keyup', applyFiltersAndSearch);
document.getElementById('search-location').addEventListener('keyup', applyFiltersAndSearch);

// Initialize
fetchJobs();
window.addEventListener('scroll', handleScroll);
