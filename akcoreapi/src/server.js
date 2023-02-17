const fs = require('fs/promises')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const axios = require('axios')
// const morgan = require('morgan')
const connection = require('./connection')
    /* required ./connection.js' structure:
        const db_name = 'akcoredb';
        const db_username = '*****';
        const db_password = '*****';
        const db_host = 'localhost'
        
        const ls_username = '*****';
        const ls_password = '*****';
        
        module.exports = {
            db_name,
            db_username,
            db_password,
            db_host,
            ls_username,
            ls_password
        }
    */

const LIME_RPC_URL = 'http://localhost/index.php/admin/remotecontrol/';
const LRPC_LOGGING = true;
const ERROR_LOG_PATH = __dirname + "/../logs/error.log"

function initLogs() {
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    
    fs.writeFile(ERROR_LOG_PATH, timeString + "Server has been started", function(){})
}

function handleError(error) {
    console.error(error);
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    fs.appendFile(ERROR_LOG_PATH, timeString + error + "\r\n", (error) => {});
}

/**
 * Make a HTTP-POST request to the limesurvey rpc using axios HTTP library
 * @param id: rpc id
 * @param method: the rpc method to be used
 * @param params: the rpc params to send to the server 
 */
async function lrpc_req(id, method, params) {
    const response = await axios.post(LIME_RPC_URL, {
        id: id,
        method: method,
        params: params,
    }, {
        headers: {
        'Content-Type': 'application/json',
        },
    });
    if (LRPC_LOGGING) console.log("LRPC-Response for '",id,"' ::", response.data);
    return response.data;
}

/**
 * @class Class representing an interface to the LimeSurvey RPC API (documented as LRPC)
 */
