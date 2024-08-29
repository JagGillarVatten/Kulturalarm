// Toggle dropdown
function toggleDropdown() {
const dropdownContent = document.querySelector(".dropdown-content");
const animationDuration = 0.5;

dropdownContent.classList.toggle("show");
dropdownContent.style.animation = dropdownContent.classList.contains("show") ? `fadeIn ${animationDuration}s` : `fadeOut ${animationDuration}s`;
}

// Adjust timezone
function adjustTimezone(date) {
return new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + (hourOffset || 0)) * 60 * 60 * 1000);
}

// Check if special date
function isSpecialDate(date) {
return specialDates.some(entry => entry.date === date.toISOString().split("T")[0]);
}

// Get special date
function getSpecialDate(date) {
return specialDates.find(entry => entry.date === date.toISOString().split("T")[0]);
}
// Check if snowfall period
function isSnowfallPeriod() {
    const startDate = new Date(new Date().getFullYear(),10 , 23);
    const endDate = new Date(new Date().getFullYear(), 12, 31);
    return new Date() >= startDate && new Date() <= endDate;
}

// Create snowflake
function createSnowflake() {
    const snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.style.left = `${Math.random() * window.innerWidth}px`;
    snowflake.style.position = "fixed";
    snowflake.style.top = "-10px";
    snowflake.style.fontSize = "20px";
    snowflake.style.color = "white";
    snowflake.style.opacity = "4030";
    snowflake.style.userSelect = "none";
    snowflake.style.zIndex = "1000";
    snowflake.innerHTML = "❄";
    document.body.appendChild(snowflake);

    // Animate snowflake
    const animationDuration = 5 + Math.random() * 5; // 5-10 seconds
    const horizontalMovement = -20 + Math.random() * 40; // -20px to 20px

    snowflake.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${horizontalMovement}px, ${window.innerHeight}px) rotate(360deg)` }
    ], {
        duration: animationDuration * 1000,
        easing: 'linear'
    }).onfinish = () => {
        document.body.removeChild(snowflake);
    };
}

// Start snowfall
function startSnowfall() {
    if (isSnowfallPeriod()) {
        createSnowflake();
        setTimeout(startSnowfall, 200); // Create a new snowflake every 200ms
    }
}

// Call startSnowfall when the page loads
window.addEventListener('load', startSnowfall);
// Function to update the background color every second
function updateBackground() {
const currentHour = new Date().getHours();

document.body.className = "";
if (currentHour >= 6 && currentHour < 12) {
document.body.classList.add("morning");
} else if (currentHour >= 12 && currentHour < 18) {
document.body.classList.add("afternoon");
} else if (currentHour >= 18 && currentHour < 22) {
document.body.classList.add("evening");
} else {
document.body.classList.add("night");
}
}
// Set interval for updating background
setInterval(updateBackground, 1000);


// Set interval for updating countdown
setInterval(updateCountdown, 50);

// Parallax scrolling
window.addEventListener("scroll", () => {
document.body.style.backgroundPosition = `center ${window.scrollY * 0.3}px`;
document.querySelector(".name").style.transform = `translateY(${window.scrollY * 0.2}px)`;
document.querySelector("#countdown").style.transform = `translateY(${window.scrollY * 0.2}px)`;
document.querySelector(".progress-bar").style.transform = `translateY(${window.scrollY * 0.2}px)`;
});

