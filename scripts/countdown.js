// Funktion för att uppdatera nedräkningen
function updateCountdown() {
  if (!events.length) {
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

  if (!nextEvent) {
    displayNoEventsMessage();
    return;
  }

  const { name, englishName, location, start, end } = nextEvent;

  if (now < start) {
    displayUpcomingEvent(name, englishName, location, start, end, now);
  } else {
    displayOngoingEvent(name, englishName, location, start, end, now);
  }

  // Add event timestamps to a file
  if (todaysEvents.length > 0 && document.addEventListener) {
    document.addEventListener('keydown', saveEventTimestamps.bind(null, todaysEvents));
  }
}

function displayNoEventsMessage() {
  currentEventName = "";
  currentEventEnglishName = "";
  currentEventStart = null;
  currentEventLocation = "";
  currentEventSentNotification = false;

  const countdownText = document.getElementById("countdown-text");
  countdownText.textContent = isSwedish ? "Inga fler händelser idag." : "No more events today.";

  const locationEl = document.getElementById("location");
  locationEl.textContent = "";

  const countdownNumber = document.getElementById("countdown-number");
  countdownNumber.textContent = isSwedish ? "Hejdå!" : "Goodbye!";

  const progressBar = document.getElementById("progress-bar");
  progressBar.style.display = "none";
}

function displayUpcomingEvent(name, englishName, location, start, end, now) {
  const remainingTime = formatSeconds((start - now) / 1000);

  if (
    currentEventName !== name ||
    currentEventEnglishName !== englishName ||
    currentEventStart !== start ||
    currentEventLocation !== location
  ) {
    updateEventDetails(name, englishName, location, start);

    document.title = `${remainingTime} ${isSwedish ? 'tills' : 'until'} | ${isSwedish ? name : englishName}`;

    const countdownText = document.getElementById("countdown-text");
    countdownText.textContent = `${isSwedish ? name : englishName} ${isSwedish ? 'börjar om' : 'starts in'}:`;

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.textContent = remainingTime;

    const locationEl = document.getElementById("location");
    locationEl.textContent = `${isSwedish ? 'Plats' : 'Location'}: ${currentEventLocation}`;

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "block";

    if (!sentNotifications.includes(name)) {
      sendNotification(name, englishName, location, remainingTime);
      sentNotifications.push(name);
      currentEventSentNotification = true;
    }
  }

  const progressWidth = Math.max(0, ((start - now) / 1000 / (start - (start - 60 * 1000))) * 100);
  updateProgressBar(progressWidth);
}

function displayOngoingEvent(name, englishName, location, start, end, now) {
  const remainingTime = formatSeconds((end - now) / 1000);

  if (
    currentEventName !== name ||
    currentEventEnglishName !== englishName ||
    currentEventStart !== start ||
    currentEventLocation !== location
  ) {
    updateEventDetails(name, englishName, location, start);

    const countdownText = document.getElementById("countdown-text");
    countdownText.textContent = `${isSwedish ? 'Tid kvar för' : 'Time left for'} ${isSwedish ? name : englishName}:`;

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.textContent = remainingTime;

    const locationEl = document.getElementById("location");
    locationEl.textContent = `${isSwedish ? 'Plats' : 'Location'}: ${location}`;

    document.title = `${remainingTime} ${isSwedish ? 'kvar' : 'left'} | ${isSwedish ? name : englishName}`;
  }

  if (
    !currentEventSentNotification &&
    now >= start &&
    !sentNotifications.includes(name)
  ) {
    sendNotification(name, englishName, location, isSwedish ? "Pågår just nu" : "Ongoing");
    sentNotifications.push(name);
    currentEventSentNotification = true;
  }

  const progressWidth = Math.max(0, ((now - start) / 1000 / ((end - start) / 1000)) * 100);
  updateProgressBar(progressWidth);

  const progressBar = document.getElementById("progress-bar");
  progressBar.style.display = "block";
}

function updateEventDetails(name, englishName, location, start) {
  currentEventName = name;
  currentEventEnglishName = englishName;
  currentEventStart = start;
  currentEventLocation = location;
  currentEventSentNotification = false;
}

function sendNotification(name, englishName, location, body) {
  new Notification(isSwedish ? name : englishName, {
    body: `${body} ${isSwedish ? 'vid' : 'at'} ${location}`,
  });
}

function updateProgressBar(width) {
  const progress = document.getElementById("progress");
  progress.style.width = `${width}%`;
}

function saveEventTimestamps(todaysEvents, event) {
  if (event.key === 's') {
    const eventTimestamps = todaysEvents.map(event => `${isSwedish ? event.name : event.englishName}: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}`);
    const eventTimestampsText = eventTimestamps.join('\n');
    const blob = new Blob([eventTimestampsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'event-timestamps.txt';
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Function to format seconds to a time string
function formatSeconds(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    console.error('Invalid seconds value:', seconds);
    return '';
  }

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

// Function to pad a value with leading zeros
function pad(value, length) {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('Invalid value for padding:', value);
    return '';
  }

  return ("000000000" + value).substr(-length);
}

// Function to load event file
async function loadEventFile(filename) {
  try {
    const response = await fetch(`scheman/${filename}`);

    if (!response.ok) {
      console.error('Error fetching event file:', response.status, response.statusText);
      throw new Error('Could not fetch file');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format');
    }

    events = data.filter(entry => !entry.specialDate);
    specialDates = data.filter(entry => entry.specialDate);

    console.log('Vanliga händelser:', events);
    console.log('Speciella datum:', specialDates);

    updateCountdown();

  } catch (error) {
    console.error(error);
  }
}
// Add event listener for language switching
const languageSwitcher = document.getElementById('language-switcher');
let isSwedish = true;

languageSwitcher.addEventListener('click', () => {
  isSwedish = !isSwedish;
  languageSwitcher.textContent = isSwedish ? 'Svenska' : 'English';
  updateCountdown();
});
