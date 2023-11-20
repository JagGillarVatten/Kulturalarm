// Global variables
let events = [];
let sentNotifications = [];

// Event files
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

/**
 * Loads a JSON file and calls a callback function with the parsed data.
 * @param {string} url - The URL of the JSON file.
 * @param {function} callback - The function to call with the parsed data.
 * @returns {void}
 */
function loadJSON(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(null);
}

/**
 * Gets the events for the current day of the week.
 * @returns {array} - The events for the current day of the week.
*/
function getTodaysEvents() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  return events.filter((event) => event.startDay === dayOfWeek);
}

/**
 * Gets the next event.
 * @returns {object} - The next event or null if there are no more events today.
 */
function getNextEvent() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todaysEvents = getTodaysEvents();
  for (const event of todaysEvents) {
    const start = new Date(`${today.toDateString()} ${event.startTime}`);
    const end = new Date(`${today.toDateString()} ${event.endTime}`);
    if (now >= start && now < end) {
      // We're currently in this event
      return {
        name: event.name,
        start,
        location: event.location,
        end,
      };
    } else if (now < start) {
      // This event hasn't started yet
      return {
        name: event.name,
        start,
        end,
        location: event.location,
      };
    }
  }
  // There are no events left today
  return null;
}

/**
 * Updates the countdown timer and progress bar for the next event.
 * @returns {void}
 */
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;

function updateCountdown() {
  if (events.length === 0) {
    // JSON hasn't loaded yet, try again later
    setTimeout(updateCountdown, 1000);
    return;
  }
 const now = new Date();
  const nextEvent = getNextEvent();

  if (nextEvent === null) {
    // No events left today
    if (currentEventName !== "") {
      currentEventName = "";
      currentEventStart = null;
      currentEventLocation = "";
      currentEventSentNotification = false;
      document.getElementById("countdown-text").innerHTML =
        "Inga fler lektioner idag.";
      document.getElementById("countdown-number").innerHTML = ""; // Clear countdown number
      document.getElementById("progress-bar").style.display = "none";
    }
    return;
  }

  const { name, location, start, end } = nextEvent;

  if (now < start) {
    // Event hasn't started yet
    const timeUntilStart = (start - now) / 1000; // Convert to seconds
    const timeUntilStartFormatted = formatSeconds(timeUntilStart);
    if (
      currentEventName !== name ||
      currentEventStart !== start ||
      currentEventLocation !== location
    ) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;
      document.title = `${timeUntilStartFormatted} tills | ${name}`;
      const countdownText = ` ${name} börjar om: `;
      const countdownNumber = `${timeUntilStartFormatted} `;
      document.getElementById("countdown-text").innerHTML = countdownText;
      document.getElementById("countdown-number").innerHTML = countdownNumber;
      document.getElementById("countdown").style.color = "#ffff";
      document.getElementById("progress").style.width = "0";
      document.getElementById("location").innerHTML ='Rum: ' +currentEventLocation;
      document.getElementById("progress").style.backgroundColor = "#a3d47a";
      document.getElementById("progress-bar").style.display = "block";

      // Check if notification has already been sent for this event
      if (!sentNotifications.includes(name)) {
        // Create new notification
        const notification = new Notification(name, {
          body: `Börjar om ${timeUntilStartFormatted} i ${location}`,
        });
        // Add event name to sentNotifications array
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }
    }
    return;
  }

  // Event is ongoing or already finished
  const totalDuration = (end - start) / 1000; // Convert to seconds
  const timeElapsed = (now - start) / 1000; // Convert to seconds
  const timeRemaining = (end - now) / 1000; // Convert to seconds

  const timeRemainingFormatted = formatSeconds(timeRemaining);
  if (
    currentEventName !== name ||
    currentEventStart !== start ||
    currentEventLocation !== location
  ) {
    currentEventName = name;
    currentEventStart = start;
    currentEventLocation = location;
    currentEventSentNotification = false;
    const countdownText = `Tid kvar för ${name}:`;
    const countdownNumber = `${timeRemainingFormatted}`;
    const locationText = `Rum: ${location}`;
    document.getElementById("countdown-text").innerHTML = countdownText;
    document.getElementById("countdown-number").innerHTML = countdownNumber;
    document.getElementById("location").innerHTML = locationText;
    document.title = `${timeRemainingFormatted} kvar | ${name}`;
  }

  if (!currentEventSentNotification && now >= start) {
    // Check if notification has already been sent for this event
    if (!sentNotifications.includes(name)) {
      // Create new notification
      const notification = new Notification(name, {
        body: `Pågår nu i ${location}`,
      });
      // Add event name to sentNotifications array
      sentNotifications.push(name);
      currentEventSentNotification = true;
    }
  }

  const percentElapsed = (timeElapsed / totalDuration) * 100;
  const width =
    (percentElapsed / 100) *
    document.getElementById("progress-bar").offsetWidth;
  document.getElementById("progress").style.width = `${width}px`;

  document.getElementById("progress-bar").style.display = "block";
}

