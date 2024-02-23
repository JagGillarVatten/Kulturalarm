
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
  let morningColor = "#f6d7a7";
  let afternoonColor = "#a7d7eb";
  let eveningColor = "#d7a7eb";
  let nightColor = "#a7a7d7";

  let currentHour = new Date().getHours();
  let currentMinute = new Date().getMinutes();

  let morningStart = 6;
  let morningEnd = 12;

  let afternoonStart = 12;
  let afternoonEnd = 18;

  let eveningStart = 18;
  let eveningEnd = 22;

  if (currentHour >= morningStart && currentHour < morningEnd) {
    let morningProgress = (currentHour - morningStart + currentMinute / 60) / (morningEnd - morningStart);
    body.style.backgroundColor = interpolateColor(nightColor, morningColor, morningProgress);
  } else if (currentHour >= afternoonStart && currentHour < afternoonEnd) {
    let afternoonProgress = (currentHour - afternoonStart + currentMinute / 60) / (afternoonEnd - afternoonStart);
    body.style.backgroundColor = interpolateColor(morningColor, afternoonColor, afternoonProgress);
  } else if (currentHour >= eveningStart && currentHour < eveningEnd) {
    let eveningProgress = (currentHour - eveningStart + currentMinute / 60) / (eveningEnd - eveningStart);
    body.style.backgroundColor = interpolateColor(afternoonColor, eveningColor, eveningProgress);
  } else {
    let nightProgress = (currentHour - eveningEnd + currentMinute / 60) / (24 - eveningEnd);
    body.style.backgroundColor = interpolateColor(eveningColor, nightColor, nightProgress);
  }
}

// Function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
  let r1 = parseInt(color1.substring(1, 3), 16);
  let g1 = parseInt(color1.substring(3, 5), 16);
  let b1 = parseInt(color1.substring(5, 7), 16);

  let r2 = parseInt(color2.substring(1, 3), 16);
  let g2 = parseInt(color2.substring(3, 5), 16);
  let b2 = parseInt(color2.substring(5, 7), 16);

  let r = Math.round(r1 + factor * (r2 - r1));
  let g = Math.round(g1 + factor * (g2 - g1));
  let b = Math.round(b1 + factor * (b2 - b1));

  return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}


// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Function to update the background color every second
setInterval(updateBackground, 1000);
