let events = [];
let sentNotifications = [];
let specialDates = [];

const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];

let currentEvent = {
  name: "",
  start: null,
  location: "",
  sentNotification: false,
};

// Hour offset for timezone adjustment
const hourOffset = 0;

function loadJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);

  xhr.onreadystatechange = () => {
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

function getTodaysEvents() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

function getNextEvent() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaysEvents = getTodaysEvents();

  for (const event of todaysEvents) {
    const startTime = new Date(`${today.toDateString()} ${event.startTime}`);
    const endTime = new Date(`${today.toDateString()} ${event.endTime}`);

    if ((now >= startTime && now < endTime) || now < startTime) {
      return { ...event, start: startTime, end: endTime };
    }
  }

  return null;
}

function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = new Date();
  const nextEvent = isSpecialDate(now) ? getSpecialDate(now) : getNextEvent();

  if (nextEvent === null) {
    resetCountdown();
    return;
  }

  const { name, location, start, end } = nextEvent;
  const countdownElement = document.getElementById("countdown");
  const progressElement = document.getElementById("progress");
  const remainingTime = formatSeconds((now < start ? start : end - now) / 1000);

  if (
    shouldUpdateCountdown(
      name,
      start,
      location,
      remainingTime,
      now,
      progressElement.offsetWidth
    )
  ) {
    updateCountdownDisplay(name, start, location, remainingTime);
  }
}

function shouldUpdateCountdown(name, start, location, remainingTime, now, progressBarWidth) {
  return (
    currentEvent.name !== name ||
    currentEvent.start !== start ||
    currentEvent.location !== location ||
    (now < start && !currentEvent.sentNotification)
  );
}

function updateCountdownDisplay(name, start, location, remainingTime) {
  currentEvent = { name, start, location };
  const countdownText = now < start ? `${name} börjar om:` : `Tid kvar för ${name}:`;
  const countdownNumber = `${remainingTime}`;
  const locationText = now < start ? `Rum: ${location}` : `Pågår nu i ${location}`;

  document.getElementById("countdown-text").innerHTML = countdownText;
  document.getElementById("countdown-number").innerHTML = countdownNumber;
  document.getElementById("location").innerHTML = locationText;
  document.title = `${remainingTime} ${now < start ? 'tills' : 'kvar'} | ${name}`;

  if (now < start) {
    setupCountdownProgressBar(now, start, progressBarWidth);
    triggerNotification(name, remainingTime, location);
  }

  currentEvent.sentNotification = now < start;
}

function resetCountdown() {
  currentEvent = { name: "", start: null, location: "", sentNotification: false };

  document.getElementById("countdown-text").innerHTML = "Inga fler lektioner idag.";
  document.getElementById("location").innerHTML = "";
  document.getElementById("countdown-number").innerHTML = "Hejdå!";
  document.getElementById("progress-bar").style.display = "none";
}

function setupCountdownProgressBar(now, start, progressBarWidth) {
  const progressWidth = Math.max(
    0,
    ((now - start) / 1000 / ((start - (start - 60 * 1000)) / 1000)) * 100
  );

  document.getElementById("progress").style.width = `${(progressWidth / 100) * progressBarWidth}px`;
  document.getElementById("progress-bar").style.display = "block";
}

function triggerNotification(name, remainingTime, location) {
  if (!sentNotifications.includes(name)) {
    new Notification(name, {
      body: now < start ? `Börjar om ${remainingTime} i ${location}` : `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEvent.sentNotification = true;
  }
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(value, length) {
  return ("000000000" + value).substr(-length);
}

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

class Dropdown {
  constructor(button, content) {
    this.button = button;
    this.content = content;
    this.init();
  }

  init() {
    this.renderItems();
    this.attachEvents();
  }

  renderItems() {
    eventFiles.forEach(({ name, url }) => {
      const anchor = document.createElement("a");
      anchor.innerText = name;
      anchor.addEventListener("click", () => {
        this.selectItem(url);
      });
      this.content.appendChild(anchor);
    });
  }

  attachEvents() {
    this.button.addEventListener("click", () => {
      this.toggle();
    });
  }

  selectItem(url) {
    loadEventFile(url, () => {
      loadEventFile("specialDates.json", () => {
        updateCountdown();
      });
    });
    this.close();
  }

  toggle() {
    this.content.classList.toggle("open");
  }

  close() {
    this.content.classList.remove("open");
  }
}

const dropdown = new Dropdown(
  document.querySelector(".dropdown-button"),
  document.querySelector(".dropdown-content")
);

function init() {
  loadEventFile(eventFiles[0].url);
  updateCountdown();
  displayDayAndDate();
}
function displayDayAndDate() {
  const daysOfWeek = [
    "Söndag",
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
  ];

  const today = new Date();
  const dayOfWeek = daysOfWeek[today.getDay()];
  const dateString = `${today.getDate()} ${getSwedishMonth(today.getMonth())} ${today.getFullYear()}`;

  const dayAndDateElement = document.getElementById("day-and-date");
  dayAndDateElement.innerHTML = `${dayOfWeek}, ${dateString}`;
}

function getSwedishMonth(monthIndex) {
  const months = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  return months[monthIndex];
}
init();
displayDayAndDate();
function toggleDropdown() {
  document.querySelector(".dropdown-content").classList.toggle("show");
}

function closeDropdown() {
  document.querySelector(".dropdown-content").classList.remove("show");
}

window.onload = init;

setInterval(updateCountdown, 50);

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
  return new Date(
    date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 60 * 1000
  );
}

function isSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
  return specialDates.some((entry) => entry.date === dateString);
}

function getSpecialDate(date) {
  const dateString = date.toISOString().split("T")[0];
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
  const snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  snowflake.style.animationDuration = `${Math.random() * 2 + 1}s`; // Vary the animation duration
  document.body.appendChild(snowflake);

  snowflake.addEventListener("animationend", () => {
    document.body.removeChild(snowflake);
  });
}

function startSnowfall() {
  if (isSnowfallPeriod()) {
    setInterval(createSnowflake, 100); // Adjust the interval for more frequent snowflakes
  }
}

startSnowfall();
