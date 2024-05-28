import icalendar
from icalendar import Calendar
from datetime import datetime, date
import requests

def parse_ics_file(ics_url):
    response = requests.get(ics_url)
    cal = Calendar.from_ical(response.content)

    class_schedule = []
    today = date.today()
    for event in cal.walk('VEVENT'):
        event_date = event.get('DTSTART').dt.date()
        if event_date == today:
            class_info = {
                'name': event.get('SUMMARY'),
                'englishName': get_english_name(event.get('SUMMARY')),
                'startDay': event.get('DTSTART').dt.weekday() + 1,
                'startTime': event.get('DTSTART').dt.strftime('%H:%M'),
                'endTime': event.get('DTEND').dt.strftime('%H:%M'),
                'location': event.get('LOCATION', ''),
            }
            class_schedule.append(class_info)

    return class_schedule

def get_english_name(name):
    english_names = {
        'Programmering': 'Programming',
        'Matematik': 'Mathematics',
        'Ensemble med körsång': 'Ensemble with Choir Singing',
        'Historia': 'History',
        'Svenska': 'Swedish',
        'Engelska': 'English',
        'Musikproduktion': 'Music Production',
        'Media Produktion': 'Media Production',
    }
    for swedish_name, english_name in english_names.items():
        if swedish_name in name:
            return english_name
    return ''

if __name__ == '__main__':
    ics_url = 'https://cloud.timeedit.net/medborgarskolan/web/kulturama/ri6655eyYn00b4QZ88Q6ZuQQZZ8Q1209.ics'
    today_schedule = parse_ics_file(ics_url)
    print(today_schedule)
