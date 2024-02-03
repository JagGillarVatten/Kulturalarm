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
    if (countdownText.innerHTML !== "Inga fler händelser idag.") {
      countdownText.innerHTML = "Inga fler händelser idag.";
    }

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

    if (currentEventName !== name) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;

      document.title = `${remainingTime} tills | ${name}`;

      const countdownText = document.getElementById("countdown-text");
      if (countdownText.innerHTML !== `${name} börjar om:`) {
        countdownText.innerHTML = `${name} börjar om:`;
      }

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

    if (currentEventName !== name) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;

      const countdownText = document.getElementById("countdown-text");
      if (countdownText.innerHTML !== `Tid kvar för ${name}:`) {
        countdownText.innerHTML = `Tid kvar för ${name}:`;
      }

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
