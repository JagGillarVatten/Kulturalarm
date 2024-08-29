function updateCountdown() {
    // If there are no events, try again in 1 second
    if (!events.length) {
        setTimeout(updateCountdown, 1000);
        return;
    }

    // Get the next event or special date
    const currentDate = new Date();
    const nextEvent = isSpecialDate(currentDate)
        ? getSpecialDate(currentDate)
        : getNextEvent();

    // If there are no upcoming events, display a message
    if (!nextEvent) {
        return displayNoEventsMessage();
    }

    // Destructure the event details
    const { name, englishName, location, start, end } = nextEvent;

    // Display the event details based on whether it has started or not
    displayEvent(name, englishName, location, start, end, currentDate, currentDate < start);
    
    // Add an event listener for saving event timestamps if there are events today
    if (getTodaysEvents().length > 0 && document.addEventListener) {
        document.addEventListener(
            "keydown",
            saveEventTimestamps.bind(null, getTodaysEvents())
        );
    }
}

function displayNoEventsMessage() {
    // Reset event details
    currentEventName = "";
    currentEventEnglishName = "";
    currentEventStart = null;
    currentEventLocation = "";

    // Update UI elements
    const countdownText = document.getElementById("countdown-text");
    countdownText.textContent = isSwedish
        ? "Inga fler händelser idag."
        : "No more events today.";

    const locationElement = document.getElementById("location");
    locationElement.textContent = "";

    const countdownNumber = document.getElementById("countdown-number");
    countdownNumber.textContent = isSwedish ? "Hejdå!" : "Goodbye!";

    const progressBar = document.getElementById("progress-bar");
    progressBar.style.display = "none";
}

// Todo: improve logic
function displayEvent(name, englishName, location, start, end, currentDate, isUpcoming) {
    // Format the time remaining or elapsed
    const timeString = formatSeconds(
        (isUpcoming ? start - currentDate : end - currentDate) / 1000
    );

    // Check if event details have changed
    const detailsChanged =
        currentEventName !== name ||
        currentEventEnglishName !== englishName ||
        currentEventStart !== start ||
        currentEventLocation !== location;

    if (detailsChanged) {
        // Update event details
        updateEventDetails(name, englishName, location, start);

        // Update UI elements
        const countdownText = document.getElementById("countdown-text");
        countdownText.textContent = isUpcoming
            ? `${isSwedish ? name : englishName} ${isSwedish ? "börjar om" : "starts in"}:`
            : `${isSwedish ? "Tid kvar för" : "Time left for"} ${isSwedish ? name : englishName}:`;

        const countdownNumber = document.getElementById("countdown-number");
        countdownNumber.textContent = timeString;

        const locationElement = document.getElementById("location");
        locationElement.textContent = `${isSwedish ? "Plats" : "Location"}: ${currentEventLocation}`;

        document.title = `${timeString} ${isUpcoming ? (isSwedish ? "tills" : "until") : isSwedish ? "kvar" : "left"} | ${isSwedish ? name : englishName}`;

        const progressBar = document.getElementById("progress-bar");
        progressBar.style.display = "block";
// TODO: make this more intelligent and reactive.
        // Send a notification if not already sent
        if (!sentNotifications.includes(name)) {
            sendNotification(
                name,
                englishName,
                location,
                isUpcoming ? timeString : isSwedish ? "Pågår just nu" : "Ongoing"
            );
            sentNotifications.push(name);
            currentEventSentNotification = true;
        }
    }

    // Calculate and update the progress bar
    const progress = Math.max(
        0,
        isUpcoming
            ? (start - currentDate) / 1000 / (start - (start - 60000)) * 100
            : ((currentDate - start) / 1000 / ((end - start) / 1000)) * 100
    );
    updateProgressBar(progress);
}

function updateEventDetails(name, englishName, location, start) {
    // Update event details
    currentEventName = name;
    currentEventEnglishName = englishName;
    currentEventStart = start;
    currentEventLocation = location;
    currentEventSentNotification = false;
}

function sendNotification(name, englishName, location, message) {
    // Send a notification with the event details
    new Notification(isSwedish ? name : englishName, {
        body: `${message} ${isSwedish ? "vid" : "at"} ${location}`,
    });
}
// Todo: improve logic
function updateProgressBar(progress) {
    // Update the progress bar width
    const progressElement = document.getElementById("progress");
    progressElement.style.width = `${progress}%`;
}

function saveEventTimestamps(events, event) {
    // TODO Save event timestamps to a file if the "s" key is pressed
    if (event.key === "s") {
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
}

function formatSeconds(seconds) {
    // Format seconds into a human-readable string
    if (typeof seconds !== "number" || isNaN(seconds)) {
        console.error("Invalid seconds value:", seconds);
        return "";
    }

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingSeconds = pad(Math.floor(seconds) % 60, 2);

    if (hours > 0) {
        return `${hours}:${pad(minutes % 60, 2)}:${remainingSeconds}`;
    } else {
        return `${pad(minutes, 2)}:${remainingSeconds}`;
    }
}

function pad(value, length) {
    // Pad a number with leading zeros
    if (typeof value !== "number" || isNaN(value)) {
        console.error("Invalid value for padding:", value);
        return "";
    }

    return ("000000000" + value).substr(-length);
}

async function loadEventFile(filename) {
    try {
        // Fetch the event file
        const response = await fetch(`scheman/${filename}`);

        // Check if the fetch was successful
        if (!response.ok) {
            console.error(
                "Error fetching event file:",
                response.status,
                response.statusText
            );
            throw new Error("Could not fetch file");
        }

        // Parse the JSON data
        const data = await response.json();

        // Check if the data is an array
        if (!Array.isArray(data)) {
            console.error("Invalid data format:", data);
            throw new Error("Invalid data format");
        }

        // Filter events and special dates
        events = data.filter((event) => !event.specialDate);
        specialDates = data.filter((event) => event.specialDate);

        console.log("Regular events:", events);
        console.log("Special dates:", specialDates);

        // Update the countdown
        updateCountdown();
    } catch (error) {
        console.error(error);
    }
}

// Language switcher
const languageSwitcher = document.getElementById("language-switcher");
let isSwedish = true;

languageSwitcher.addEventListener("click", () => {
    // Toggle the language
    isSwedish = !isSwedish;
    languageSwitcher.textContent = isSwedish ? "Svenska" : "English";

    // Update the countdown with the new language
    updateCountdown();
});
