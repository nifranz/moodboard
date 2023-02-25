const connection = require('./connection')
const replace = require('replace-in-file')
const { Client } = require('@elastic/elasticsearch')
const { Console } = require('console')
const { Sequelize, DataTypes } = require('sequelize')
const fssync = require('fs')
const axios = require('axios')

const express = require('express')
const fs = require('fs/promises')
const cors = require('cors')
const bodyParser = require('body-parser')
const { exec } = require('child_process')
const uuid = require('uuid')

const { ESAPI } = require(__dirname+'/apis/esapi.js')
const { LRPC } = require(__dirname+'/apis/lrpc.js')
const { KIBAPI } = require(__dirname+"/apis/kibapi.js")
const { akcoredb, Organisation, Projekt, Umfrage, Mitarbeiter, Abteilung } = require('./datamodels')
const { getToday, getYesterday, SurveyFile, handleError } = require('./helper')

// creating and configuring expressjs server 
const PORT = 3001;
const HTTP = {
    OK: 200, 
    CREATED: 201, 
    BAD_REQUEST: 400, 
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
    INTERNAL_ERROR: 500,
}

let app = express();

app.use(cors());
app.use(bodyParser.json());

/** Create REST API endpoints 
 * C for Create: HTTP POST
 * R for Read: HTTP GET
 * U for Update: HTTP PUT
 * D for Delete: HTTP DELETE
 */ 

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
 * API ENDPOINTS FOR MITARBEITER
 */

/**
 * GET all employees for a specific organization ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {object} Returns a JSON object containing all employees for a specific organization ID
 */
app.get("/mitarbeiterAll/:organisationId", async (req, res) => {
    let organisationId = req.params.organisationId;
    console.log("GET /mitarbeiterAll/"+organisationId);

    try {
        // Check if organization ID is provided, return error if missing
        if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);

        // Check if organization exists, return error if not found
        if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.NOT_FOUND);

        // Find all employees for specific organization and include related surveys and projects
        let mitarbeiter = await Mitarbeiter.findAll( { 
            where: { organisationId: organisationId}, 
            include: [Umfrage, Projekt]
        });
        
        // Return JSON response with all employees
        return res.send(mitarbeiter);

    } catch (e) {
        handleError(e);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    }
});

/**
 * POST endpoint for creating a new Mitarbeiter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post("/mitarbeiter", async (req, res) => {
    console.log("POST /mitarbeiter");

    try {
        data = req.body; // the data sent by the client in request body
        if( !data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId || !data.organisationId ) {
            // Return HTTP BAD_REQUEST if required data is missing
            return res.sendStatus(HTTP.BAD_REQUEST);
        }

        // Create a new Mitarbeiter record in the database with the provided data
        await Mitarbeiter.create({ 
            mitarbeiterName: data.mitarbeiterName, 
            mitarbeiterEmail: data.mitarbeiterEmail, 
            abteilungId: data.abteilungId, 
            organisationId: data.organisationId
        });

        // Return HTTP CREATED status code to indicate that the record was successfully created
        return res.sendStatus(HTTP.CREATED);

    } catch (e) {
        handleError(e);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    }    
});

app.put("/mitarbeiter", async (req, res) => {
    console.log("PUT /mitarbeiter");

    try {
        // update a mitarbeiter at specific mitarbeiterId
        data = req.body; // the data sent by the client in request body

        if(!data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId) return res.sendStatus(HTTP.BAD_REQUEST);

        // let wtf = await Umfrage.findAll({
        //     include: [FuelltAus]
        // })
        let result = await Mitarbeiter.findOne({
            where: { mitarbeiterId: data.mitarbeiterId },
            include: [Umfrage, Projekt] 
        })
        .then(async result => {
            let mitarbeiter = result;
            // console.log("result", result);
            console.log(mitarbeiter.umfrages);
            console.log(mitarbeiter.projekts);

            if ( mitarbeiter.mitarbeiterEmail != data.mitarbeiterEmail || mitarbeiter.mitarbeiterName != data.mitarbeiterName ) {
                let client = new LRPC();
                await client.openConnection();
                for (umfr of mitarbeiter.umfrages) {
                    await client.updateParticipant(umfr.umfrageLimesurveyId, umfr.fuelltAus.mitarbeiterLimesurveyTokenId, ["email = test",]);
                }                
                await client.closeConnection();
            }

            mitarbeiter.update({ 
                mitarbeiterName: data.mitarbeiterName, 
                mitarbeiterEmail: data.mitarbeiterEmail, 
                abteilungId: data.abteilungId
            }, { where: { mitarbeiterId: data.mitarbeiterId } })
            return res.sendStatus(HTTP.CREATED);
        })
        .catch(error => {
            throw new Error(e);
        })
    } catch (e) {
        handleError(e);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    }
});

app.delete("/mitarbeiter/:mitarbeiterId", async (req, res)  => {    
    let mitarbeiterId = req.params.mitarbeiterId;
    console.log("DELETE /mitarbeiter/"+mitarbeiterId);
    
    try {
        // DELETE a mitarbeiter for specific mitarbeiterId
        let success = await Mitarbeiter.destroy({
            where: {mitarbeiterId: mitarbeiterId}
        });

        if (!success) return res.sendStatus(HTTP.NOT_FOUND);
        return res.sendStatus(HTTP.OK);
        
    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
});

/** 
 * API ENDPOINTS FOR PROJEKTE 
 */
