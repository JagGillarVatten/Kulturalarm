/**
 * Updates the countdown display by checking for the next event in the list
 * of events. If no events are found, it displays a message indicating that
 * there are no more events for the day.
 */
function updateCountdown() {
  console.log("Updating countdown...");

  if (!events.length) {
      console.log("No events found, displaying no events message...");
      setTimeout(updateCountdown, 1000);
      return;
  }

  const currentDate = new Date();
  const nextEvent = isSpecialDate(currentDate) ? getSpecialDate(currentDate) : getNextEvent();

  if (! nextEvent) {
      console.log("No next event found, displaying no events message...");
      return displayNoEventsMessage();
  }

  const {
      name,
      englishName,
      location,
      start,
      end
  } = nextEvent;
  console.log("Next event:", name, englishName, location, start, end);
  displayEvent(name, englishName, location, start, end, currentDate, currentDate < start);

  if (getTodaysEvents().length > 0 && !document.hasEventListener) {
      console.log("Adding keydown event listener...");
      document.addEventListener("keydown", handleKeyDown);
      document.hasEventListener = true;
  }
}

/**
* Displays a message indicating that there are no more events for the day.
*/
function displayNoEventsMessage() {
  console.log("Displaying no events message...");
  resetEventDetails();
  updateUIForNoEvents();
  updateProgressBarForNextEvent();
}

/**
* Resets the current event details.
*/
function resetEventDetails() {
  currentEventName = "";
  currentEventEnglishName = "";
  currentEventStart = null;
  currentEventLocation = "";
}

/**
* Updates the UI to display a message indicating that there are no more events
* for the day.
*/
function updateUIForNoEvents() {
  const countdownText = document.getElementById("countdown-text");
  countdownText.textContent = isSwedish ? "Inga fler händelser idag." : "No more events today.";

  const locationElement = document.getElementById("location");
  locationElement.textContent = "";

  const countdownNumber = document.getElementById("countdown-number");
  countdownNumber.textContent = isSwedish ? "Hejdå!" : "Goodbye!";
  countdownNumber.innerHTML = '';
}

/**
* Updates the progress bar for the next event.
*/
function updateProgressBarForNextEvent() {
  const progressBar = document.getElementById("progress-bar");
  const nextEvent = getNextEvent();
  if (nextEvent) {
      const timeUntilNextEvent = (nextEvent.start - new Date()) / 1000;
      const progress = 100 - (timeUntilNextEvent / (24 * 60 * 60)) * 100;
      updateProgressBar(progress);
      progressBar.style.display = "block";
  } else {
      progressBar.style.display = "none";
  }
}

/**
* Displays the event with the given details.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {string} location - The location of the event.
* @param {Date} start - The start time of the event.
* @param {Date} end - The end time of the event.
* @param {Date} currentDate - The current date.
* @param {boolean} isUpcoming - Whether the event is upcoming or not.
*/
function displayEvent(name, englishName, location, start, end, currentDate, isUpcoming) {
  const timeString = formatSeconds((isUpcoming ? start - currentDate : end - currentDate) / 1000);
  const detailsChanged = hasEventDetailsChanged(name, englishName, location, start);

  if (detailsChanged) {
      updateEventDetails(name, englishName, location, start);
      updateUIForEvent(name, englishName, location, isUpcoming, timeString);
      handleNotification(name, englishName, location, isUpcoming, timeString);
  }

  updateCountdownNumber(timeString);
  updateDocumentTitle(name, englishName, isUpcoming, timeString);
  updateProgressBarForEvent(start, end, currentDate, isUpcoming);
}

/**
* Checks if the event details have changed.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {string} location - The location of the event.
* @param {Date} start - The start time of the event.
* @returns {boolean} Whether the event details have changed.
*/
function hasEventDetailsChanged(name, englishName, location, start) {
  return currentEventName !== name || currentEventEnglishName !== englishName || currentEventStart !== start || currentEventLocation !== location;
}

