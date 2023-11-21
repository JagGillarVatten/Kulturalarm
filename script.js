let events = [];
let currentEvent = {
  name: "",
  start: null,
  location: "",
  sentNotification: false,
};

const countdownElements = {
  text: document.getElementById("countdown-text"),
  location: document.getElementById("location"),
  number: document.getElementById("countdown-number"),
  progress: document.getElementById("progress"),
  progressBar: document.getElementById("progress-bar"),
};

const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];

function loadJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        console.error(`Failed to load JSON from ${url}. Status: ${xhr.status}`);
      }
    }
  };
  xhr.send(null);
}

function getTodaysEvents() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

function getNextEvent() {
  const now = adjustTimezone(new Date());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaysEvents = getTodaysEvents();

  for (const event of todaysEvents) {
    const startTime = adjustTimezone(new Date(`${today.toDateString()} ${event.startTime}`));
    const endTime = adjustTimezone(new Date(`${today.toDateString()} ${event.endTime}`));

    if (now >= startTime && now < endTime) {
      return { ...event, start: startTime, end: endTime };
    }

    if (now < startTime) {
      return { ...event, start: startTime, end: endTime };
    }
  }

  // Check for special events
  const specialEvent = getSpecialEvent(now);
  if (specialEvent) {
    return { ...specialEvent, start: adjustTimezone(new Date(specialEvent.date)) };
  }

  return null;
}

function getSpecialEvent(date) {
  const dateString = date.toISOString().split('T')[0];
  return specialEvents.find(entry => entry.date === dateString);
}

let lastAdjustedDateLogTime = null;

function updateCountdown() {
  if (events.length === 0) {
    console.warn('No events loaded. Waiting for events to be loaded.');
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = adjustTimezone(new Date());
  console.log('Adjusted Current Date:', now);

  const nextEvent = getNextEvent();

  if (!nextEvent) {
    resetCurrentEvent();
    updateDisplay("Inga fler lektioner idag.", "", "Hejdå!", "none");
    return;
  }

  updateCurrentEvent(nextEvent);
  const remainingTime = calculateRemainingTime(nextEvent.end, now);
  const { name, location, start, end } = nextEvent;

  if (now < start) {
    // Check if the time difference is within the reminder range
    const timeDifference = (start - now) / (1000 * 60); // in minutes

    if (
      (timeDifference <= 12 && timeDifference >= 10) ||
      (timeDifference > 12 && timeDifference <= 60)
    ) {
      // Trigger a reminder notification
      notifyEvent(name, location, `Börjar om ${formatSeconds(timeDifference)}`);
    }

    handleEventBeforeStart(name, remainingTime, location);
  } else {
    handleEventInProgress(name, remainingTime, location);
  }
}

function resetCurrentEvent() {
  currentEvent = { name: "", start: null, location: "", sentNotification: false };
}

function updateCurrentEvent(event) {
  if (
    currentEvent.name !== event.name ||
    currentEvent.start !== event.start ||
    currentEvent.location !== event.location
  ) {
    resetCurrentEvent();
    Object.assign(currentEvent, { ...event, sentNotification: false });
  }
}

function calculateRemainingTime(endTime, currentTime) {
  return formatSeconds((endTime - currentTime) / 1000);
}

function handleEventBeforeStart(name, remainingTime, location) {
  updateDisplay(` ${name} börjar om: `, `Rum: ${location}`, remainingTime);
}

function handleEventInProgress(name, remainingTime, location) {
  updateDisplay(`Tid kvar för ${name}:`, `Rum: ${location}`, remainingTime);
}

function updateDisplay(countdownText, locationText, countdownNumber, progressDisplay = "block") {
  const { text, location, number, progress, progressBar } = countdownElements;

  document.title = `${countdownNumber} kvar | ${currentEvent.name}`;
  text.innerHTML = countdownText;
  location.innerHTML = locationText;
  number.innerHTML = countdownNumber;

  const startTime = currentEvent.start;
  const endTime = currentEvent.end;
  const progressWidth = calculateProgressWidth(startTime, endTime);

  progress.style.width = progressWidth;

  progressBar.style.display = progressDisplay;
}

function calculateProgressWidth(startTime, endTime) {
  const now = adjustTimezone(new Date());
  const progress =
    ((now - startTime) / (endTime - startTime)) * 100;
  
  return `${Math.max(0, Math.min(100, progress))}%`;
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0 ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}` : `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(value, length) {
  return ("000000000" + value).substr(-length);
}

function loadEventFile(filename, callback) {
  loadJSON(`scheman/${filename}`, (data) => {
    console.log('Loaded data:', data);

    if (Array.isArray(data)) {
      events = data;
    } else {
      events = [data];
    }
    console.log('All events:', events);

    if (typeof callback === 'function') {
      callback();
    }
  });
}

function init() {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");

  eventFiles.forEach(({ name, url }) => {
    const anchor = document.createElement("a");
    anchor.innerText = name;
    anchor.onclick = () => {
      loadEventFile(url, () => {
        updateCountdown();
      });
      closeDropdown();
    };

    anchor.addEventListener("click", () => { });
    dropdownContent.appendChild(anchor);
  });

  loadEventFile(eventFiles[0].url);

  dropdownButton.addEventListener("click", () => {
    toggleDropdown();
  });
}

function toggleDropdown() {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");
}

function closeDropdown() {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.remove("show");
}

window.onload = init;

setInterval(updateCountdown, 100);

const soundFiles = ["bird.mp3", "bird.mp3", "sound3.mp3"];

function playRandomSound() {
  const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
  const audio = new Audio(`sounds/${randomSound}`);
  audio.volume = 0.1;
  audio.play();
}

const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);

const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  const clickSound = new Audio("sounds/click.mp3");
  clickSound.volume = 0.01;
  clickSound.play();
  button.classList.add("pop");
  setTimeout(() => {
    button.classList.remove("pop");
  }, 30);
});

let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

function adjustTimezone(date) {
  return new Date(date.getTime() + userTimeZoneOffset * 60 * 60 * 1000);
}

function notifyEvent(name, location, message) {
  try {
    new Notification(name, { body: message });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
}