app.get("/projekte/:organisationId", async (req, res) => {
    let organisationId = req.params.organisationId;
    console.log("GET /projekte/"+organisationId);

    try {
        // READ all projekte for specific organisationId      
        let projekte = await Projekt.findAll({
            where: { organisationId: organisationId }, 
            include: [Mitarbeiter, Umfrage]
        });
        return res.send(projekte);

    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
});

app.get("/projekt/:projektId", async(req, res) => {
    let projektId = req.params.projektId;
    console.log("GET /projekt/" + projektId);
    
    try {
        const result = await Projekt.findOne({
            where: {projektId: projektId},
            include: [{ 
                model: Mitarbeiter, 
                include: [Abteilung, {
                    model: Umfrage,
                    where: { projektId: projektId }
                }]
            }, {
                model: Umfrage
            }]
        });
        
        if (!result) return res.sendStatus(HTTP.NOT_FOUND);
        return res.send(result);

    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
})

app.post("/projekt", async (req, res) => {
    console.log("POST /projekt");
    let client;
    
    try {
        data = req.body; // the data sent by the client in request body

        // check if all required data for creating a project is present
        if (!data.projektName || 
            !data.projektBeschreibung || 
            !data.projektStartDate || 
            !data.projektEndDate || 
            !data.teilnehmer || 
            !data.umfragen ) {
                console.log("bad request")
                return res.sendStatus(HTTP.BAD_REQUEST);
        }

        data.projektKibanaDashboardId = ""; // set the project Kibana dashboard ID to an empty string, because it does not have a default value when a new project is created
        
        // create new projekt
        let projekt = await Projekt.create(data);

        // create a new LimeSurvey RPC client and open a connection
        client = new LRPC();
        await client.openConnection();

        // create each survey in LimeSurvey and add it to the project
        for (u of data.umfragen) {
            let surveyFile = new SurveyFile(u.umfrageStartDate, u.umfrageEndDate, "AK Core Admin", "nifranz@uni-potsdam.de", projekt.projektName, projekt.projektBeschreibung);
            await surveyFile.createFile(); // creating a new survey file from the survey source file on disk
            await client.createSurvey(surveyFile.getPathToFile())
            .then( async surveyId => {     
                await client.activateSurvey(surveyId); // activate the survey in limesurvey
                await client.activateTokens(surveyId, [1,2]); // initialize the participant table for the survey in limesurvey
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);
                await projekt.addUmfrage(umfrage); // add the survey to the project
            }).catch(error => {
                handleError(error);
            });

            surveyFile.destroyFile(); // delete the survey file from disk
        }

        // add each participant to the project
        for (teiln of data.teilnehmer) {
            console.log("Teilnehmer-Data:", teiln);
            let teilnId = teiln.mitarbeiterId;
            let teilnehmer = await Mitarbeiter.findOne({
                where: {mitarbeiterId: teilnId},
                include: [Abteilung]
            });

            await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } }); // add the participant to the project
        }

        // retrieve all the newly created project participants and surveys
        projekt = await Projekt.findOne({ 
            where: {projektId: projekt.projektId},
            include: [{ 
                model: Mitarbeiter, 
                include: [Abteilung]
            }, { model: Umfrage }]
        });
        let projektTeilnehmer = projekt.mitarbeiters;
        let projektUmfragen = projekt.umfrages;       

       // add each participant to each survey and write the token ID to the database
        for (let teilnehmer of projektTeilnehmer) {
            for (let umfr of projektUmfragen) {
                // adding participant to limesurvey
                let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":"none", "firstname":teilnehmer.mitarbeiterName, "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
                console.log("tokenid: ", limesurveyTokenId);

                // writing the limesurveyTokenId to database
                teilnehmer.addUmfrage(umfr, { 
                    through: { 
                        mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                        projektId: projekt.projektId 
                    } 
                })
            }
        }

        // create kibana space        
        let kibClient = new KIBAPI();
        await kibClient.createKibanaSpace(projekt.projektId, projekt.projektName);
        
        // create elasticsearch indices
        let esClient = new ESAPI();
        await esClient.createProjektIndices(projekt.projektId);

        console.log("  => Creating Project successfull");
        return res // the response
            .setHeader('Location', `/projekt/${projekt.projektId}`) // setting location header for the response to the client
            .set( { 'Access-Control-Expose-Headers': 'location', } ) // exposing location header
            .sendStatus(HTTP.CREATED);
    }
    catch (error) {
        handleError(error);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } 
    finally {
        if (client) await client.closeConnection();
    }
});

