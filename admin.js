// Initialize jobs from localStorage or use empty array
let jobs = JSON.parse(localStorage.getItem('jobs')) || [];

// DOM Elements
const jobsList = document.querySelector('.jobs-list');
const addJobBtn = document.getElementById('addJobBtn');
const modal = document.getElementById('jobModal');
const closeBtn = document.querySelector('.close-btn');
const jobForm = document.getElementById('jobForm');
const cancelBtn = document.getElementById('cancelBtn');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');
const deleteBtn = document.getElementById('deleteBtn');

// Logo handling
const logoFile = document.getElementById('logoFile');
const logoUrl = document.getElementById('logoUrl');

let editingJobId = null;

// Add these variables at the top with other initializations
const DESKTOP_ITEMS_PER_PAGE = 15;
const MOBILE_ITEMS_PER_PAGE = 8;
let currentPage = 1;
const jobsPerPage = 10;

// Add these variables at the top with other DOM elements
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
let jobToDelete = null;

// Event Listeners
addJobBtn.addEventListener('click', () => openModal());
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
jobForm.addEventListener('submit', handleJobSubmit);
statusFilter.addEventListener('change', filterJobs);
searchInput.addEventListener('input', filterJobs);
deleteBtn.addEventListener('click', () => {
    jobToDelete = editingJobId;
    openDeleteConfirmModal();
});

// Handle logo input
logoFile.addEventListener('change', handleLogoFile);
logoUrl.addEventListener('input', handleLogoUrl);

// Initialize jobs list
renderJobs();

// Functions
function renderJobs(filteredJobs = null) {
    const jobs = filteredJobs || JSON.parse(localStorage.getItem('jobs')) || [];
    const totalJobs = jobs.length;
    const itemsPerPage = window.innerWidth <= 768 ? 8 : DESKTOP_ITEMS_PER_PAGE; // 8 cards for mobile
    const totalPages = Math.ceil(totalJobs / itemsPerPage);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentJobs = jobs.slice(startIndex, endIndex);

    const tableBody = document.getElementById('jobsList');
    tableBody.innerHTML = '';

    currentJobs.forEach((job, index) => {
        const actualIndex = startIndex + index;
        const row = document.createElement('tr');
        row.onclick = () => editJob(job.id);
        
        // Format the date to show only YYYY-MM-DD
        const postedDate = job.postedDate ? new Date(job.postedDate).toISOString().split('T')[0] : 'N/A';
        
        row.innerHTML = `
            <td data-label="#">${actualIndex + 1}</td>
            <td data-label="Job Position">${job.position || 'N/A'}</td>
            <td data-label="Company">${job.companyName || 'N/A'}</td>
            <td data-label="City">${job.city || 'N/A'}</td>
            <td data-label="Country">${job.country || 'N/A'}</td>
            <td data-label="Category">${job.category || 'N/A'}</td>
            <td data-label="Posted Date">${postedDate}</td>
            <td data-label="Status"><span class="status-badge status-${job.status.toLowerCase()}">${job.status}</span></td>
        `;
        
        tableBody.appendChild(row);
    });

    renderPagination(totalPages, totalJobs);
}

function handleJobSubmit(e) {
    e.preventDefault();
    
    const categoryValue = document.getElementById('category').value;
    // Normalize category case when saving
    const normalizedCategory = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase();

    const jobData = {
        id: editingJobId || Date.now(),
        companyName: document.getElementById('companyName').value,
        logo: document.getElementById('logoUrl').value || 
              (document.getElementById('logoFile').files[0] ? 
               URL.createObjectURL(document.getElementById('logoFile').files[0]) : ''),
        category: normalizedCategory,  // Use normalized category
        position: document.getElementById('position').value,
        city: document.getElementById('city').value,
        country: document.getElementById('country').value,
        description: document.getElementById('description').value,
        requirements: document.getElementById('requirements').value,
        status: document.getElementById('status').value,
        postedDate: editingJobId ? jobs.find(j => j.id == editingJobId).postedDate : new Date().toISOString()
    };

    if (editingJobId) {
        // Update existing job
        const index = jobs.findIndex(job => job.id == editingJobId);
        if (index !== -1) {
            jobs[index] = jobData;
        }
    } else {
        // Add new job
        jobs.push(jobData);
    }

    // Save to localStorage
    localStorage.setItem('jobs', JSON.stringify(jobs));
    console.log('Jobs saved:', JSON.parse(localStorage.getItem('jobs'))); // Debug line

    // Reset form and close modal
    closeModal();

    // Refresh the jobs list
    renderJobs();
}

function editJob(jobId) {
    const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
    const job = jobs.find(job => job.id === jobId);
    
    if (!job) return;
    
    // Set the editingJobId
    editingJobId = jobId;
    
    // Populate the modal with job data
    document.getElementById('modalTitle').textContent = 'Edit Job Opening';
    document.getElementById('companyName').value = job.companyName || '';
    document.getElementById('position').value = job.position || '';
    document.getElementById('category').value = job.category || '';
    document.getElementById('city').value = job.city || '';
    document.getElementById('country').value = job.country || '';
    document.getElementById('description').value = job.description || '';
    document.getElementById('requirements').value = job.requirements || '';
    document.getElementById('status').value = job.status || 'active';
    document.getElementById('logoUrl').value = job.logo || '';
    
    // Show the delete button when editing
    document.getElementById('deleteBtn').style.display = 'block';
    
    // Show the modal
    const modal = document.getElementById('jobModal');
    modal.style.display = 'block';
}

