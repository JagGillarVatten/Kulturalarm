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

// Hour offset for timezone adjustment
let hourOffset = 0;

function loadJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);

  xhr.onreadystatechange = function () {
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
  let today = new Date();
  let dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

function getNextEvent() {
  let now = new Date();
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let todaysEvents = getTodaysEvents();

  for (let event of todaysEvents) {
    let startTime = new Date(`${today.toDateString()} ${event.startTime}`);
    let endTime = new Date(`${today.toDateString()} ${event.endTime}`);

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

function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  let now = new Date();
  let nextEvent;
 let todaysEvents = getTodaysEvents();
  let eventListContainer = document.getElementById("event-list");
  let eventListUl = document.getElementById("events-ul");
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

    document.getElementById("countdown-text").innerHTML =
      "Inga fler lektioner idag.";
    document.getElementById("location").innerHTML = "";
    document.getElementById("countdown-number").innerHTML = "Hejdå!";
    document.getElementById("progress-bar").style.display = "none";

    return;
  }
  let { name, location, start, end } = nextEvent;
  let countdownElement = document.getElementById("countdown");
  let progressElement = document.getElementById("progress");

  if (now < start) {
    let remainingTime = formatSeconds((start - now) / 1000);

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
      let countdownText = ` ${name} börjar om: `;
      let countdownNumber = `${remainingTime}`;

      document.getElementById("countdown-text").innerHTML = countdownText;
      document.getElementById("countdown-number").innerHTML = countdownNumber;
      document.getElementById("location").innerHTML =
        "Rum: " + currentEventLocation;
      document.getElementById("countdown").style.color = "#ffff";
      document.getElementById("progress").style.width = "";
      document.getElementById("progress").style.backgroundColor = "#a3d47a";
      document.getElementById("progress-bar").style.display = "block";

      if (!sentNotifications.includes(name)) {
        new Notification(name, {
          body: `Börjar om ${remainingTime} i ${location}`,
        });
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }

      let progressWidth =
        ((((start - now) / 1000 / (start - (start - 60 * 1000))) * 100) / 100) *
        document.getElementById("progress-bar").offsetWidth;

      progressWidth = Math.max(0, progressWidth);

      progressElement.style.width = `${progressWidth}px`;
      return;
    }
  }
  let remainingTime = formatSeconds((end - now) / 1000);

  if (
    currentEventName !== name ||
    currentEventStart !== start ||
    currentEventLocation !== location
  ) {
    currentEventName = name;
    currentEventStart = start;
    currentEventLocation = location;
    currentEventSentNotification = false;

    let countdownText = `Tid kvar för ${name}:`;
    let countdownNumber = `${remainingTime}`;
    let locationText = `Rum: ${location}`;

    document.getElementById("countdown-text").innerHTML = countdownText;
    document.getElementById("countdown-number").innerHTML = countdownNumber;
    document.getElementById("location").innerHTML = locationText;
    document.title = `${remainingTime} kvar | ${name}`;
  }

  if (
    !currentEventSentNotification &&
    now >= start &&
    !sentNotifications.includes(name)
  ) {
    new Notification(name, {
      body: `Pågår nu i ${location}`,
    });
    sentNotifications.push(name);
    currentEventSentNotification = true;
      }

  // Calculate progress width for the ongoing event
  let progressWidth =
    ((((now - start) / 1000 / ((end - start) / 1000)) * 100) / 100) *
    document.getElementById("progress-bar").offsetWidth;

  progressWidth = Math.max(0, progressWidth); // Ensure progressWidth is not negative

  progressElement.style.width = `${progressWidth}px`;
  document.getElementById("progress-bar").style.display = "block";
}
updateBackground();
/**
 * Formats a given number of seconds into a string representation of hours, minutes, and seconds.
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} - The formatted time string in the format "hh:mm:ss".
 */
function formatSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

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
function init() {
  const fullscreenButton = document.createElement('button');
  fullscreenButton.textContent = 'Fullscreen';
  fullscreenButton.style.position = 'fixed';
  fullscreenButton.style.bottom = '20px';
  fullscreenButton.style.right = '20px';
  fullscreenButton.style.opacity = '0';

  fullscreenButton.addEventListener('mouseover', () => {
    fullscreenButton.style.opacity = '1';
  });


  fullscreenButton.addEventListener('mouseout', () => {
    fullscreenButton.style.opacity = '0';
    fullscreenButton.style.transition = 'opacity 0.2s';
  });

  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      fullscreenButton.textContent = 'Exit Fullscreen';

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

  document.body.appendChild(fullscreenButton);
  let dropdownContent = document.querySelector(".dropdown-content");
  let dropdownButton = document.querySelector(".dropdown-button");
  const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

  const date = new Date();
  const day = date.getDay();

  const dayElement = document.createElement('div');
  dayElement.textContent = days[day];

  dayElement.style.animation = 'fadeIn 1s';

  document.body.appendChild(dayElement);

  const dotsContainer = document.createElement('div');

  for (let i = 0; i < 7; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === day) {
      dot.classList.add('active');
    }

    dot.style.animation = 'fadeIn 0.5s forwards';

    dotsContainer.appendChild(dot);
  }

  document.body.appendChild(dotsContainer);

  eventFiles.forEach(({ name, url }) => {
    let anchor = document.createElement("a");
    anchor.innerText = name;
    anchor.onclick = () => {
      loadEventFile(url, () => {
        loadEventFile("specialDates.json", () => {
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

  // Add event listeners for timezone adjustment buttons
  document.getElementById("plus-button").addEventListener("click", () => {
    hourOffset++;
    updateCountdown();
  });

  document.getElementById("minus-button").addEventListener("click", () => {
    hourOffset--;
    updateCountdown();

  });

}


function toggleDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");

  // Add fade in animation
  dropdownContent.style.animation = "fadeIn 0.5s";
}

function closeDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.remove("show");

  // Add fade out animation
 dropdownContent.style.animation = "fadeOut 0.5s";
 
  }
  window.onload = function () {
    init();
    updateBackground();
  };
  
setInterval(updateCountdown, 50);
const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  let clickSound = new Audio("sounds/click.mp3");
  clickSound.volume = 0.01;
  clickSound.play();
  button.classList.add("pop");
  setTimeout(() => {
    button.classList.remove("pop");
  }, 30);
});

let u
kTimeZoneOffset = 0;

let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

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

let today = new Date();
let isBST = today.getTimezoneOffset() === 60;
if (isBST) {
  ukTimeZoneOffset = 1;
}

function isSnowfallPeriod() {
  let currentDate = new Date();
  let startDate = new Date(currentDate.getFullYear(), 10, 23);
  let endDate = new Date(currentDate.getFullYear(), 11, 31);

  return currentDate >= startDate && currentDate <= endDate;
}

function createSnowflake() {
  let snowflake = document.createElement("div");
  snowflake.className = "snowflake";
  snowflake.style.left = `${Math.random() * window.innerWidth}px`;
  document.body.appendChild(snowflake);

  snowflake.addEventListener("animationend", () => {
    document.body.removeChild(snowflake);
  });
}
function updateBackground() {
  let now = new Date();
  let currentHour = now.getHours() + now.getMinutes() / 60;

  let body = document.body;

  let morningColor = "#f65e7";
  let lateMorningColor = "#FCD116";
  let afternoonColor = "#87CEEB";
  let lateAfternoonColor = "#2120ff";
  let eveningColor = "#2b0932";
  let nightColor = "#0e041c";


  if (currentHour >= 6 && currentHour < 9) {
    // Morning: Interpolate between night and morning colors
    let mix = (currentHour - 6) / 3;
    body.style.backgroundColor = interpolateColor(nightColor, morningColor, mix);
  } else if (currentHour >= 9 && currentHour < 12) {
    // Late Morning: Interpolate between morning and late morning colors
    let mix = (currentHour - 9) / 3;
    body.style.backgroundColor = interpolateColor(morningColor, lateMorningColor, mix);
  } else if (currentHour >= 12 && currentHour < 15) {
    // Afternoon: Interpolate between late morning and afternoon colors
    let mix = (currentHour - 12) / 3;
    body.style.backgroundColor = interpolateColor(lateMorningColor, afternoonColor, mix);
  } else if (currentHour >= 15 && currentHour < 18) {
    // Late Afternoon: Interpolate between afternoon and late afternoon colors
    let mix = (currentHour - 15) / 3;
    body.style.backgroundColor = interpolateColor(afternoonColor, lateAfternoonColor, mix);
  } else if (currentHour >= 18 && currentHour < 21) {
    // Evening: Interpolate between late afternoon and evening colors
    let mix = (currentHour - 18) / 3;
    body.style.backgroundColor = interpolateColor(lateAfternoonColor, eveningColor, mix);
  } else {
    // Night: Interpolate between evening and night colors
    let mix = (currentHour - 21) / 3;
    body.style.backgroundColor = interpolateColor(eveningColor, nightColor, mix);
  }

}

function interpolateColor(color1, color2, mix) {
  let r1 = parseInt(color1.slice(1, 3), 16);
  let g1 = parseInt(color1.slice(3, 5), 16);
  let b1 = parseInt(color1.slice(5, 7), 16);

  let r2 = parseInt(color2.slice(1, 3), 16);
  let g2 = parseInt(color2.slice(3, 5), 16);
  let b2 = parseInt(color2.slice(5, 7), 16);

  let r = Math.round(r1 * (1 - mix) + r2 * mix);
  let g = Math.round(g1 * (1 - mix) + g2 * mix);
  let b = Math.round(b1 * (1 - mix) + b2 * mix);

  return "#" + r.toString(16) + g.toString(16) + b.toString(16);
}

setInterval(updateBackground, 1000);
