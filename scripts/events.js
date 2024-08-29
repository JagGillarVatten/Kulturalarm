/**
 * This module defines global variables and functions related to managing events and notifications.
 *
 * The module loads event data from various JSON and ICS files, and provides functions to retrieve the current and upcoming events.
 * It also includes a function to handle key press events, allowing the user to adjust the time offset.
 *
 * The global variables are:
 * - events: An array of objects containing information about events, such as name, start time, end time, and location.
 * - sentNotifications: An array of strings containing the names of events that have already been sent as notifications.
 * - specialDates: An array of objects containing information about special dates, such as holidays or other events.
 * - currentEventName: A string containing the name of the current event.
 * - currentEventEnglishName: A string containing the English name of the current event.
 * - currentEventStart: A Date object containing the start time of the current event.
 * - currentEventLocation: A string containing the location of the current event.
 * - currentEventSentNotification: A boolean indicating whether a notification has already been sent for the current event.
 * - hourOffset: An integer indicating the number of hours to offset the start time of events.
 *
 * The functions are:
 * - loadJSON(fileUrl): Loads event data from a given file URL.
 * - parseICSFile(icsData): Parses an ICS file and converts it to a JSON array of events.
 * - getEnglishName(name): Takes a Swedish name and returns the English name.
 * - showSnackbar(message): Shows a snackbar with a given message.
 * - getTodaysEvents(): Returns an array of events for the current day.
 * - getNextEvent(): Returns the next event for the current day.
 * - handleKeyPress(event): Handles key press events, allowing the user to adjust the time offset.
 */

// Define global variables with appropriate initialization
let events = [];
let sentNotifications = [];
let specialDates = [];
let currentEventName = "";
let currentEventEnglishName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;
let hourOffset = 0;

// Define event files with names and URLs
const eventFiles = [
    { name: "MP1", url: "MP1.json" },
    { name: "AM1", url: "AM1.json" },
    { name: "MP2", url: "MP2.json" },
    { name: "AM2", url: "AM2.json" }
   // { name: "Live Schedule", url: "https://cloud.timeedit.net/medborgarskolan/web/kulturama/ri6655eyYn00b4QZ88Q6ZuQQZZ8Q1209.ics" }//
];

// Get the last used event file from localStorage
const lastUsedEventFile = localStorage.getItem('lastUsedEventFile') || eventFiles[0].url;

// Function to load JSON data from a given file URL
async function loadJSON(fileUrl) {
    console.log(`Loading JSON data from ${fileUrl}`);
    // Get the previous file name
    const previousFileName = eventFiles.find(file => file.url === lastUsedEventFile)?.name || 'Unknown';
    // Get the current file name
    const currentFileName = eventFiles.find(file => file.url === fileUrl)?.name || 'Unknown';
    // Save the current file URL as the last used one
    localStorage.setItem('lastUsedEventFile', fileUrl);
    // Show snackbar notification
    showSnackbar(`Switched from ${previousFileName} to ${currentFileName}`);
    // Fetch the event file
    const response = await fetch(fileUrl);
    if (response.ok) {
        const data = await response.text();
        if (fileUrl.endsWith(".ics")) {
            console.log(`Parsing ICS file: ${fileUrl}`);
            return parseICSFile(data);
        }
        console.log(`Parsing JSON file: ${fileUrl}`);
        return JSON.parse(data);
    }
    throw new Error(`Error fetching event file: ${fileUrl}. Status: ${response.status}`);
}

// Function to parse ICS file and convert to JSON
function parseICSFile(icsData) {
    try {
        console.log(`Parsing ICS file: ${icsData.length} bytes`);
        const cal = icalendar.Calendar.from_ical(icsData);
        const classSchedule = [];

        for (const event of cal.walk('VEVENT')) {
            const eventDate = event.get('DTSTART').dt.date();
            const classInfo = {
                'name': event.get('SUMMARY'),
                'englishName': getEnglishName(event.get('SUMMARY')),
                'startDay': event.get('DTSTART').dt.getDay() + 1,
                'startTime': event.get('DTSTART').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'endTime': event.get('DTEND').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'location': event.get('LOCATION', ''),
                'date': eventDate
            };
            classSchedule.push(classInfo);
        }

        return classSchedule;
    } catch (error) {
        console.error(`Error parsing ICS file: ${error.message}`);
        return [];
    }
}

// Function to get English name for a Swedish name
function getEnglishName(name) {
    const englishNames = {
        'Programmering': 'Programming',
        'Matematik': 'Mathematics',
        'Ensemble med körsång': 'Ensemble with Choir Singing',
        'Historia': 'History',
        'Svenska': 'Swedish',
        'Engelska': 'English',
        'Musikproduktion': 'Music Production',
        'Media Produktion': 'Media Production',
    };

    for (const swedishName in englishNames) {
        if (name.includes(swedishName)) {
            console.log(`Found English name for ${swedishName}: ${englishNames[swedishName]}`);
            return englishNames[swedishName];
        }
    }

    console.log(`No English name found for ${name}`);
    return '';
}

// Function to show a snackbar
function showSnackbar(message) {
    const snackbar = document.getElementById("snackbar");
    if (!snackbar) {
        const snackbar = document.createElement('div');
        snackbar.id = "snackbar";
        document.body.appendChild(snackbar);
    }
    snackbar.textContent = message;
    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}

// Function to get today's events
function getTodaysEvents() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todaysSpecialEvents = specialDates.filter(event => event.date.toDateString() === today.toDateString());
    return todaysSpecialEvents.length > 0 ? todaysSpecialEvents : events.filter((event) => event.startDay === dayOfWeek);
}

// Function to get the next event
function getNextEvent() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysEvents = getTodaysEvents();

    for (const event of todaysEvents) {
        const startTime = new Date(`${today.toDateString()} ${event.startTime || event.date.toTimeString().slice(0, 5)}`);
        const endTime = new Date(`${today.toDateString()} ${event.endTime || event.date.toTimeString().slice(0, 5)}`);

        // Apply hourOffset to startTime and endTime
        startTime.setHours(startTime.getHours() + hourOffset);
        endTime.setHours(endTime.getHours() + hourOffset);

        if (now >= startTime && now < endTime) {
            return { name: event.name, englishName: event.englishName, start: startTime, end: endTime, location: event.location };
        }

        if (now < startTime) {
            return { name: event.name, englishName: event.englishName, start: startTime, end: endTime, location: event.location };
        }
    }

    return null;
}

// Function to handle key press events
function handleKeyPress(event) {
    try {
        if (event.key === '.') {
            hourOffset++;
            console.log(`You are now offsetted to UTC+${hourOffset + 2}`);
            showSnackbar(`You are now offsetted to UTC+${hourOffset + 2} (${hourOffset === 0 ? 'Sweden' : ''})`);
        } else if (event.key === ',') {
            hourOffset--;
            console.log(`You are now offsetted to UTC+${hourOffset + 2}`);
            showSnackbar(`You are now offsetted to UTC+${hourOffset + 2} (${hourOffset === 0 ? 'Sweden' : ''})`);
        } else if (event.key === 'r') {
            hourOffset = 0;
            console.log(`Reset to UTC+2 (Sweden)`);
            showSnackbar(`Reset to UTC+2 (Sweden)`);
        } else {
            console.log(`Unhandled key press: ${event.key}`);
        }
    } catch (error) {
        console.error(`Error handling key press: ${error.message}`);
    }
}

// Add event listener for key press events
document.addEventListener('keydown', handleKeyPress);

// Load the last used event file by default
loadJSON(lastUsedEventFile);

