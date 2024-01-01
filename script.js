let events = [],
    sentNotifications = [],
    specialDates = [];
const eventFiles = [{
    name: "MP1",
    url: "MP1.json"
}, {
    name: "AM1",
    url: "AM1.json"
}, {
    name: "MP2",
    url: "MP2.json"
}, {
    name: "AM2",
    url: "AM2.json"
}];
let currentEventName = "",
    currentEventStart = null,
    currentEventLocation = "",
    currentEventSentNotification = !1,
    hourOffset = 0;

    function loadJSON(url, callback) {
        // Check if the data is already cached
        const cachedData = localStorage.getItem(url);
        
        if (cachedData) {
            // If cached, parse and use the cached data
            callback(JSON.parse(cachedData));
            return;
        }
    
        let xhr = new XMLHttpRequest();
        xhr.overrideMimeType("application/json");
        xhr.open("GET", url, true);
    
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    // Cache the data in localStorage
                    localStorage.setItem(url, xhr.responseText);
    
                    // Parse and use the data
                    callback(JSON.parse(xhr.responseText));
                } else {
                    console.error(`Error loading JSON from ${url}. Status: ${xhr.status}`);
                }
            }
        };
    
        xhr.send(null);
    }
    

function getTodaysEvents() {
    let e = (new Date).getDay();
    return events.filter((t => t.startDay === e))
}

function getNextEvent() {
    let e = new Date,
        t = new Date(e.getFullYear(), e.getMonth(), e.getDate()),
        n = getTodaysEvents();
    for (let o of n) {
        let n = new Date(`${t.toDateString()} ${o.startTime}`),
            r = new Date(`${t.toDateString()} ${o.endTime}`);
        if (e >= n && e < r) return {
            name: o.name,
            start: n,
            location: o.location,
            end: r
        };
        if (e < n) return {
            name: o.name,
            start: n,
            end: r,
            location: o.location
        }
    }
    return null
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

    // Check if it's a special date range
    if (
        now.getDate() > 21 && now.getMonth() === 11 || // After December 21st
        (now.getDate() <= 10 && now.getMonth() === 11) // Until January 10th
    ) {
        let daysLeft = 10 - now.getDate();
        document.getElementById("countdown-text").innerHTML =
            "God jul, önskar dig ett skönt lov";
        document.getElementById("location").innerHTML = `Kom tillbaka om ${daysLeft*-1} dagar`;
        document.getElementById("countdown-number").innerHTML = "";
        document.getElementById("progress-bar").style.display = "none";
        return;
    }

    // Continue with regular event logic
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
    let {
        name: n,
        location: o,
        start: r,
        end: a
    } = e, i = (document.getElementById("countdown"), document.getElementById("progress"));
    if (t < r) {
        let e = formatSeconds((r - t) / 1e3);
        if (currentEventName !== n || currentEventStart !== r || currentEventLocation !== o) {
            currentEventName = n, currentEventStart = r, currentEventLocation = o, currentEventSentNotification = !1, document.title = `${e} tills | ${n}`;
            let a = ` ${n} börjar om: `,
                l = `${e}`;
            document.getElementById("countdown-text").innerHTML = a, document.getElementById("countdown-number").innerHTML = l, document.getElementById("location").innerHTML = "Rum: " + currentEventLocation, document.getElementById("countdown").style.color = "#ffff", document.getElementById("progress").style.width = "", document.getElementById("progress").style.backgroundColor = "#a3d47a", document.getElementById("progress-bar").style.display = "block", sentNotifications.includes(n) || (new Notification(n, {
                body: `Börjar om ${e} i ${o}`
            }), sentNotifications.push(n), currentEventSentNotification = !0);
            let c = (r - t) / 1e3 / (r - (r - 6e4)) * 100 / 100 * document.getElementById("progress-bar").offsetWidth;
            return c = Math.max(0, c), void(i.style.width = `${c}px`)
        }
    }
    let l = formatSeconds((a - t) / 1e3);
    if (currentEventName !== n || currentEventStart !== r || currentEventLocation !== o) {
        currentEventName = n, currentEventStart = r, currentEventLocation = o, currentEventSentNotification = !1;
        let e = `Tid kvar för ${n}:`,
            t = `${l}`,
            a = `Rum: ${o}`;
        document.getElementById("countdown-text").innerHTML = e, document.getElementById("countdown-number").innerHTML = t, document.getElementById("location").innerHTML = a, document.title = `${l} kvar | ${n}`
    }!currentEventSentNotification && t >= r && !sentNotifications.includes(n) && (new Notification(n, {
        body: `Pågår nu i ${o}`
    }), sentNotifications.push(n), currentEventSentNotification = !0);
    let c = (t - r) / 1e3 / ((a - r) / 1e3) * 100 / 100 * document.getElementById("progress-bar").offsetWidth;
    c = Math.max(0, c), i.style.width = `${c}px`, document.getElementById("progress-bar").style.display = "block"
}

function formatSeconds(e) {
    let t = Math.floor(e / 60),
        n = Math.floor(t / 60),
        o = pad(Math.floor(e) % 60, 2);
    return n > 0 ? `${n}:${pad(t%60,2)}:${o}` : `${pad(t,2)}:${o}`
}

function pad(e, t) {
    return ("000000000" + e).substr(-t)
}

function loadEventFile(e) {
    loadJSON(`scheman/${e}`, (e => {
        console.log("Loaded data:", e), Array.isArray(e) ? (events = e.filter((e => !e.specialDate)), specialDates = e.filter((e => e.specialDate))) : (events = e, specialDates = []), console.log("Regular events:", events), console.log("Special dates:", specialDates), updateCountdown()
    }))
}

function init() {
    let e = document.querySelector(".dropdown-content"),
        t = document.querySelector(".dropdown-button");
    eventFiles.forEach((({
        name: t,
        url: n
    }) => {
        let o = document.createElement("a");
        o.innerText = t, o.onclick = () => {
            loadEventFile(n, (() => {
                loadEventFile("specialDates.json", (() => {
                    updateCountdown()
                }))
            })), closeDropdown()
        }, o.addEventListener("click", (() => {})), e.appendChild(o)
    })), loadEventFile(eventFiles[0].url), t.addEventListener("click", (() => {
        toggleDropdown()
    }))
}

function toggleDropdown() {
    document.querySelector(".dropdown-content").classList.toggle("show")
}

function closeDropdown() {
    document.querySelector(".dropdown-content").classList.remove("show")
}
window.onload = init, setInterval(updateCountdown, 50);
const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", (() => {
    let e = new Audio("sounds/click.mp3");
    e.volume = .01, e.play(), button.classList.add("pop"), setTimeout((() => {
        button.classList.remove("pop")
    }), 30)
}));
let ukTimeZoneOffset = 0,
    userTimeZoneOffset = (new Date).getTimezoneOffset() / 60;

function adjustTimezone(e) {
    return new Date(e.getTime() + 60 * (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 1e3)
}

function isSpecialDate(e) {
    const t = e.toISOString().split("T")[0];
    return specialDates.some((e => e.date === t))
}

function getSpecialDate(e) {
    const t = e.toISOString().split("T")[0];
    return specialDates.find((e => e.date === t))
}
let today = new Date,
    isBST = 60 === today.getTimezoneOffset();

