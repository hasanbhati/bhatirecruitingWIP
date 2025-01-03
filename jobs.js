let jobs = []; // Will store all jobs
const JOBS_PER_PAGE = 9; // 3 rows × 3 columns = 9 jobs
let currentPage = 1;

// Move initializeFilters outside the DOMContentLoaded event
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const countryFilter = document.getElementById('countryFilter');
    
    // Get unique categories and countries from jobs
    const categories = [...new Set(jobs.map(job => job.category))];
    const countries = [...new Set(jobs.map(job => job.country))];

    // Clear existing options first
    categoryFilter.innerHTML = `<option value="all" data-translate="filter_all_categories">All Categories</option>`;
    countryFilter.innerHTML = `<option value="all" data-translate="filter_all_countries">All Countries</option>`;

    // Add categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Add countries
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.toLowerCase();
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Function to fetch jobs from localStorage
function fetchJobs() {
    try {
        console.log('Fetching jobs...'); // Debug line
        const storedJobs = localStorage.getItem('jobs');
        console.log('Stored jobs:', storedJobs); // Debug line
        
        if (storedJobs) {
            // Parse jobs and filter only active ones
            jobs = JSON.parse(storedJobs).filter(job => job.status === 'active');
            console.log('Active jobs:', jobs); // Debug line
            
            if (jobs.length > 0) {
                initializeFilters();
                renderJobs(jobs);
                document.getElementById('noJobsMessage').style.display = 'none';
            } else {
                console.log('No active jobs found'); // Debug line
                document.getElementById('noJobsMessage').style.display = 'block';
            }
        } else {
            console.log('No jobs in localStorage'); // Debug line
            jobs = [];
            document.getElementById('noJobsMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        document.getElementById('noJobsMessage').style.display = 'block';
    }
}

// Function to render jobs
function renderJobs(jobsToRender) {
    const jobsList = document.getElementById('jobsList');
    const noJobsMessage = document.getElementById('noJobsMessage');
    
    // Clear previous content
    jobsList.innerHTML = '';
    
    if (!jobsToRender || jobsToRender.length === 0) {
        noJobsMessage.style.display = 'block';
        return; // Exit early if no jobs to show
    }

    // Hide no jobs message if we have jobs
    noJobsMessage.style.display = 'none';
    
    // Calculate pagination
    const totalPages = Math.ceil(jobsToRender.length / JOBS_PER_PAGE);
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    const endIndex = startIndex + JOBS_PER_PAGE;
    const currentJobs = jobsToRender.slice(startIndex, endIndex);

    // Create jobs container
    const jobsContainer = document.createElement('div');
    jobsContainer.className = 'jobs-container';

    // Add jobs to container
    currentJobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        
        jobCard.innerHTML = `
            <div class="job-card-header">
                <div class="company-info">
                    ${job.logo ? `<img src="${job.logo}" alt="${job.companyName}" class="company-logo">` : ''}
                    <div>
                        <h3 class="job-title">${job.position}</h3>
                        <p class="company-name">${job.companyName}</p>
                    </div>
                </div>
                <div class="job-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${job.city}, ${job.country}
                </div>
            </div>
            <div class="job-footer">
                <span class="job-category">${job.category}</span>
                <button onclick="viewJobDetails('${job.id}')" class="view-details-btn">
                    View Details
                </button>
            </div>
        `;
        
        jobsContainer.appendChild(jobCard);
    });

    // Add jobs container to the list
    jobsList.appendChild(jobsContainer);

    // Add pagination only if we have jobs
    if (jobsToRender.length > 0) {
        renderPagination(totalPages, jobsToRender.length);
    }
}

// Filter jobs function
async function filterJobs() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const countryFilter = document.getElementById('countryFilter');
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedCountry = countryFilter.value;

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = 
            job.position.toLowerCase().includes(searchTerm) ||
            job.companyName.toLowerCase().includes(searchTerm);
        
        const matchesCategory = 
            selectedCategory === 'all' || 
            job.category.toLowerCase() === selectedCategory.toLowerCase();
        
        const matchesCountry = 
            selectedCountry === 'all' || 
            job.country.toLowerCase() === selectedCountry.toLowerCase();

        return job.status === 'active' && matchesSearch && matchesCategory && matchesCountry;
    });

    renderJobs(filteredJobs);
    updatePaginationTranslations();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateGridStyles();
    fetchJobs();
    
    // Get stored language preference
    const storedLang = localStorage.getItem('preferred-language') || 'en';
    
    // Set the correct language button state
    document.querySelectorAll('.lang-link').forEach(button => {
        button.classList.remove('current');
        if ((storedLang === 'hi' && button.textContent.includes('हिन्दी')) ||
            (storedLang === 'en' && button.textContent.includes('English'))) {
            button.classList.add('current');
        }
    });

    // Update page translations
    updatePageTranslations(storedLang);
    
    // Add language button event listeners
    document.querySelectorAll('.lang-link').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.textContent.includes('हिन्दी') ? 'hi' : 'en';
            changeLanguage(lang);
            
            // Update active state
            document.querySelectorAll('.lang-link').forEach(btn => btn.classList.remove('current'));
            this.classList.add('current');
        });
    });
    
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const countryFilter = document.getElementById('countryFilter');

    // Event listeners
    searchInput.addEventListener('input', () => {
        currentPage = 1; // Reset to first page when searching
        filterJobs();
    });
    categoryFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page when filtering
        filterJobs();
    });
    countryFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page when filtering
        filterJobs();
    });
});

