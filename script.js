/**
 * This script is responsible for managing events and displaying countdowns for upcoming events.
 * It includes functions for loading event data from JSON files, calculating countdowns, and updating the UI.
 * @returns None
 */
/**
 * This code contains functions related to managing events and countdowns on a webpage.
 * It includes functions for loading event data from JSON files, calculating the next event,
 * updating the countdown display, and playing sounds.
 * 
 * Functions:
 * - loadJSON(url, callback): Loads JSON data from the specified URL and calls the callback function with the parsed data.
 * - getTodaysEvents(): Returns an array of events that occur on the current day of the week.
 * - getNextEvent(): Returns the next event based on the current time.
 * - updateCountdown(): Updates the countdown display based on the current event.
 * - formatSeconds(seconds): Formats the given number of seconds into a string representation of hours, minutes, and
 */
/**
 * Manages the countdown and display of events.
 * @param {string} url - The URL of the JSON file containing the events data.
 * @returns None
 */
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


/**
 * Updates the countdown timer and displays the next event information.
 * If there are no more events, displays a message indicating the end of the day.
 * @returns None
 */
function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }
  let now = adjustTimezone(new Date());
  console.log('Adjusted Current Date:', now);
  let nextEvent;
  let specialDates;  // Define specialDates array locally

  if (isSpecialDate(now)) {
    // Use special date events if today is a special date
    nextEvent = getSpecialDate(now);
  } else {
    // Use default events if today is not a special date
    nextEvent = getNextEvent();
  }
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
/**
 * Formats a given number of seconds into a string representation of hours, minutes, and seconds.
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} - The formatted time string in the format "hh:mm:ss".
 */
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
    console.log('Loaded data:', data);

    if (Array.isArray(data)) {
      events = data.filter(entry => !entry.specialDate);
      specialDates = data.filter(entry => entry.specialDate);
    } else {
      events = data;
      specialDates = [];
    }
    console.log('Regular events:', events);
    console.log('Special dates:', specialDates);

    updateCountdown();
  });
}
/**
 * Initializes the dropdown menu and event files.
 * - Finds the dropdown content and button elements.
 * - Creates anchor elements for each event file and adds them to the dropdown content.
 * - Sets the click event for each anchor element to load the event file and update the countdown.
 * - Sets the click event for the dropdown button to toggle the dropdown menu.
 * @returns None
 */
function init() {
  let dropdownContent = document.querySelector(".dropdown-content");
  let dropdownButton = document.querySelector(".dropdown-button");

  eventFiles.forEach(({ name, url }) => {
    let anchor = document.createElement("a");
    anchor.innerText = name;
    anchor.onclick = () => {
      loadEventFile(url, () => {
        // After loading regular events, load special dates
        loadEventFile('specialDates.json', () => {
          // Both regular events and special dates are loaded, update countdown
          updateCountdown();
        });
      });
      closeDropdown();
    };

    anchor.addEventListener("click", () => { });

    dropdownContent.appendChild(anchor);
  });

  // Load regular events
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

let ukTimeZoneOffset = 0; // This is the initial offset for GMT, adjust it accordingly for BST if needed

let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

function adjustTimezone(date) {
  return new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset) * 60 * 60 * 1000);
}
let specialDates = []; // Array to store special date entries
function isSpecialDate(date) {
  const dateString = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
  return specialDates.some(entry => entry.date === dateString);
}
function getSpecialDate(date) {
  const dateString = date.toISOString().split('T')[0];
  return specialDates.find(entry => entry.date === dateString);
}
let today = new Date();
let isBST = today.getTimezoneOffset() === 60; // Check if it's British Summer Time (BST)
if (isBST) {
  ukTimeZoneOffset = 1; // Adjust for BST offset (1 hour ahead of GMT)
}