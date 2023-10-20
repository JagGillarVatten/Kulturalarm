/**
 * Global variables to store event data and duration.
 * eventFiles contains the schema options to load.
 * loadJSON loads JSON data from a URL.
 * getTodaysEvents filters events to only today's.
 * getNextEvent gets the next upcoming event.
 * updateCountdown calculates and displays the countdown UI.
 * formatSeconds and pad format time strings.
 * loadEventFile loads a schema's JSON data.
 * init sets up the schema dropdown UI.
 * parseRSS parses an RSS feed into HTML.
 */

let events = [];

let eventDuration = 0;

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
        `${today.toDateString()} ${todaysEvents[i].startTime}`
      );
      const end = new Date(`${today.toDateString()} ${todaysEvents[i].endTime}`);
      if (now >= start && now < end) {
        // We're currently in this event
        return {
          name: todaysEvents[i].name,
          start: start,
          end: end,
        };
      } else if (now < start) {
        // This event hasn't started yet
        return {
          name: todaysEvents[i].name,
          start: start,
          end: end,
        };
      }
    }
    // There are no events left today
    return null;
  }

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
    const start = nextEvent.start;
    const end = nextEvent.end;

    if (now < start) {
      // Event hasn't started yet
      const timeUntilStart = (start - now) / 1000; // Convert to seconds
      const timeUntilStartFormatted = formatSeconds(timeUntilStart);
      document.title = `${timeUntilStartFormatted} tills | ${eventName}`;
      const countdown = ` ${eventName} börjar om: <br> ${formatSeconds(
        timeUntilStart
      )} `;
      document.getElementById("countdown").innerHTML = countdown;
      setCountdownAnimation("Shake", 0.1, 100);
      setProgressBarColor("#a3d47a");
      return;
    }

    // Event is ongoing or already finished
    const timeElapsed = (now - start) / 1000; // Convert to seconds
    const timeRemaining = (end - now) / 1000; // Convert to seconds
    const eventDuration = (end - start) / 1000; // convert to seconds

    const countdown = `Tid kvar för ${eventName}:<br> ${formatSeconds(
      timeRemaining
    )}`;
    document.getElementById("countdown").innerHTML = countdown;
    const timeRemainingFormatted = formatSeconds(timeRemaining);
    document.title = `${timeRemainingFormatted} kvar | ${eventName}`;
    const percentElapsed = (timeElapsed / eventDuration) * 100;
    const width =
      (percentElapsed / 100) *
      document.getElementById("progress-bar").offsetWidth;
    document.getElementById("progress").style.width = `${width}px`;

    switch (true) {
      case timeRemaining < 60:
        setCountdownAnimation("Shake", null, "infinite");
        setProgressBarColor("#f36868");
        document.getElementById("countdown").style.color = "#f36868";
        break;
      case timeRemaining < 300:
        setCountdownAnimation("Shake", 0.1, 100);
        setProgressBarColor("#f7d26f");
        document.getElementById("countdown").style.color = "#fffff";
        break;
      case timeRemaining < 600:
        setProgressBarColor("#e33314");
        document.getElementById("countdown").style.color = "#e33314";
        break;
      default:
        setProgressBarColor("#aed47a");a
        document.getElementById("countdown").style.color = "#fd25";
        break;
    }

    document.getElementById("progress-bar").style.display = "block";
  }

  function setCountdownAnimation(animationName, animationDuration, iterationCount) {
    const countdown = document.getElementById("countdown");
    countdown.style.animationName = animationName;
    countdown.style.animationDuration = animationDuration ? `${animationDuration}s` : null;
    countdown.style.animationIterationCount = iterationCount;
  }

  function setProgressBarColor(color) {
    document.getElementById("progress").style.backgroundColor = color;
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
