function init() {
    try {
        const fullscreenButton = document.createElement('button');
        fullscreenButton.textContent = 'Fullscreen';
        fullscreenButton.classList.add('btn', 'btn-primary', 'btn-sm');
        fullscreenButton.style.cssText = 'position:fixed;bottom:20px;right:20px;';

        fullscreenButton.addEventListener('click', () => {
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                    fullscreenButton.textContent = 'Exit Fullscreen';
                } else {
                    document.exitFullscreen();
                    fullscreenButton.textContent = 'Fullscreen';
                }
            } catch (error) {
                console.error(`Error toggling fullscreen: ${error.message}`);
            }
        });

        document.body.appendChild(fullscreenButton);

        const dropdownContent = document.querySelector('.dropdown-content');
        const dropdownButton = document.querySelector('.dropdown-button');

        const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];

        const date = new Date();
        const day = date.getDay();

        const dayElement = document.createElement('h3');
        dayElement.textContent = days[day];
        dayElement.classList.add('text-center', 'mt-4', 'mb-4');

        document.body.appendChild(dayElement);

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('d-flex', 'justify-content-center', 'mb-4');

        for (let i = 0; i < 7; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot', 'mx-1');
            if (i === day) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }

        document.body.appendChild(dotsContainer);

        eventFiles.forEach(file => {
            const anchor = document.createElement('a');
            anchor.classList.add('dropdown-item');
            anchor.innerText = file.name;
            anchor.onclick = () => {
                loadEventFile(file.url, () => loadEventFile('specialDates.json', updateCountdown));
                closeDropdown();
            };
            dropdownContent.appendChild(anchor);
        });

        loadEventFile(eventFiles[0].url);

        dropdownButton.addEventListener('click', toggleDropdown);

        document.addEventListener('click', event => {
            let hourOffset = 0;
            if (event.target.id === 'plus-button') hourOffset++;
            else if (event.target.id === 'minus-button') hourOffset--;
            if (hourOffset) updateCountdown();
        });

        document.addEventListener('click', event => {
            if (!event.target.matches('.dropdown-toggle')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => dropdown.classList.remove('show'));
            }
        });

    } catch (error) {
        console.error(`Error initializing: ${error.message}`);
    }
}
