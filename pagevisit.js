// Check if the page was loaded for the first time in this session
let isNewSession = sessionStorage.getItem("isNewSession") === null;

if (isNewSession) {
  // Get the accurate visit count from local storage
  let visitCount = parseInt(localStorage.getItem("visitCount")) || 0;

  // Increment the visit count
  visitCount++;

  // Save the accurate visit count to local storage
  localStorage.setItem("visitCount", visitCount);

  // Display the accurate visit count on the page
  document.getElementById("visit-count").textContent = visitCount;

  // Log the accurate current visit count
  console.log(`Current accurate visit count: ${visitCount}`);

  // Set session flag to prevent incrementing on page refresh
  sessionStorage.setItem("isNewSession", false);

} else {

  // Get the accurate visit count from local storage
  let visitCount = parseInt(localStorage.getItem("visitCount")) || 0;

  // Display the accurate visit count on page
  document.getElementById("visit-count").textContent = visitCount;

  // Log the accurate current visit count
  console.log(`Current accurate visit count: ${visitCount}`);

}

// Get client IP address
const ipRequest = new XMLHttpRequest();

ipRequest.open("GET", "https://api.ipify.org", true);
ipRequest.send();

// Fade out visit count after 5 seconds
setTimeout(function () {

  let fadeEffect = setInterval(function () {

    if (!document.getElementById("page-visit-count").style.opacity) {
      document.getElementById("page-visit-count").style.opacity = 1;
    }

    if (document.getElementById("page-visit-count").style.opacity > 0) {
      document.getElementById("page-visit-count").style.opacity -= 0.1;
    } else {
      clearInterval(fadeEffect);
      document.getElementById("page-visit-count").style.display = "none";
    }

  }, 50);

}, 5000);
