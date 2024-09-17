// Toggle dropdown with advanced animations and sound effects
const toggleDropdown = () => {
    const dropdownContent = document.querySelector(".dropdown-content");
    const animationDuration = 0.5;
    const isShowing = dropdownContent.classList.toggle("show");
    dropdownContent.style.animation = `fade${isShowing ? 'In' : 'Out'} ${animationDuration}s`;

    // Play sound effect
    const audio = new Audio(isShowing ? 'open.mp3' : 'close.mp3');
    audio.play();

    // Change button icon
    const dropdownButton = document.querySelector(".dropdown-button i");
    dropdownButton.className = isShowing ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
};

// Adjust timezone
const adjustTimezone = date => new Date(date.getTime() + (userTimeZoneOffset + ukTimeZoneOffset + (hourOffset || 0)) * 3600000);

// Check if special date
const isSpecialDate = date => specialDates.some(entry => entry.date === date.toISOString().split("T")[0]);

// Get special date
const getSpecialDate = date => specialDates.find(entry => entry.date === date.toISOString().split("T")[0]);

// Check if snowfall period
const isSnowfallPeriod = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 10, 23);
    const endDate = new Date(now.getFullYear(), 11, 31);
    return now >= startDate && now <= endDate;
};

// Create snowflake
const createSnowflake = () => {
    const snowflake = document.createElement("div");
    Object.assign(snowflake.style, {
        left: `${Math.random() * window.innerWidth}px`,
        position: "fixed",
        top: "-10px",
        fontSize: "20px",
        color: "white",
        opacity: "0.7",
        userSelect: "none",
        zIndex: "1000"
    });
    snowflake.className = "snowflake";
    snowflake.innerHTML = "❄";
    document.body.appendChild(snowflake);

    const animationDuration = 5 + Math.random() * 5;
    const horizontalMovement = -20 + Math.random() * 40;

    snowflake.animate([
        { transform: 'translate(0, 0) rotate(0deg)' },
        { transform: `translate(${horizontalMovement}px, ${window.innerHeight}px) rotate(360deg)` }
    ], {
        duration: animationDuration * 1000,
        easing: 'linear'
    }).onfinish = () => document.body.removeChild(snowflake);
};

// Start snowfall
const startSnowfall = () => {
    if (isSnowfallPeriod()) {
        createSnowflake();
        setTimeout(startSnowfall, 200);
    }
};

// Function to update the background color smoothly
const updateBackground = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    let startTime, endTime, startColor, endColor;
    
    if (currentHour >= 6 && currentHour < 12) {
        startTime = 6;
        endTime = 12;
        startColor = getComputedStyle(document.documentElement).getPropertyValue('--morning-bg-color').trim();
        endColor = getComputedStyle(document.documentElement).getPropertyValue('--afternoon-bg-color').trim();
    } else if (currentHour >= 12 && currentHour < 18) {
        startTime = 12;
        endTime = 18;
        startColor = getComputedStyle(document.documentElement).getPropertyValue('--afternoon-bg-color').trim();
        endColor = getComputedStyle(document.documentElement).getPropertyValue('--evening-bg-color').trim();
    } else if (currentHour >= 18 && currentHour < 20) {
        startTime = 18;
        endTime = 20;
        startColor = getComputedStyle(document.documentElement).getPropertyValue('--evening-bg-color').trim();
        endColor = getComputedStyle(document.documentElement).getPropertyValue('--night-bg-color').trim();
    } else {
        startTime = 20;
        endTime = 6;
        startColor = getComputedStyle(document.documentElement).getPropertyValue('--night-bg-color').trim();
        endColor = getComputedStyle(document.documentElement).getPropertyValue('--morning-bg-color').trim();
    }

    const totalSeconds = (endTime - startTime) * 3600;
    const currentSeconds = ((currentHour - startTime) * 3600) + (currentMinute * 60) + currentSecond;
    const progress = currentSeconds / totalSeconds;

    const interpolatedColor = interpolateColor(startColor, endColor, progress);
    document.body.style.backgroundColor = interpolatedColor;

    requestAnimationFrame(updateBackground);
};

// Helper function to interpolate between two colors
const interpolateColor = (color1, color2, factor) => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Start the background update
updateBackground();
// Event listeners and intervals
window.addEventListener('load', startSnowfall);
setInterval(updateBackground, 1000);
setInterval(updateCountdown, 50);

// Parallax scrolling
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    document.body.style.backgroundPosition = `center ${scrollY * 0.3}px`;
    ['name', 'countdown', 'progress-bar'].forEach(className => {
        document.querySelector(`.${className}`).style.transform = `translateY(${scrollY * 0.2}px)`;
    });
});

// Create confetti with advanced animations
function createConfetti() {
  const confettiCount = 100;
  const colors = ['#ff0000', '#00ff00', '#0000ff']; // Red, Green, Blue
  for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      document.body.appendChild(confetti);

      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight;
      const angle = Math.random() * 360;
      const scale = Math.random() * 0.5 + 0.5;
      const speed = Math.random() * 5 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const zIndex = Math.floor(Math.random() * 100);

      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      confetti.style.transform = `rotate(${angle}deg) scale(${scale})`;
      confetti.style.backgroundColor = color;
      confetti.style.zIndex = zIndex;
      confetti.style.boxShadow = `0 0 5px ${color}`;

      const animation = confetti.animate([
          { transform: `translate3d(0, 0, ${zIndex}px) rotate(${angle}deg) scale(${scale})`, opacity: 1 },
          { transform: `translate3d(${(Math.random() - 0.5) * 200}px, ${-window.innerHeight - 100}px, ${zIndex}px) rotate(${angle + 720}deg) scale(${scale})`, opacity: 0 }
      ], {
          duration: speed * 1000,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
      });

      animation.onfinish = () => document.body.removeChild(confetti);
  }
}

function triggerConfettiBurst() {
  if (Math.random() < 0.001) { // 5% chance of triggering
      createConfetti();
  }
}

setInterval(triggerConfettiBurst, 1000); // Check every second