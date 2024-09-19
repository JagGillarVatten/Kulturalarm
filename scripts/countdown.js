function updateCountdown() {
    console.log("Updating countdown...");

    if (!events.length) {
        console.log("No events found, displaying no events message...");
        setTimeout(updateCountdown, 1000);
        return;
    }

    const currentDate = new Date();
    const nextEvent = isSpecialDate(currentDate) ? getSpecialDate(currentDate) : getNextEvent();

    if (! nextEvent) {
        console.log("No next event found, displaying no events message...");
        return displayNoEventsMessage();
    }

    const {
        name,
        englishName,
        location,
        start,
        end
    } = nextEvent;
    console.log("Next event:", name, englishName, location, start, end);
    displayEvent(name, englishName, location, start, end, currentDate, currentDate < start);

    if (getTodaysEvents().length > 0 && !document.hasEventListener) {
        console.log("Adding keydown event listener...");
        document.addEventListener("keydown", handleKeyDown);
        document.hasEventListener = true;
    }
}

function displayNoEventsMessage() {
    console.log("Displaying no events message...");
    resetEventDetails();
    updateUIForNoEvents();
    updateProgressBarForNextEvent();
}

function resetEventDetails() {
    currentEventName = "";
    currentEventEnglishName = "";
    currentEventStart = null;
    currentEventLocation = "";
}

function updateUIForNoEvents() {
    const countdownText = document.getElementById("countdown-text");
    countdownText.textContent = isSwedish ? "Inga fler händelser idag." : "No more events today.";

    const locationElement = document.getElementById("location");
    locationElement.textContent = "";

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.textContent = isSwedish ? "Hejdå!" : "Goodbye!";
    countdownNumber.innerHTML = '';
}

function updateProgressBarForNextEvent() {
    const progressBar = document.getElementById("progress-bar");
    const nextEvent = getNextEvent();
    if (nextEvent) {
        const timeUntilNextEvent = (nextEvent.start - new Date()) / 1000;
        const progress = 100 - (timeUntilNextEvent / (24 * 60 * 60)) * 100;
        updateProgressBar(progress);
        progressBar.style.display = "block";
    } else {
        progressBar.style.display = "none";
    }
}

function displayEvent(name, englishName, location, start, end, currentDate, isUpcoming) {
    const timeString = formatSeconds((isUpcoming ? start - currentDate : end - currentDate) / 1000);
    const detailsChanged = hasEventDetailsChanged(name, englishName, location, start);

    if (detailsChanged) {
        updateEventDetails(name, englishName, location, start);
        updateUIForEvent(name, englishName, location, isUpcoming, timeString);
        handleNotification(name, englishName, location, isUpcoming, timeString);
    }

    updateCountdownNumber(timeString);
    updateDocumentTitle(name, englishName, isUpcoming, timeString);
    updateProgressBarForEvent(start, end, currentDate, isUpcoming);
}

function hasEventDetailsChanged(name, englishName, location, start) {
    return currentEventName !== name || currentEventEnglishName !== englishName || currentEventStart !== start || currentEventLocation !== location;
}

function updateUIForEvent(name, englishName, location, isUpcoming, timeString) {
    const countdownText = document.getElementById("countdown-text");
    countdownText.textContent = isUpcoming ? `${
        isSwedish ? name : englishName
    } ${
        isSwedish ? "börjar om" : "starts in"
    }:` : `${
        isSwedish ? "Tid kvar för" : "Time left for"
    } ${
        isSwedish ? name : englishName
    }:`;

    const locationElement = document.getElementById("location");
    locationElement.textContent = `${
        isSwedish ? "Plats" : "Location"
    }: ${currentEventLocation}`;

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "block";

    const dropdownButton = document.querySelector('.dropdown-button');
    dropdownButton.textContent = isSwedish ? 'Byt schema' : 'Change schedule';
    dropdownButton.title = isSwedish ? 'Byt schema' : 'Change schedule';
}

function handleNotification(name, englishName, location, isUpcoming, timeString) {
    if (!sentNotifications.includes(name)) {
        sendNotification(name, englishName, location, isUpcoming ? timeString : isSwedish ? "Pågår just nu" : "Ongoing");
        sentNotifications.push(name);
        currentEventSentNotification = true;
    }
}

