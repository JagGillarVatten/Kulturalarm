// Toggle dropdown
function toggleDropdown() {
    let dropdownContent = document.querySelector(".dropdown-content");
    dropdownContent.classList.toggle("show");

    // Add fade in animation 
    dropdownContent.style.animation = "fadeIn 0.5s";

    // Add blur effect to the rest of the site
    document.body.style.filter = "blur(5px)";
}

// Close dropdown
function closeDropdown() {
    let dropdownContent = document.querySelector(".dropdown-content");
    dropdownContent.classList.remove("show");

    // Add fade out animation
    dropdownContent.style.animation = "fadeOut 0.5s";

    // Remove blur effect from the rest of the site
    document.body.style.filter = "none";
}

// Adjust timezone
function adjustTimezone(date) {
    return new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + hourOffset) * 60 * 60 * 1000);
}

// Check if special date
function isSpecialDate(date) {
    return specialDates.some(entry => entry.date === date.toISOString().split("T")[0]);
}

// Get special date
function getSpecialDate(date) {
    return specialDates.find(entry => entry.date === date.toISOString().split("T")[0]);
}

// Check if snowfall period
function isSnowfallPeriod() {
    let currentDate = new Date();
    return currentDate >= new Date(currentDate.getFullYear(), 10, 23)
        && currentDate <= new Date(currentDate.getFullYear(), 11, 31);
}

// Create snowflake
function createSnowflake() {
    let snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    snowflake.style.left = `${Math.random() * window.innerWidth}px`;
    document.body.appendChild(snowflake);

    snowflake.addEventListener("animationend", () => {
        document.body.removeChild(snowflake);
    });
}

// Create lens flare
function createLensFlare() {
    let lensFlare = document.createElement("div");
    lensFlare.className = "lens-flare";
    lensFlare.style.left = `${Math.random() * window.innerWidth}px`;
    lensFlare.style.top = `${Math.random() * window.innerHeight}px`;
    lensFlare.style.opacity = Math.random() * 0.5 + 0.2;
    document.body.appendChild(lensFlare);

    setTimeout(() => {
        document.body.removeChild(lensFlare);
    }, 5000);
}

// Create rain drop
function createRainDrop() {
    let rainDrop = document.createElement("div");
    rainDrop.className = "rain-drop";
    rainDrop.style.left = `${Math.random() * window.innerWidth}px`;
    rainDrop.style.top = `${Math.random() * window.innerHeight}px`;
    document.body.appendChild(rainDrop);

    setTimeout(() => {
        document.body.removeChild(rainDrop);
    }, 5000);
}

// Function to update the background color every second
function updateBackground() {
    let body = document.body;

    let currentHour = new Date().getHours();
    let currentMinute = new Date().getMinutes();

    if (currentHour >= 6 && currentHour < 12) {
        body.classList.add("morning");
    } else if (currentHour >= 12 && currentHour < 18) {
        body.classList.add("afternoon");
    } else if (currentHour >= 18 && currentHour < 22) {
        body.classList.add("evening");
    } else {
        body.classList.add("night");
    }

    // Add lens flare and rain drop if not winter
    if (!isSnowfallPeriod()) {
        if (Math.random() < 0.1) {
            createLensFlare();
        }
        if (Math.random() < 0.002) {
            createRainDrop();
        }
    }
}

// Function to update the countdown every 50 milliseconds
setInterval(updateCountdown, 50);

// Function to update the background color every second
setInterval(updateBackground, 1000);
// Define CSS for raindrops and lens flares
const style = document.createElement('style');
style.innerHTML = `
  .rain-drop {
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: rgba(0, 0, 255, 0.5);
    border-radius: 50%;
    animation: rain 5s linear infinite;
  }

  @keyframes rain {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100vh);
    }
  }

  .lens-flare {
    position: absolute;
    width: 50px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.5);
    animation: flare 5s linear infinite;
  }

  @keyframes flare {
    0% {
      transform: scale(0.5);
      opacity: 0.2;
    }
    50% {
      transform: scale(1);
      opacity: 0.5;
    }
    100% {
      transform: scale(0.5);
      opacity: 0.2;
    }
  }
`;
document.head.appendChild(style);
