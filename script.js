let events = [];
let eventDuration = 0;
let sentNotifications = [];

const eventFiles = [
  {
    name: "MP1-23",
    url: "MP1.json",
  },
  {
    name: "AM1-23",
    url: "AM1.json",
  },
];

function loadJSON(callback, url) {
  const xhr = new XMLHttpRequest();
  xhr.overrideMimeType("application/json");
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      callback(xhr.responseText);
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
  for (let i = 0; i < todaysEvents.length; i++) {
    const start = new Date(
      `${today.toDateString()} ${todaysEvents[i].startTime}`,
    );
    const end = new Date(`${today.toDateString()} ${todaysEvents[i].endTime}`);
    if (now >= start && now < end) {
      // We're currently in this event
      return {
        name: todaysEvents[i].name,
        start: start,
        location: todaysEvents[i].location,
        end: end,
      };
    } else if (now < start) {
      // This event hasn't started yet
      return {
        name: todaysEvents[i].name,
        start: start,
        end: end,
        location: todaysEvents[i].location,
      };
    }
  }
  // There are no events left today
  return null;
}

/**
 * Updates the countdown timer and progress bar for the next event.
 * @function
 * @returns {void}
 */
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
    document.getElementById("countdown").innerHTML =
      "Inga fler lektioner idag.";
    document.getElementById("progress-bar").style.display = "none";
    return;
  }

  const eventName = nextEvent.name;
  const eventLocation = nextEvent.location;
  const start = nextEvent.start;
  const end = nextEvent.end;

  if (now < start) {
    // Event hasn't started yet
    const timeUntilStart = (start - now) / 1000; // Convert to seconds
    const timeUntilStartFormatted = formatSeconds(timeUntilStart);
    document.title = `${timeUntilStartFormatted} tills | ${eventName}`;
    const countdown = ` ${eventName} börjar om: <br> ${formatSeconds(
      timeUntilStart,
    )} `;
    document.getElementById("countdown").innerHTML = countdown;
    document.getElementById("countdown").style.color = "#ffff";
    document.getElementById("progress").style.width = "0";
    document.getElementById("progress").style.backgroundColor = "#a3d47a";
    document.getElementById("progress-bar").style.display = "block";

    // Check if notification has already been sent for this event
    if (!sentNotifications.includes(eventName)) {
      // Create new notification
      const notification = new Notification(eventName, {
        body: `Börjar om ${formatSeconds(timeUntilStart)} i ${eventLocation}`,
      });
      // Add event name to sentNotifications array
      sentNotifications.push(eventName);
    }

    return;
  }

  // Event is ongoing or already finished
  const totalDuration = (end - start) / 1000; // Convert to seconds
  const timeElapsed = (now - start) / 1000; // Convert to seconds
  const timeRemaining = (end - now) / 1000; // Convert to seconds
  const eventDuration = (end - start) / 1000; // convert to seconds

  const countdown = `Tid kvar för ${eventName}:<br> ${formatSeconds(timeRemaining)}`;
  const location = `Rum: ${eventLocation}`;
  document.getElementById("countdown").innerHTML = countdown;
  document.getElementById("location").innerHTML = location;
  document.getElementById("countdown").innerHTML = countdown;
  const timeRemainingFormatted = formatSeconds(timeRemaining);
  document.title = `${timeRemainingFormatted} kvar | ${eventName}`;
  const percentElapsed = (timeElapsed / eventDuration) * 100;
  const width =
    (percentElapsed / 100) *
    document.getElementById("progress-bar").offsetWidth;
  document.getElementById("progress").style.width = `${width}px`;

  document.getElementById("progress-bar").style.display = "block";
}

function formatSeconds(seconds) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const paddedSeconds = pad(Math.floor(seconds) % 60, 2);
  if (hours > 0) {
    return `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`;
  }
  return `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(num, size) {
  return ("000000000" + num).substr(-size);
}

function loadEventFile(url) {
  loadJSON(function (response) {
    events = JSON.parse(response);
    updateCountdown();
  }, url);
}

function init() {
  const dropdownContent = document.querySelector(".dropdown-content");
  const dropdownButton = document.querySelector(".dropdown-button");
  eventFiles.forEach((eventFile) => {
    const eventButton = document.createElement("a");
    eventButton.innerText = eventFile.name;
    eventButton.onclick = () => {
      loadEventFile(eventFile.url);
    };
    dropdownContent.appendChild(eventButton);
  });
  loadEventFile(eventFiles[0].url);
}

setInterval(updateCountdown, 100);
init();