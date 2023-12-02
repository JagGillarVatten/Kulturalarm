let events = [];
let sentNotifications = [];
let specialDates = [];
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;

const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];

function loadJSON(url, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error loading JSON from ${url}. Status: ${response.status}`);
      }
      return response.json();
    })
    .then(callback)
    .catch((error) => console.error(error));
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
      return { name: event.name, start: startTime, location: event.location, end: endTime };
    }

    if (now < startTime) {
      return { name: event.name, start: startTime, end: endTime, location: event.location };
    }
  }

  return null;
}

function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = adjustTimezone(new Date());
  let nextEvent;

  if (isSpecialDate(now)) {
    nextEvent = getSpecialDate(now);
  } else {
    nextEvent = getNextEvent();
  }

  if (nextEvent === null) {
    resetCountdown();
    return;
  }

  const { name, location, start, end } = nextEvent;
  const countdownElement = document.getElementById("countdown");
  const progressElement = document.getElementById("progress");

  if (now < start) {
    updateCountdownBeforeEvent(name, location, start);
  } else {
    updateCountdownDuringEvent(name, location, start, end, now);
  }
}

function resetCountdown() {
  currentEventName = "";
  currentEventStart = null;
  currentEventLocation = "";
  currentEventSentNotification = false;

  document.getElementById("countdown-text").innerHTML = "Inga fler lektioner idag.";
  document.getElementById("location").innerHTML = "";
  document.getElementById("countdown-number").innerHTML = "Hejdå!";
  document.getElementById("progress-bar").style.display = "none";
}

function updateCountdownBeforeEvent(name, location, start) {
  const remainingTime = formatSeconds((start - now) / 1000);

  if (!isEventInfoSame(name, location, start)) {
    updateEventInfo(name, location, start);
    notifyEventStart(name, location, remainingTime);
    updateProgressBar(start);
  }
}

function updateCountdownDuringEvent(name, location, start, end, now) {
  const remainingTime = formatSeconds((end - now) / 1000);

  if (!isEventInfoSame(name, location, start)) {
    updateEventInfo(name, location, start);
    notifyEventOngoing(name, location);
  }

  if (!currentEventSentNotification && now >= start && !sentNotifications.includes(name)) {
    notifyEventStart(name, location, remainingTime);
  }

  updateProgressBar(now, start, end);
}

function isEventInfoSame(name, location, start) {
  return (
    currentEventName === name &&
    currentEventLocation === location &&
    currentEventStart === start
  );
}

function updateEventInfo(name, location, start) {
  currentEventName = name;
  currentEventStart = start;
  currentEventLocation = location;
  currentEventSentNotification = false;

  const countdownText = now < start ? `${name} börjar om:` : `Tid kvar för ${name}:`;
  const countdownNumber = formatSeconds((start - now) / 1000);
  const locationText = now < start ? `Rum: ${location}` : `Rum: ${location}`;

  document.getElementById("countdown-text").innerHTML = countdownText;
  document.getElementById("countdown-number").innerHTML = countdownNumber;
  document.getElementById("location").innerHTML = locationText;
  document.title = now < start ? `${countdownNumber} tills | ${name}` : `${countdownNumber} kvar | ${name}`;
}

function notifyEventStart(name, location, remainingTime) {
  if (!sentNotifications.includes(name)) {
    new Notification(name, {
      body: `Börjar om ${remainingTime} i ${location}`,
    });
    sentNotifications.push(name);
    currentEventSentNotification = true;
  }
}

function notifyEventOngoing(name, location) {
  if (!currentEventSentNotification && now >= currentEventStart && !sentNotifications.includes(name)) {
    new Notification(name, {
      body: `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEventSentNotification = true;
  }
}

function updateProgressBar(now, start, end) {
  const progressWidth =
    ((now - start) / (end - start)) * 100;
  const progressElement = document.getElementById("progress");

  progressElement.style.width = `${Math.max(0, progressWidth)}%`;
  document.getElementById("progress-bar").style.display = "block";
}

function loadEventFile(filename) {
  loadJSON(`scheman/${filename}`, (data) => {
    console.log('Loaded data:', data);

    if (Array.isArray(data)) {
      events = data.filter((entry) => !entry.specialDate);
      specialDates = data.filter((entry) => entry.specialDate);
    } else {
      events = data;
      specialDates = [];
    }
    console.log('Regular events:', events);
    console.log('Special dates:', specialDates);

    updateCountdown();
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
        loadEventFile('specialDates.json', () => {
          updateCountdown();
        });
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

let ukTimeZoneOffset = 0;

const userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

function adjustTimezone(date) {
  return new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset) * 60 * 60 * 1000);
}

function isSpecialDate(date) {
  const dateString = date.toISOString().split('T')[0];
  return specialDates.some((entry) => entry.date === dateString);
}

function getSpecialDate(date) {
  const dateString = date.toISOString().split('T')[0];
  return specialDates.find((entry) => entry.date === dateString);
}

const today = new Date();
const isBST = today.getTimezoneOffset() === 60;

if (isBST) {
  ukTimeZoneOffset = 1;
}

function isSnowfallPeriod() {
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 10, 23);
  const endDate = new Date(currentDate.getFullYear(), 11, 31);
  return currentDate >= startDate && currentDate <= endDate;
}

function createSnowflake() {
  const snowflake = document.createElement('div');
  snowflake.className = 'snowflake';
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  document.body.appendChild(snowflake);

  snowflake.addEventListener('animationend', () => {
    document.body.removeChild(snowflake);
  });
}

if (isSnowfallPeriod()) {
  setInterval(createSnowflake, 405);
}
