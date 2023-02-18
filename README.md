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

### AKCORE FRONTEND (VUE)

TBD

### AKCORE BACKEND API (EXPRESSJS)

TBD