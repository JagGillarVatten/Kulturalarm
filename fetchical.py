import importlib
import subprocess
import sys

def install_missing_modules(modules):
    for module in modules:
        try:
            importlib.import_module(module)
        except ImportError:
            print(f"Installing missing module: {module}")
            subprocess.check_call([sys.executable, "-m", "pip", "install", module])

required_modules = ['requests', 'icalendar']
install_missing_modules(required_modules)

import requests
import icalendar
from datetime import datetime, timedelta
import json

def fetch_ical(url):
    response = requests.get(url)
    return response.text

def parse_ical(ical_data):
    calendar = icalendar.Calendar.from_ical(ical_data)
    events = []

    for component in calendar.walk():
        if component.name == "VEVENT":
            start = component.get('dtstart').dt
            end = component.get('dtend').dt
            summary = str(component.get('summary'))
            location = str(component.get('location', ''))

            event = {
                "name": summary,
                "englishName": get_english_name(summary),
                "startDay": start.weekday() + 1,
                "startTime": start.strftime("%H:%M"),
                "endTime": end.strftime("%H:%M"),
                "location": location
            }
            events.append(event)

    return events

def get_english_name(name):
    # This is a simple mapping. You might want to expand this or use a more sophisticated translation method.
    translations = {
        "Mentorsgrupp": "Mentor Group",
        "Lunch": "Lunch",
        "Svenska": "Swedish",
        "Ensemble med körsång": "Ensemble with Choir Singing",
        "Naturkunskap": "Natural Science",
        "Musikproduktion": "Music Production",
        "Gehörs- och musiklära": "Ear Training and Music Theory",
        "Medieproduktion": "Media Production",
        "Historia": "History",
        "Engelska": "English",
        "Estetisk kommunikation": "Aesthetic Communication",
        "Stuga": "Study Hall"
    }
    return translations.get(name, name)

def main():
    url = "https://cloud.timeedit.net/medborgarskolan/web/kulturama/ri66m5oQYy00QZQZoZQQQfpQZo8o12cjkZZ8mymyZ45xZZQlQubooZbqQ0fZbcmcxfb8ZQQZfQQ1b4Qfe0nc6qZu.ics"
    ical_data = fetch_ical(url)
    events = parse_ical(ical_data)

    with open('scheman/schedule.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    main()