class LRPC {
    #sessionKey;
    #activeConnection;
     /** @constructs */
    constructor() {
        this.#sessionKey = "";
        this.#activeConnection = false;
    }
    /** 
     * Opens a connection to the LRPC, requesting a sessionKey 
     * */
    async openConnection() {
        try {
            if (this.#activeConnection) {
                console.error("Connection already active");
                return
            }
            let response = await lrpc_req('open_connection', 'get_session_key', [connection.ls_username, connection.ls_password]);
            if (response.error) throw new Error(response.error);
            this.#sessionKey = response.result;
            this.#activeConnection = true;
            console.log("Connection to LimeSurvey RPC established!");
        } catch (error) {
            console.log(error);
        }
    }
    /** 
     * Closes the connection to the LRPC 
     * */
    async closeConnection() {
        try {
            if (!this.#activeConnection) {
                console.error("No active connection!");
                return 
            }
            let response = await lrpc_req('close_connection','release_session_key', [this.#sessionKey]);
            if (response.error) throw new Error(response.error);
            this.#sessionKey = "";
            this.#activeConnection = false;
            console.log("Connection to LimeSurvey RPC closed!");
        } catch (error) {
            console.log(error);
        }
    }
    /** 
     * Requests all surveys from the LRPC and prints the response to the console.
     * */
    async listSurveys() {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('list_surveys', 'list_surveys', [this.#sessionKey]);
            if (data.error) throw new Error (data.error);
            console.log(data.result);
            return (data.result);
        } catch (error) {
            throw new Error(error);
        }        
    }

    /** 
     * Requests all users from the LRPC and prints the response to the console.
     * */
    async listUsers() {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('list_users', 'list_users', [this.#sessionKey]);
            if (data.error) 
            console.log(data.result);
        } catch (error) {
            console.log(error);
        }        
    }

    /** 
     * Requests all surveys from the LRPC and prints the response to the console.
     * @param startDate The startDate of the survey
     * @param stopDate The stopDate of the survey
     * @returns {Promise} Promise object, represents the surveyId of the created survey
     * */
    async createSurvey(startDate, stopDate) {
        return new Promise(async (resolve, reject)  => {
            try {
                if (!this.#activeConnection) {
                    throw new Error("No active connection! Establish a connection first by calling openConnection()!");
                }    

                var surveyFile = await fs.readFile(__dirname + '/../assets/limesurvey/base_survey.lss', { encoding: 'base64' });
                if(!surveyFile) throw new Error("Some error reading the file");
    
                let data = await lrpc_req('import_survey', 'import_survey', [this.#sessionKey, surveyFile, 'lss']);
                if (data.error) throw new Error (data.error);
                let surveyId = data.result;
                console.log("Survey created! SurveyId: " + surveyId);
                resolve(surveyId);
             } catch(error) {
                reject(error);
             }
        })
    }

    async activateTokens(surveyId, attributeData) {
        console.log("attribute-dataa:", attributeData);
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('activate tokens, survey ' + surveyId, 'activate_tokens', [this.#sessionKey, surveyId, attributeData]);
            if (data.error) throw new Error (data.error);
            console.log("Participant Table initialized for survey ", surveyId);
         } catch(error) {
            console.error("Participant Table could not be initialized for survey ", surveyId);
            throw new Error(error);
         }
    }

    async addParticipants(surveyId, participantData) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }

            let data = await lrpc_req('add participant, survey ' + surveyId, 'add_participants', [this.#sessionKey, surveyId /*, participantData*/]); // not adding participant data. no longer used, since pipeline adds this to the data.
            if (data.error) throw new Error (data.error);
            console.log(participantData.length, "participant(s) added for survey", surveyId);
            return (data.result[0].token);
         } catch(error) {
            console.error("Participant could not be added for survey ", surveyId);
            throw new Error(error);
         }
    }

    async deleteSurvey(surveyId) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }

            let response = await lrpc_req('delete survey, survey ' + surveyId, 'delete_survey', [this.#sessionKey, surveyId]);
            if (response.error) throw new Error (response.error);
            return (response.result);
         } catch(error) {
            console.error("Participant could not be added for survey ", surveyId);
            throw new Error(error);
         }
    }

    async listParticipants(surveyId) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('list_participants, survey '+surveyId, 'list_participants', [this.#sessionKey, surveyId, 0, 10000, false, ["attribute_1", "attribute_2"]]);
            if (data.error) 
            console.log(data.result);
            return(data.result);
        } catch (error) {
            console.log(error);
        }  
    }

    async updateParticipant(surveyId, participantToken, attributeData) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('set_participant_properties, survey '+surveyId, 'set_participant_properties', [this.#sessionKey, surveyId, participantToken, attributeData]);
            if (data.error) 
            console.log(data.result);
            console.log(surveyId)
            return(data.result);
            
        } catch (error) {
            console.log(error);
            console.log(surveyId)
        }

    }

    connectionIsActive () {
        return this.#activeConnection;
    }

    getSessionKey () {
        return this.#sessionKey;
    }
}

const PORT = 3001;
let app = express();

const HTTP = {
    OK: 200, 
    CREATED: 201, 
    BAD_REQUEST: 400, 
    ENTITY_NOT_FOUND: 406,
    INTERNAL_ERROR: 500,
}

app.use(cors());
app.use(bodyParser.json());

// Defining the connection to mariadb on localhost with sequalize
if (!connection) return;

let akcoredb = new Sequelize(
    connection.db_name,
    connection.db_username,
    connection.db_password,
    {
        host: connection.db_host,
        dialect: 'mariadb',
        logging: false,
    }    
)

// Establishing a connection with sequlalize to the mysql "sequalizedb" database
akcoredb.authenticate().then(() => {
    console.log('Connection to the database has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

const Organisation = akcoredb.define('organisation', {
    organisationId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organisationName:{
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

const Mitarbeiter = akcoredb.define('mitarbeiter', {
    mitarbeiterId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mitarbeiterName: {
        type: DataTypes.STRING
    },
    mitarbeiterEmail: {
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

// const Account = akcoredb.define('mitarbeiter', {
//     accountId:{
//         type: DataTypes.INTEGER,
//         autoIncrement: true
//     },
//     accountName:{
//         type: DataTypes.STRING
//     },
//     accountPasswort:{
//         type: DataTypes.STRING
//     },
//     accountType: {
//         type: DataTypes.STRING
//     }
// }, {
//     timestamps: false
// });

const Abteilung = akcoredb.define('abteilung', {
    abteilungId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    abteilungName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false
});


const Projekt = akcoredb.define('projekt', {
    projektId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projektName: {
        type: DataTypes.STRING
    },
    projektBeschreibung: {
        type: DataTypes.STRING
    },
    projektStartDate: {
        type: DataTypes.DATEONLY

    },
    projektEndDate: {
        type: DataTypes.DATEONLY
    },
}, {
    timestamps: false
});

const Umfrage = akcoredb.define('umfrage', {   
    umfrageId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    umfrageStartDate: {
        type: DataTypes.DATEONLY
    },
    umfrageEndDate: {
        type: DataTypes.DATEONLY
    },
    umfrageLimesurveyId: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

const ProjektTeilnahme = akcoredb.define('projektTeilnahme', {
    mitarbeiterRolle:{
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

const FuelltAus = akcoredb.define('fuelltAus', {
    mitarbeiterLimesurveyTokenId:{
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});


// Defining associations:
// Organisation 1 :: n Mitarbeiter
Organisation.hasMany(Mitarbeiter, {foreignKey: 'organisationId'});
Mitarbeiter.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Organisation 1 :: n Abteilung
Organisation.hasMany(Abteilung, {foreignKey: 'organisationId'});
Abteilung.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Abteilung 1 :: n Mitarbeiter
Abteilung.hasMany(Mitarbeiter, {foreignKey: 'abteilungId'});
Mitarbeiter.belongsTo(Abteilung, {foreignKey: 'abteilungId'});

// Organisation 1 :: n Projekt
Organisation.hasMany(Projekt, {foreignKey: 'organisationId'});
Projekt.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Projekt 1 :: n Umfrage
Projekt.hasMany(Umfrage, {foreignKey: 'projektId'});
Umfrage.belongsTo(Projekt, {foreignKey: 'projektId'});

// Projekt m :: n Mitarbeiter
Projekt.belongsToMany(Mitarbeiter, { through: ProjektTeilnahme });
Mitarbeiter.belongsToMany(Projekt, { through: ProjektTeilnahme });

// Mitarbeiter m :: n Umfrage
Mitarbeiter.belongsToMany(Umfrage, { through: FuelltAus });
Umfrage.belongsToMany(Mitarbeiter, { through: FuelltAus });

// Mitarbeiter.belongsToMany(Projekt, { through: 'nimmtTeil' })

// Create REST API endpoints
// C for Create: HTTP POST
// R for Read: HTTP GET
// U for Update: HTTP PUT
// D for Delete: HTTP DELETE

try { // encapsulate api requests in try block to catch errors 

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

app.get("/mitarbeiterAll/:organisationId", async (req, res) => {
    let organisationId = req.params.organisationId;
    console.log("GET /mitarbeiterAll/"+organisationId);

    try {
        if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
        if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);

        let mitarbeiter = await Mitarbeiter.findAll({where: { organisationId: organisationId}});
        return res.send(mitarbeiter);

    } catch (e) {
        handleError(e);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    }
});

app.post("/mitarbeiter", async (req, res) => {
    console.log("POST /mitarbeiter");

    try {
        data = req.body; // the data sent by the client in request body
        if( !data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId || !data.organisationId ) return res.sendStatus(HTTP.BAD_REQUEST); 

        await Mitarbeiter.create({ 
            mitarbeiterName: data.mitarbeiterName, 
            mitarbeiterEmail: data.mitarbeiterEmail, 
            abteilungId: data.abteilungId, 
            organisationId: data.organisationId
        });

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

            if ( mitarbeiter.abteilungId != data.abteilungId ) {
                let client = new LRPC();
                await client.openConnection();
                for (umfr of mitarbeiter.umfrages) {
                    await client.updateParticipant(umfr.umfrageLimesurveyId, umfr.fuelltAus.mitarbeiterLimesurveyTokenId, []);
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

        if (!success) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
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
                include: [Abteilung]
            }, {
                model: Umfrage
            }]
        });
        
        // const result = await Projekt.findOne({
        //     where: { projektId: projektId },
        //     include: [Mitarbeiter, Umfrage]
        // });

        if (!result) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
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

        if (!data.projektName || 
            !data.projektBeschreibung || 
            !data.projektStartDate || 
            !data.projektEndDate || 
            !data.teilnehmer || 
            !data.umfragen ) {
                console.log("bad request")
                return res.sendStatus(HTTP.BAD_REQUEST);
        }

        // create new projekt
        let projekt = await Projekt.create(data);

        // Opening a connection to LimeSurvey RPC
        client = new LRPC();
        await client.openConnection();

        let surveyIds = []; // array of created surveyIds
        // adding all umfragen to projekt
        for (u of data.umfragen) {
            await client.createSurvey(u.startDate, u.stopDate)
            .then( async surveyId => {          
                await client.activateTokens(surveyId, [1,2]);    
                surveyIds.push(surveyId); 
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);
                await projekt.addUmfrage(umfrage);
            }).catch(error => {
                throw new Error(error);
            });
        }
        // adding all teilnehmer to projekt
        for (teiln of data.teilnehmer) {
            console.log("Teilnehmer-Data:", teiln);
            let teilnId = teiln.mitarbeiterId;
            let teilnehmer = await Mitarbeiter.findOne({
                where: {mitarbeiterId: teilnId},
                include: [Abteilung]
            });
            await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } });
        }

        // get all newly created projektTeilnehmer and projektUmfragen from projekt
        projekt = await Projekt.findOne({ 
            where: {projektId: projekt.projektId},
            include: [{ 
                model: Mitarbeiter, 
                include: [Abteilung]
            }, { model: Umfrage }]
        });
        let projektTeilnehmer = projekt.mitarbeiters;
        let projektUmfragen = projekt.umfrages;       

        // adding participants to survey in limesurvey and write token id for each mitarbeiter in database
        for (let teilnehmer of projektTeilnehmer) {
            for (let umfr of projektUmfragen) {
                // adding participant to limesurvey
                let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName} ]);
                console.log("tokenid: ", limesurveyTokenId);

                // writing the limesurveyTokenId to database
                teilnehmer.addUmfrage(umfr, { through: { mitarbeiterLimesurveyTokenId: limesurveyTokenId } })

                // ProjektTeilnahme.update(
                //     { limesurveyTokenId: limesurveyTokenId }, 
                //     { where: { mitarbeiterMitarbeiterId: teilnehmer.mitarbeiterId, projektProjektId: projekt.projektId } }
                // );
            }
        }
        console.log("returning HTTP.CREATED");
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
        if (!projekt) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
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
            await client.createSurvey(u.startDate, u.stopDate)
            .then( async surveyId => {          
                await client.activateTokens(surveyId, [1,2]);    
                newSurveyIds.push(surveyId); 
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

        let allProjektTeilnehmer = [];
        projekt = await Projekt.findOne({
            where: {projektId: projekt.projektId},
            include: { 
                model: Mitarbeiter, 
                include: [Abteilung]
            }
        });
        allProjektTeilnehmer = projekt.mitarbeiters;

        // adding participants to new surveys in limesurvey
        for (let teilnehmer of allProjektTeilnehmer) {
            for (sId of newSurveyIds) {
                // adding participant to limesurvey
                let limesurveyTokenId = await client.addParticipants(sId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName} ]);
                console.log("tokenid: ", limesurveyTokenId);
                // writing the limesurveyTokenId to database
                ProjektTeilnahme.update(
                    { limesurveyTokenId: limesurveyTokenId }, 
                    { where: { mitarbeiterMitarbeiterId: teilnehmer.mitarbeiterId, projektProjektId: projekt.projektId } }
                );
            }
            // for surveys that existed before the update we add only new participants since the old ones already have been created for these surveys.
            if (newTeilnehmerMitarbeiterIds.includes(teilnehmer.mitarbeiterId))  {
                // if the mitarbeiterId of current teilnehmer is included in newTeilnehmerMitarbeiterIds -> add to all presentSurveys
                for (sId of presentSurveyIds) {
                    // adding participant to limesurvey
                    let limesurveyTokenId = await client.addParticipants(sId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName} ]);
                    console.log("tokenid: ", limesurveyTokenId);
                    // writing the limesurveyTokenId to database
                    ProjektTeilnahme.update(
                        { limesurveyTokenId: limesurveyTokenId }, 
                        { where: { mitarbeiterMitarbeiterId: teilnehmer.mitarbeiterId, projektProjektId: projekt.projektId } }
                    );
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
        if (!projekt) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
        var projektUmfragen = projekt.umfrages;
    
        client = new LRPC();
        await client.openConnection();
    
        for (umfr of projektUmfragen) {
            await client.deleteSurvey(umfr.umfrageLimesurveyId);
        }

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
        if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);

        let abteilung = await Abteilung.findAll({where: { organisationId: organisationId }, include: [Mitarbeiter]});

        return res.send(abteilung);
    } catch (e) {
        handleError(e);
        return res.status(HTTP.INTERNAL_ERROR).send(e);
    }
})

app.post("/abteilung/", async(req, res) => {
    console.log("POST /abteilung");
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

app.delete("/abteilung/:abteilungId", async (req, res)  => {  
    console.log("DELETE /abteilung");j
    try {
        // DELETE a mitarbeiter for specific mitarbeiterId
        let abteilung = await Abteilung.findOne({
            where: {abteilungId: req.params.abteilungId},
            include: [Mitarbeiter]
        });
        if (!abteilung) {
            return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
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
app.post("/verifyLogin", async (req, res) => {
    console.log("POST /verifyLogin", req.body);

    try {        
        const ACCOUNTS = [
            {type: "admin", accountName: "admin1", passwort: "passwort", organisationId: 2},
            {type: "admin", accountName: "admin2", passwort: "passwort", organisationId: 2},
            {type: "cm", accountName: "changeManager1", passwort: "passwort", organisationId: 2},
            {type: "cm", accountName: "changeManager2", passwort: "passwort", organisationId: 1},
            {type: "superadmin", accountName: "dev", passwort: "passwort", organisationId: 1}
        ]

        let data = req.body; // get data from request body
        if (!data) return res.sendStatus(HTTP.BAD_REQUEST); // if no body is present send back HTTP error

        let account;
        for (a of ACCOUNTS) { // check if there is an account matching the requested accountName
            if (a.accountName == data.accountName) account = a;
        }

        if (!account) { // if no account is found send back HTTP error
            console.log("  -> account not found.");
            return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
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

/** 
 * EXPERIMENTAL API ENDPOINTS
 */

// app.get("/lrpc/createSurvey", async (req, res) => {
//     let client = new LRPC();
//     await client.openConnection();
    
//     console.log("Connection active:", client.connectionIsActive())
//     try {
//         // await client.listSurveys();
//         // await client.listUsers();
//         // await client.addParticipants('842869', [ {"lastname":"franz","firstname":"niklas","email":"nf.app@icloud.com","attribute_1":"user", "attribute_2":"1"} ]);
//         return res.sendStatus(HTTP.OK);
//     } catch (err) {
//         console.log(err);
//         return res.sendStatus(HTTP.INTERNAL_ERROR);
//     } finally {
//         await client.closeConnection();
//     }
// })

app.get("/lrpc/listParticipants/:surveyId", async (req, res) => {
    let client;
    try {
        client = new LRPC();
        await client.openConnection();
        let result = await client.listParticipants(req.params.surveyId);
        console.log("result:", result)
        return res.send(result);
    } catch (err) {
        console.log(err);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } finally {
        await client.closeConnection();
    }
});

} catch {
    console.log(error)
}

akcoredb
    .sync({alter: true})
    .then(() => {
        app.listen(PORT, async () => {
            initLogs();
            // creating an entry that already exists in the database will result in an error, so we want to catch that error
            // this way, we only create that entries when the database is first initialized 
            try { await Organisation.findOrCreate( { where: {organisationId: 1, organisationName: "LSWI-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 2, organisationName: "Marketing-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 3, organisationName: "Informatik-Lehrstuhl" } }); } catch (error) { console.log(error); }

            // try { await Abteilung.findOrCreate( { where: { abteilungId: 1, abteilungName: "Verkauf", organisationId: 1 }}); } catch (error) { console.log(error); }
            // try { await Abteilung.findOrCreate( { where: { abteilungId: 2, abteilungName: "Lager", organisationId: 1 }}); } catch (error) { console.log(error); }
            // try { await Abteilung.findOrCreate( { where: { abteilungId: 3, abteilungName: "Management", organisationId: 1 }}); } catch (error) { console.log(error); }

            console.log('Listening on port localhost:' + PORT+ ". Apache redirects to this from /api/");
        })
    });
