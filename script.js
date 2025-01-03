// Add this at the beginning of your script
document.addEventListener('DOMContentLoaded', () => {
    // Remove preload class to allow transitions after page loads
    document.body.classList.remove('preload');

    // Add transition-fade class to main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.add('transition-fade');
    }

    // Handle internal navigation
    document.querySelectorAll('a').forEach(link => {
        if (link.href && link.href.includes(window.location.origin)) {
            link.addEventListener('click', function(e) {
                // Don't prevent default if it's a navigation link
                const target = this.href;
                
                // Add fade-out effect
                if (mainContent) {
                    mainContent.classList.add('fade-out');
                }
                
                // Navigate after brief transition
                setTimeout(() => {
                    window.location.href = target;
                }, 150);
            });
        }
    });
});

// Add preload class before page loads
document.documentElement.classList.add('preload');

// Remove preload and fade-out classes when page is shown
window.addEventListener('pageshow', function(event) {
    document.documentElement.classList.remove('preload');
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove('fade-out');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Form submission handling
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get the submit button
    const submitButton = this.querySelector('button[type="submit"]');
    
    try {
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Simulate form submission (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success
        const currentLang = localStorage.getItem('preferred-language') || 'en';
        alert(alertMessages[currentLang]);
        this.reset();
        
    } catch (error) {
        alert('An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = translations[currentLang].form_submit;
    }
});

// Navigation background change on scroll
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('nav').style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        document.querySelector('nav').style.backgroundColor = '#fff';
    }
});

// Add file size and type validation
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('cv');
    const fileBtn = document.querySelector('.file-upload-btn');
    const fileName = document.querySelector('.file-name');
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    // File button click handler
    fileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File change handler with validation
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const lang = localStorage.getItem('preferred-language') || 'en';
        
        if (!file) {
            fileName.textContent = translations[lang]['form_file_no_file'];
            return;
        }

        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            showError(lang === 'en' ? 
                'Please upload only PDF or DOC files' : 
                'कृपया केवल PDF या DOC फ़ाइलें अपलोड करें');
            this.value = '';
            fileName.textContent = translations[lang]['form_file_no_file'];
            return;
        }

        // Validate file size
        if (file.size > maxSize) {
            showError(lang === 'en' ? 
                'File size should not exceed 5MB' : 
                'फ़ाइल का आकार 5MB से अधिक नहीं होना चाहिए');
            this.value = '';
            fileName.textContent = translations[lang]['form_file_no_file'];
            return;
        }

        // Show success state
        fileName.textContent = file.name;
        showSuccess(lang === 'en' ? 
            'File selected successfully' : 
            'फ़ाइल सफलतापूर्वक चुनी गई');
    });
});

