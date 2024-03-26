// Toggle dropdown
function toggleDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");

  // Add fade in animation 
  dropdownContent.style.animation = "fadeIn 0.5s";
}

// Close dropdown
function closeDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.remove("show");

  // Add fade out animation
  dropdownContent.style.animation = "fadeOut 0.5s";
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
  let currentDate = new Date();
  return currentDate >= new Date(currentDate.getFullYear(), 10, 23)
    && currentDate <= new Date(currentDate.getFullYear(), 11, 31);
}

// Create snowflake
function createSnowflake() {
  let snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  document.body.appendChild(snowflake);

  snowflake.addEventListener("animationend", () => {
    document.body.removeChild(snowflake);
  });
}


// Function to update the background color every second
function updateBackground() {
  let body = document.body;

  let currentHour = new Date().getHours();
  let currentMinute = new Date().getMinutes();

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

// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Function to update the background color every second
setInterval(updateBackground, 1000);
