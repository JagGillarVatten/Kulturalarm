
let events = [];
let sentNotifications = [];
let specialDates = [];

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
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;

// Hour offset for timezone adjustment
let hourOffset = 0;

// Function to load JSON data
function loadJSON(fileUrl, onFileLoaded) {
  let request = new XMLHttpRequest();
  request.overrideMimeType("application/json");
  request.open("GET", fileUrl, true);

  /**
     * The provided code snippet defines an anonymous function assigned to the `onreadystatechange` event handler of
     * an XMLHttpRequest object. This function is executed whenever the state of the request changes.
     * 
     * Within the function, it first checks if the readyState property of the request object is equal to 4,
     * indicating that the request has been completed. If this condition is true, it proceeds to check if the status
     * property of the request object is equal to 200, indicating a successful response.
     * 
     * If the status is 200, the `onFileLoaded` function is called with the parsed JSON response text as an argument.
     * This function is expected to handle the loaded JSON data.
     * 
     * If the status is not 200, an error message is logged to the console using `console.error()`. Additionally, an
     * Error object is thrown with a descriptive message indicating the failure to load the JSON from the specified
     * file URL and the corresponding status code.
     * 
     * It is important to note that the code assumes the existence of a `fileUrl` variable, which should contain the
     * URL of the JSON file being loaded.
     */
    request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if (request.status === 200) {
        onFileLoaded(JSON.parse(request.responseText));
      } else {
        console.error(`Error loading JSON from ${fileUrl}. Status: ${request.status}`);
        throw new Error(`Failed to load JSON from ${fileUrl}. Status: ${request.status}`);
      }
    }
  };

  request.send(null);
}

// events.js

// Function to get today's events
function getTodaysEvents() {
  try {
    let today = new Date();
    let dayOfWeek = today.getDay();
    return events.filter((event) => event.startDay === dayOfWeek);
  } catch (error) {
    console.error('Error getting todays events:', error);
    throw error;
  }
}

// Function to get next event  
function getNextEvent() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysEvents = getTodaysEvents();

    for (const event of todaysEvents) {
      const startTime = new Date(`${today.toDateString()} ${event.startTime}`);
      const endTime = new Date(`${today.toDateString()} ${event.endTime}`);

      if (now >= startTime && now < endTime) {
        return {
          name: event.name,
          start: startTime,
          location: event.location,
          end: endTime,
        };
      }

      if (now < startTime) {
        return {
          name: event.name,
          start: startTime,
          end: endTime,
          location: event.location,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting next event:', error);
    throw error;
  }
}
