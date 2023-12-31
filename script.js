// Use const for variables that are not reassigned
const events = [];
const sentNotifications = [];
const specialDates = [];
const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" }
];
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;
let hourOffset = 0;

function loadJSON(url, callback) {
  // Check if the data is already cached
  const cachedData = localStorage.getItem(url);

  if (cachedData) {
    // If cached, parse and use the cached data
    callback(JSON.parse(cachedData));
    return;
  }

  let xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        // Cache the data in localStorage
        localStorage.setItem(url, xhr.responseText);

        // Parse and use the data
        callback(JSON.parse(xhr.responseText));
      } else {
        console.error(`Error loading JSON from ${url}. Status: ${xhr.status}`);
      }
    }
  };

  xhr.send(null);
}

function getTodaysEvents() {
  let day = new Date().getDay();
  return events.filter((event) => event.startDay === day);
}

function getNextEvent() {
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let todaysEvents = getTodaysEvents();

  for (let event of todaysEvents) {
    let start = new Date(`${today.toDateString()} ${event.startTime}`);
    let end = new Date(`${today.toDateString()} ${event.endTime}`);

    if (now >= start && now < end) {
      return {
        name: event.name,
        start: start,
        location: event.location,
        end: end
      };
    }

    if (now < start) {
      return {
        name: event.name,
        start: start,
        end: end,
        location: event.location
      };
    }
  }

  return null;
}

function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  let now = Date.now();
  let nextEvent;
  let todaysEvents = getTodaysEvents();
  let eventListContainer = document.querySelector("#event-list");
  let eventListUl = document.querySelector("#events-ul");

  // Continue with regular event logic
  nextEvent = getNextEvent();

  if (nextEvent === null) {
    currentEventName = "";
    currentEventStart = null;
    currentEventLocation = "";
    currentEventSentNotification = false;

    document.querySelector("#countdown-text").textContent =
      "Inga fler lektioner idag.";
    document.querySelector("#location").textContent = "";
    document.querySelector("#countdown-number").textContent = "Hejdå!";
    document.querySelector("#progress-bar").style.display = "none";

    return;
  }

  let {
    name: eventName,
    location: eventLocation,
    start: eventStart,
    end: eventEnd
  } = nextEvent;

  let countdownText = document.querySelector("#countdown-text");
  let countdownNumber = document.querySelector("#countdown-number");
  let locationElement = document.querySelector("#location");
  let countdownElement = document.querySelector("#countdown");
  let progressBar = document.querySelector("#progress");
  let progressBarContainer = document.querySelector("#progress-bar");

  if (today < eventStart) {
    let timeLeft = formatSeconds((eventStart - today) / 1000);

    if (
      currentEventName !== eventName ||
      currentEventStart !== eventStart ||
      currentEventLocation !== eventLocation
    ) {
      currentEventName = eventName;
      currentEventStart = eventStart;
      currentEventLocation = eventLocation;
      currentEventSentNotification = false;

      document.title = `${timeLeft} tills | ${eventName}`;
      countdownText.textContent = ` ${eventName} börjar om: `;
      countdownNumber.textContent = timeLeft;
      locationElement.textContent = "Rum: " + currentEventLocation;
      countdownElement.style.color = "#ffff";
      progressBar.style.width = "";
      progressBar.style.backgroundColor = "#a3d47a";
      progressBarContainer.style.display = "block";

      if (!sentNotifications.includes(eventName)) {
        new Notification(eventName, {
          body: `Börjar om ${timeLeft} i ${eventLocation}`
        });

        sentNotifications.push(eventName);
        currentEventSentNotification = true;
      }

      let progressWidth =
        (eventStart - today) / 1000 / (eventStart - (eventStart - 60000)) * 100 / 100 *
        progressBarContainer.offsetWidth;
      progressWidth = Math.max(0, progressWidth);
      progressBar.style.width = `${progressWidth}px`;

      return;
    }
  }

  let timeLeft = formatSeconds((eventEnd - today) / 1000);

  if (
    currentEventName !== eventName ||
    currentEventStart !== eventStart ||
    currentEventLocation !== eventLocation
  ) {
    currentEventName = eventName;
    currentEventStart = eventStart;
    currentEventLocation = eventLocation;
    currentEventSentNotification = false;

    let countdownText = `Tid kvar för ${eventName}:`;
    let countdownNumber = timeLeft;
    let locationText = `Rum: ${eventLocation}`;

    countdownText.textContent = countdownText;
    countdownNumber.textContent = countdownNumber;
    locationElement.textContent = locationText;
    document.title = `${timeLeft} kvar | ${eventName}`;
  }

  if (
    !currentEventSentNotification &&
    today >= eventStart &&
    !sentNotifications.includes(eventName)
  ) {
    new Notification(eventName, {
      body: `Pågår nu i ${eventLocation}`
    });

    sentNotifications.push(eventName);
    currentEventSentNotification = true;
  }

  let progressWidth =
    (today - eventStart) / 1000 / ((eventEnd - eventStart) / 1000) * 100 / 100 *
    progressBarContainer.offsetWidth;
  progressWidth = Math.max(0, progressWidth);
  progressBar.style.width = `${progressWidth}px`;
  progressBarContainer.style.display = "block";
}

function formatSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(number, length) {
  return ("000000000" + number).substr(-length);
}

function loadEventFile(url, callback) {
  fetch(`scheman/${url}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Loaded data:", data);

      if (!data) {
        console.error("Data is empty");
        return;
      }

      events.length = 0; // Clear the array
      events.push(...data);

      console.log("Regular events:", events);

      if (callback) {
        callback();
      }
    })
    .catch((error) => {
      console.error("Failed to load data:", error);
    });
}

function init() {
  let dropdownContent = document.querySelector(".dropdown-content");
  let dropdownButton = document.querySelector(".dropdown-button");

  eventFiles.forEach(({ name, url }) => {
    let link = document.createElement("a");
    link.innerText = name;
    link.onclick = () => {
      loadEventFile(url);
      closeDropdown();
    };

    link.addEventListener("click", () => {});

    dropdownContent.appendChild(link);
  });

  loadEventFile(eventFiles[0].url);
  dropdownButton.addEventListener("click", () => {
    toggleDropdown();
  });
}

function toggleDropdown() {
  document.querySelector(".dropdown-content").classList.toggle("show");
}

function closeDropdown() {
  document.querySelector(".dropdown-content").classList.remove("show");
}

window.onload = init;
requestAnimationFrame(updateCountdown);

const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);

const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  let audio = new Audio("sounds/click.mp3");
  audio.volume = 0.01;
  audio.play();
  button.classList.add("pop");

  setTimeout(() => {
    button.classList.remove("pop");
  }, 30);
});

let ukTimeZoneOffset = 0;
let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

function adjustTimezone(date) {
  return new Date(
    date.getTime() +
      60 * (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 1000
  );
}

function isSpecialDate(date) {
  //TODO: Implement new special date feauture check
  return false;
}

function getSpecialDate(date) {
  //TODO: Implement new special date feauture retrieval
  return null;
}

let today = new Date();
let isBST = 60 === today.getTimezoneOffset();
