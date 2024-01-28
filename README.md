# Kulturalarm
![Kulturalarm Logo](https://file.garden/ZWc5R9szsWLb2ccu/favicon3ae.png))

Kulturalarm är en webbapplikation utvecklad för elever på Kulturama Sjöstaden för att enkelt hålla koll på sina lektioner och tider. Applikationen inkluderar en nedräkningstimer som visar hur mycket tid som har gått och hur mycket tid som återstår för varje lektion.

## Funktioner

- Lättanvänd
- Nedräkningstimer för lektioner 

## Bidra

Jag är elev på Kulturama Sjöstaden, inte anställd av skolan. Detta är ett personligt projekt som inte officiellt är kopplat till Kulturama Gymnasium. 

Om du vill hjälpa till att förbättra Kulturalarm och bidra med fler scheman är du välkommen att göra det! Så här går du tillväga:

1. Skapa en JSON-fil för ett schema du vill dela med dig av. Följ formatet som beskrivs nedan.
2. Lägg till på GitHub eller skicka mig filen på något annat sätt.
   Jag kommer att granska och inkludera nya scheman om de passar för appen.
   Att dela hjälper till att göra Kulturalarm mer användbart för andra elever på Kulturama Sjöstaden.
   
Tack för ditt intresse att bidra! Tillsammans kan vi göra appen ännu bättre anpassad till vår gemenskaps behov.

## Kod

Kulturalarm använder:

- CSS
- HTML
- JavaScript

## Anpassning

För att anpassa Kulturalarm med dina egna scheman:

1. Skapa en JSON-fil för varje schema i mappen "Scheman". Döp filerna som `KLASSNAMN.json`.
2. Använd detta format:

     ```json
     [
       {  
         "name":"Engelska",
         "startDay":1, 
         "startTime":"09:20",
         "endTime":"10:20",
         "location":"Rum"
       },
       {
         "name":"Biologi",  
         "startDay":1,
         "startTime":"10:30",
         "endTime":"11:10",
         "location":"Rum"
       }
     ]
     ```
     
     - `startDay` 1=Måndag, 5=Fredag
     - `location` är klassrum
     - `startTime` och `endTime` är start- och sluttid för lektionen
     
3. Ersätt befintliga JSON-filer i root med dina anpassade JSON-filer.
4. Lägg till JSON-data i arrayen i script.js. Detta spårar tillgängliga alternativ.

## Att göra

- Lägg till alla Kulturamas kurs-scheman
- Lägg till möjlighet att åsidosätta vanliga scheman med unika datum
- Förbättra visuell design - unika ikoner för ämnen, dekorationer, etc.