function updateDocumentTitle(name, englishName, isUpcoming, timeString) {
    document.title = `${timeString} ${
        isUpcoming ? (isSwedish ? "tills" : "until") : isSwedish ? "kvar" : "left"
    } | ${
        isSwedish ? name : englishName
    }`;
}

function updateProgressBarForEvent(start, end, currentDate, isUpcoming) {
    const progress = Math.max(0, isUpcoming ? (start - currentDate) / 1000 / (start - (start - 60000)) * 100 : ((currentDate - start) / 1000 / ((end - start) / 1000)) * 100);
    updateProgressBar(progress);
}

function updateEventDetails(name, englishName, location, start) {
    currentEventName = name;
    currentEventEnglishName = englishName;
    currentEventStart = start;
    currentEventLocation = location;
    currentEventSentNotification = false;
}

function updateCountdownNumber(timeString) {
    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.innerHTML = '';
    const [hours, minutes, seconds] = timeString.split(':');

    const createSpan = (className, content) => {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = content;
        return span;
    };

    countdownNumber.appendChild(createSpan('hours', hours));
    countdownNumber.appendChild(document.createTextNode(':'));
    countdownNumber.appendChild(createSpan('minutes', minutes));
    countdownNumber.appendChild(document.createTextNode(':'));
    countdownNumber.appendChild(createSpan('seconds', seconds));
}

function sendNotification(name, englishName, location, message) {
    new Notification(isSwedish ? name : englishName, {
            body: `${message} ${
            isSwedish ? "vid" : "at"
        } ${location}`
    });
}

let lastProgress = 0;
let animationFrameId = null;

function updateProgressBar(targetProgress) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    function animate() {
        const progressElement = document.getElementById("progress");
        const diff = targetProgress - lastProgress;
        const step = diff * 0.1;

        if (Math.abs(diff) > 0.1) {
            lastProgress += step;
            progressElement.style.width = `${lastProgress}%`;
            animationFrameId = requestAnimationFrame(animate);
        } else {
            lastProgress = targetProgress;
            progressElement.style.width = `${targetProgress}%`;
        }
    }

    animate();
}

function handleKeyDown(event) {
    if (event.key === "s") {
        saveEventTimestamps(getTodaysEvents());
    }
}

function saveEventTimestamps(events) {
    const timestamps = events.map(
        (event) => `${
            isSwedish ? event.name : event.englishName
        }: ${
            event.start.toLocaleString()
        } - ${
            event.end.toLocaleString()
        }`
    );
    const content = timestamps.join("\n");
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-timestamps.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatSeconds(seconds) {
    if (typeof seconds !== "number" || isNaN(seconds)) {
        console.error("Invalid seconds value:", seconds);
        return "";
    }

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = pad(Math.floor(seconds) % 60, 2);

    return hours > 0 ? `${hours}:${
        pad(minutes % 60, 2)
    }:${remainingSeconds}` : `${
        pad(minutes, 2)
    }:${remainingSeconds}`;
}

function pad(value, length) {
    if (typeof value !== "number" || isNaN(value)) {
        console.error("Invalid value for padding:", value);
        return "";
    }

    return value.toString().padStart(length, '0');
}

async function loadEventFile(filename) {
    try {
        const response = await fetch(`scheman/${filename}`);
        if (! response.ok) {
            throw new Error(`Could not fetch file: ${
                response.status
            } ${
                response.statusText
            }`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Invalid data format");
        }

        events = data.filter((event) => !event.specialDate);
        specialDates = data.filter((event) => event.specialDate);

        console.log("Regular events:", events);
        console.log("Special dates:", specialDates);

        updateCountdown();
    } catch (error) {
        console.error("Error loading event file:", error);
    }
}

const languageSwitcher = document.getElementById("language-switcher");
let isSwedish = true;

languageSwitcher.addEventListener("click", () => {
    isSwedish = ! isSwedish;
    languageSwitcher.textContent = isSwedish ? "Svenska" : "English";
    updateCountdown();
});
