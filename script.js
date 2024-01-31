// Variabeldeklarationer
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

// Timme för tidszonjustering
let hourOffset = 0;

// Funktion för att ladda JSON-data
function loadJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        console.error(`Fel vid inläsning av JSON från ${url}. Status: ${xhr.status}`);
      }
    }
  };

  xhr.send(null);
}

// Funktion för att hämta dagens händelser
function getTodaysEvents() {
  let today = new Date();
  let dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

// Funktion för att hämta nästa händelse
function getNextEvent() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaysEvents = getTodaysEvents();

  for (const event of todaysEvents) {
    const startTime = new Date(`${today.toDateString()} ${event.startTime}`);
    const endTime = new Date(`${today.toDateString()} ${event.endTime}`);

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
// Funktion för att uppdatera nedräkningen
function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = new Date();
  let nextEvent;
  const todaysEvents = getTodaysEvents();

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

    const countdownText = document.getElementById("countdown-text");
    countdownText.innerHTML = "Inga fler händelser idag.";

    const locationEl = document.getElementById("location");
    locationEl.innerHTML = "";

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.innerHTML = "Hejdå!";

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "none";

    return;
  }

  const { name, location, start, end } = nextEvent;

  if (now < start) {
    const remainingTime = formatSeconds((start - now) / 1000);

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

      const countdownText = document.getElementById("countdown-text");
      countdownText.innerHTML = `${name} börjar om:`;

      const countdownNumber = document.getElementById("countdown-number");
      countdownNumber.innerHTML = remainingTime;

      const locationEl = document.getElementById("location");
      locationEl.innerHTML = "Plats: " + currentEventLocation;

      const progressBar = document.getElementById("progress-bar");
      progressBar.style.display = "block";

      if (!sentNotifications.includes(name)) {
        new Notification(name, {
          body: `Börjar om ${remainingTime} vid ${location}`,
        });
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }

      const progressWidth = Math.max(0, ((start - now) / 1000 / (start - (start - 60 * 1000))) * 100);

      const progress = document.getElementById("progress");
      progress.style.width = `${progressWidth}%`;
      return;
    }
  } else {
    const remainingTime = formatSeconds((end - now) / 1000);

    if (
      currentEventName !== name ||
      currentEventStart !== start ||
      currentEventLocation !== location
    ) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;

      const countdownText = document.getElementById("countdown-text");
      countdownText.innerHTML = `Tid kvar för ${name}:`;

      const countdownNumber = document.getElementById("countdown-number");
      countdownNumber.innerHTML = remainingTime;

      const locationEl = document.getElementById("location");
      locationEl.innerHTML = `Plats: ${location}`;

      document.title = `${remainingTime} kvar | ${name}`;
    }

    if (
      !currentEventSentNotification &&
      now >= start &&
      !sentNotifications.includes(name)
    ) {
      new Notification(name, {
        body: `Pågår just nu vid ${location}`,
      });
      sentNotifications.push(name);
      currentEventSentNotification = true;
    }

    const progressWidth = Math.max(0, ((now - start) / 1000 / ((end - start) / 1000)) * 100);

    const progress = document.getElementById("progress");
    progress.style.width = `${progressWidth}%`;

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "block";
  }
}

// Funktion för att formatera sekunder till en tidssträng
function formatSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

// Funktion för att fylla på med nollor framför ett värde
function pad(value, length) {
  return ("000000000" + value).substr(-length);
}

// Funktion för att ladda händelsefil
function loadEventFile(filename) {
  loadJSON(`scheman/${filename}`, (data) => {
    console.log("Inläst data:", data);

    if (Array.isArray(data)) {
      events = data.filter((entry) => !entry.specialDate);
      specialDates = data.filter((entry) => entry.specialDate);
    } else {
      events = data;
      specialDates = [];
    }
    console.log("Vanliga händelser:", events);
    console.log("Speciella datum:", specialDates);

    updateCountdown();
  });
}

// Funktion för att initiera applikationen
function init() {

  // Create fullscreen button
  const fullscreenButton = document.createElement('button');
  fullscreenButton.textContent = 'Fullscreen';
  fullscreenButton.style.position = 'fixed';
  fullscreenButton.style.bottom = '20px';
  fullscreenButton.style.right = '20px';
  fullscreenButton.opacity = 0;

  // Show on hover
  fullscreenButton.addEventListener('mouseover', () => {
    fullscreenButton.style.opacity = 1;
  });

  // Hide on mouseout
  fullscreenButton.addEventListener('mouseout', () => {
    fullscreenButton.style.opacity = 0;
    fullscreenButton.style.transition = 'opacity 0.2s';
  });

  // Toggle fullscreen on click
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenButton.textContent = 'Exit Fullscreen';

      // Hide cursor after 3 seconds inactive
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

  // Add button to DOM
  document.body.appendChild(fullscreenButton);

  // Get dropdown elements
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");

  // Get weekdays
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

  // Add schedule options
  eventFiles.forEach(file => {
    const anchor = document.createElement('a');
    anchor.innerText = file.name;
    anchor.onclick = () => {
      loadEventFile(file.url, () => {
        loadEventFile('specialDates.json', updateCountdown);
      });
      closeDropdown();
    };

    anchor.addEventListener('click', () => { });
    dropdownContent.appendChild(anchor);
  });

  // Load default schedule
  loadEventFile(eventFiles[0].url);

  // Toggle dropdown on button click
  dropdownButton.addEventListener('click', toggleDropdown);

  // Timezone buttons
  document.getElementById('plus-button').addEventListener('click', () => {
    hourOffset++;
    updateCountdown();
  });

  document.getElementById('minus-button').addEventListener('click', () => {
    hourOffset--;
    updateCountdown();
  });

}

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
// Function to update the background color 
function updateBackground() {

  const times = [
    { start: 6, end: 12, color: "#f65e7" }, // morning
    { start: 12, end: 14, color: "#8e7eEEB" }, // afternoon 
    { start: 18, end: 22, color: "#eb0932" }, // evening
    { start: 22, end: 24, color: "#2b0232" } // night
  ];

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  let color;

  times.forEach(time => {
    if (hour >= time.start && hour < time.end) {
      const progress = (hour - time.start + minute / 60) / (time.end - time.start);
      color = interpolateColor(times[times.indexOf(time) - 1].color, time.color, progress);
    }
  });

  document.body.style.backgroundColor = color;

}

// Function to interpolate between two colors
function interpolateColor(color1, color2, factor) {

  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return "#" + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');

}

// Update background color every 500ms
setInterval(updateBackground, 500);
