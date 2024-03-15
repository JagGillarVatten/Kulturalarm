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
function loadJSON(fileUrl, onFileLoaded) {
  const request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", fileUrl, true);
  
  // Event handler for XMLHttpRequest state changes
  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        // Parse JSON response and pass it to the callback function
        onFileLoaded(JSON.parse(request.responseText));
      } else {
        // Log error and throw an error for failed JSON loading
        console.error(`Error loading JSON from ${fileUrl}. Status: ${request.status}`);
        throw new Error(`Failed to load JSON from ${fileUrl}. Status: ${request.status}`);
      }
    }
  };

  request.send(null);
}

// Function to get today's events
function getTodaysEvents() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Filter events for the current day of the week
    return events.filter((event) => event.startDay === dayOfWeek);
  } catch (error) {
    console.error('Error getting today\'s events:', error.message);
    throw error;
  }
}

// Function to get the next event
function getNextEvent() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysEvents = getTodaysEvents();

    // Find the next upcoming event
    for (const event of todaysEvents) {
      const startTime = new Date(`${today.toDateString()} ${event.startTime}`);
      const endTime = new Date(`${today.toDateString()} ${event.endTime}`);

      if (now >= startTime && now < endTime) {
        return { name: event.name, start: startTime, end: endTime, location: event.location };
      }

      if (now < startTime) {
        return { name: event.name, start: startTime, end: endTime, location: event.location };
      }
    }

    return null; // Return null if no upcoming events found
  } catch (error) {
    console.error('Error getting next event:', error.message);
    throw error;
  }
}
