// Define global variables with appropriate initialization
let events = [];
let sentNotifications = [];
let specialDates = [];
let currentEventName = "";
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
];

// Function to load JSON data from a given file URL
function loadJSON(fileUrl) {
return new Promise((resolve, reject) => {
const request = new XMLHttpRequest();
request.overrideMimeType("application/json");
request.open("GET", fileUrl, true);

request.onreadystatechange = function () {
if (request.readyState === 4) {
if (request.status === 200) {
resolve(JSON.parse(request.responseText));
} else {
reject(`Error loading JSON from ${fileUrl}. Status: ${request.status}`);
}
}
};

request.onerror = function () {
reject(`Error loading JSON from ${fileUrl}.`);
};

request.send(null);
});
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
return { name: event.name, start: startTime, end: endTime, location: event.location };
}

if (now < startTime) {
return { name: event.name, start: startTime, end: endTime, location: event.location };
}
}

return null;
}

// Function to handle key press events
function handleKeyPress(event) {
if (event.key === '.') {
hourOffset++;
showSnackbar(`You are now offsetted to UTC+${hourOffset + 2} (${hourOffset === 0 ? 'Sweden' : ''})`);
} else if (event.key === ',') {
hourOffset--;
showSnackbar(`You are now offsetted to UTC+${hourOffset + 2} (${hourOffset === 0 ? 'Sweden' : ''})`);
} else if (event.key === 'r') {
hourOffset = 0;
showSnackbar(`Reset to UTC+2 (Sweden)`);
}
}

/* CSS for cute window */



// Add event listener for key press events
document.addEventListener('keydown', handleKeyPress);
