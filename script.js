let events = [];
let sentNotifications = [];
const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;

function loadJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(null);
}

function getTodaysEvents() {
  let today = new Date();
  let dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

// Modify the getNextEvent function to use adjusted time
function getNextEvent() {
  let now = adjustTimezone(new Date());
  let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let todaysEvents = getTodaysEvents();

  for (let event of todaysEvents) {
    let startTime = adjustTimezone(new Date(`${today.toDateString()} ${event.startTime}`));
    let endTime = adjustTimezone(new Date(`${today.toDateString()} ${event.endTime}`));

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
  let now = adjustTimezone(new Date());
  let nextEvent = getNextEvent();
  if (nextEvent === null) {
    currentEventName = "";
    currentEventStart = null;
    currentEventLocation = "";
    currentEventSentNotification = false;

    document.getElementById("countdown-text").innerHTML = "Inga fler lektioner idag.";
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
      document.getElementById("location").innerHTML = "Rum: " + currentEventLocation;
      document.getElementById("countdown").style.color = "#ffff";
      document.getElementById("progress").style.width = "";
      document.getElementById("progress").style.backgroundColor = "#a3d47a";
      document.getElementById("progress-bar").style.display = "block";

      if (!sentNotifications.includes(name)) {
        new Notification(name, { body: `Börjar om ${remainingTime} i ${location}` });
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }
    }

    return;
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
    new Notification(name, { body: `Pågår nu i ${location}` });
    sentNotifications.push(name);
    currentEventSentNotification = true;
  }
  
  let progressWidth =
    (((now - start) / 1000 / ((end - start) / 1000)) * 100) /
    100 *
    document.getElementById("progress-bar").offsetWidth;
  
  progressWidth = Math.max(0, progressWidth); // Ensure progressWidth is not negative

  progressElement.style.width = `${progressWidth}px`;
  document.getElementById("progress-bar").style.display = "block";
}
function formatSeconds(seconds) {
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0 ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}` : `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(value, length) {
  return ("000000000" + value).substr(-length);
}

function loadEventFile(filename) {
  loadJSON(`scheman/${filename}`, (data) => {
    events = data;
    updateCountdown();
  });
}

function init() {
  let dropdownContent = document.querySelector(".dropdown-content");
  let dropdownButton = document.querySelector(".dropdown-button");

  eventFiles.forEach(({ name, url }) => {
    let anchor = document.createElement("a");
    anchor.innerText = name;
    anchor.onclick = () => {
      loadEventFile(url);
      closeDropdown(); // Close the dropdown when an option is clicked
    };

    anchor.addEventListener("click", () => {

    });

    dropdownContent.appendChild(anchor);
  });

  loadEventFile(eventFiles[0].url);

  // Toggle the dropdown content when the button is clicked
  dropdownButton.addEventListener("click", () => {
    toggleDropdown();
  });
}

function toggleDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.toggle("show");
}

function closeDropdown() {
  let dropdownContent = document.querySelector(".dropdown-content");
  dropdownContent.classList.remove("show");
}

window.onload = init;


setInterval(updateCountdown, 100);

const soundFiles = ["bird.mp3", "bird.mp3", "sound3.mp3"];

function playRandomSound() {
  let randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
  let audio = new Audio(`sounds/${randomSound}`);
  audio.volume = 0.1;
  audio.play();
}

const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  let clickSound = new Audio("sounds/click.mp3");
  clickSound.volume = 0.01; // Adjust the volume level as needed (0.2 is 20% of the maximum volume)
  clickSound.play();
  button.classList.add("pop");
  setTimeout(() => {
    button.classList.remove("pop");
  }, 30);
});

let userTimeZoneOffset = new Date().getTimezoneOffset() / 60; // Get user's timezone offset in hours

function adjustTimezone(date) {
  return new Date(date.getTime() + userTimeZoneOffset * 60 * 60 * 1000);
}