// Error display function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'file-error';
    errorDiv.textContent = message;
    
    // Remove any existing error message
    const existingError = document.querySelector('.file-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Insert error message after file upload section
    const fileUpload = document.querySelector('.file-upload');
    fileUpload.appendChild(errorDiv);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Success display function
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'file-success';
    successDiv.textContent = message;
    
    // Remove any existing success message
    const existingSuccess = document.querySelector('.file-success');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // Insert success message after file upload section
    const fileUpload = document.querySelector('.file-upload');
    fileUpload.appendChild(successDiv);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Cookie Consent Management
document.addEventListener('DOMContentLoaded', () => {
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptBtn = cookieConsent.querySelector('.accept');
    const declineBtn = cookieConsent.querySelector('.decline');

    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    
    if (!cookieChoice) {
        setTimeout(() => {
            cookieConsent.classList.add('active');
        }, 2000); // Show after 2 seconds
    }

    // Cookie consent handlers
    acceptBtn.addEventListener('click', () => {
        setCookieConsent(true);
        cookieConsent.classList.remove('active');
        initializeAnalytics(); // Function to initialize your analytics
    });

    declineBtn.addEventListener('click', () => {
        setCookieConsent(false);
        cookieConsent.classList.remove('active');
    });
});

function setCookieConsent(accepted) {
    localStorage.setItem('cookieConsent', accepted);
    
    if (accepted) {
        // Set cookies for analytics and tracking
        setCookie('userConsent', 'true', 365);
        // You can add more cookies here
    }
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function initializeAnalytics() {
    // Add your analytics initialization code here
    // For example, Google Analytics or custom tracking
    console.log('Analytics initialized');
}

// Example of tracking page views
function trackPageView() {
    if (getCookie('userConsent') === 'true') {
        // Add your page view tracking code here
        console.log('Page view tracked');
    }
}

// Track page views when navigation occurs
document.addEventListener('DOMContentLoaded', () => {
    trackPageView();
});

// Cookie Management
document.addEventListener('DOMContentLoaded', () => {
    const cookieManageBtn = document.getElementById('cookieManageBtn');
    const cookieModal = createCookieModal();
    document.body.appendChild(cookieModal);

    cookieManageBtn.addEventListener('click', () => {
        cookieModal.classList.add('active');
        loadCookiePreferences();
    });
});

function createCookieModal() {
    const modal = document.createElement('div');
    modal.className = 'cookie-modal';
    const lang = localStorage.getItem('preferred-language') || 'en';
    
    modal.innerHTML = `
        <div class="cookie-modal-content">
            <div class="cookie-modal-header">
                <h3 data-translate="cookie_modal_title">Cookie Preferences</h3>
                <button class="cookie-modal-close">&times;</button>
            </div>
            <div class="cookie-preferences">
                <div class="cookie-preference-item">
                    <div>
                        <h4 data-translate="cookie_necessary">Necessary Cookies</h4>
                        <p data-translate="cookie_necessary_desc">Essential for website functionality</p>
                    </div>
                    <input type="checkbox" checked disabled>
                </div>
                <div class="cookie-preference-item">
                    <div>
                        <h4 data-translate="cookie_analytics">Analytics Cookies</h4>
                        <p data-translate="cookie_analytics_desc">Help us improve our website</p>
                    </div>
                    <input type="checkbox" id="analyticsCookies">
                </div>
                <div class="cookie-preference-item">
                    <div>
                        <h4 data-translate="cookie_marketing">Marketing Cookies</h4>
                        <p data-translate="cookie_marketing_desc">Used for targeted advertising</p>
                    </div>
                    <input type="checkbox" id="marketingCookies">
                </div>
            </div>
            <div class="cookie-modal-buttons">
                <button class="cookie-modal-btn reset" data-translate="cookie_reset">Reset to Default</button>
                <button class="cookie-modal-btn save" data-translate="cookie_save">Save Preferences</button>
            </div>
        </div>
    `;

    // Add event listeners
    modal.querySelector('.cookie-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.querySelector('.save').addEventListener('click', () => {
        saveCookiePreferences();
        modal.classList.remove('active');
    });

    modal.querySelector('.reset').addEventListener('click', () => {
        resetCookiePreferences();
        loadCookiePreferences();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    return modal;
}

function loadCookiePreferences() {
    const analyticsCookies = document.getElementById('analyticsCookies');
    const marketingCookies = document.getElementById('marketingCookies');
    
    analyticsCookies.checked = getCookie('analyticsCookies') === 'true';
    marketingCookies.checked = getCookie('marketingCookies') === 'true';
}

function saveCookiePreferences() {
    const analyticsCookies = document.getElementById('analyticsCookies').checked;
    const marketingCookies = document.getElementById('marketingCookies').checked;
    
    setCookie('analyticsCookies', analyticsCookies, 365);
    setCookie('marketingCookies', marketingCookies, 365);
    
    // Update analytics based on new preferences
    if (analyticsCookies) {
        initializeAnalytics();
    }
}

function resetCookiePreferences() {
    setCookie('analyticsCookies', false, 365);
    setCookie('marketingCookies', false, 365);
}

document.addEventListener('DOMContentLoaded', () => {
    // Create intersection observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const imageUrl = card.dataset.bgImage;
                
                // Add loading class
                card.classList.add('loading');
                
                // Create new image to preload
                const img = new Image();
                img.onload = () => {
                    // Once image is loaded, set as background and remove loading class
                    card.style.backgroundImage = `url(${imageUrl})`;
                    card.classList.remove('loading');
                };
                img.src = imageUrl;
                
                // Stop observing this element
                observer.unobserve(card);
            }
        });
    }, {
        rootMargin: '50px' // Start loading when image is 50px from viewport
    });

    // Observe all skill cards
    document.querySelectorAll('[data-bg-image]').forEach(card => {
        imageObserver.observe(card);
    });
});

// Add loading state to language switching
function changeLanguage(lang) {
    // Store the selected language
    localStorage.setItem('preferred-language', lang);
    
    // Update text content
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang][key]) {
            if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Update placeholders specifically
    document.querySelectorAll('input, textarea').forEach(element => {
        const placeholderKey = element.getAttribute('data-translate-placeholder');
        if (placeholderKey && translations[lang][placeholderKey]) {
            element.placeholder = translations[lang][placeholderKey];
        }
    });

    // Update language buttons active state
    document.querySelectorAll('.lang-link').forEach(btn => {
        btn.classList.remove('current');
        if ((lang === 'hi' && btn.getAttribute('onclick').includes('hi')) ||
            (lang === 'en' && btn.getAttribute('onclick').includes('en'))) {
            btn.classList.add('current');
        }
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set up language switcher buttons
    document.querySelectorAll('.lang-link').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('onclick').includes('hi') ? 'hi' : 'en';
            changeLanguage(lang);
        });
    });

    // Initialize with stored language preference or default to English
    const storedLang = localStorage.getItem('preferred-language') || 'en';
    changeLanguage(storedLang);
});

// Add mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Change icon between bars and times
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

function updatePageTranslations(lang) {
    // Update text content for elements with data-translate attribute
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
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });
}

// Call this when the page loads and when language changes
document.addEventListener('DOMContentLoaded', () => {
    const currentLang = localStorage.getItem('preferred-language') || 'en';
    updatePageTranslations(currentLang);
}); 