app.put("/projekt/:projektId", async (req, res) => {
    let projektId = req.params.projektId;
    console.log("PUT /projekt/",projektId);
    let client;

    try {        
        data = req.body; // the data sent by the client in request body

        if (!data.projektName || 
            !data.projektBeschreibung || 
            !data.projektStartDate || 
            !data.projektEndDate || 
            !data.teilnehmer || 
            !data.umfragen ) {
                console.log("bad request")
                return res.sendStatus(HTTP.BAD_REQUEST);
        }
    
        var projekt = await Projekt.findOne({where: {projektId: projektId}});
        if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
        // update projekt meta-data
        projekt.set({
            projektName: data.projektName,
            projektBeschreibung: data.projektBeschreibung,
            projektStartDate: data.projektStartDate,
            projektEndDate: data.projektEndDate,
        })
        await projekt.save()

        data.teilnehmerNew = data.teilnehmer.filter(teiln => {
            return teiln.new;
        });

        data.umfragenNew = data.umfragen.filter(umfr => {
            return !umfr.readOnly;
        });

        // Opening a connection to LimeSurvey RPC
        client = new LRPC();
        await client.openConnection();

        // creating an array presentSurveyIds that contains all surveyIds of all surveys that existed in the Projekt before updating it.
        var presentUmfragen = await Umfrage.findAll({
            where: {projektId: projekt.projektId},
        });
        let presentSurveyIds = [];
        for (umfr of presentUmfragen) {
            presentSurveyIds.push(umfr.umfrageLimesurveyId);
        }
        console.log("Present surveyIds:",presentSurveyIds);

        var newSurveyIds = []; // array of newly created surveyIds
        for (u of data.umfragenNew) {
            let surveyFile = new SurveyFile(u.umfrageStartDate, u.umfrageEndDate, "AK Core Admin", "nifranz@uni-potsdam.de", projekt.projektName, projekt.projektBeschreibung);
            await surveyFile.createFile(); // creating the file in fs
            await client.createSurvey(surveyFile.getPathToFile())
            .then( async surveyId => {          
                await client.activateSurvey(surveyId);
                await client.activateTokens(surveyId, [1,2]);    
                newSurveyIds.push(""+surveyId); 
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);
                await projekt.addUmfrage(umfrage);
            }).catch(error => {
                throw new Error(error);
            });
        }

        let newTeilnehmerMitarbeiterIds = []; // array that will contain the mitarbeiterIds of all new teilnehmers; for later use
        for (teiln of data.teilnehmerNew) {
            newTeilnehmerMitarbeiterIds.push(teiln.mitarbeiterId);
            console.log("Teilnehmer-Data:", teiln);
            let teilnId = teiln.mitarbeiterId;
            let teilnehmer = await Mitarbeiter.findOne({
                where: {mitarbeiterId: teilnId},
                include: [Abteilung]
            });
            await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } });
        }

        projekt = await Projekt.findOne({ 
            where: {projektId: projekt.projektId},
            include: [{ 
                model: Mitarbeiter, 
                include: [Abteilung]
            }, { model: Umfrage }]
        });
        let allProjektTeilnehmer = projekt.mitarbeiters;
        let allProjektUmfragen = projekt.umfrages;

        console.log(newSurveyIds);

        for (let teilnehmer of allProjektTeilnehmer) {
            for (let umfr of allProjektUmfragen) {
                console.log( newSurveyIds.includes(umfr.umfrageLimesurveyId) )
                if (newSurveyIds.includes(umfr.umfrageLimesurveyId)) { // add all teilnehmer to new surveys only
                    // adding all participants to limesurvey
                    let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname": "none","firstname":teilnehmer.mitarbeiterName, "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
                    console.log("tokenid: ", limesurveyTokenId);

                    teilnehmer.addUmfrage(umfr, { 
                        through: { 
                            mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                            projektId: projekt.projektId 
                        } 
                    })

                    // writing the limesurveyTokenId to database
                    
                } else if (newTeilnehmerMitarbeiterIds.includes(teilnehmer.mitarbeiterId)) { // add only new teilnehmer to only already existing surveys 
                    let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName} ]);
                    teilnehmer.addUmfrage(umfr, { 
                        through: { 
                            mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                            projektId: projekt.projektId 
                        } 
                    })
                }                
            }
        }

        console.log("returning HTTP.CREATED");
        return res // the response
            .setHeader('Location', `/projekt/${projekt.projektId}`) // setting location header for the response to the client
            .set( { 'Access-Control-Expose-Headers': 'location', } )
            .sendStatus(HTTP.CREATED);
    }
    catch (error) {
        handleError(error);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } 
    finally {
        if (client) await client.closeConnection();
    }
});

