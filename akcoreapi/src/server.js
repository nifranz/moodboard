// express.js
const express = require('express')
const routes = require('./routes') 
const { HTTP } = require('./helper')

// utils
const fs = require('fs/promises')
const cors = require('cors')
const { exec } = require('child_process')
const uuid = require('uuid')
const bodyParser = require('body-parser')
const { getToday, getYesterday, handleError } = require('./helper')

// api classes
const { ESAPI } = require(__dirname+'/apis/esapi.js')
const { LRPC } = require(__dirname+'/apis/lrpc.js')
const { KIBAPI } = require(__dirname+"/apis/kibapi.js")

// sequelize database and datamodel definitions
const akcoredb = require('./database')
const Organisation = require('./models/organisation')
const Abteilung = require('./models/abteilung')
const User = require('./models/user')
const Mitarbeiter = require('./models/mitarbeiter')
const Projekt = require('./models/projekt')
const Umfrage = require('./models/umfrage')
const { Console } = require('console')
require('./models/associations')

// Controllers
const UserController = require('./controllers/user')


// creating and configuring expressjs server 
const PORT = 3001;
let app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/", routes) // REST API CRUD Endpoints for all DataModels (see routes/index.js)

// defining additional data endpoints
/** 
 * API ENDPOINTS FOR ORGANISATIONS
 */
app.get("/organisations", async (req, res) => {
    console.log("GET /organisations");

    try {
        let organisations = await Organisation.findAll();
        return res.status(HTTP.OK).send(organisations);
    } catch (e) {
        console.error(e);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    }
});

/** 
 * API ENDPOINTS FOR LOGIN VERIFICATION
 */

/**
 * Handle the POST request to verify user login credentials.
 * @function
 * @name verifyLogin
 * @param {object} req - The HTTP request object.
 * @param {object} res - The HTTP response object.
 * @returns {Promise<void>} - The Promise object representing the completion of the function.
 */
