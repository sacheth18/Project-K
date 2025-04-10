// Check for saved start date or create a new one
const STORAGE_KEY = 'project-k-start-date';
let startDate;

// Initialize with system preference for dark/light mode
function initTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (savedTheme === null && prefersDarkScheme)) {
        document.body.classList.add('dark-theme');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    });
}

// Initialize countdown data
function initCountdown() {
    if (localStorage.getItem(STORAGE_KEY)) {
        startDate = parseInt(localStorage.getItem(STORAGE_KEY));
        document.getElementById('last-updated').textContent = new Date(startDate).toLocaleDateString();
    } else {
        startDate = new Date().getTime();
        localStorage.setItem(STORAGE_KEY, startDate);
        document.getElementById('last-updated').textContent = 'Now';
    }
    
    // Set the target date (August 1, 2028)
    const targetDate = new Date('August 1, 2028 00:00:00').getTime();
    
    // Create week boxes with appropriate animations
    createWeekBoxes(startDate, targetDate);
    
    // Do initial update
    updateCountdown(startDate, targetDate);
    
    // Set recurring updates
    setInterval(() => updateCountdown(startDate, targetDate), 3600000); // Update every hour
}

// Create the week boxes
function createWeekBoxes(startDate, targetDate) {
    const weeksGrid = document.getElementById('weeks-grid');
    weeksGrid.innerHTML = ''; // Clear existing boxes
    
    const totalWeeks = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    
    // Create week boxes with staggered animation
    for (let i = 0; i < totalWeeks; i++) {
        const weekBox = document.createElement('div');
        weekBox.className = 'week-box week-box-new';
        weekBox.id = `week-${i}`;
        
        const weekDate = new Date(startDate + i * 7 * 24 * 60 * 60 * 1000);
        const formattedDate = weekDate.toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        weekBox.title = `Week ${i + 1} (${formattedDate})`;
        weekBox.setAttribute('aria-label', `Week ${i + 1} starting ${formattedDate}`);
        
        // Stagger the animations
        weekBox.style.animationDelay = `${i * 10}ms`;
        
        // Add click event to show week details
        weekBox.addEventListener('click', () => {
            alert(`Week ${i + 1} (${i+1} of ${totalWeeks})\nStarts: ${formattedDate}`);
        });
        
        weeksGrid.appendChild(weekBox);
    }
}

// Update the countdown display
function updateCountdown(startDate, targetDate) {
    // Get current date and time
    const now = new Date().getTime();
    
    // Calculate time remaining
    const timeRemaining = targetDate - now;
    const timeElapsed = now - startDate;
    const totalTime = targetDate - startDate;
    
    // Calculate weeks
    const totalWeeks = Math.ceil(totalTime / (1000 * 60 * 60 * 24 * 7));
    const weeksRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24 * 7));
    const weeksPassed = totalWeeks - weeksRemaining;
    
    // Calculate days
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
    
    // Calculate years, months, days for detailed breakdown
    const msPerDay = 1000 * 60 * 60 * 24;
    const yearsRemaining = Math.floor(timeRemaining / (msPerDay * 365));
    const monthsRemaining = Math.floor((timeRemaining % (msPerDay * 365)) / (msPerDay * 30));
    const daysRemainingDetail = Math.floor((timeRemaining % (msPerDay * 30)) / msPerDay);
    
    // Calculate percentage with 1 decimal place
    const percentageCompleted = ((timeElapsed / totalTime) * 100).toFixed(1);
    
    // Update the display with smooth animations
    animateCounter('weeks-count', weeksRemaining);
    document.getElementById('weeks-passed').textContent = weeksPassed;
    document.getElementById('days-remaining').textContent = daysRemaining;
    document.getElementById('percentage').textContent = percentageCompleted + '%';
    
    // Update detailed stats
    document.getElementById('years-remaining').textContent = yearsRemaining;
    document.getElementById('months-remaining').textContent = monthsRemaining;
    document.getElementById('days-remaining-detail').textContent = daysRemainingDetail;
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = `${percentageCompleted}%`;
    progressBar.setAttribute('aria-valuenow', percentageCompleted);
    
    // Update week boxes
    for (let i = 0; i < totalWeeks; i++) {
        const weekBox = document.getElementById(`week-${i}`);
        if (weekBox) {
            if (i < weeksPassed) {
                if (!weekBox.classList.contains('filled')) {
                    weekBox.classList.add('filled');
                }
            } else {
                weekBox.classList.remove('filled');
            }
        }
    }
    
    // If countdown is finished
    if (timeRemaining < 0) {
        document.getElementById('weeks-count').textContent = "0";
        document.getElementById('days-remaining').textContent = "0";
        document.getElementById('percentage').textContent = "100%";
        document.getElementById('progress-bar').style.width = "100%";
        
        // Fill all boxes
        for (let i = 0; i < totalWeeks; i++) {
            const weekBox = document.getElementById(`week-${i}`);
            if (weekBox) {
                weekBox.classList.add('filled');
            }
        }
    }
}

// Animate counter for smooth number transitions
function animateCounter(id, targetValue) {
    const element = document.getElementById(id);
    const startValue = parseInt(element.textContent) || 0;
    const duration = 500; // ms
    const startTime = performance.now();
    
    function updateValue(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuad = progress * (2 - progress);
        
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuad);
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCountdown();
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });
    
    // Reset button
    document.getElementById('reset-button').addEventListener('click', () => {
        if (confirm('Reset the countdown to today? This will change when the countdown started.')) {
            startDate = new Date().getTime();
            localStorage.setItem(STORAGE_KEY, startDate);
            document.getElementById('last-updated').textContent = 'Now';
            
            // Reinitialize with new start date
            const targetDate = new Date('August 1, 2028 00:00:00').getTime();
            createWeekBoxes(startDate, targetDate);
            updateCountdown(startDate, targetDate);
        }
    });
});