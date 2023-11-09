# Kulturalarm

Kulturalarm är en webbapplikation utvecklad för elever på Kulturama Sjöstaden för att enkelt hålla koll på sina lektioner och tider. Applikationen inkluderar en nedräknings timer som visar hur mycket tid som har gått och hur mycket tid som återstår för varje lektion.

## Funktioner

- Enkel att använda
- Nedräknings timer för lektioner

## Bidra till Kulturalarm

Jag som har utvecklat Kulturalarm är en elev på Kulturama Sjöstaden och inte anställd av Kulturama Gymnasium. Applikationen är ett personligt projekt och är inte officiellt kopplat till eller representativt för Kulturama Gymnasium.

Om du vill hjälpa till att förbättra Kulturalarm och bidra med fler scheman, är du mer än välkommen att göra det! Här är hur du kan bidra:

1. Skapa en JSON-fil för ett specifikt klasschema som du vill dela med andra användare. Följ formatet som beskrivs  senare  i dokumentet.
2. Gör en commit på github eller skicka filen till mig på annat sätt
    Jag kommer att granska och inkludera det nya klasschemat i Kulturalarm om det uppfyller kraven och är lämpligt för applikationen.
    Genom att dela ditt klasschema hjälper du till att göra Kulturalarm mer användbart och användarvänligt för andra elever på Kulturama Sjöstaden.

Tack för ditt intresse för att bidra till Kulturalarm! Tillsammans kan vi göra applikationen ännu bättre och mer anpassad efter gemenskapens behov.

## Kod

Kulturalarm är utvecklad med följande programmeringsspråk:

- CSS
- HTML
- JavaScript

## Anpassning

För att anpassa Kulturalarm för dina egna scheman, följ dessa steg:

1. Skapa en JSON-fil för varje klasschema du vill visa i mappen "Scheman". Filen ska heta `KLASSNAMN.json`, där KLASSNAMN är namnet på klassen.
2. JSON-filen ska ha följande format:

     ```json
     [
         {
             "name": "Engelska",
             "startDay": 1,
             "startTime": "09:20",
             "endTime": "10:20",
             "location": "Rum"
         },
         {
             "name": "Biologi",
             "startDay": 1,
             "startTime": "10:30",
             "endTime": "11:10",
             "location": "Rum"
         },
        
     ```

     - `startDay` är en variabel där 1 står för måndag och 5 är fredag.
     - `location` är rummet/klassrummet.
     - `startTime` och `endTime` är start- och sluttid för lektionen.

3. Ersätt de befintliga JSON-filerna i rotmappen med dina anpassade JSON-filer.
4. Gå till script.js och lägg till JSON-data till arrayen. Denna array håller koll på vilka alternativ som är tillgängliga att välja från:
## To-do
- Lägg till alla kulturama kursers scheman.
- Lägg till en funktion som gör att man kan göra att specifika datum har undantag och har ett unikt schema som överskrider det regelbunda schemat.
- Lägg till ett mer interaktivt och intressant utseende med unika ikoner för olika ämnen och andra dekorationer för att göra appen mer attraktiv.