app.delete('/projekt/:projektId', async(req,res) => {
    let projektId = req.params.projektId;
    console.log("DELETE /projekt/",projektId)
    let client;
    try {
        let projekt = await Projekt.findOne({where: {projektId: projektId},include: [Umfrage]});
        if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
        var projektUmfragen = projekt.umfrages;
    
        client = new LRPC();
        await client.openConnection();
    
        for (umfr of projektUmfragen) {
            console.log("lsid:",umfr.umfrageLimesurveyId);
            await client.deleteSurvey(umfr.umfrageLimesurveyId);
            await umfr.destroy();
        }
        
        // deleted related kibana space
        let kibClient = new KIBAPI();
        await kibClient.deleteKibanaSpace(projekt.projektId);

        // delete related elasticsearch indices
        let esClient = new ESAPI();
        await esClient.deleteProjectIndices(projekt.projektId);

        // delete projekt from akcoredb
        await projekt.destroy();
        
        return res.sendStatus(HTTP.OK);
    } catch (error) {
        handleError(error);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } finally {
        if (client) client.closeConnection();
    }
});

/** 
 * API ENDPOINTS FOR ABTEILUNGEN 
 */
app.get("/abteilungen/:organisationId", async(req, res) => {
    console.log("GET /abteilungen/"+req.params.organisationId);
    try {
        let organisationId = req.params.organisationId;
        if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
        if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.NOT_FOUND);

        let abteilung = await Abteilung.findAll({where: { organisationId: organisationId }, include: [Mitarbeiter]});

        return res.send(abteilung);
    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
})

app.post("/abteilung/", async(req, res) => {
    console.log("POST /abteilung");
    console.log(req.body)
    try {
        data = req.body; // the data sent by the client in request body
        console.log(req.body)

        if( !data.abteilungName || !data.organisationId ) return res.sendStatus(HTTP.BAD_REQUEST); 

        await Abteilung.create({ 
            abteilungName: data.abteilungName,
            organisationId: data.organisationId
        });

        return res.sendStatus(HTTP.CREATED);
    } catch (e) {
        handleError(e);
        res.status(HTTP.INTERNAL_ERROR).send(e);
    }
});

