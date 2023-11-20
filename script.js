/**
 * Global variables to store loaded event data and sent notifications.
 * loadJSON loads JSON data from a URL.
 * getTodaysEvents filters events to only those happening today.
 * getNextEvent gets the next upcoming event.
 * updateCountdown handles displaying the countdown UI.
 * formatSeconds formats a seconds count into HH:MM:SS format.
 * loadEventFile loads event data for a schedule.
 * init initializes the app.
 */
let events = [],
  sentNotifications = [];
const eventFiles = [
  { name: "MP1", url: "MP1.json" },
  { name: "AM1", url: "AM1.json" },
  { name: "MP2", url: "MP2.json" },
  { name: "AM2", url: "AM2.json" },
];
function loadJSON(e, t) {
  let n = new XMLHttpRequest();
  n.overrideMimeType("application/json"),
    n.open("GET", e, !0),
    (n.onreadystatechange = function () {
      4 === n.readyState && 200 === n.status && t(JSON.parse(n.responseText));
    }),
    n.send(null);
}
function getTodaysEvents() {
  let e = new Date(),
    t = e.getDay();
  return events.filter((e) => e.startDay === t);
}
function getNextEvent() {
  let e = new Date(),
    t = new Date(e.getFullYear(), e.getMonth(), e.getDate()),
    n = getTodaysEvents();
  for (let o of n) {
    let r = new Date(`${t.toDateString()} ${o.startTime}`),
      l = new Date(`${t.toDateString()} ${o.endTime}`);
    if (e >= r && e < l)
      return { name: o.name, start: r, location: o.location, end: l };
    if (e < r) return { name: o.name, start: r, end: l, location: o.location };
  }
  return null;
}
let currentEventName = "",
  currentEventStart = null,
  currentEventLocation = "",
  currentEventSentNotification = !1;
function updateCountdown() {
  if (0 === events.length) {
    setTimeout(updateCountdown, 1e3);
    return;
  }
  let e = new Date(),
    t = getNextEvent();
  if (null === t) {
    "" !== currentEventName &&
      ((currentEventName = ""),
      (currentEventStart = null),
      (currentEventLocation = ""),
      (currentEventSentNotification = !1),
      (document.getElementById("countdown-text").innerHTML =
        "Inga fler lektioner idag."),
        (document.getElementById("location").innerHTML = ""),
      (document.getElementById("countdown-number").innerHTML = "Hejdå!"),
      (document.getElementById("progress-bar").style.display = "none"));
    return;
  }
  let { name: n, location: o, start: r, end: l } = t;
  if (e < r) {
    let i = formatSeconds((r - e) / 1e3);
    if (
      currentEventName !== n ||
      currentEventStart !== r ||
      currentEventLocation !== o
    ) {
      (currentEventName = n),
        (currentEventStart = r),
        (currentEventLocation = o),
        (currentEventSentNotification = !1),
        (document.title = `${i} tills | ${n}`);
      let a = ` ${n} börjar om: `,
        c = `${i} `;
      (document.getElementById("countdown-text").innerHTML = a),
        (document.getElementById("countdown-number").innerHTML = c),
        (document.getElementById("countdown").style.color = "#ffff"),
        (document.getElementById("progress").style.width = "0"),
        (document.getElementById("location").innerHTML =
          "Rum: " + currentEventLocation),
        (document.getElementById("progress").style.backgroundColor = "#a3d47a"),
        (document.getElementById("progress-bar").style.display = "block"),
        sentNotifications.includes(n) ||
          (new Notification(n, { body: `Börjar om ${i} i ${o}` }),
          sentNotifications.push(n),
          (currentEventSentNotification = !0));
    }
    return;
  }
  let u = formatSeconds((l - e) / 1e3);
  if (
    currentEventName !== n ||
    currentEventStart !== r ||
    currentEventLocation !== o
  ) {
    (currentEventName = n),
      (currentEventStart = r),
      (currentEventLocation = o),
      (currentEventSentNotification = !1);
    let d = `Tid kvar för ${n}:`,
      s = `${u}`,
      m = `Rum: ${o}`;
    (document.getElementById("countdown-text").innerHTML = d),
      (document.getElementById("countdown-number").innerHTML = s),
      (document.getElementById("location").innerHTML = m),
      (document.title = `${u} kvar | ${n}`);
  }
  currentEventSentNotification ||
    !(e >= r) ||
    sentNotifications.includes(n) ||
    (new Notification(n, { body: `Pågår nu i ${o}` }),
    sentNotifications.push(n),
    (currentEventSentNotification = !0));
  let E =
    ((((e - r) / 1e3 / ((l - r) / 1e3)) * 100) / 100) *
    document.getElementById("progress-bar").offsetWidth;
  (document.getElementById("progress").style.width = `${E}px`),
    (document.getElementById("progress-bar").style.display = "block");
}
function formatSeconds(e) {
  let t = Math.floor(e / 60),
    n = Math.floor(t / 60),
    o = pad(Math.floor(e) % 60, 2);
  return n > 0 ? `${n}:${pad(t % 60, 2)}:${o}` : `${pad(t, 2)}:${o}`;
}
function pad(e, t) {
  return ("000000000" + e).substr(-t);
}
function init() {
  let e = document.querySelector(".dropdown-content");
  document.querySelector(".dropdown-button"),
    eventFiles.forEach(({ name: t, url: n }) => {
      let o = document.createElement("a");
      (o.innerText = t),
        (o.onclick = () => {
          loadEventFile(n);
        }),
        e.appendChild(o);
    }),
    loadEventFile(eventFiles[0].url);
}
function getNextEvent() {
  let e = new Date(),
    t = new Date(e.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })),
    n = t.getDay(),
    o = events.filter((e) => e.startDay === n);
  for (let r of o) {
    let l = new Date(`${t.toDateString()} ${r.startTime}`),
      i = new Date(`${t.toDateString()} ${r.endTime}`);
    if (e >= l && e < i)
      return { name: r.name, start: l, location: r.location, end: i };
    if (e < l) return { name: r.name, start: l, end: i, location: r.location };
  }
  return null;
}
function loadEventFile(e) {
  loadJSON(`scheman/${e}`, (e) => {
    (events = e), updateCountdown();
  });
  let t = document.querySelector(".dropdown-button");
  t.addEventListener("click", () => {
    let e = new Audio("click.mp3");
    e.play();
  });
}
function init() {
  let e = document.querySelector(".dropdown-content");
  document.querySelector(".dropdown-button"),
    eventFiles.forEach(({ name: t, url: n }) => {
      let o = document.createElement("a");
      (o.innerText = t),
        (o.onclick = () => {
          loadEventFile(n);
        }),
        o.addEventListener("click", () => {
          let e = new Audio("sounds/click.mp3");
          e.play();
        }),
        e.appendChild(o);
    }),
    loadEventFile(eventFiles[0].url);
}
(window.onload = init), setInterval(updateCountdown, 100);
const soundFiles = ["bird.mp3", "bird.mp3", "sound3.mp3"];
function playRandomSound() {
  let e = soundFiles[Math.floor(Math.random() * soundFiles.length)],
    t = new Audio(`sounds/${e}`);
  (t.volume = 100.1), t.play();
}
const title = document.querySelector("title");
title.addEventListener("click", playRandomSound);
const button = document.querySelector(".dropdown-button");
button.addEventListener("click", () => {
  let e = new Audio("sounds/click.mp3");
  e.play(),
    button.classList.add("pop"),
    setTimeout(() => {
      button.classList.remove("pop");
    }, 500);
});
