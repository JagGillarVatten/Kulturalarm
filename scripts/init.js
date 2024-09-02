function init() {
    try {
        const dropdownContent = document.querySelector('.dropdown-content');
        const dropdownButton = document.querySelector('.dropdown-button');
        const days = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
        const date = new Date();
        const day = date.getDay();
        const fragment = document.createDocumentFragment();

        const dayElement = document.createElement('h3');
        dayElement.textContent = days[day];
        dayElement.classList.add('text-center', 'mt-4', 'mb-4');
        fragment.appendChild(dayElement);

        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('d-flex', 'justify-content-center', 'mb-4');
        for (let i = 0; i < 7; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot', 'mx-1');
            if (i === day) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
        fragment.appendChild(dotsContainer);

        document.body.appendChild(fragment);

        const dropdownFragment = document.createDocumentFragment();
        eventFiles.forEach(file => {
            const anchor = document.createElement('a');
            anchor.classList.add('dropdown-item');
            anchor.innerText = file.name;
            anchor.onclick = () => {
                loadEventFile(file.url, () => loadEventFile('specialDates.json', updateCountdown));
                closeDropdown();
            };
            dropdownFragment.appendChild(anchor);
        });
        dropdownContent.appendChild(dropdownFragment);

        loadEventFile(eventFiles[0].url);

        dropdownButton.addEventListener('click', toggleDropdown);

        document.addEventListener('click', event => {
            const hourOffset = event.target.id === 'plus-button' ? 1 : event.target.id === 'minus-button' ? -1 : 0;
            if (hourOffset) updateCountdown();

            if (!event.target.matches('.dropdown-toggle')) {
                document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => dropdown.classList.remove('show'));
            }
        });

    } catch (error) {
        console.error(`Error initializing: ${error.message}`);
    }
}