// Toggle dropdown
function toggleDropdown() {
const dropdownContent = document.querySelector(".dropdown-content");
dropdownContent.classList.toggle("show");
dropdownContent.style.animation = dropdownContent.classList.contains("show") ? "fadeIn 0.5s" : "fadeOut 0.5s";
document.body.style.filter = dropdownContent.classList.contains("show") ? "blur(5px)" : "none";
const dropdownButton = document.querySelector(".dropdown-button");
dropdownButton.style.animation = dropdownContent.classList.contains("show") ? "pulse 0.5s" : "";
}

// Adjust timezone
function adjustTimezone(date) {
return new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 60 * 1000);
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
const currentDate = new Date();
return currentDate >= new Date(currentDate.getFullYear(), 10, 23) && currentDate <= new Date(currentDate.getFullYear(), 11, 31);
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
const body = document.body;
const currentHour = new Date().getHours();

body.classList.remove("morning", "afternoon", "evening", "night");

if (currentHour >= 6 && currentHour < 12) {
body.classList.add("morning");
} else if (currentHour >= 12 && currentHour < 18) {
body.classList.add("afternoon");
} else if (currentHour >= 18 && currentHour < 22) {
body.classList.add("evening");
} else {
body.classList.add("night");
}
}

// Function to update the background color every second
setInterval(updateBackground, 1000);

// Function to create snowflakes every 50 milliseconds
setInterval(createSnowflake, 50);

// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Parallax scrolling
window.addEventListener("scroll", () => {
const scrollPosition = window.scrollY;
document.body.style.backgroundPosition = `center ${scrollPosition * 0.3}px`;
document.querySelector(".name").style.transform = `translateY(${scrollPosition * 0.2}px)`;
document.querySelector("#countdown").style.transform = `translateY(${scrollPosition * 0.2}px)`;
document.querySelector(".progress-bar").style.transform = `translateY(${scrollPosition * 0.2}px)`;
});

