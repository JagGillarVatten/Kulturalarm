function init() {
try {
// Create fullscreen button
const fullscreenButton = document.createElement('button');
fullscreenButton.textContent = 'Fullscreen';
fullscreenButton.style.position = 'fixed';
fullscreenButton.style.bottom = '20px';
fullscreenButton.style.opacity = 0;

// Show on hover
fullscreenButton.addEventListener('mouseover', () => {
fullscreenButton.style.opacity = 1;
});

// Hide on mouseout
fullscreenButton.addEventListener('mouseout', () => {
fullscreenButton.style.opacity = 0;
fullscreenButton.style.transition = 'opacity 0.2s';
});

// Toggle fullscreen on click
fullscreenButton.addEventListener('click', handleFullscreenToggle);

function handleFullscreenToggle() {
try {
if (!document.fullscreenElement) {
document.documentElement.requestFullscreen();
fullscreenButton.textContent = 'Exit Fullscreen';

// Update button text on fullscreen change
document.addEventListener('fullscreenchange', handleFullscreenChange);
} else {
document.exitFullscreen();
fullscreenButton.textContent = 'Fullscreen';
}
} catch (error) {
console.error('Error toggling fullscreen: ' + error.message);
}
}

function handleFullscreenChange() {
fullscreenButton.textContent = document.fullscreenElement ? 'Exit Fullscreen' : 'Fullscreen';
}

// Add button to DOM
document.body.appendChild(fullscreenButton);

// Get dropdown elements
const dropdownContent = document.querySelector('.dropdown-content');
const dropdownButton = document.querySelector('.dropdown-button');

// Get weekdays
const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

// Get current day
const date = new Date();
const day = date.getDay();

// Create day element
const dayElement = document.createElement('h2');
dayElement.textContent = days[day];

// Fade in animation
fadeIn(dayElement, '1s');

// Add to DOM
document.body.appendChild(dayElement);

// Create dots
const dotsContainer = document.createElement('div');

for (let i = 0; i < 7; i++) {
const dot = document.createElement('div');
dot.classList.add('dot');
if (i === day) {
dot.classList.add('active');
}

// Fade in animation
fadeIn(dot, '0.5s');

dotsContainer.appendChild(dot);
}

// Add to DOM
document.body.appendChild(dotsContainer);

function fadeIn(element, duration) {
element.style.animation = `fadeIn ${duration} forwards`;
}

// Add schedule options
eventFiles.forEach(file => {
const anchor = document.createElement('a');
anchor.innerText = file.name;
anchor.onclick = () => {
loadEventFile(file.url, () => {
loadEventFile('specialDates.json', updateCountdown);
});
closeDropdown();
};

anchor.addEventListener('click', () => { });
dropdownContent.appendChild(anchor);
});

// Load default schedule
loadEventFile(eventFiles[0].url);

// Toggle dropdown on button click
dropdownButton.addEventListener('click', toggleDropdown);

// Timezone buttons
document.addEventListener('click', event => {
if (event.target.id === 'plus-button') {
hourOffset++;
updateCountdown();
} else if (event.target.id === 'minus-button') {
hourOffset--;
updateCountdown();
}
});

// Close the dropdown menu when the user clicks outside of it
document.addEventListener('click', event => {
if (!event.target.matches('.dropdown-toggle')) {
const dropdowns = document.getElementsByClassName('dropdown-menu');
for (let i = 0; i < dropdowns.length; i++) {
const openDropdown = dropdowns[i];
if (openDropdown.classList.contains('show')) {
openDropdown.classList.remove('show');
}
}
}
});

// Add a fade-in effect to the dropdown menu
$('.dropdown-menu').on('show.bs.dropdown', function () {
$(this).find('.dropdown-item').addClass('animated fadeInDown');
});
} catch (error) {
console.error('Error initializing: ' + error.message);
}
}
