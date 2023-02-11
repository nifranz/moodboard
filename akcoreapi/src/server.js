const fs = require('fs/promises')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const axios = require('axios')

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
                throw new Error("Connection already active");
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
                throw new Error("No active connection!");
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

            let data = await lrpc_req('add participant, survey ' + surveyId, 'add_participants', [this.#sessionKey, surveyId, participantData]);
            if (data.error) throw new Error (data.error);
            console.log(participantData.length, "participant(s) added for survey", surveyId);
            return (data.result[0].token);
         } catch(error) {
            console.error("Participant could not be added for survey ", surveyId);
            throw new Error(error);
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
    console.log('Connection has been established successfully.');
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
    limesurveyTokenId:{
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

// Creating associations:
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



// Mitarbeiter.belongsToMany(Projekt, { through: 'nimmtTeil' })


// Create REST API endpoints
// C for Create: HTTP POST
// R for Read: HTTP GET
// U for Update: HTTP PUT
// D for Delete: HTTP DELETE

app.get("/organisations", async (req, res) => {
    let organisations = await Organisation.findAll();
    return res.send(organisations);
});

app.get("/mitarbeiterAll/:organisationId", async (req, res) => {
    let organisationId = req.params.organisationId;
    if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
    if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);

    let mitarbeiter = await Mitarbeiter.findAll({where: { organisationId: organisationId}});
    return res.send(mitarbeiter);
});

app.post("/mitarbeiter", async (req, res) => {
    data = req.body; // the data sent by the client in request body
    console.log("incoming request: ", data);

    if( !data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId) return res.sendStatus(HTTP.BAD_REQUEST); 

    await Mitarbeiter.create({ 
        mitarbeiterName: data.mitarbeiterName, 
        mitarbeiterEmail: data.mitarbeiterEmail, 
        abteilungId: data.abteilungId, 
        organisationId: data.organisationId
    });

    return res.sendStatus(HTTP.CREATED);
});

app.put("/mitarbeiter", async (req, res) => {
    // update a mitarbeiter at specific mitarbeiterId
    data = req.body; // the data sent by the client in request body

    if(!data.mitarbeiterName || !data.mitarbeiterEmail || !data.mitarbeiterAbteilung) return res.sendStatus(HTTP.BAD_REQUEST);

    await Mitarbeiter.update({ 
        mitarbeiterName: data.mitarbeiterName, 
        mitarbeiterEmail: data.mitarbeiterEmail, 
        mitarbeiterAbteilung: data.mitarbeiterAbteilung 
    }, { where: { mitarbeiterId: data.mitarbeiterId } })
    .then(result => {
        return res.sendStatus(HTTP.CREATED);
    })
    .catch(result => {
        return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
    })
});

app.delete("/mitarbeiter/:mitarbeiterId", async (req, res)  => {    
    // DELETE a mitarbeiter for specific mitarbeiterId
    let success = await Mitarbeiter.destroy({
        where: {mitarbeiterId: req.params.mitarbeiterId}
    });

    if (!success) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
    return res.sendStatus(HTTP.OK);
});

app.get("/projekte/:organisationId", async (req, res) => {
    // READ all projekte for specific organisationId
    let organisationId = req.params.organisationId;

    if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
    
    let projekte = await Projekt.findAll({
        where: { organisationId: organisationId }, 
        include: [Mitarbeiter, Umfrage]
    });

    return res.send(projekte);
});

app.post("/projekt", async (req, res) => {
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
    
        var projekt = await Projekt.create(data);

        // Opening a connection to LimeSurvey RPC
        var client = new LRPC();
        await client.openConnection();

        var surveyIds = []; // array of created surveyIds
        for (u of data.umfragen) {
            await client.createSurvey(u.startDate, u.stopDate)
            .then( async surveyId => {          
                await client.activateTokens(surveyId, [1,2]);    
                surveyIds.push(surveyId); 
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);;
                await projekt.addUmfrage(umfrage);
            }).catch(error => {
                throw new Error(error);
            });
        }
        let projektTeilnehmer = [];
        for (teiln of data.teilnehmer) {
            console.log("Teilnehmer-Data:", teiln);
            let teilnId = teiln.mitarbeiterId;
            let teilnehmer = await Mitarbeiter.findOne({
                where: {mitarbeiterId: teilnId},
                include: [Abteilung]
            });
            await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } });
            
            projekt = await Projekt.findOne({
                where: {projektId: projekt.projektId},
                include: { 
                    model: Mitarbeiter, 
                    include: [Abteilung]
                }
            });
            projektTeilnehmer = projekt.mitarbeiters;
        }

        // adding participants to survey in limesurvey
        for (let teilnehmer of projektTeilnehmer) {
            for (sId of surveyIds) {
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
        console.log("returning HTTP.CREATED");
        return res.sendStatus(HTTP.CREATED); 
    } 
    catch (error) {
        if (client) client.closeConnection();
        console.log(error);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } 
    finally {
        if (client) await client.closeConnection();
    }
});

app.get("/projekt/:projektId", async(req, res) => {
    try {
        var projektId = req.params.projektId;
    } catch (e) {
        return res.sendStatus(HTTP.BAD_REQUEST);
    }

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
})

app.get("/abteilungen/:organisationId", async(req, res) => {
    let organisationId = req.params.organisationId;
    if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
    if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);

    let abteilung = await Abteilung.findAll({where: { organisationId: organisationId }});

    return res.send(abteilung);
}) 

app.get("/lrpc/createSurvey", async (req, res) => {
    let client = new LRPC();
    await client.openConnection();
    
    console.log("Connection active:", client.connectionIsActive())
    try {
        // await client.listSurveys();
        // await client.listUsers();
        // await client.addParticipants('842869', [ {"lastname":"franz","firstname":"niklas","email":"nf.app@icloud.com","attribute_1":"user", "attribute_2":"1"} ]);
        return res.sendStatus(HTTP.OK);
    } catch (err) {
        console.log(err);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } finally {
        await client.closeConnection();
    }
})

akcoredb
    .sync({ alter: true })
    .then(() => {
        app.listen(PORT, async () => {
             // creating an entry that already exists in the database will result in an error, so we want to catch that error
            // this way, we only create that entries when the database is first initialized 
            try { await Organisation.findOrCreate( { where: {organisationId: 1, organisationName: "LSWI-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 2, organisationName: "Marketing-Lehrstuhl" } }); } catch (error) { console.log(error); }
            try { await Organisation.findOrCreate( { where: {organisationId: 3, organisationName: "Informatik-Lehrstuhl" } }); } catch (error) { console.log(error); }

            try { await Abteilung.findOrCreate( { where: { abteilungId: 1, abteilungName: "Verkauf", organisationId: 1 }}); } catch (error) { console.log(error); }
            try { await Abteilung.findOrCreate( { where: { abteilungId: 2, abteilungName: "Lager", organisationId: 1 }}); } catch (error) { console.log(error); }
            try { await Abteilung.findOrCreate( { where: { abteilungId: 3, abteilungName: "Management", organisationId: 1 }}); } catch (error) { console.log(error); }

            console.log('listening to PORT localhost:' + PORT)
        })
    })



