let events = [];
let sentNotifications = [];
let specialDates = [];
const eventFiles = [
    { name: "MP1", url: "MP1.json" },
    { name: "AM1", url: "AM1.json" },
    { name: "MP2", url: "MP2.json" },
    { name: "AM2", url: "AM2.json" }
];
let currentEventName = "";
let currentEventStart = null;
let currentEventLocation = "";
let currentEventSentNotification = false;
let hourOffset = 0;

function loadJSON(url, callback) {
    const cachedData = localStorage.getItem(url);

    if (cachedData) {
        callback(JSON.parse(cachedData));
        return;
    }

    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", url, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                localStorage.setItem(url, xhr.responseText);
                callback(JSON.parse(xhr.responseText));
            } else {
                console.error(`Error loading JSON from ${url}. Status: ${xhr.status}`);
            }
        }
    };

    xhr.send(null);
}

function getTodaysEvents() {
    let dayOfWeek = new Date().getDay();
    return events.filter((event) => event.startDay === dayOfWeek);
}

function getNextEvent() {
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let todaysEvents = getTodaysEvents();

    for (let event of todaysEvents) {
        let eventStart = new Date(`${today.toDateString()} ${event.startTime}`);
        let eventEnd = new Date(`${today.toDateString()} ${event.endTime}`);

        if (now >= eventStart && now < eventEnd) {
            return { name: event.name, start: eventStart, location: event.location, end: eventEnd };
        }

        if (now < eventStart) {
            return { name: event.name, start: eventStart, end: eventEnd, location: event.location };
        }
    }

    return null;
}

function updateCountdown() {
    if (events.length === 0) {
        setTimeout(updateCountdown, 1000);
        return;
    }

    let now = new Date();
    let nextEvent;
    let todaysEvents = getTodaysEvents();
    let eventListContainer = document.getElementById("event-list");
    let eventListUl = document.getElementById("events-ul");

    if (
        (now.getDate() > 21 && now.getMonth() === 11) ||
        (now.getDate() <= 11 && now.getMonth() === 11)
    ) {
        let daysLeft = 7 - now.getDate();
        document.getElementById("countdown-text").innerHTML =
            "God jul, önskar dig ett skönt lov";
        document.getElementById("location").innerHTML = `Kom tillbaka om ${daysLeft * -1} dagar`;
        document.getElementById("countdown-number").innerHTML = "";
        document.getElementById("progress-bar").style.display = "none";
        return;
    }

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

        document.getElementById("countdown-text").innerHTML =
            "Inga fler lektioner idag.";
        document.getElementById("location").innerHTML = "";
        document.getElementById("countdown-number").innerHTML = "Hejdå!";
        document.getElementById("progress-bar").style.display = "none";

        return;
    }

    let { name, location, start, end } = nextEvent;
    let countdownElement = document.getElementById("countdown");
    let progressElement = document.getElementById("progress");

    if (today < start) {
        let timeLeft = formatSeconds((start - today) / 1000);

        if (
            currentEventName !== name ||
            currentEventStart !== start ||
            currentEventLocation !== location
        ) {
            currentEventName = name;
            currentEventStart = start;
            currentEventLocation = location;
            currentEventSentNotification = false;

            document.title = `${timeLeft} tills | ${name}`;
            let countdownText = ` ${name} börjar om: `;
            let countdownNumber = `${timeLeft}`;
            let locationText = `Rum: ${location}`;

            document.getElementById("countdown-text").innerHTML = countdownText;
            document.getElementById("countdown-number").innerHTML = countdownNumber;
            document.getElementById("location").innerHTML = locationText;
            document.getElementById("countdown").style.color = "#ffff";
            document.getElementById("progress").style.width = "";
            document.getElementById("progress").style.backgroundColor = "#a3d47a";
            document.getElementById("progress-bar").style.display = "block";

            if (!sentNotifications.includes(name)) {
                new Notification(name, {
                    body: `Börjar om ${timeLeft} i ${location}`
                });

                sentNotifications.push(name);
                currentEventSentNotification = true;
            }

            let progressBarWidth =
                ((start - today) / 1000 / (start - (start - 60000))) *
                100 /
                100 *
                document.getElementById("progress-bar").offsetWidth;
            progressBarWidth = Math.max(0, progressBarWidth);

            progressElement.style.width = `${progressBarWidth}px`;
            return;
        }
    }

    let timeLeft = formatSeconds((end - today) / 1000);

    if (
        currentEventName !== name ||
        currentEventStart !== start ||
        currentEventLocation !== location
    ) {
        currentEventName = name;
        currentEventStart = start;
        currentEventLocation = location;
        currentEventSentNotification = false;

        let countdownText = `Tid kvar för ${name}:`;
        let countdownNumber = `${timeLeft}`;
        let locationText = `Rum: ${location}`;

        document.getElementById("countdown-text").innerHTML = countdownText;
        document.getElementById("countdown-number").innerHTML = countdownNumber;
        document.getElementById("location").innerHTML = locationText;
        document.title = `${timeLeft} kvar | ${name}`;
    }

    if (
        !currentEventSentNotification &&
        today >= start &&
        !sentNotifications.includes(name)
    ) {
        new Notification(name, {
            body: `Pågår nu i ${location}`
        });

        sentNotifications.push(name);
        currentEventSentNotification = true;
    }

    let progressBarWidth =
        (today - start) / 1000 / ((end - start) / 1000) * 100 / 100 *
        document.getElementById("progress-bar").offsetWidth;
    progressBarWidth = Math.max(0, progressBarWidth);

    progressElement.style.width = `${progressBarWidth}px`;
    document.getElementById("progress-bar").style.display = "block";
}

