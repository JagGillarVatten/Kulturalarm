// Toggle dropdown
function toggleDropdown() {
    const dropdownContent = document.querySelector(".dropdown-content");
    const animationDuration = 0.5;
    const isShowing = dropdownContent.classList.toggle("show");
    dropdownContent.style.animation = `fade${isShowing ? 'In' : 'Out'} ${animationDuration}s`;
}

// Adjust timezone
function adjustTimezone(date) {
    const offset = (userTimeZoneOffset + ukTimeZoneOffset + (hourOffset || 0)) * 60 * 60 * 1000;
    return new Date(date.getTime() + offset);
}

// Check if special date
function isSpecialDate(date) {
    const dateString = date.toISOString().split("T")[0];
    return specialDates.some(entry => entry.date === dateString);
}

// Get special date
function getSpecialDate(date) {
    const dateString = date.toISOString().split("T")[0];
    return specialDates.find(entry => entry.date === dateString);
}

// Check if snowfall period
function isSnowfallPeriod() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, 10, 23); // November 23rd
    const endDate = new Date(currentYear, 11, 31); // December 31st
    return currentDate >= startDate && currentDate <= endDate;
}

// Create snowflake
function createSnowflake() {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: -10px;
        font-size: 20px;
        color: white;
        opacity: 0.7;
        user-select: none;
        z-index: 1000;
    `;
    snowflake.textContent = "❄";
    document.body.appendChild(snowflake);

    animateSnowflake(snowflake);
}

// Animate snowflake
function animateSnowflake(snowflake) {
    const animationDuration = 5 + Math.random() * 5; // 5-10 seconds
    const horizontalMovement = -20 + Math.random() * 40; // -20px to 20px

    snowflake.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${horizontalMovement}px, ${window.innerHeight}px) rotate(360deg)` }
    ], {
        duration: animationDuration * 1000,
        easing: 'linear'
    }).onfinish = () => {
        snowflake.remove();
    };
}

// Start snowfall
function startSnowfall() {
    if (isSnowfallPeriod()) {
        createSnowflake();
        setTimeout(startSnowfall, 200); // Create a new snowflake every 200ms
    }
}

// Function to update the background color
function updateBackground() {
    const currentHour = new Date().getHours();
    let timeOfDay;

    if (currentHour >= 6 && currentHour < 12) {
        timeOfDay = 'morning';
    } else if (currentHour >= 12 && currentHour < 18) {
        timeOfDay = 'afternoon';
    } else if (currentHour >= 18 && currentHour < 22) {
        timeOfDay = 'evening';
    } else {
        timeOfDay = 'night';
    }

    document.body.style.backgroundColor = `var(--${timeOfDay}-bg-color)`;
}

// Initialize page
function initializePage() {
    startSnowfall();
    setInterval(updateBackground, 60000); // Update background every minute
    setInterval(updateCountdown, 50);
    updateBackground(); // Initial background update
}

// Parallax scrolling
function handleParallax() {
    const scrollY = window.scrollY;
    document.body.style.backgroundPosition = `center ${scrollY * 0.3}px`;
    const parallaxElements = [".name", "#countdown", ".progress-bar"];
    parallaxElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
    });
}

// Event listeners
window.addEventListener('load', initializePage);
window.addEventListener("scroll", handleParallax);
