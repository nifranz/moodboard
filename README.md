# AKCORE APP

This gitup-repository contains the source code of the akcore frontend app and backend api developed as part of the the A&K-Project of ${PARTICIPANTS} at the University of Potsdam in the winter semester of 2022/2023.

## Prerequisites

npm, version > 9.2.0  
node, version > 19.3.0  

## Development Build Instructions
### AKCORE FRONTEND (VUE)

The frontend is developed with the Vue.js frontend web-framework. To run the Vue development server, while in the directory "/akcoreapp/", run  
<ul>
    <li>`npm install`</li>
    <li>`npm run serve` </li>
</ul> 

This will run a development server listening at port 8081.

### AKCORE BACKEND API (EXPRESSJS)

The backend is developed with express.js for node. To run the express.js api server, while in the directory "/akcoreapi/", run  
<ul>
    <li>`npm install`</li>
    <li>`npm run serve` </li>
</ul> 

This will run a exprees.js api server listening at port 3001.

## Production Build Instructions
### AKCORE FRONTEND (VUE)
In a production environment, the vue app is deployed to a static web server, such as apache2, to be served over http. This can be done by running the command `npm run build`, which will create a "dist" directory at /var/www/html/akcore/dist/, containing a single page application ready to be deployed. The webserver needs to be properly setup to be able to serve the site correctly. (How to setup: TBD)

### AKCORE BACKEND API (EXPRESSJS)
In a production environment, the node app is run as a daemon (system service) on a Linux system. This will automatically restart the server if it crashes and logs any stdin/stderr output to a specified log-file. This project is setup through a systemd-daemon called "nodeapi", logging stdin/stderr via rsyslog to /akcoreapi/logs/service.log. To follow the content of the log live in a terminal, while the service is active, you can run `less -f /home/nifranz/dev/git/akcore_stable/logs/error.log`. To start or stop the service, you can run with appropriate privileges `systemctl [start | stop | restart] nodeapi`. 
## Documentation

###### AKCORE Frontend (VUE)

### 1. Allgemeines
#### 1.1 Frameworks
<ul>
<li>Die Website wurde mit dem Vue.js Frontend Framework gebaut</li>
<li>das CSS-Styling wurde mit dem Bootstrap Framework realisiert</li>
<li>für http-requests wurde das AXIOS Framework genutzt</li>

#### 1.2 Aufbau
<li>die Navigationbar und die RouterView wurden in App.js eingebaut, der main file des Vue-Frameworks</li>
<li>Die Ansichten wie der Login-Screen, die Mitarbeiter-Ansicht und Projekt-Ansicht wurden über das Vue-RouterView Konzept als Views in die main file App.js eingebunden; klickt man auf einen Nav-Link, um beispielsweise zur Mitarbeiter-View zu gelangen, wird die aktuelle RouterView durch die MitarbeiterView ersetzt</li>
<li>häufig wiederverwendeter Code wurde als Component in die Views integriert, wie zum Beispiel der Loading-Anzeiger, um Code-Redundanz zu minimieren
#### 1.3 Kommunikation mit dem Backend</li>
<li>müssen einzelne Views mit dem Backend kommunizieren, tun sie das über Funktionen, die die app.js Datei bereitstellt. Hierzu wird die api.js file in jede View imporiert. Es werden alle nötigen Daten an diese Funktionen weitergegeben</li>
<li>die Funktionen der api starten dann die http requests über axios (einer http request library für nodejs), indem sie die korrekten API-URIS aufrufen und im request body die daten aus den views an das backend übergeben</li>

### 2. Funktionalitäten
#### 2.1 Einloggen
<li>über einen Login-Screen, der angezeigt wird, wenn ein Nutzer nicht eingeloggt ist, kann sich ein Nutzer anmelden</li>
<li>dem Backend werden Nutzername und Passwort übergeben</li>
<li>das Backend übergibt bei Erfolg alle Daten des Accounts, unter anderem den Account-Typ, der festlegt, welche Funktionen einem Nutzer im Frontend angezeigt werden und die organisationId, die dem Backend bei jeder Operation übergeben wird</li>
<li>in Zukunft kann Authentifizierung durch eine JWT-Session-Token Authentifizierung ersetzt werden, aber für das PoC reicht diese Funktionalität vollkommen aus</li>

#### 2.2 Mitarbeiter 
<li>ermöglicht Anlegen und Bearbeiten von Mitarbeitern und Abteilungen</li>
<li>Mitarbeiter sind Abteilungen zugeordnet und können nicht abteilungslos sein</li>
<li>Mitarbeiter benötigen die Felder „Name“, „E-Mail“</li>
<li>Abteilungen benötigen einen Namen</li>
<li>Mitarbeiter und Abteilungen existieren nach dem Erstellen in der Datenbank</li>
<li>- es findet (noch) keine Frontend-Validierung statt</li>

#### 2.3 Projekte
##### 2.3.1 Anlegen 
<li>ermöglicht Anlegen und Bearbeiten von Projekten und Umfragen für ein Projekt</li>
<li>Projekte benötigen einen Namen, eine Beschreibung, ein Start- und End-Datum</li>
<li>es können beliebig viele Umfragen hinzugefügt werden; Umfragen benötigen ein Start- und End-Datum, das Startdatum darf nicht in der Vergangenheit und das Enddatum nicht vor dem Startdatum liegen</li>
<li>es können bereits existierende Teilnehmer ausgewählt werden; ihnen muss eine der 3 Mitarbeiter Rollen Key-User, Change-Manager, User zugeordnet werden (evtl. bearbeiten dieser Rollen ermöglichen?)</li>
<li>es werden alle Eingaben im Frontend validiert</li>
<li>dem Backend werden die vom User eingegebenen Projekt-Informationen sowie der organisationId des Users übergeben</li>
<li>das Backend übergibt nach dem Erfolg durch den Location-Header die projektId des erstellten Projekts und das Frontend leitet den User zur Projektansicht des erstellten Projekts</li>

##### 2.3.2 Ansehen 
<li>ermöglicht das Darstellen eines Projekts</li>
<li>hier können alle Informationen, Umfragen und Teilnehmer eingesehen werden</li>
<li>über einen Button kann die Bearbeitungsansicht aufgerufen werden</li>
<li>über einen Button kann das dem Projekt zugeordnete Kibana-Dashboard angezeigt werden</li>

##### 2.3.3 Bearbeiten
<li>ermöglicht das Bearbeiten eines Projekts</li>
<li>es können Umfragen und Teilnehmer hinzugefügt werden</li>
<li>es können (noch) keine Umfragen und Teilnehmer gelöscht werden</li>
<li>über einen Button kann das Projekt gelöscht werden (evtl. verschieben dieser Funktionalität in Bearbeiten-Ansicht?)</li>
<li>dem Backend werden die Projekt-Informationen sowie die organisationId des Users übergeben; die Projekt-Informationen enthalten die alten sowie die neuen Projektinformationen gleichermaßen</li>
<li>das Backend übergibt eine Erfolgsmeldung nach Erfolg und das Frontend leitet zur Projektansicht weiter</li>
</ul>
### AKCORE BACKEND API (EXPRESSJS)

TBD