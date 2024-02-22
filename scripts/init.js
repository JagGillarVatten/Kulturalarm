function init() {

    // Create fullscreen button
    const fullscreenButton = document.createElement('button');
    fullscreenButton.textContent = 'Fullscreen';
    fullscreenButton.style.position = 'fixed';
    fullscreenButton.style.bottom = '20px';
    fullscreenButton.style.right = '20px';
    fullscreenButton.opacity = 0;
  
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
    fullscreenButton.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        fullscreenButton.textContent = 'Exit Fullscreen';
  
        // Hide cursor after 3 seconds inactive
        let timeout;
        document.onmousemove = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            document.body.style.cursor = 'none';
          }, 3000);
          document.body.style.cursor = '';
        }
      } else {
        document.exitFullscreen();
        fullscreenButton.textContent = 'Fullscreen';
      }
    });
  
    // Add button to DOM
    document.body.appendChild(fullscreenButton);
  
    // Get dropdown elements
    const dropdownContent = document.querySelector(".dropdown-content");
    const dropdownButton = document.querySelector(".dropdown-button");
  
    // Get weekdays
    const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  
    // Get current day
    const date = new Date();
    const day = date.getDay();
  
    // Create day element
    const dayElement = document.createElement('div');
    dayElement.textContent = days[day];
  
    // Fade in animation
    dayElement.style.animation = 'fadeIn 1s';
  
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
      dot.style.animation = 'fadeIn 0.5s forwards';
  
      dotsContainer.appendChild(dot);
    }
  
    // Add to DOM
    document.body.appendChild(dotsContainer);
  
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
    document.getElementById('plus-button').addEventListener('click', () => {
      hourOffset++;
      updateCountdown();
    });
  
    document.getElementById('minus-button').addEventListener('click', () => {
      hourOffset--;
      updateCountdown();
    });
  
  }