/**
* Updates the UI to display the event with the given details.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {string} location - The location of the event.
* @param {boolean} isUpcoming - Whether the event is upcoming or not.
* @param {string} timeString - The time string for the event.
*/
function updateUIForEvent(name, englishName, location, isUpcoming, timeString) {
  const countdownText = document.getElementById("countdown-text");
  countdownText.textContent = isUpcoming ? `${
      isSwedish ? name : englishName
  } ${
      isSwedish ? "börjar om" : "starts in"
  }:` : `${
      isSwedish ? "Tid kvar för" : "Time left for"
  } ${
      isSwedish ? name : englishName
  }:`;

  const locationElement = document.getElementById("location");
  locationElement.textContent = `${
      isSwedish ? "Plats" : "Location"
  }: ${currentEventLocation}`;

  const progressBar = document.getElementById("progress-bar");
  progressBar.style.display = "block";

  const dropdownButton = document.querySelector('.dropdown-button');
  dropdownButton.textContent = isSwedish ? 'Byt schema' : 'Change schedule';
  dropdownButton.title = isSwedish ? 'Byt schema' : 'Change schedule';
}

/**
* Handles the notification for the given event.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {string} location - The location of the event.
* @param {boolean} isUpcoming - Whether the event is upcoming or not.
* @param {string} timeString - The time string for the event.
*/
function handleNotification(name, englishName, location, isUpcoming, timeString) {
  if (!sentNotifications.includes(name)) {
      sendNotification(name, englishName, location, isUpcoming ? timeString : isSwedish ? "Pågår just nu" : "Ongoing");
      sentNotifications.push(name);
      currentEventSentNotification = true;
  }
}

/**
* Updates the document title.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {boolean} isUpcoming - Whether the event is upcoming or not.
* @param {string} timeString - The time string for the event.
*/
function updateDocumentTitle(name, englishName, isUpcoming, timeString) {
  document.title = `${timeString} ${
      isUpcoming ? (isSwedish ? "tills" : "until") : isSwedish ? "kvar" : "left"
  } | ${
      isSwedish ? name : englishName
  }`;
}

/**
* Updates the progress bar for the given event.
*
* @param {Date} start - The start time of the event.
* @param {Date} end - The end time of the event.
* @param {Date} currentDate - The current date.
* @param {boolean} isUpcoming - Whether the event is upcoming or not.
*/
function updateProgressBarForEvent(start, end, currentDate, isUpcoming) {
  const progress = Math.max(0, isUpcoming ? (start - currentDate) / 1000 / (start - (start - 60000)) * 100 : ((currentDate - start) / 1000 / ((end - start) / 1000)) * 100);
  updateProgressBar(progress);
}

/**
* Updates the event details.
*
* @param {string} name - The name of the event.
* @param {string} englishName - The English name of the event.
* @param {string} location - The location of the event.
* @param {Date} start - The start time of the event.
*/
function updateEventDetails(name, englishName, location, start) {
  currentEventName = name;
  currentEventEnglishName = englishName;
  currentEventStart = start;
  currentEventLocation = location;
  currentEventSentNotification = false;
}

/**
* Updates the countdown number.
*
* @param {string} timeString - The time string for the event.
*/
function updateCountdownNumber(timeString) {
  const countdownNumber = document.getElementById("countdown-number");
  countdownNumber.innerHTML = '';
  const [hours, minutes, seconds] = timeString.split(':');

  const createSpan = (className, content) => {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = content;
      return span;
  };

  countdownNumber.appendChild(createSpan('hours', hours));
  countdownNumber.appendChild(document.createTextNode(':'));
  countdownNumber.appendChild(createSpan('minutes', minutes));
  countdownNumber.appendChild(document.createTextNode(':'));
  countdownNumber.appendChild(createSpan('seconds', seconds));
}

