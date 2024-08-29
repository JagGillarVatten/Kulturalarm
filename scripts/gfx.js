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
const startDate = new Date(new Date().getFullYear(), 10, 23);
const endDate = new Date(new Date().getFullYear(), 11, 31);
return new Date() >= startDate && new Date() <= endDate;
}

// Create snowflake
function createSnowflake() {
const snowflake = document.createElement("div");
snowflake.className = "snowflake";
snowflake.style.left = `${Math.random() * window.innerWidth}px`;
document.body.appendChild(snowflake);

snowflake.addEventListener("animationend", () => {
document.body.removeChild(snowflake);
});
}

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

// Set interval for creating snowflakes
setInterval(createSnowflake, 50);

// Set interval for updating countdown
setInterval(updateCountdown, 50);

// Parallax scrolling
window.addEventListener("scroll", () => {
document.body.style.backgroundPosition = `center ${window.scrollY * 0.3}px`;
document.querySelector(".name").style.transform = `translateY(${window.scrollY * 0.2}px)`;
document.querySelector("#countdown").style.transform = `translateY(${window.scrollY * 0.2}px)`;
document.querySelector(".progress-bar").style.transform = `translateY(${window.scrollY * 0.2}px)`;
});

