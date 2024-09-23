// Cache DOM elements
const snackbar = document.getElementById("snackbar") || createSnackbar();
const eventsList = document.getElementById("events-list");
const eventsModal = document.getElementById("events-modal");
const closeButton = document.getElementsByClassName("close")[0];

let events = [];
let sentNotifications = [];
let specialDates = [];
let currentEventName = "";
let currentEventEnglishName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;
let hourOffset = 0;

// Define event files with names and URLs
const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" }
//  { name: "test", url: "schedule.json" }//
];

// Get the last used event file from URL parameter or use the first event file as default
const urlParams = new URLSearchParams(window.location.search);
const lastUsedEventFile = urlParams.get('lastUsedEventFile') || eventFiles[0].url;

// Find the index of the last used event file in the eventFiles array
const lastUsedEventIndex = eventFiles.findIndex(file => file.url === lastUsedEventFile);

// Use the found index if valid, otherwise default to 0
const currentEventFileIndex = lastUsedEventIndex !== -1 ? lastUsedEventIndex : 0;

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

function loadEventFile(filename) {
  return eventFileCache[filename] || (eventFileCache[filename] = loadJSON(filename).then(data => {
    events = data;
    // Additional logic for handling the loaded events
    return events;
  }));
}

// Function to load JSON data from a given file URL
async function loadJSON(fileUrl) {
  console.log(`Loading JSON data from ${fileUrl}`);
  const previousFileName = eventFiles.find(file => file.url === lastUsedEventFile)?.name || 'Unknown';
  const currentFileName = eventFiles.find(file => file.url === fileUrl)?.name || 'Unknown';
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
      date: event.get('DTSTART').dt.date(),
      image: event.get('X-ALT-DESC', '').match(/image:([^;]+)/)?.[1] || '',
      color: event.get('X-ALT-DESC', '').match(/color:([^;]+)/)?.[1] || ''
    }));
  } catch (error) {
    console.error(`Error parsing ICS file: ${error.message}`);
    return [];
  }
}

// Function to get English name for a Swedish name
const englishNames = new Map([
  ['Programmering', 'Programming'],
  ['Matematik', 'Mathematics'],
  ['Ensemble med körsång', 'Ensemble with Choir Singing'],
  ['Historia', 'History'],
  ['Svenska', 'Swedish'],
  ['Engelska', 'English'],
  ['Musikproduktion', 'Music Production'],
  ['Media Produktion', 'Media Production'],
]);

function getEnglishName(name) {
  for (const [swedishName, englishName] of englishNames) {
    if (name.includes(swedishName)) {
      console.log(`Found English name for ${swedishName}: ${englishName}`);
      return englishName;
    }
  }
  console.log(`No English name found for ${name}`);
  return '';
}

// Function to show a snackbar
function showSnackbar(message) {
  snackbar.textContent = message;
  snackbar.className = "show";
  setTimeout(() => snackbar.className = snackbar.className.replace("show", ""), 3000);
}

// Function to get today's events
function getTodaysEvents() {
  const today = new Date();
  today.setHours(today.getHours() + hourOffset);
  const dayOfWeek = today.getDay();
  const todayString = today.toDateString();
  const todaysSpecialEvents = specialDates.filter(event => event.date.toDateString() === todayString);
  return todaysSpecialEvents.length > 0 ? todaysSpecialEvents : events.filter(event => event.startDay === dayOfWeek);
}

function getNextEvent() {
  const now = new Date();
  now.setHours(now.getHours() + hourOffset);
  const todayEvents = getTodaysEvents();
  const currentTime = now.getTime();

  for (const event of todayEvents) {
    const startTime = new Date(now.toDateString() + ' ' + (event.startTime || event.date.toTimeString().slice(0, 5))).getTime();
    const endTime = new Date(now.toDateString() + ' ' + (event.endTime || event.date.toTimeString().slice(0, 5))).getTime();

    if (currentTime >= startTime && currentTime < endTime || currentTime < startTime) {
      return { name: event.name, englishName: event.englishName, start: new Date(startTime), end: new Date(endTime), location: event.location, image: event.image, color: event.color };
    }
  }

  return null;
}

// Function to handle key press events
function handleKeyPress(event) {
  try {
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() + hourOffset);
    const oldDay = oldDate.getDate();

    switch (event.key) {
      case '.': hourOffset++; break;
      case ',': hourOffset--; break;
      case 'r': hourOffset = 0; break;
      default: return;
    }

    const newDate = new Date();
    newDate.setHours(newDate.getHours() + hourOffset);
    const newDay = newDate.getDate();

    if (oldDay !== newDay) {
      console.log(`Day changed from ${oldDay} to ${newDay}`);
    }

    const message = `You are now offsetted to UTC+${hourOffset + 2}${hourOffset === 0 ? ' (Sweden)' : ''}`;
    console.log(message);
    showSnackbar(message);
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

  const groupedEvents = new Map();
  events.forEach(event => {
    const key = `${event.startTime}-${event.endTime}-${event.name}`;
    if (!groupedEvents.has(key)) {
      groupedEvents.set(key, { ...event, count: 1 });
    } else {
      groupedEvents.get(key).count++;
    }
  });

  return Array.from(groupedEvents.values()).map(event => {
    const startTime = new Date(`${now.toDateString()} ${event.startTime}`);
    const endTime = new Date(`${now.toDateString()} ${event.endTime}`);

    return {
      time: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
      name: event.count > 1 ? `${event.name} (x${event.count})` : event.name,
      isCurrent: currentEventName === event.name ? '➤ ' : '',
      isCompleted: now > endTime ? '✓ ' : '',
      image: event.image,
      color: event.color
    };
  });
}

function updateTodayEvents() {
  const fragment = document.createDocumentFragment();
  const todayEvents = getTodayEvents();

  todayEvents.forEach(event => {
    const eventItem = document.createElement("p");
    eventItem.textContent = `${event.isCurrent}${event.isCompleted}${event.time} - ${event.endTime} ${event.name}`;
    if (event.image) {
      const icon = document.createElement("img");
      icon.src = event.image;
      icon.alt = event.name;
      icon.style.cssText = "width: 20px; height: 20px; margin-right: 5px;";
      eventItem.prepend(icon);
    }
    if (event.color) {
      eventItem.style.color = event.color;
    }
    fragment.appendChild(eventItem);
  });

  eventsList.innerHTML = "";
  eventsList.appendChild(fragment);
}

function showTodayEvents() {
  updateTodayEvents();

  eventsModal.style.display = "block";

  closeButton.onclick = function () {
    eventsModal.style.display = "none";
  }

  window.onclick = function (event) {
    if (event.target == eventsModal) {
      eventsModal.style.display = "none";
    }
  }

  // Set up interval to update events every minute
  const updateInterval = setInterval(updateTodayEvents, 60000);

  // Clear interval when modal is closed
  eventsModal.addEventListener('hidden.bs.modal', function () {
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
