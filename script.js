document.addEventListener('DOMContentLoaded', function() {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Apply the saved theme
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
    
    // Navigation between pages
    const navLinks = document.querySelectorAll('.nav a');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and pages
            navLinks.forEach(l => l.classList.remove('active'));
            pages.forEach(page => page.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding page
            const pageId = this.id.replace('-link', '-page');
            document.getElementById(pageId).classList.add('active');
        });
    });
    
    // User dropdown
    const userMenu = document.getElementById('user-menu');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    userMenu.addEventListener('click', function() {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userMenu.contains(e.target) && !dropdownContent.contains(e.target)) {
            dropdownContent.style.display = 'none';
        }
    });
    
    // Testimonial carousel
    const testimonials = document.querySelectorAll('.testimonial');
    const indicators = document.querySelectorAll('.indicator');
    const prevTestimonial = document.getElementById('prev-testimonial');
    const nextTestimonial = document.getElementById('next-testimonial');
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        testimonials[index].classList.add('active');
        indicators[index].classList.add('active');
        currentTestimonial = index;
    }
    
    prevTestimonial.addEventListener('click', function() {
        let newIndex = currentTestimonial - 1;
        if (newIndex < 0) newIndex = testimonials.length - 1;
        showTestimonial(newIndex);
    });
    
    nextTestimonial.addEventListener('click', function() {
        let newIndex = currentTestimonial + 1;
        if (newIndex >= testimonials.length) newIndex = 0;
        showTestimonial(newIndex);
    });
    
    // Click on indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showTestimonial(index));
    });
    
    // Auto-rotate testimonials
    setInterval(() => {
        let newIndex = currentTestimonial + 1;
        if (newIndex >= testimonials.length) newIndex = 0;
        showTestimonial(newIndex);
    }, 5000);
    
    // Profile edit toggle
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileSection = document.querySelector('.profile-section');
    const profileEditForm = document.querySelector('.profile-edit-form');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    editProfileBtn.addEventListener('click', function() {
        profileSection.style.display = 'none';
        profileEditForm.style.display = 'block';
    });
    
    cancelEditBtn.addEventListener('click', function() {
        profileSection.style.display = 'flex';
        profileEditForm.style.display = 'none';
    });
    
    saveProfileBtn.addEventListener('click', function() {
        const newName = document.getElementById('edit-name').value;
        const newLocation = document.getElementById('edit-location').value;
        
        // Update profile info
        document.querySelector('.profile-details h3').textContent = newName;
        document.querySelector('.profile-details p').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${newLocation}`;
        
        profileSection.style.display = 'flex';
        profileEditForm.style.display = 'none';
        
        // Show success message
        alert('Profile updated successfully!');
    });
    
    // Add skills functionality
    const addOfferedSkillBtn = document.getElementById('add-offered-skill');
    const addWantedSkillBtn = document.getElementById('add-wanted-skill');
    const offeredSkillsList = document.getElementById('offered-skills');
    const wantedSkillsList = document.getElementById('wanted-skills');
    
    addOfferedSkillBtn.addEventListener('click', function() {
        const newSkill = document.getElementById('new-offered-skill').value.trim();
        if (newSkill) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${newSkill}</span>
                <button class="btn-icon remove-skill"><i class="fas fa-times"></i></button>
            `;
            offeredSkillsList.appendChild(li);
            document.getElementById('new-offered-skill').value = '';
            
            // Add event listener to new remove button
            li.querySelector('.remove-skill').addEventListener('click', function() {
                li.remove();
            });
        }
    });
    
    addWantedSkillBtn.addEventListener('click', function() {
        const newSkill = document.getElementById('new-wanted-skill').value.trim();
        if (newSkill) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${newSkill}</span>
                <button class="btn-icon remove-skill"><i class="fas fa-times"></i></button>
            `;
            wantedSkillsList.appendChild(li);
            document.getElementById('new-wanted-skill').value = '';
            
            // Add event listener to new remove button
            li.querySelector('.remove-skill').addEventListener('click', function() {
                li.remove();
            });
        }
    });
    
    // Existing remove skill buttons
    document.querySelectorAll('.remove-skill').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Swap tabs functionality
    const swapTabs = document.querySelectorAll('.swap-tabs .tab-btn');
    const swapTabContents = document.querySelectorAll('.swap-tab-content');
    
    swapTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            swapTabs.forEach(t => t.classList.remove('active'));
            swapTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Admin tabs functionality
    const adminTabs = document.querySelectorAll('.admin-tabs .tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    
    adminTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            adminTabs.forEach(t => t.classList.remove('active'));
            adminTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Request swap modal
    const requestSwapBtns = document.querySelectorAll('.request-swap-btn');
    const swapModal = document.getElementById('swap-modal');
    const closeModal = document.querySelectorAll('.close-modal');
    const sendSwapRequestBtn = document.getElementById('send-swap-request');
    
    requestSwapBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const profileCard = this.closest('.profile-card');
            const userName = profileCard.querySelector('.profile-info h3').textContent;
            const userPhoto = profileCard.querySelector('.profile-photo').src;
            const userSkill = profileCard.querySelector('.skills-wanted li').textContent;
            const yourSkill = document.querySelector('#offered-skills li').textContent;
            
            // Update modal content
            document.querySelector('#swap-modal .swap-party:nth-child(3) img').src = userPhoto;
            document.getElementById('your-offer').textContent = yourSkill;
            document.getElementById('their-skill').textContent = userSkill;
            
            // Show modal
            swapModal.style.display = 'flex';
        });
    });
    
    sendSwapRequestBtn.addEventListener('click', function() {
        swapModal.style.display = 'none';
        alert('Swap request sent successfully!');
    });
    
    // Feedback modal
    const feedbackModal = document.getElementById('feedback-modal');
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    const ratingStars = document.querySelectorAll('.rating-input i');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            // Update stars display
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('active');
                    s.classList.add('far');
                    s.classList.remove('fas');
                }
            });
        });
    });
    
    submitFeedbackBtn.addEventListener('click', function() {
        feedbackModal.style.display = 'none';
        alert('Thank you for your feedback!');
    });
    
    // Close modals
    closeModal.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Swap actions
    document.querySelectorAll('.accept-swap-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const swapCard = this.closest('.swap-card');
            alert('Swap accepted! You can now coordinate details with the other user.');
            swapCard.remove();
        });
    });
    
    document.querySelectorAll('.reject-swap-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const swapCard = this.closest('.swap-card');
            if (confirm('Are you sure you want to reject this swap request?')) {
                swapCard.remove();
            }
        });
    });
    
    document.querySelectorAll('.cancel-swap-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const swapCard = this.closest('.swap-card');
            if (confirm('Are you sure you want to cancel this swap request?')) {
                swapCard.remove();
            }
        });
    });
    
    document.querySelectorAll('.view-feedback-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            feedbackModal.style.display = 'flex';
        });
    });
    
    // Admin actions
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.moderation-item');
            alert('Skill approved successfully.');
            item.remove();
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.moderation-item');
            if (confirm('Are you sure you want to reject this skill?')) {
                alert('Skill rejected.');
                item.remove();
            }
        });
    });
    
    document.querySelectorAll('.warn-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Warning sent to user.');
        });
    });
    
    document.querySelectorAll('.ban-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.moderation-item');
            if (confirm('Are you sure you want to ban this user?')) {
                alert('User banned.');
                item.remove();
            }
        });
    });
    
    // Simulate admin user
    const adminLink = document.getElementById('admin-link');
    const adminPages = document.querySelectorAll('.admin-only');
    
    // Uncomment to enable admin features
    // adminLink.style.display = 'block';
    // adminPages.forEach(page => page.style.display = 'block');
    
    // For demo purposes, show admin features when clicking the admin link
    adminLink.addEventListener('click', function(e) {
        e.preventDefault();
        adminPages.forEach(page => page.style.display = 'block');
        document.querySelector('.nav a.active').classList.remove('active');
        document.querySelector('.page.active').classList.remove('active');
        this.classList.add('active');
        document.getElementById('admin-page').classList.add('active');
    });
    
    // How it works button
    const howItWorksBtn = document.getElementById('how-it-works-btn');
    
    howItWorksBtn.addEventListener('click', function() {
        alert('SkillSwap allows you to exchange skills with others without money changing hands. List what you can offer and what you\'re looking for, then connect with matching users!');
    });
    
    // Get started button
    const getStartedBtn = document.getElementById('get-started-btn');
    
    getStartedBtn.addEventListener('click', function() {
        document.querySelector('.nav a.active').classList.remove('active');
        document.querySelector('.page.active').classList.remove('active');
        document.getElementById('my-profile-link').classList.add('active');
        document.getElementById('profile-page').classList.add('active');
    });
    
    // Profile visibility toggle
    const profileVisibility = document.getElementById('profile-visibility');
    
    profileVisibility.addEventListener('change', function() {
        const statusText = this.checked ? 'Public Profile' : 'Private Profile';
        document.querySelector('.profile-status span').textContent = statusText;
        alert(`Profile set to ${statusText}`);
    });
    
    // Simulate login/logout
    const logoutLink = document.getElementById('logout-link');
    
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            alert('You have been logged out. Redirecting to home page.');
            document.querySelector('.nav a.active').classList.remove('active');
            document.querySelector('.page.active').classList.remove('active');
            document.getElementById('home-link').classList.add('active');
            document.getElementById('home-page').classList.add('active');
        }
    });
});