// View job details function
function viewJobDetails(jobId) {
    const job = jobs.find(j => j.id == jobId);
    if (!job) return;

    const modal = document.getElementById('jobDetailsModal');
    const content = document.getElementById('jobDetailsContent');
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    content.innerHTML = `
        <div class="job-details-header">
            <div class="company-info">
                ${job.logo ? `<img src="${job.logo}" alt="${job.companyName}" class="company-logo">` : ''}
                <div>
                    <h2>${job.position}</h2>
                    <p class="company-name">${job.companyName}</p>
                    <p class="job-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${job.city}, ${job.country}
                    </p>
                    <span class="job-category">${job.category}</span>
                </div>
            </div>
        </div>
        
        <div class="job-details-body">
            <div class="details-section">
                <h3>Job Description</h3>
                <p>${job.description}</p>
            </div>
            
            <div class="details-section">
                <h3>Requirements</h3>
                <p>${job.requirements}</p>
            </div>
            
            <button class="apply-btn">Apply Now</button>
        </div>
    `;

    // Show modal
    modal.style.display = 'block';

    // Function to close modal
    const closeModal = () => {
        modal.style.display = 'none';
        // Re-enable background scrolling
        document.body.style.overflow = 'auto';
    };

    // Close modal when clicking on X or outside the modal
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.onclick = closeModal;
    window.onclick = (event) => {
        if (event.target == modal) {
            closeModal();
        }
    };

    // Close modal on escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

// Add pagination controls rendering
function renderPagination(totalPages, totalJobs) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn prev';
    prevButton.innerHTML = `
        <i class="fas fa-chevron-left"></i> 
        <span>${translations[localStorage.getItem('preferred-language') || 'en'].pagination_previous}</span>
    `;
    prevButton.disabled = currentPage === 1;
    
    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    const currentLang = localStorage.getItem('preferred-language') || 'en';
    pageInfo.innerHTML = `
        <span>${translations[currentLang].pagination_page}</span> 
        ${currentPage} 
        <span>${translations[currentLang].pagination_of}</span> 
        ${totalPages}
    `;
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn next';
    nextButton.innerHTML = `
        <span>${translations[currentLang].pagination_next}</span> 
        <i class="fas fa-chevron-right"></i>
    `;
    nextButton.disabled = currentPage === totalPages;

    // Button click handlers
    prevButton.onclick = async () => {
        if (currentPage > 1) {
            currentPage--;
            await filterJobs();
            updatePaginationTranslations();
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    nextButton.onclick = async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await filterJobs();
            updatePaginationTranslations();
            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // Append controls
    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);

    // Add to DOM
    const jobsList = document.getElementById('jobsList');
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
    jobsList.appendChild(paginationContainer);
}

// Update the grid layout in jobs-styles.css
const updateGridStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .jobs-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* 3 columns */
            gap: 2rem;
            padding: 1rem;
            max-width: 1400px;
            margin: 0 auto;
        }

        @media (max-width: 1200px) {
            .jobs-container {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .jobs-container {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
};

// Add this function to handle pagination updates
function updatePaginationTranslations() {
    const prevButton = document.querySelector('.pagination-btn.prev span');
    const nextButton = document.querySelector('.pagination-btn.next span');
    const pageInfo = document.querySelector('.page-info');
    const currentLang = localStorage.getItem('preferred-language') || 'en';
    
    if (prevButton && nextButton && pageInfo) {
        const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
        
        // Update text content based on current language
        prevButton.textContent = translations[currentLang].pagination_previous;
        nextButton.textContent = translations[currentLang].pagination_next;
        
        // Update page info
        pageInfo.innerHTML = `
            <span data-translate="pagination_page">${translations[currentLang].pagination_page}</span> 
            ${currentPage} 
            <span data-translate="pagination_of">${translations[currentLang].pagination_of}</span> 
            ${totalPages}
        `;
    }
}

// Update the changeLanguage function to include pagination
function changeLanguage(lang) {
    localStorage.setItem('preferred-language', lang);
    updatePageTranslations(lang);
    updatePaginationTranslations();
}

// Add this function to handle page translations
function updatePageTranslations(lang) {
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Update filter options with translations
    const categoryFilter = document.getElementById('categoryFilter');
    const countryFilter = document.getElementById('countryFilter');
    
    if (categoryFilter) {
        categoryFilter.querySelector('option[value="all"]').textContent = translations[lang].filter_all_categories;
    }
    
    if (countryFilter) {
        countryFilter.querySelector('option[value="all"]').textContent = translations[lang].filter_all_countries;
    }

    // Re-render jobs to update any translated content
    filterJobs();
} 