function sendNotification(name, englishName, location, message) {
  new Notification(isSwedish ? name : englishName, {
          body: `${message} ${
          isSwedish ? "vid" : "at"
      } ${location}`
  });
}

let lastProgress = 0;
let animationFrameId = null;

function updateProgressBar(targetProgress) {
  if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
  }

  function animate() {
      const progressElement = document.getElementById("progress");
      const diff = targetProgress - lastProgress;
      const step = diff * 0.1;

      if (Math.abs(diff) > 0.1) {
          lastProgress += step;
          progressElement.style.width = `${lastProgress}%`;
          animationFrameId = requestAnimationFrame(animate);
      } else {
          lastProgress = targetProgress;
          progressElement.style.width = `${targetProgress}%`;
      }
  }

  animate();
}

function handleKeyDown(event) {
  if (event.key === "s") {
      saveEventTimestamps(getTodaysEvents());
  }
}

function saveEventTimestamps(events) {
  const timestamps = events.map(
      (event) => `${
          isSwedish ? event.name : event.englishName
      }: ${
          event.start.toLocaleString()
      } - ${
          event.end.toLocaleString()
      }`
  );
  const content = timestamps.join("\n");
  const blob = new Blob([content], {type: "text/plain"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "event-timestamps.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatSeconds(seconds) {
  if (typeof seconds !== "number" || isNaN(seconds)) {
      console.error("Invalid seconds value:", seconds);
      return "";
  }

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0 ? `${hours}:${
      pad(minutes % 60, 2)
  }:${remainingSeconds}` : `${
      pad(minutes, 2)
  }:${remainingSeconds}`;
}

function pad(value, length) {
  if (typeof value !== "number" || isNaN(value)) {
      console.error("Invalid value for padding:", value);
      return "";
  }

  return value.toString().padStart(length, '0');
}

async function loadEventFile(filename) {
  try {
      const response = await fetch(`scheman/${filename}`);
      if (! response.ok) {
          throw new Error(`Could not fetch file: ${
              response.status
          } ${
              response.statusText
          }`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
          throw new Error("Invalid data format");
      }

      events = data.filter((event) => !event.specialDate);
      specialDates = data.filter((event) => event.specialDate);

      console.log("Regular events:", events);
      console.log("Special dates:", specialDates);

      updateCountdown();
  } catch (error) {
      console.error("Error loading event file:", error);
  }
}

const languageSwitcher = document.getElementById("language-switcher");
let isSwedish = true;

languageSwitcher.addEventListener("click", () => {
  isSwedish = ! isSwedish;
  languageSwitcher.textContent = isSwedish ? "Svenska" : "English";
  updateCountdown();
});
let events = [];
let sentNotifications = [];
let specialDates = [];
let hourOffset = 0;

// Define event files with names and URLs
const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" }
];

// Get the last used event file from URL parameter or use the first event file as default
const urlParams = new URLSearchParams(window.location.search);
const lastUsedEventFile = urlParams.get('lastUsedEventFile') || eventFiles[0].url;

// Find the index of the last used event file in the eventFiles array
const currentEventFileIndex = eventFiles.findIndex(file => file.url === lastUsedEventFile) || 0;

// Set the current event file
const currentEventFile = eventFiles[currentEventFileIndex];

// Update the URL with the current event file
function updateURLWithEventFile(fileUrl) {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('lastUsedEventFile', fileUrl);
  window.history.pushState({}, '', newUrl);
}

// Cache the event files to avoid loading them multiple times
const eventFileCache = {};

async function loadEventFile(filename) {
  if (!eventFileCache[filename]) {
    eventFileCache[filename] = await loadJSON(filename);
  }
  events = eventFileCache[filename];
  return events;
}

// Function to load JSON data from a given file URL
async function loadJSON(fileUrl) {
  console.log(`Loading JSON data from ${fileUrl}`);
  updateURLWithEventFile(fileUrl);

  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Error fetching event file: ${fileUrl}. Status: ${response.status}`);
  const data = await response.text();
  return fileUrl.endsWith(".ics") ? parseICSFile(data) : JSON.parse(data);
}

// Function to parse ICS file and convert to JSON
function parseICSFile(icsData) {
  try {
    console.log(`Parsing ICS file: ${icsData.length} bytes`);
    const cal = icalendar.Calendar.from_ical(icsData);
    return cal.walk('VEVENT').map(event => ({
      name: event.get('SUMMARY'),
      englishName: getEnglishName(event.get('SUMMARY')),
      startDay: event.get('DTSTART').dt.getDay() + 1,
      startTime: event.get('DTSTART').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: event.get('DTEND').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: event.get('LOCATION', ''),
      date: event.get('DTSTART').dt.date()
    }));
  } catch (error) {
    console.error(`Error parsing ICS file: ${error.message}`);
    return [];
  }
}

// Function to get English name for a Swedish name
const englishNames = {
  'Programmering': 'Programming',
  'Matematik': 'Mathematics',
  'Ensemble med körsång': 'Ensemble with Choir Singing',
  'Historia': 'History',
  'Svenska': 'Swedish',
  'Engelska': 'English',
  'Musikproduktion': 'Music Production',
  'Media Produktion': 'Media Production',
};

function getEnglishName(name) {
  return Object.entries(englishNames).find(([swedishName]) => name.includes(swedishName))?.[1] || '';
}

// Function to show a snackbar
function showSnackbar(message) {
  let snackbar = document.getElementById("snackbar");
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = "snackbar";
    document.body.appendChild(snackbar);
  }
  snackbar.textContent = message;
  snackbar.className = "show";
  setTimeout(() => snackbar.className = snackbar.className.replace("show", ""), 3000);
}

// Function to get today's events
function getTodaysEvents() {
  const today = new Date();
  today.setHours(today.getHours() + hourOffset);
  const dayOfWeek = today.getDay();
  const todaysSpecialEvents = specialDates.filter(event => event.date.toDateString() === today.toDateString());
  return todaysSpecialEvents.length > 0 ? todaysSpecialEvents : events.filter(event => event.startDay === dayOfWeek);
}

function getNextEvent() {
  const now = new Date();
  now.setHours(now.getHours() + hourOffset);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaysEvents = getTodaysEvents();

  for (const event of todaysEvents) {
    const startTime = new Date(`${today.toDateString()} ${event.startTime || event.date.toTimeString().slice(0, 5)}`);
    const endTime = new Date(`${today.toDateString()} ${event.endTime || event.date.toTimeString().slice(0, 5)}`);

    if (now >= startTime && now < endTime || now < startTime) {
      return { name: event.name, englishName: event.englishName, start: startTime, end: endTime, location: event.location };
    }
  }

  return null;
}

// Function to handle key press events
function handleKeyPress(event) {
  try {
    switch (event.key) {
      case '.':
        hourOffset++;
        break;
      case ',':
        hourOffset--;
        break;
      case 'r':
        hourOffset = 0;
        break;
      default:
        console.log(`Unhandled key press: ${event.key}`);
        return;
    }
    console.log(`You are now offsetted to UTC+${hourOffset + 2}${hourOffset === 0 ? ' (Sweden)' : ''}`);
    showSnackbar(`You are now offsetted to UTC+${hourOffset + 2}${hourOffset === 0 ? ' (Sweden)' : ''}`);
    updateTodayEvents();
  } catch (error) {
    console.error(`Error handling key press: ${error.message}`);
  }
}

// Add event listener for key press events
document.addEventListener('keydown', handleKeyPress);

// Function to get today's events for the modal
function getTodayEvents() {
  const now = new Date();
  now.setHours(now.getHours() + hourOffset);
  const currentEventName = getNextEvent()?.name;
  const events = getTodaysEvents();

  // Group events by time and name
  const groupedEvents = events.reduce((acc, event) => {
    const key = `${event.startTime}-${event.endTime}-${event.name}`;
    if (!acc[key]) {
      acc[key] = { ...event, count: 1 };
    } else {
      acc[key].count++;
    }
    return acc;
  }, {});

  return Object.values(groupedEvents).map(event => {
    const startTime = new Date(`${now.toDateString()} ${event.startTime}`);
    const endTime = new Date(`${now.toDateString()} ${event.endTime}`);

    return {
      time: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      name: event.count > 1 ? `${event.name} (x${event.count})` : event.name,
      isCurrent: currentEventName === event.name ? '➤ ' : '',
      isCompleted: now > endTime ? '✓ ' : ''
    };
  });
}

function updateTodayEvents() {
  const eventsList = document.getElementById("events-list");

  // Clear previous events
  eventsList.innerHTML = "";

  // Get today's events
  const todayEvents = getTodayEvents();

  // Populate the events list
  todayEvents.forEach(event => {
    const eventItem = document.createElement("p");
    eventItem.textContent = `${event.isCurrent}${event.isCompleted}${event.time} - ${event.endTime} ${event.name}`;
    eventsList.appendChild(eventItem);
  });
}

function showTodayEvents() {
  const modal = document.getElementById("events-modal");
  const span = document.getElementsByClassName("close")[0];

  updateTodayEvents();

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // Set up interval to update events every minute
  const updateInterval = setInterval(updateTodayEvents, 60000);

  // Clear interval when modal is closed
  modal.addEventListener('hidden.bs.modal', function () {
    clearInterval(updateInterval);
  });
}

// Use the cached event file
loadEventFile(currentEventFile.url).then(() => {
  // Update the URL with the most recent event file
  updateURLWithEventFile(currentEventFile.url);
});

// Initial update of events
updateTodayEvents();
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
function init() {
  try {
      const dropdownContent = document.querySelector('.dropdown-content');
      const dropdownButton = document.querySelector('.dropdown-button');
      const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
      const date = new Date();
      const day = date.getDay();
      const fragment = document.createDocumentFragment();

      const dayElement = document.createElement('h3');
      dayElement.textContent = days[day];
      dayElement.classList.add('text-center', 'mt-4', 'mb-4');
      fragment.appendChild(dayElement);

      const dotsContainer = document.createElement('div');
      dotsContainer.classList.add('d-flex', 'justify-content-center', 'mb-4');
      for (let i = 0; i < 7; i++) {
          const dot = document.createElement('div');
          dot.classList.add('dot', 'mx-1');
          if (i === day) dot.classList.add('active');
          dotsContainer.appendChild(dot);
      }
      fragment.appendChild(dotsContainer);

      document.body.appendChild(fragment);

      const dropdownFragment = document.createDocumentFragment();
      eventFiles.forEach(file => {
          const anchor = document.createElement('a');
          anchor.classList.add('dropdown-item');
          anchor.innerText = file.name;
          anchor.onclick = () => {
              loadEventFile(file.url, () => loadEventFile('specialDates.json', updateCountdown));
              closeDropdown();
          };
          dropdownFragment.appendChild(anchor);
      });
      dropdownContent.appendChild(dropdownFragment);

      loadEventFile(eventFiles[0].url);

      dropdownButton.addEventListener('click', toggleDropdown);

      document.addEventListener('click', event => {
          const hourOffset = event.target.id === 'plus-button' ? 1 : event.target.id === 'minus-button' ? -1 : 0;
          if (hourOffset) updateCountdown();

          if (!event.target.matches('.dropdown-toggle')) {
              const dropdowns = document.querySelectorAll('.dropdown-menu.show');
              if (dropdowns.length) dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
          }
      });

  } catch (error) {
      console.error(`Error initializing: ${error.message}`);
  }
}