function formatSeconds(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let paddedSeconds = pad(Math.floor(seconds) % 60, 2);

    return hours > 0
        ? `${hours}:${pad(minutes % 60, 2)}:${paddedSeconds}`
        : `${pad(minutes, 2)}:${paddedSeconds}`;
}

function pad(number, length) {
    return ("000000000" + number).substr(-length);
}

function loadEventFile(file) {
    loadJSON(`scheman/${file}`, (data) => {
        console.log("Loaded data:", data);

        if (Array.isArray(data)) {
            events = data.filter((event) => !event.specialDate);
            specialDates = data.filter((event) => event.specialDate);
        } else {
            events = data;
            specialDates = [];
        }

        console.log("Regular events:", events);
        console.log("Special dates:", specialDates);
        updateCountdown();
    });
}

function init() {
    let dropdownContent = document.querySelector(".dropdown-content");
    let dropdownButton = document.querySelector(".dropdown-button");

    eventFiles.forEach(({ name, url }) => {
        let link = document.createElement("a");
        link.innerText = name;
        link.onclick = () => {
            loadEventFile(url);
            closeDropdown();
        };

        link.addEventListener("click", () => {});
        dropdownContent.appendChild(link);
    });

    loadEventFile(eventFiles[0].url);
    dropdownButton.addEventListener("click", toggleDropdown);
}

function toggleDropdown() {
    document.querySelector(".dropdown-content").classList.toggle("show");
}

function closeDropdown() {
    document.querySelector(".dropdown-content").classList.remove("show");
}

window.onload = init;
setInterval(updateCountdown, 50);

const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);

const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
    let audio = new Audio("sounds/click.mp3");
    audio.volume = 0.01;
    audio.play();
    button.classList.add("pop");
    setTimeout(() => {
        button.classList.remove("pop");
    }, 30);
});

let ukTimeZoneOffset = 0;
let userTimeZoneOffset = new Date().getTimezoneOffset() / 60;

function adjustTimezone(date) {
    return new Date(date.getTime() + 60 * (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 1000);
}

function isSpecialDate(date) {
    const dateString = date.toISOString().split("T")[0];
    return specialDates.some((event) => event.date === dateString);
}

function getSpecialDate(date) {
    const dateString = date.toISOString().split("T")[0];
    return specialDates.find((event) => event.date === dateString);
}

let today = new Date();
let isBST = today.getTimezoneOffset() === 60;
