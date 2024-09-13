function updateCountdown() {
    const currentDate = new Date();
    const events = getTodaysEvents();
    const nextEvent = isSpecialDate(currentDate)
        ? getSpecialDate(currentDate)
        : getNextEvent();

    if (!nextEvent) {
        displayNoEventsMessage();
    } else {
        displayEvent(nextEvent, currentDate);
    }

    updateEventListener(events);
    setTimeout(updateCountdown, 1000);
}

function displayNoEventsMessage() {
    resetEventDetails();
    updateUIForNoEvents();
    updateProgressBarForNextEvent();
}

function resetEventDetails() {
    currentEvent = null;
    currentEventSentNotification = false;
}

function updateUIForNoEvents() {
    const countdownText = document.getElementById("countdown-text");
    const locationElement = document.getElementById("location");
    const countdownNumber = document.getElementById("countdown-number");

    countdownText.textContent = isSwedish ? "Inga fler händelser idag." : "No more events today.";
    locationElement.textContent = "";
    countdownNumber.textContent = isSwedish ? "Hejdå!" : "Goodbye!";
    countdownNumber.innerHTML = '';

    document.title = isSwedish ? "Inga fler händelser" : "No more events";
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

function displayEvent(event, currentDate) {
    const { name, englishName, location, start, end } = event;
    const isUpcoming = currentDate < start;
    const timeString = formatSeconds((isUpcoming ? start - currentDate : end - currentDate) / 1000);

    if (hasEventDetailsChanged(event)) {
        updateEventDetails(event);
        updateUIForEvent(event, isUpcoming);
        handleNotification(event, isUpcoming, timeString);
    }

    updateCountdownNumber(timeString);
    updateDocumentTitle(event, isUpcoming, timeString);
    updateProgressBarForEvent(start, end, currentDate, isUpcoming);
}

function hasEventDetailsChanged(event) {
    return !currentEvent || 
           currentEvent.name !== event.name ||
           currentEvent.englishName !== event.englishName ||
           currentEvent.start.getTime() !== event.start.getTime() ||
           currentEvent.location !== event.location;
}

function updateUIForEvent(event, isUpcoming) {
    const { name, englishName, location } = event;
    const countdownText = document.getElementById("countdown-text");
    const locationElement = document.getElementById("location");
    const progressBar = document.getElementById("progress-bar");

    countdownText.textContent = isUpcoming
        ? `${isSwedish ? name : englishName} ${isSwedish ? "börjar om" : "starts in"}:`
        : `${isSwedish ? "Tid kvar för" : "Time left for"} ${isSwedish ? name : englishName}:`;

    locationElement.textContent = `${isSwedish ? "Plats" : "Location"}: ${location}`;
    progressBar.style.display = "block";
}

function handleNotification(event, isUpcoming, timeString) {
    if (!currentEventSentNotification) {
        sendNotification(
            event.name,
            event.englishName,
            event.location,
            isUpcoming ? timeString : isSwedish ? "Pågår just nu" : "Ongoing"
        );
        currentEventSentNotification = true;
    }
}

function updateDocumentTitle(event, isUpcoming, timeString) {
    const { name, englishName } = event;
    document.title = `${timeString} ${isUpcoming ? (isSwedish ? "tills" : "until") : isSwedish ? "kvar" : "left"} | ${isSwedish ? name : englishName}`;
}

function updateProgressBarForEvent(start, end, currentDate, isUpcoming) {
    const totalDuration = end - start;
    const elapsedTime = currentDate - start;
    const progress = isUpcoming
        ? Math.max(0, 100 - (start - currentDate) / 60000)  // Show progress in last minute before event starts
        : Math.min(100, (elapsedTime / totalDuration) * 100);
    updateProgressBar(progress);
}

function updateEventDetails(event) {
    currentEvent = event;
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
    if (Notification.permission === "granted") {
        new Notification(isSwedish ? name : englishName, {
            body: `${message} ${isSwedish ? "vid" : "at"} ${location}`,
        });
    }
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

function updateEventListener(events) {
    if (events.length > 0 && !document.hasEventListener) {
        document.addEventListener("keydown", handleKeyDown);
        document.hasEventListener = true;
    }
}

function handleKeyDown(event) {
    if (event.key === "s") {
        saveEventTimestamps(getTodaysEvents());
    }
}

function saveEventTimestamps(events) {
    const timestamps = events.map(
        (event) =>
            `${isSwedish ? event.name : event.englishName}: ${event.start.toLocaleString()} - ${event.end.toLocaleString()}`
    );
    const content = timestamps.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
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

    return hours > 0 ? `${hours}:${pad(minutes % 60, 2)}:${remainingSeconds}` : `${pad(minutes, 2)}:${remainingSeconds}`;
}

function pad(value, length) {
    if (typeof value !== "number" || isNaN(value)) {
        console.error("Invalid value for padding:", value);
        return "";
    }

    return ("000000000" + value).substr(-length);
}

async function loadEventFile(filename) {
    try {
        const response = await fetch(`scheman/${filename}`);
        if (!response.ok) {
            throw new Error(`Could not fetch file: ${response.status} ${response.statusText}`);
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
    isSwedish = !isSwedish;
    languageSwitcher.textContent = isSwedish ? "Svenska" : "English";
    updateCountdown();
});
