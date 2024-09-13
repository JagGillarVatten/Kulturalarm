
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
];

// Get the last used event file from URL parameter or use the first event file as default
const urlParams = new URLSearchParams(window.location.search);
const lastUsedEventFile = urlParams.get('lastUsedEventFile') || eventFiles[0].url;

// Find the index of the last used event file in the eventFiles array
const lastUsedEventIndex = eventFiles.findIndex(file => file.url === lastUsedEventFile);

// Use the found index if valid, otherwise default to 0
const currentEventFileIndex = lastUsedEventIndex !== -1 ? lastUsedEventIndex : 0;

// Set the current event file
const currentEventFile = eventFiles[currentEventFileIndex];

// Update the URL with the current event file
function updateURLWithEventFile(fileUrl) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('lastUsedEventFile', fileUrl);
    window.history.pushState({}, '', newUrl);
}

// Use currentEventFile.url for loading the events
loadJSON(currentEventFile.url).then(data => {
    events = data;
    // Additional logic for handling the loaded events
});

// Function to load JSON data from a given file URL
async function loadJSON(fileUrl) {
    console.log(`Loading JSON data from ${fileUrl}`);
    const previousFileName = eventFiles.find(file => file.url === lastUsedEventFile)?.name || 'Unknown';
    const currentFileName = eventFiles.find(file => file.url === fileUrl)?.name || 'Unknown';
    updateURLWithEventFile(fileUrl);
    
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Error fetching event file: ${fileUrl}. Status: ${response.status}`);
    const data = await response.text();
    return fileUrl.endsWith(".ics") ? parseICSFile(data) : JSON.parse(data);
}

// Function to parse ICS file and convert to JSON
function parseICSFile(icsData) {
    try {
        console.log(`Parsing ICS file: ${icsData.length} bytes`);
        const cal = icalendar.Calendar.from_ical(icsData);
        return cal.walk('VEVENT').map(event => ({
            name: event.get('SUMMARY'),
            englishName: getEnglishName(event.get('SUMMARY')),
            startDay: event.get('DTSTART').dt.getDay() + 1,
            startTime: event.get('DTSTART').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: event.get('DTEND').dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: event.get('LOCATION', ''),
            date: event.get('DTSTART').dt.date()
        }));
    } catch (error) {
        console.error(`Error parsing ICS file: ${error.message}`);
        return [];
    }
}

// Function to get English name for a Swedish name
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

function getEnglishName(name) {
    for (const [swedishName, englishName] of Object.entries(englishNames)) {
        if (name.includes(swedishName)) {
            console.log(`Found English name for ${swedishName}: ${englishName}`);
            return englishName;
        }
    }
    console.log(`No English name found for ${name}`);
    return '';
}

// Function to show a snackbar
function showSnackbar(message) {
    let snackbar = document.getElementById("snackbar");
    if (!snackbar) {
        snackbar = document.createElement('div');
        snackbar.id = "snackbar";
        document.body.appendChild(snackbar);
    }
    snackbar.textContent = message;
    snackbar.className = "show";
    setTimeout(() => snackbar.className = snackbar.className.replace("show", ""), 3000);
}

// Function to get today's events
function getTodaysEvents() {
    const today = new Date();
    today.setHours(today.getHours() + hourOffset);
    const dayOfWeek = today.getDay();
    const todaysSpecialEvents = specialDates.filter(event => event.date.toDateString() === today.toDateString());
    return todaysSpecialEvents.length > 0 ? todaysSpecialEvents : events.filter(event => event.startDay === dayOfWeek);
}
function getNextEvent() {
    const now = new Date();
    now.setHours(now.getHours() + hourOffset);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaysEvents = getTodaysEvents();

    for (const event of todaysEvents) {
      const startTime = new Date(`${today.toDateString()} ${event.startTime || event.date.toTimeString().slice(0, 5)}`);
      const endTime = new Date(`${today.toDateString()} ${event.endTime || event.date.toTimeString().slice(0, 5)}`);

      if (now >= startTime && now < endTime || now < startTime) {
        return { name: event.name, englishName: event.englishName, start: startTime, end: endTime, location: event.location };
      }
    }

    return null;
  }
  // Function to handle key press events
  function handleKeyPress(event) {
    try {
      switch (event.key) {
        case '.':
          hourOffset++;
          break;
        case ',':
          hourOffset--;
          break;
        case 'r':
          hourOffset = 0;
          break;
        default:
          console.log(`Unhandled key press: ${event.key}`);
          return;
      }
      console.log(`You are now offsetted to UTC+${hourOffset + 2}${hourOffset === 0 ? ' (Sweden)' : ''}`);
      showSnackbar(`You are now offsetted to UTC+${hourOffset + 2}${hourOffset === 0 ? ' (Sweden)' : ''}`);
      updateTodayEvents();
    } catch (error) {
        
      console.error(`Error handling key press: ${error.message}`);
    }
  }

  // Add event listener for key press events
  document.addEventListener('keydown', handleKeyPress);

  // Function to get today's events for the modal
  function getTodayEvents() {
    const now = new Date();
    now.setHours(now.getHours() + hourOffset);
    const currentEventName = getNextEvent()?.name;
    const events = getTodaysEvents();

    // Group events by time and name
    const groupedEvents = events.reduce((acc, event) => {
      const key = `${event.startTime}-${event.endTime}-${event.name}`;
      if (!acc[key]) {
        acc[key] = { ...event, count: 1 };
      } else {
        acc[key].count++;
      }
      return acc;
    }, {});

    return Object.values(groupedEvents).map(event => {
      const startTime = new Date(`${now.toDateString()} ${event.startTime}`);
      const endTime = new Date(`${now.toDateString()} ${event.endTime}`);

      return {
        time: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        name: event.count > 1 ? `${event.name} (x${event.count})` : event.name,
        isCurrent: currentEventName === event.name ? '➤ ' : '',
        isCompleted: now > endTime ? '✓ ' : ''
      };
    });
  }

  function updateTodayEvents() {
    var eventsList = document.getElementById("events-list");

    // Clear previous events
    eventsList.innerHTML = "";

    // Get today's events
    var todayEvents = getTodayEvents();

    // Populate the events list
    todayEvents.forEach(function(event) {
      var eventItem = document.createElement("p");
      eventItem.textContent = `${event.isCurrent}${event.isCompleted}${event.time} - ${event.endTime} ${event.name}`;
      eventsList.appendChild(eventItem);
    });
  }

  function showTodayEvents() {
    var modal = document.getElementById("events-modal");
    var span = document.getElementsByClassName("close")[0];

    updateTodayEvents();

    modal.style.display = "block";

    span.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    // Set up interval to update events every minute
    const updateInterval = setInterval(updateTodayEvents, 60000);

    // Clear interval when modal is closed
    modal.addEventListener('hidden.bs.modal', function () {
      clearInterval(updateInterval);
    });
  }

  // Load the last used event file by default
  loadJSON(lastUsedEventFile).then(() => {
    // Update the URL with the most recent event file
    updateURLWithEventFile(currentEventFile.url);
  });

  // Initial update of events
  updateTodayEvents();