/**
 * DELETE request to delete an Abteilung and its associated Mitarbeiters if there are no Mitarbeiters assigned to the Abteilung.
 *
 * @function
 * @name deleteAbteilung
 * @param {string} req.params.abteilungId - The ID of the Abteilung to delete.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - Returns a response object with a status code.
 * @throws {Object} - Throws an error if an exception occurs during the deletion process.
 */
app.delete("/abteilung/:abteilungId", async (req, res)  => {  
    console.log("DELETE /abteilung");
    try {
        // DELETE a mitarbeiter for specific mitarbeiterId
        let abteilung = await Abteilung.findOne({
            where: {abteilungId: req.params.abteilungId},
            include: [Mitarbeiter]
        });
        if (!abteilung) {
            return res.sendStatus(HTTP.NOT_FOUND);
        }
        if (!abteilung.mitarbeiters.length) {
            abteilung.destroy();
            return res.sendStatus(HTTP.OK);
        } else {
            return res.sendStatus(HTTP.BAD_REQUEST);
        }
    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
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
 * @throws {Error} - An error occurred while handling the request.
 */
app.post("/verifyLogin", async (req, res) => {
    console.log("POST /verifyLogin", req.body);

    try {        
        const ACCOUNTS = [
            {type: "suadm", accountName: "dev", passwort: "passwort", organisationId: 1},

            {type: "adm", accountName: "dkotarski", passwort: "lswi_test", organisationId: 2},
            {type: "adm", accountName: "thammes", passwort: "lswi_test", organisationId: 2},

            {type: "cm", accountName: "bbender", passwort: "lswi_test", organisationId: 2},
            {type: "cm", accountName: "jgonnermann", passwort: "lswi_test", organisationId: 2},
            {type: "cm", accountName: "cthim", passwort: "lswi_test", organisationId: 2},
            {type: "cm", accountName: "ngronau", passwort: "lswi_test", organisationId: 2},

            {type: "adm", accountName: "awolf", passwort: "lswi_test", organisationId: 2},

        ]

        let data = req.body; // get data from request body
        if (!data) return res.sendStatus(HTTP.BAD_REQUEST); // if no body is present send back HTTP error

        let account;
        for (a of ACCOUNTS) { // check if there is an account matching the requested accountName
            if (a.accountName == data.accountName) account = a;
        }

        if (!account) { // if no account is found send back HTTP error
            console.log("  -> account not found.");
            return res.sendStatus(HTTP.NOT_FOUND);
        }

        if (account.passwort == data.passwort) { // if request passwort matches account passwort send back account info
            console.log("  -> Login sucessfull for account: ", account.accountName);
            delete account.passwort;
            return res.status(HTTP.OK).send(account);
        } else { // if passwort doesnt match account passwort send back http error
            console.log("  -> Login unsucessfull for account: ", account.accountName);
            return res.sendStatus(401);
        }

    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
});

app.get("/inviteParticipants", async(req, res) => {
    let client = new LRPC();
    await client.openConnection();
    let today = getToday();
    let umfragen = await Umfrage.findAll({
        include: {model:Mitarbeiter}
    });
    for (umfr of umfragen) {       
        if (umfr.umfrageStartDate <= today && umfr.umfrageEndDate >= today) {
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

});

app.get("/injectDataAll", async (req, res) => {
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
                        }
                        if (stderr) {            
                            console.log("Error while executing python script!");
                            console.log('stderr:', stderr);
                            reject();
                        }
                        let pipeResultsFilePath = stdout.split('§')[0];
                        let returnData = "";
                        let data = await fs.readFile(pipeResultsFilePath, encoding = 'utf-8');
                        await fs.unlink(pipeResultsFilePath); // delete the file created by python

                        returnData = JSON.parse(data);        
                        resolve(returnData);
                    });
                }).catch(() => {
                    return null;
                }).then(async (data) => {
                    return data;
                }).finally(async () => {
                    // deleting the file after data was imported
                    await fs.unlink(filePath);
                });               
        
                if (data === null) return res.sendStatus(HTTP.INTERNAL_ERROR);
        
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
            console.log(`⎣ ✓ Injection complete.
            `);
        }
    } catch(error) {
        return res.status(HTTP.INTERNAL_ERROR).send(error);
    }    
    return res.sendStatus(HTTP.OK);
});

/** 
 * EXPERIMENTAL API ENDPOINTS
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