app.post("/verifyLogin", async (req, res) => {
    console.log("POST /verifyLogin", req.body);

    try {        
        let data = req.body; // get data from request body
        
        if (!data) {return res.sendStatus(HTTP.BAD_REQUEST);} // if no body is present send back HTTP error

        let usr = await User.findOne({ where: { username: data.username, password: data.password } })
        console.log("GET user:", usr);

        if (!usr) { // if no user is found send back HTTP error
            console.log("  -> user not found.");
            return res.sendStatus(HTTP.NOT_FOUND);
        }
        else{
            console.log("  -> Login sucessfull for user: ", usr.username);
            delete usr.password;
            return res.status(HTTP.OK).send(usr);
        }

    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
});

app.get("/utils/ls/emailtrigger", async(req, res) => {
    let client = new LRPC();
    await client.openConnection();
    let today = getToday();
    let umfragen = await Umfrage.findAll({
        include: {model:Mitarbeiter}
    });
    for (umfr of umfragen) {
        console.log(`Umfrage start: ${umfr.umfrageStartDate} - end: ${umfr.umfrageEndDate}`);
        console.log(`today: ${today}`)
        if (umfr.umfrageStartDate <= today && umfr.umfrageEndDate >= today) {
            console.log("umfrage aktiv; inviting ... ")
            let participantTokens = [];
            for (ma of umfr.mitarbeiters) {
                participantTokens.push(ma.fuelltAus.mitarbeiterLimesurveyTokenId);
            }
            console.log(umfr.umfrageLimesurveyId,participantTokens);
            // client.inviteParticipants(umfr.umfrageLimesurveyId);
            await client.remindParticipants(umfr.umfrageLimesurveyId);
            await client.mailRegisteredParticipants(umfr.umfrageLimesurveyId);
        }
    }
    return res.sendStatus(HTTP.OK);
});

app.get("/utils/es/datainject", async (req, res) => {
    console.log("GET /injectDataAll")

    // request for all projekte
    let projekte = await Projekt.findAll({
        include: [Umfrage]
    });

    try {
        for (projekt of projekte) {
            console.log(`⎡ Executing injection for projekt: ${projekt.projektName}`);
            if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
            let surveyIndex = 0;
            for (umfr of projekt.umfrages) {
                surveyIndex++; // variable used to create iterated Survey_Name column in elastic search
                if (umfr.umfrageStartDate > getToday()) {
                    console.log(`⎢  - excluding umfrage (id:${umfr.umfrageId}, start: ${umfr.umfrageStartDate} - end: ${umfr.umfrageEndDate}) => umfrage has not yet started!`);
                    continue; // exclude all surveys that have not yet started
                }
                if (umfr.umfrageEndDate < getYesterday()) {
                    console.log(`⎢  - excluding umfrage (id:${umfr.umfrageId}, start: ${umfr.umfrageStartDate} - end: ${umfr.umfrageEndDate}) => umfrage has already been completed!`);
                    continue;
                }
                console.log(`⎢⎡ + including umfrage (id:${umfr.umfrageId}, start: ${umfr.umfrageStartDate} - end: ${umfr.umfrageEndDate}) => umfrage is currently active! `);
                let surveyId = umfr.umfrageLimesurveyId
                // building the pipeline input object
                // - get mitarbeiter data for pipeline ingestion
                let umfrageProjekt = await Projekt.findOne({
                    where: { projektId: projekt.projektId },
                    include: { 
                        model: Mitarbeiter,
                        include: [{
                            model: Umfrage,
                            where: { umfrageId: umfr.umfrageId }
                        }, Abteilung]
                        }
                });
                let projektMitarbeiter = umfrageProjekt.mitarbeiters;
                
                let mitarbeiterData = {}
                for (let ma of projektMitarbeiter) {
                    mitarbeiterData[ma.umfrages[0].fuelltAus.mitarbeiterLimesurveyTokenId] = { "participantID": ma.mitarbeiterId, "rolle": ma.projektTeilnahme.mitarbeiterRolle, "abteilung": ma.abteilung.abteilungName };
                }
                let surveyData = {"surveyId": surveyId, "surveyIndex": surveyIndex, "surveyStartDate": umfr.umfrageStartDate, "surveyEndDate": umfr.umfrageEndDate}
                let json = { "projektId": projekt.projektId, "surveyData": surveyData, "teilnehmerData": mitarbeiterData };
        
                // create a jsonfile to read from python script with "json" variable as file content
                var filePath = __dirname + "/../pipeline/tmp.pipeline-input_" + surveyId + "_" + uuid.v4() + ".json"
                await fs.writeFile(filePath, JSON.stringify(json), function(){});
                
                let data = await new Promise(async (resolve, reject) => {
                    exec(`python3 ${__dirname}/../pipeline/ETL-Pipeline.py ${filePath} `, async (error, stdout, stderr) => {
                        if (error) {
                            console.log("Error while invoking python script!");
                            console.log('error:', error.message);
                            reject();
                            return;
                        }
                        if (stderr) {            
                            console.log("Error while executing python script!");
                            console.log('stderr:', stderr);
                            reject();
                            return;
                        }
                        let pipeResultsFilePath = stdout.split('§')[0];
                        let returnData = "";
                        let data = await fs.readFile(pipeResultsFilePath, encoding = 'utf-8');
                        await fs.unlink(pipeResultsFilePath); // delete the file created by python

                        returnData = JSON.parse(data);        
                        resolve(returnData);
                    });
                }).catch(() => {
                    console.log("catched");
                    return null;
                }).then(async (data) => {
                    return data;
                }).finally(async () => {
                    // deleting the file after data was imported
                    await fs.unlink(filePath);
                });
                        
        
                if (data === null) {
                    console.log("⎢⎣ Injection for umfrage unsuccessfull")
                    continue;
                }
        
                projektId = data.projektId;
                let pie = data.pie;
                let count = data.count;
                let responses = data.responses;
    
                let esClient = new ESAPI(); // class used to connect to elastic search
        
                // writing all response documents
                console.log("⎢⎢ injecting data to elastic search ...")
                console.log("⎢⎢ writing documents to index 'responses' ...");
                for (let documentId of Object.keys(responses)) {
                    
                    // the documentId is the desired id of an elasticsearch document: one entry of an index; 
                    // in a tabular metaphor, the index is a table, the document is one row in that table. 
                    // therefore, the documentId is used to adress a specific row.
                    let indexId = `akcore_${projektId}_responses`
                    await esClient.writeDataToDocument(indexId, documentId, responses[documentId], refresh = true);
                };
                console.log("⎢⎢ => done!");

                // writing all pie documents
                console.log("⎢⎢ writing documents to index 'pie' ...");
                for (let documentId of Object.keys(pie)) {
                    // the documentId is the desired id of an elasticsearch document: one entry of an index. In a tabular metaphor, the index is a table, the document is one row in that table. the documentId is used to adress a specific row.
                    let indexId = `akcore_${projektId}_pie`
                    await esClient.writeDataToDocument(indexId, documentId, pie[documentId], refresh = true);
                };
                console.log("⎢⎢ => done!")        
                
                // writing all count documents
                console.log("⎢⎢ writing documents to index 'count' ...");
                for (let documentId of Object.keys(count)) {
                    // the documentId is the desired id of an elasticsearch document: one entry of an index In a tabular metaphor, the index is a table, the document is one row in that table. the documentId is used to adress a specific row.
                    let indexId = `akcore_${projektId}_count`
                    await esClient.writeDataToDocument(indexId, documentId, count[documentId]);
                };
                console.log("⎢⎢ => done!")
                console.log(`⎢⎣ \u2713 data injection to elasticsearch for umfrage (id:${umfr.umfrageId}, start: ${umfr.umfrageStartDate} - end: ${umfr.umfrageEndDate}) completed!`)
            }
            console.log(`⎣ ✓ Projekt injection complete.
            `);
        }
    } catch(error) {
        return res.status(HTTP.INTERNAL_ERROR).send(error);
    }    
    return res.sendStatus(HTTP.OK);
});

/** 
 * (EXPERIMENTAL API ENDPOINTS)
 */

// starting the server and listen to the specified port
akcoredb
    .sync({})
    .then(() => {
        app.listen(PORT, async () => {
            // Create 3 organisations in the database on startup. This is necessary if the database has been flushed
            // creating an entry that already exists in the database will result in an error, so we want to catch that error
            // this way, we only create that entries when the database is first initialized 
            try { await Organisation.findOrCreate( { where: {organisationId: 1, organisationName: "LSWI-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 2, organisationName: "Marketing-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 3, organisationName: "Informatik-Lehrstuhl" } }); } catch (error) { console.log(error); }


            console.log('Listening on port localhost:' + PORT+ ". Apache redirects to this from /api/");
        })
    });
