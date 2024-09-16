// Toggle dropdown
const toggleDropdown = () => {
    const dropdownContent = document.querySelector(".dropdown-content");
    const animationDuration = 0.5;
    const isShowing = dropdownContent.classList.toggle("show");
    dropdownContent.style.animation = `fade${isShowing ? 'In' : 'Out'} ${animationDuration}s`;
};

// Adjust timezone
const adjustTimezone = date => new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + (hourOffset || 0)) * 3600000);

// Check if special date
const isSpecialDate = date => specialDates.some(entry => entry.date === date.toISOString().split("T")[0]);

// Get special date
const getSpecialDate = date => specialDates.find(entry => entry.date === date.toISOString().split("T")[0]);

// Check if snowfall period
const isSnowfallPeriod = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 10, 23);
    const endDate = new Date(now.getFullYear(), 11, 31);
    return now >= startDate && now <= endDate;
};

// Create snowflake
const createSnowflake = () => {
    const snowflake = document.createElement("div");
    Object.assign(snowflake.style, {
        left: `${Math.random() * window.innerWidth}px`,
        position: "fixed",
        top: "-10px",
        fontSize: "20px",
        color: "white",
        opacity: "0.7",
        userSelect: "none",
        zIndex: "1000"
    });
    snowflake.className = "snowflake";
    snowflake.innerHTML = "❄";
    document.body.appendChild(snowflake);

    const animationDuration = 5 + Math.random() * 5;
    const horizontalMovement = -20 + Math.random() * 40;

    snowflake.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${horizontalMovement}px, ${window.innerHeight}px) rotate(360deg)` }
    ], {
        duration: animationDuration * 1000,
        easing: 'linear'
    }).onfinish = () => document.body.removeChild(snowflake);
};

// Start snowfall
const startSnowfall = () => {
    if (isSnowfallPeriod()) {
        createSnowflake();
        setTimeout(startSnowfall, 200);
    }
};

// Function to update the background color every second
const updateBackground = () => {
    const currentHour = new Date().getHours();
    const timeOfDay = 
        currentHour >= 6 && currentHour < 12 ? 'morning' :
        currentHour >= 12 && currentHour < 18 ? 'afternoon' :
        currentHour >= 18 && currentHour < 22 ? 'evening' : 'night';
    document.body.style.backgroundColor = `var(--${timeOfDay}-bg-color)`;
};

// Event listeners and intervals
window.addEventListener('load', startSnowfall);
setInterval(updateBackground, 1000);
setInterval(updateCountdown, 50);

// Parallax scrolling
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.body.style.backgroundPosition = `center ${scrollY * 0.3}px`;
    ['name', 'countdown', 'progress-bar'].forEach(className => {
        document.querySelector(`.${className}`).style.transform = `translateY(${scrollY * 0.2}px)`;
    });
});
