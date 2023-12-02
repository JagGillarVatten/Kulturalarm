// Define constants for color palettes
const colorPalettes = {
  winter: {
    primaryBgColor: "#8BADC1",
    secondaryBgColor: "rgba(0, 0, 0, 0.5)",
    highlightColor: "#FFFFFF",
    buttonBgColor: "#5B6777",
    dropdownBgColor: "#A2C2A2",
    dropdownHoverColor: "#E6E6FA",
    dropdownTextColor: "#4B0082",
    accentColor: "#87CEEB",
  },
  spring: {
    primaryBgColor: "#BFD7B5",
    secondaryBgColor: "rgba(0, 0, 0, 0.5)",
    highlightColor: "#F0E68C",
    buttonBgColor: "#8F9779",
    dropdownBgColor: "#D3D3D3",
    dropdownHoverColor: "#F5F5F5",
    dropdownTextColor: "#228B22",
    accentColor: "#20B2AA",
  },
  summer: {
    primaryBgColor: "#FFDAB9",
    secondaryBgColor: "rgba(0, 0, 0, 0.5)",
    highlightColor: "#FFE4B5",
    buttonBgColor: "#D2B48C",
    dropdownBgColor: "#F0FFFF",
    dropdownHoverColor: "#FAFAD2",
    dropdownTextColor: "#2E8B57",
    accentColor: "#FF6347",
  },
  autumn: {
    primaryBgColor: "#F4A460",
    secondaryBgColor: "rgba(0, 0, 0, 0.5)",
    highlightColor: "#D2B48C",
    buttonBgColor: "#8B4513",
    dropdownBgColor: "#F5DEB3",
    dropdownHoverColor: "#FFE4C4",
    dropdownTextColor: "#8B4513",
    accentColor: "#FF4500",
  },
};

let events = [];
let sentNotifications = [];
let specialDates = [];
let currentEvent = null;

const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];

// Use async/await for fetching JSON
async function loadJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error loading JSON from ${url}. Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
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

  return null;
}

function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = adjustTimezone(new Date());
  const nextEvent = isSpecialDate(now) ? getSpecialDate(now) : getNextEvent();

  if (!nextEvent) {
    resetCountdown();
    return;
  }

  const { name, location, start, end } = nextEvent;

  if (!currentEvent || currentEvent.name !== name || currentEvent.start !== start) {
    updateEventInfo(name, location, start);
    notifyEventStart(name, location, now < start);
  }

  if (now >= start && now < end && !currentEvent.sentNotification) {
    notifyEventOngoing(name, location);
  }

  updateProgressBar(now, start, end);
}

function resetCountdown() {
  currentEvent = null;

  document.getElementById("countdown-text").innerHTML = "Inga fler lektioner idag.";
  document.getElementById("location").innerHTML = "";
  document.getElementById("countdown-number").innerHTML = "Hejdå!";
  document.getElementById("progress-bar").style.display = "none";
}

function updateEventInfo(name, location, start) {
  currentEvent = { name, location, start, sentNotification: false };

  const countdownText = now < start ? `${name} börjar om:` : `Tid kvar för ${name}:`;
  const countdownNumber = formatSeconds((start - now) / 1000);
  const locationText = now < start ? `Rum: ${location}` : `Rum: ${location}`;

  document.getElementById("countdown-text").innerHTML = countdownText;
  document.getElementById("countdown-number").innerHTML = countdownNumber;
  document.getElementById("location").innerHTML = locationText;
  document.title = now < start ? `${countdownNumber} tills | ${name}` : `${countdownNumber} kvar | ${name}`;
}

function notifyEventStart(name, location, isBeforeEvent) {
  if (!sentNotifications.includes(name)) {
    new Notification(name, {
      body: isBeforeEvent ? `Börjar om ${formatSeconds((currentEvent.start - now) / 1000)} i ${location}` : `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEvent.sentNotification = true;
  }
}

function notifyEventOngoing(name, location) {
  if (now >= currentEvent.start && now < currentEvent.end && !sentNotifications.includes(name)) {
    new Notification(name, {
      body: `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEvent.sentNotification = true;
  }
}

function updateProgressBar(now, start, end) {
  const progressWidth = ((now - start) / (end - start)) * 100;
  const progressElement = document.getElementById("progress");

  progressElement.style.width = `${Math.max(0, progressWidth)}%`;
  document.getElementById("progress-bar").style.display = "block";
}

async function loadEventFile(filename) {
  const data = await loadJSON(`scheman/${filename}`);
  if (Array.isArray(data)) {
    events = data.filter((entry) => !entry.specialDate);
    specialDates = data.filter((entry) => entry.specialDate);
  } else {
    events = data;
    specialDates = [];
  }
  updateCountdown();
}

function init() {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");

  eventFiles.forEach(({ name, url }) => {
    const anchor = document.createElement("a");
    anchor.innerText = name;
    anchor.onclick = async () => {
      await loadEventFile(url);
      await loadEventFile("specialDates.json");
    };

    dropdownContent.appendChild(anchor);
  });

  loadEventFile(eventFiles[0].url);

  dropdownButton.addEventListener("click", () => {
    toggleDropdown();
  });

  // Apply color palette based on the month
  applyColorPalette();
}

// Apply color palette based on the month
function applyColorPalette() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  if (currentMonth === 11 || currentMonth === 0 || currentMonth === 1) {
    applyPalette(colorPalettes.winter);
  } else if (currentMonth === 2 || currentMonth === 3 || currentMonth === 4) {
    applyPalette(colorPalettes.spring);
  } else if (currentMonth === 5 || currentMonth === 6 || currentMonth === 7) {
    applyPalette(colorPalettes.summer);
  } else {
    applyPalette(colorPalettes.autumn);
  }
}

// Apply color palette
function applyPalette(palette) {
  Object.entries(palette).forEach(([property, value]) => {
    document.body.style.setProperty(`--${property}`, value);
  });
}

function toggleDropdown() {
  const dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");

  // Change color palette based on the month when the dropdown is toggled
  applyColorPalette();
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