function deleteJob(jobId) {
    // Ask for confirmation before deleting
    if (confirm('Are you sure you want to delete this job?')) {
        // Get current jobs from localStorage
        let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        
        // Filter out the job to delete
        jobs = jobs.filter(job => job.id != jobId);
        
        // Save updated jobs back to localStorage
        localStorage.setItem('jobs', JSON.stringify(jobs));
        
        // Refresh the display
        renderJobs(jobs);
    }
}

function filterJobs() {
    currentPage = 1; // Reset to first page when filtering
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = 
            job.position.toLowerCase().includes(searchTerm) ||
            job.companyName.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    renderJobs(filteredJobs);
}

function handleLogoFile(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Store the base64 string but don't show preview
            logoUrl.value = ''; // Clear URL input when file is selected
        };
        reader.readAsDataURL(file);
    }
}

function handleLogoUrl(e) {
    const url = e.target.value;
    if (url) {
        logoFile.value = ''; // Clear file input when URL is entered
    }
}

function showLogoPreview(src) {
    logoPreview.innerHTML = `<img src="${src}" alt="Company logo preview">`;
}

function openModal(isEditing = false) {
    const modal = document.getElementById('jobModal');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    if (!isEditing) {
        jobForm.reset();
        document.getElementById('modalTitle').textContent = 'Add New Job Opening';
        document.getElementById('deleteBtn').style.display = 'none';
    }
}

function closeModal() {
    const modal = document.getElementById('jobModal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Reset the form
    document.getElementById('jobForm').reset();
    editingJobId = null;
    
    // Reset modal title and hide delete button
    document.getElementById('modalTitle').textContent = 'Add Job Opening';
    document.getElementById('deleteBtn').style.display = 'none';
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Add new function for pagination controls
function renderPagination(totalPages, totalJobs) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';

    // Previous button
    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.className = 'pagination-btn';
    if (currentPage === 1) {
        prevLink.classList.add('disabled');
        prevLink.style.visibility = 'hidden';
    }
    prevLink.textContent = '« Previous';
    prevLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderJobs();
        }
    };

    // Page info
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${Math.max(totalPages, 1)}`;
    pageInfo.innerHTML += `<div>Showing ${totalJobs ? ((currentPage-1)*jobsPerPage + 1) + '-' + Math.min(currentPage*jobsPerPage, totalJobs) : '0'} of ${totalJobs}</div>`;

    // Next button
    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.className = 'pagination-btn';
    if (currentPage === totalPages) {
        nextLink.classList.add('disabled');
        nextLink.style.visibility = 'hidden';
    }
    nextLink.textContent = 'Next »';
    nextLink.onclick = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderJobs();
        }
    };

    paginationContainer.appendChild(prevLink);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextLink);

    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }
    document.querySelector('.table-container').appendChild(paginationContainer);
}

// Add window resize listener to handle viewport changes
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        renderJobs();
    }, 250);
});

// Add this at the beginning of your file with other initialization code
document.addEventListener('DOMContentLoaded', function() {
    // Get the modal and close button
    const modal = document.getElementById('jobModal');
    const closeBtn = modal.querySelector('.close-btn');
    
    // Close button click handler
    closeBtn.addEventListener('click', function() {
        closeModal();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
});

// Update event listeners to use renderJobs instead
document.addEventListener('DOMContentLoaded', () => {
    renderJobs();
});

function validateForm() {
    const requiredFields = [
        'companyName',
        'position',
        'country',
        'category',
        'description',
        'requirements'
    ];

    let isValid = true;
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (!element.value.trim()) {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    return isValid;
}

// Add these new functions
function openDeleteConfirmModal() {
    deleteConfirmModal.style.display = 'block';
    // Add dimmed class to the edit modal instead of changing opacity
    if (modal) {
        modal.classList.add('dimmed');
        modal.style.pointerEvents = 'none';
    }
}

function closeDeleteConfirmModal() {
    deleteConfirmModal.style.display = 'none';
    // Remove dimmed class from the edit modal
    if (modal) {
        modal.classList.remove('dimmed');
        modal.style.pointerEvents = 'auto';
    }
    jobToDelete = null;
}

// Add event listeners for the delete confirmation modal
cancelDeleteBtn.addEventListener('click', closeDeleteConfirmModal);
confirmDeleteBtn.addEventListener('click', () => {
    if (jobToDelete) {
        let jobs = JSON.parse(localStorage.getItem('jobs')) || [];
        jobs = jobs.filter(job => job.id != jobToDelete);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        
        // Close both modals
        closeDeleteConfirmModal();
        closeModal();
        
        // Refresh the display
        renderJobs(jobs);
    }
});

// Update the window click event listener to include both modals
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        closeModal();
    }
    if (event.target == deleteConfirmModal) {
        closeDeleteConfirmModal();
    }
}); 