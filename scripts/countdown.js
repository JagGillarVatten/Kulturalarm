// Funktion för att uppdatera nedräkningen
function updateCountdown() {
  if (events.length === 0) {
    setTimeout(updateCountdown, 1000);
    return;
  }

  const now = new Date();
  let nextEvent;
  const todaysEvents = getTodaysEvents();

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

    const countdownText = document.getElementById("countdown-text");
    countdownText.innerHTML = "Inga fler händelser idag.";

    const locationEl = document.getElementById("location");
    locationEl.innerHTML = "";

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.innerHTML = "Hejdå!";

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "none";

    return;
  }

  const { name, location, start, end } = nextEvent;

  if (now < start) {
    const remainingTime = formatSeconds((start - now) / 1000);

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

      const countdownText = document.getElementById("countdown-text");
      countdownText.innerHTML = `${name} börjar om:`;

      const countdownNumber = document.getElementById("countdown-number");
      countdownNumber.innerHTML = remainingTime;

      const locationEl = document.getElementById("location");
      locationEl.innerHTML = "Plats: " + currentEventLocation;

      const progressBar = document.getElementById("progress-bar");
      progressBar.style.display = "block";

      if (!sentNotifications.includes(name)) {
        new Notification(name, {
          body: `Börjar om ${remainingTime} vid ${location}`,
        });
        sentNotifications.push(name);
        currentEventSentNotification = true;
      }

      const progressWidth = Math.max(0, ((start - now) / 1000 / (start - (start - 60 * 1000))) * 100);

      const progress = document.getElementById("progress");
      progress.style.width = `${progressWidth}%`;
      return;
    }
  } else {
    const remainingTime = formatSeconds((end - now) / 1000);

    if (
      currentEventName !== name ||
      currentEventStart !== start ||
      currentEventLocation !== location
    ) {
      currentEventName = name;
      currentEventStart = start;
      currentEventLocation = location;
      currentEventSentNotification = false;

      const countdownText = document.getElementById("countdown-text");
      countdownText.innerHTML = `Tid kvar för ${name}:`;

      const countdownNumber = document.getElementById("countdown-number");
      countdownNumber.innerHTML = remainingTime;

      const locationEl = document.getElementById("location");
      locationEl.innerHTML = `Plats: ${location}`;

      document.title = `${remainingTime} kvar | ${name}`;
    }

    if (
      !currentEventSentNotification &&
      now >= start &&
      !sentNotifications.includes(name)
    ) {
      new Notification(name, {
        body: `Pågår just nu vid ${location}`,
      });
      sentNotifications.push(name);
      currentEventSentNotification = true;
    }

    const progressWidth = Math.max(0, ((now - start) / 1000 / ((end - start) / 1000)) * 100);

    const progress = document.getElementById("progress");
    progress.style.width = `${progressWidth}%`;

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "block";
  }

  // Add event timestamps to a file
  if (todaysEvents.length > 0 && document.addEventListener) {
    document.addEventListener('keydown', function(event) {
      if (event.key === 't') {
        const eventTimestamps = todaysEvents.map(event => `${event.name}: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}`);
        const eventTimestampsText = eventTimestamps.join('\n');
        const blob = new Blob([eventTimestampsText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'event-timestamps.txt';
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}

// Function to format seconds to a time string
function formatSeconds(seconds) {
  // Log error if seconds is not a number
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    console.error('Invalid seconds value:', seconds);
    return '';
  }

  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

  return hours > 0
    ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
    : `${pad(minutes, 2)}:${paddedSeconds}`;
}

// Function to pad a value with leading zeros
function pad(value, length) {
  // Log error if value is not a number
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('Invalid value for padding:', value);
    return '';
  }

  return ("000000000" + value).substr(-length);
}

// Function to load event file
async function loadEventFile(filename) {
  try {
    const response = await fetch(`scheman/${filename}`);

    // Log error if response is not ok
    if (!response.ok) {
      console.error('Error fetching event file:', response.status, response.statusText);
      throw new Error('Could not fetch file');
    }

    const data = await response.json();

    // Log error if data is not an array
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format');
    }

    events = data.filter((entry) => !entry.specialDate);
    specialDates = data.filter((entry) => entry.specialDate);

    console.log('Vanliga händelser:', events);
    console.log('Speciella datum:', specialDates);

    updateCountdown();

  } catch (error) {
    console.error(error);
  }
}