/**
 * Formats a number of seconds as a string in the format HH:MM:SS.
 * @param {number} seconds - The number of seconds to format.
 * @returns {string} - The formatted string.
 */
function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const paddedSeconds = pad(Math.floor(seconds) % 60, 2);
  if (hours > 0) {
    return `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`;
  }
  return `${pad(minutes, 2)}:${paddedSeconds}`;
}

/**
 * Pads a number with leading zeros to a specified length.
 * @param {number} num - The number to pad.
 * @param {number} size - The desired length of the padded string.
 * @returns {string} - The padded string.
 */
function pad(num, size) {
  return ("000000000" + num).substr(-size);
}

/**
 * Loads an event file and updates the countdown.
 * @param {string} url - The URL of the event file.
 * @returns {void}
 */
function loadEventFile(url) {
  loadJSON(`scheman/${url}`, (data) => {
    events = data;
    updateCountdown();
  });
}

/**
 * Initializes the dropdown menu and loads the first event file.
 * @returns {void}
 */
function init() {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");
  eventFiles.forEach(({ name, url }) => {
    const eventButton = document.createElement("a");
    eventButton.innerText = name;
    eventButton.onclick = () => {
      loadEventFile(url);
    };
    dropdownContent.appendChild(eventButton);
  });
  loadEventFile(eventFiles[0].url);
}

// Call the init function when the page loads
window.onload = init;

// Update the countdown every 100 milliseconds
setInterval(updateCountdown, 100);
function getNextEvent() {
  const now = new Date();
  const today = new Date(now.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" }));
  const dayOfWeek = today.getDay();
  const todaysEvents = events.filter((event) => event.startDay === dayOfWeek);
  for (const event of todaysEvents) {
    const start = new Date(`${today.toDateString()} ${event.startTime}`);
    const end = new Date(`${today.toDateString()} ${event.endTime}`);
    if (now >= start && now < end) {
      // We're currently in this event
      return {
        name: event.name,
        start,
        location: event.location,
        end,
      };
    } else if (now < start) {
      // This event hasn't started yet
      return {
        name: event.name,
        start,
        end,
        location: event.location,
      };
    }
  }
  // There are no events left today
  return null;
}
/**
 * Loads an event file and updates the countdown.
 * @param {string} url - The URL of the event file.
 * @returns {void}
 */
function loadEventFile(url) {
  loadJSON(`scheman/${url}`, (data) => {
    events = data;
    updateCountdown();
  });

  // Add event listener to play click sound when button is clicked
  const button = document.querySelector(".dropdown-button");
  button.addEventListener("click", () => {
    const audio = new Audio("click.mp3");
    audio.play();
  });
}
function init() {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");
  eventFiles.forEach(({ name, url }) => {
    const eventButton = document.createElement("a");
    eventButton.innerText = name;
    eventButton.onclick = () => {
      loadEventFile(url);
    };
    eventButton.addEventListener("click", () => {
      const audio = new Audio("sounds/click.mp3");
      audio.play();
    });
    dropdownContent.appendChild(eventButton);
  });
  loadEventFile(eventFiles[0].url);
}
// Define an array of sound file names
const soundFiles = ["bird.mp3", "bird.mp3", "sound3.mp3"];

// Function to play a random sound from the sounds folder
function playRandomSound() {
  // Choose a random sound file from the array
  const soundFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
  // Create a new Audio object with the chosen sound file
  const audio = new Audio(`sounds/${soundFile}`);
  // Set the volume to a very low level
  audio.volume = 100.1;
  // Play the sound
  audio.play();
}

// Add event listener to the page title
const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);
// Add event listener to play click sound and pop animation when button is clicked
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  const audio = new Audio("sounds/click.mp3");
  audio.play();
  button.classList.add("pop");
  setTimeout(() => {
    button.classList.remove("pop");
  }, 500);
});
