// Variable Declarations
let events = [];
let sentNotifications = [];
let specialDates = [];

const eventFiles = [
  {
    name: "MP1",
    url: "MP1.json",
  },
  {
    name: "AM1",
    url: "AM1.json",
  },
  {
    name: "MP2",
    url: "MP2.json",
  },
  {
    name: "AM2",
    url: "AM2.json",
  },
];
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;

// Hour offset for timezone adjustment
let hourOffset = 0;

// Function to load JSON data
function loadJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        console.error(`Error loading JSON from ${url}. Status: ${xhr.status}`);
      }
    }
  };

  xhr.send(null);
}

// Function to get today's events
function getTodaysEvents() {
  let today = new Date();
  let dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

// Function to get the next event
function getNextEvent() {
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let todaysEvents = getTodaysEvents();

  for (let event of todaysEvents) {
    let startTime = new Date(`${today.toDateString()} ${event.startTime}`);
    let endTime = new Date(`${today.toDateString()} ${event.endTime}`);

    if (now >= startTime && now < endTime) {
      return {
        name: event.name,
        start: startTime,
        location: event.location,
        end: endTime,
      };
    }

    if (now < startTime) {
      return {
        name: event.name,
        start: startTime,
        end: endTime,
        location: event.location,
      };
    }
  }

  return null;
}

// Function to update the countdown
function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  let now = new Date();
  let nextEvent;
  let todaysEvents = getTodaysEvents();
  let eventListContainer = document.getElementById("event-list");
  let eventListUl = document.getElementById("events-ul");

  if (isSpecialDate(now)) {
    nextEvent = getSpecialDate(now);
  } else {
    nextEvent = getNextEvent();
  }

  if (nextEvent === null) {
    currentEventName = "";
    currentEventStart = null;
    currentEventLocation = "";
    currentEventSentNotification = false;

    document.getElementById("countdown-text").innerHTML =
      "Inga fler lektioner idag.";
    document.getElementById("location").innerHTML = "";
    document.getElementById("countdown-number").innerHTML = "Hejdå!";
    document.getElementById("progress-bar").style.display = "none";

    return;
  }

  let { name, location, start, end } = nextEvent;
  let countdownElement = document.getElementById("countdown");
  let progressElement = document.getElementById("progress");

  if (now < start) {
    let remainingTime = formatSeconds((start - now) / 1000);

    if (
      currentEventName !== name ||
      currentEventStart !== start ||
      currentEventLocation !== location
    ) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;

      document.title = `${remainingTime} tills | ${name}`;
      let countdownText = ` ${name} börjar om: `;
      let countdownNumber = `${remainingTime}`;

      document.getElementById("countdown-text").innerHTML = countdownText;
      document.getElementById("countdown-number").innerHTML = countdownNumber;
      document.getElementById("location").innerHTML =
        "Rum: " + currentEventLocation;
      document.getElementById("countdown").style.color = "#ffff";
      document.getElementById("progress").style.width = "";
      document.getElementById("progress").style.backgroundColor = "#a3d47a";
      document.getElementById("progress-bar").style.display = "block";

      if (!sentNotifications.includes(name)) {
        new Notification(name, {
          body: `Börjar om ${remainingTime} i ${location}`,
        });
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }

      let progressWidth =
        ((((start - now) / 1000 / (start - (start - 60 * 1000))) * 100) /
          100) *
        document.getElementById("progress-bar").offsetWidth;

      progressWidth = Math.max(0, progressWidth);

      progressElement.style.width = `${progressWidth}px`;
      return;
    }
  }

  let remainingTime = formatSeconds((end - now) / 1000);

  if (
    currentEventName !== name ||
    currentEventStart !== start ||
    currentEventLocation !== location
  ) {
    currentEventName = name;
    currentEventStart = start;
    currentEventLocation = location;
    currentEventSentNotification = false;

    let countdownText = `Tid kvar för ${name}:`;
    let countdownNumber = `${remainingTime}`;
    let locationText = `Rum: ${location}`;

    document.getElementById("countdown-text").innerHTML = countdownText;
    document.getElementById("countdown-number").innerHTML = countdownNumber;
    document.getElementById("location").innerHTML = locationText;
    document.title = `${remainingTime} kvar | ${name}`;
  }

  if (
    !currentEventSentNotification &&
    now >= start &&
    !sentNotifications.includes(name)
  ) {
    new Notification(name, {
      body: `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEventSentNotification = true;
  }

  // Calculate progress width for the ongoing event
  let progressWidth =
    ((((now - start) / 1000 / ((end - start) / 1000)) * 100) / 100) *
    document.getElementById("progress-bar").offsetWidth;

  progressWidth = Math.max(0, progressWidth); // Ensure progressWidth is not negative

  progressElement.style.width = `${progressWidth}px`;
  document.getElementById("progress-bar").style.display = "block";
}

// Function to format seconds into a time string
function formatSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

// Function to pad a value with leading zeros
function pad(value, length) {
  return ("000000000" + value).substr(-length);
}

// Function to load event file
function loadEventFile(filename) {
  loadJSON(`scheman/${filename}`, (data) => {
    console.log("Loaded data:", data);

    if (Array.isArray(data)) {
      events = data.filter((entry) => !entry.specialDate);
      specialDates = data.filter((entry) => entry.specialDate);
    } else {
      events = data;
      specialDates = [];
    }
    console.log("Regular events:", events);
    console.log("Special dates:", specialDates);

    updateCountdown();
  });
}

// Function to initialize the application
function init() {
  // Create fullscreen button
  const fullscreenButton = document.createElement('button');
  fullscreenButton.textContent = 'Fullscreen';
  fullscreenButton.style.position = 'fixed';
  fullscreenButton.style.bottom = '20px';
  fullscreenButton.style.right = '20px';
  fullscreenButton.style.opacity = '0';

  // Fade in on hover
  fullscreenButton.addEventListener('mouseover', () => {
    fullscreenButton.style.opacity = '1';
  });

  // Fade out on mouseout
  fullscreenButton.addEventListener('mouseout', () => {
    fullscreenButton.style.opacity = '0';
    fullscreenButton.style.transition = 'opacity 0.2s';
  });

  // Toggle fullscreen on click
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenButton.textContent = 'Exit Fullscreen';

      // Hide cursor after 3 seconds of inactivity
      let timeout;
      document.onmousemove = () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          document.body.style.cursor = 'none';
        }, 3000);

        document.body.style.cursor = '';
      }

    } else {
      document.exitFullscreen();
      fullscreenButton.textContent = 'Fullscreen';
    }
  });

  // Add fullscreen button to DOM
  document.body.appendChild(fullscreenButton);

  // Get dropdown elements
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");

  // Get days of week
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

  // Get current day
  const date = new Date();
  const day = date.getDay();

  // Create day element
  const dayElement = document.createElement('div');
  dayElement.textContent = days[day];

  // Fade in animation
  dayElement.style.animation = 'fadeIn 1s';

  // Add to DOM
  document.body.appendChild(dayElement);

  // Create dots
  const dotsContainer = document.createElement('div');

  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === day) {
      dot.classList.add('active');
    }

    // Fade in animation
    dot.style.animation = 'fadeIn 0.5s forwards';

    dotsContainer.appendChild(dot);
  }

  // Add to DOM
  document.body.appendChild(dotsContainer);

  // Add schema options
  eventFiles.forEach(file => {
    const anchor = document.createElement("a");
    anchor.innerText = file.name;
    anchor.onclick = () => {
      loadEventFile(file.url, () => {
        loadEventFile("specialDates.json", updateCountdown);
      });
      closeDropdown();
    };

    anchor.addEventListener("click", () => { });
    dropdownContent.appendChild(anchor);
  });

  // Load default schema
  loadEventFile(eventFiles[0].url);

  // Toggle dropdown on button click
  dropdownButton.addEventListener("click", toggleDropdown);

  // Timezone buttons
  document.getElementById("plus-button").addEventListener("click", () => {
    hourOffset++;
    updateCountdown();
  });

  document.getElementById("minus-button").addEventListener("click", () => {
    hourOffset--;
    updateCountdown();
  });
}

// Function to toggle the dropdown menu
function toggleDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");

  // Add fade in animation
  dropdownContent.style.animation = "fadeIn 0.5s";
}

// Function to close the dropdown menu
function closeDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.remove("show");

  // Add fade out animation
  dropdownContent.style.animation = "fadeOut 0.5s";
}

// Function to adjust the timezone
function adjustTimezone(date) {
  return new Date(
    date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 60 * 1000
  );
}

// Function to check if the date is a special date
function isSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
  return specialDates.some((entry) => entry.date === dateString);
}

// Function to get the special date
function getSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
  return specialDates.find((entry) => entry.date === dateString);
}

// Function to check if it is the snowfall period
function isSnowfallPeriod() {
  let currentDate = new Date();
  let startDate = new Date(currentDate.getFullYear(), 10, 23);
  let endDate = new Date(currentDate.getFullYear(), 11, 31);

  return currentDate >= startDate && currentDate <= endDate;
}

// Function to create a snowflake animation
function createSnowflake() {
  let snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  document.body.appendChild(snowflake);

  snowflake.addEventListener("animationend", () => {
    document.body.removeChild(snowflake);
  });
}

// Function to update the background color based on the time of day
function updateBackground() {
  let body = document.body;

  let morningColor = "#f65e7";
  let afternoonColor = "#87CEEB";
  let eveningColor = "#2b0932";
  let nightColor = "#0e041c";

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

// Function to initialize the application on window load
window.onload = function () {
  init();
  updateBackground();
};

// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Event listener for title click to play random sound
const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);

// Event listener for dropdown button click to play click sound and toggle dropdown
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  let clickSound = new Audio("sounds/click.mp3");
  clickSound.volume = 0.01;
  clickSound.play();
  button.classList.add("pop");
  setTimeout(() => {
    button.classList.remove("pop");
  }, 30);
});

// Variable Declarations
let ukTimeZoneOffset = 0;
let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

// Adjust timezone function
function adjustTimezone(date) {
  return new Date(
    date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 60 * 1000
  );
}

// Function to check if the date is a special date
function isSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
  return specialDates.some((entry) => entry.date === dateString);
}

// Function to get the special date
function getSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
  return specialDates.find((entry) => entry.date === dateString);
}

// Check if it is BST (British Summer Time)
let today = new Date();
let isBST = today.getTimezoneOffset() === 60;
if (isBST) {
  ukTimeZoneOffset = 1;
}

// Function to check if it is the snowfall period
function isSnowfallPeriod() {
  let currentDate = new Date();
  let startDate = new Date(currentDate.getFullYear(), 10, 23);
  let endDate = new Date(currentDate.getFullYear(), 11, 31);

  return currentDate >= startDate && currentDate <= endDate;
}

// Function to create a snowflake animation
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

  let morningColor = "#f65e7";
  let afternoonColor = "#87CEEB";
  let eveningColor = "#2b0932";
  let nightColor = "#0e041c";

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

// Function to play a random sound
function playRandomSound() {
  let sounds = ["sound1.mp3", "sound2.mp3", "sound3.mp3"];
  let randomSound = sounds[Math.floor(Math.random() * sounds.length)];
  let audio = new Audio(randomSound);
  audio.play();
}

// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Function to update the background color every second
setInterval(updateBackground, 1000);
