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
    console.log("Response: ", response.data);
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
            console.log(error);
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
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('activate tokens, survey ' + surveyId, 'activate_tokens', [this.#sessionKey, surveyId, attributeData]);
            if (data.error) throw new Error (data.error);
            console.log("Participant added!");
         } catch(error) {
            console.error(error);
         }
    }

    async addParticipants(surveyId, participantData) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }

            let data = await lrpc_req('add participant, survey ' + surveyId, 'add_participants', [this.#sessionKey, surveyId, participantData]);
            if (data.error) throw new Error (data.error);
            console.log("Participant added!");

         } catch(error) {
            console.error(error);
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

// app.listen(PORT, () => {
//     console.log("Example app listening on PORT " + PORT);
// });

app.use(cors());
app.use(bodyParser.json());

{
/*// define sqlitedb with sequelize
let sqlitedb = new Sequelize({
    dialect: 'sqlite',
    storage: './db/test.sqlite'
});

// define sqliteMitarbeiter model
let sqliteMitarbeiter = sqlitedb.define('sqliteMitarbeiter', {
    mitarbeiterId: Sequelize.STRING,
    mitarbeiterName: Sequelize.STRING,
    mitarbeiterEmail: Sequelize.STRING,
    mitarbeiterRolle: Sequelize.STRING
});

// Initialize finale
finale.initialize({
    app: app,
    sequelize: sqlitedb
});

// Create the dynamic REST resource for our model
let userResource = finale.resource({
    model: sqliteMitarbeiter,
    endpoints: ['/mitarbeiter', '/mitarbeiter/:id']
});

// Resets the database and launches the express app on :8081

sqlitedb
  .sync({ force: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log('listening to PORT localhost:'+ PORT)
    })
  })
  */
} 

// Defining the connection to mariadb on localhost with sequalize
if (!connection) return;

let akcoredb = new Sequelize(
    connection.db_name,
    connection.db_username,
    connection.db_password,
    {
        host: connection.db_host,
        dialect: 'mariadb'
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
    mitarbeiterRolle: {
        type: DataTypes.STRING
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
    projektIsDraft: {
        type: DataTypes.BOOLEAN
    }
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
    projektId: {
        type: DataTypes.INTEGER,
        references: {
            model: Projekt,
            key: 'projektId'
        }
    },
    mitarbeiterId: {
        type: DataTypes.INTEGER,
        references: {
            model: Mitarbeiter,
            key: 'mitarbeiterId'
        }
    },
    mitarbeiterRolle:{
        type: DataTypes.STRING
    },
    mitarbeiterAbteilung: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

Organisation.hasMany(Mitarbeiter, {foreignKey: 'organisationId'});
Mitarbeiter.belongsTo(Organisation, {foreignKey: 'organisationId'});

Organisation.hasMany(Projekt, {foreignKey: 'organisationId'});
Projekt.belongsTo(Organisation, {foreignKey: 'organisationId'});

Projekt.hasMany(Umfrage, {foreignKey: 'projektId'});
Umfrage.belongsTo(Projekt, {foreignKey: 'projektId'});

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
    let organisationId= req.params.organisationId;
    if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
    if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);

    let mitarbeiter = await Mitarbeiter.findAll({where: { organisationId: organisationId}});

    return res.send(mitarbeiter);
});

app.post("/mitarbeiter", async (req, res) => {
    data = req.body; // the data sent by the client in request body

    if(!data.mitarbeiterName || !data.mitarbeiterEmail || !data.mitarbeiterRolle) return res.status(HTTP.BAD_REQUEST); 

    await Mitarbeiter.create({mitarbeiterName: data.mitarbeiterName, mitarbeiterEmail: data.mitarbeiterEmail, mitarbeiterRolle: data.mitarbeiterRolle, organisationId: data.organisationId});

    return res.sendStatus(HTTP.CREATED);
});

app.put("/mitarbeiter", async (req, res) => {
    // update a mitarbeiter at specific mitarbeiterId
    data = req.body; // the data sent by the client in request body

    if(!data.mitarbeiterName || !data.mitarbeiterEmail || !data.mitarbeiterRolle) return res.sendStatus(HTTP.BAD_REQUEST);

    await Mitarbeiter.update(
        { mitarbeiterName: data.mitarbeiterName, mitarbeiterEmail: data.mitarbeiterEmail, mitarbeiterRolle: data.mitarbeiterRolle },
        { where: { mitarbeiterId: data.mitarbeiterId } }
    ).then(result => {
        return res.sendStatus(HTTP.CREATED);
    }).catch(result => {
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
            !data.teilnehmerIds || 
            !data.umfragen ||
            !data.umfragen.umfrageStartDate ||
            !data.umfragen.umfrageEndDate) {
                return res.sendStatus(HTTP.BAD_REQUEST);
        }

        const projekt = await Projekt.create(data);

        // Opening a connection to LimeSurvey RPC
        var client = new LRPC();
        await client.openConnection();

        var surveyIds = []; // array of created surveyIds
        for (u of data.umfragen) {
            await client.createSurvey(u.startDate, u.stopDate)
            .then(async surveyId => {          
                await client.activateTokens(surveyId, ["Rolle", "Abteilung"]);    
                surveyIds.push(surveyId); 
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);
                await projekt.addUmfrage(umfrage);
            }).catch(error => {
                throw new Error(error);
            });
        }

        var allTeilnehmer = [];
        for (tId of data.teilnehmerIds) {
            let teilnehmer = await Mitarbeiter.findOne({
                where: {mitarbeiterId: tId}
            });
            for (sId of surveyIds) {
                console.log("adding participant: ", teilnehmer);
                await client.addParticipants(sId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.mitarbeiterRolle, "attribute_2":"TBD"} ]);
            }
            await projekt.addMitarbeiter(teilnehmer);
            allTeilnehmer.push(teilnehmer);
        }
        // data.teilnehmerIds.forEach( async tId => {
        //     // getting the teilnemer by the teilnehmerId from Mitarbeiter-Model and adding it the the projekt
        //     let teilnehmer = await Mitarbeiter.findOne({
        //         where: {mitarbeiterId: tId}
        //     });
        //     await projekt.addMitarbeiter(teilnehmer);
        //     allTeilnehmer.push(teilnehmer);
        // });
        return res.sendStatus(HTTP.CREATED); 
    } 
    catch (error) {
        if (client) client.closeConnection();
        console.log(error);
        return res.sendStatus(HTTP.INTERNAL_ERROR);
    } 
    finally {
        console.log("closing connection");
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
        where: { projektId: projektId },
        include: [Mitarbeiter, Umfrage]
    });

    if (!result) return res.sendStatus(HTTP.ENTITY_NOT_FOUND);
    return res.send(result);
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

            console.log('listening to PORT localhost:' + PORT)
        })
    })



