const fs = require('fs/promises')
const fssync = require('fs')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const { Sequelize, DataTypes } = require('sequelize')
const axios = require('axios')
const {exec} = require('child_process')
const uuid = require('uuid')
// const morgan = require('morgan')
const connection = require('./connection')
const replace = require('replace-in-file')
const { Client } = require('@elastic/elasticsearch')
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


const LIME_RPC_URL = 'http://bolarus.wi.uni-potsdam.de/index.php/admin/remotecontrol/';
const LRPC_LOGGING = true;
const ERROR_LOG_PATH = __dirname + "/../logs/error.log"
const LRPC_LOG_PATH = __dirname + "/../logs/lrpc.log"

function initLogs() {
    return;
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    
    fs.writeFile(ERROR_LOG_PATH, timeString + "Server has been started", function(){})
}

class SurveyFile {
    constructor(umfrageStartDate, umfrageEndDate, adminName, adminEmail, umfrageTitel, umfrageBeschreibung) {
        this.umfrageStartDate = umfrageStartDate;
        this.umfrageEndDate = umfrageEndDate;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.umfrageTitel = umfrageTitel;
        this.umfrageBeschreibung = umfrageBeschreibung;

        this.filePath = __dirname + "/../assets/limesurvey/tmp." + uuid.v4() + "_survey-import-file_" + ".lss";
        this.created = false;
    }

    async createFile() {
        if (this.created) throw new Error("File has already been created!");
        let sourceSurveyFilePath = __dirname + '/../assets/limesurvey/base_survey_2.lss'
        let sourceSurveyFile = await fs.readFile(sourceSurveyFilePath, { encoding: 'UTF-8' });
        if(!sourceSurveyFile) throw new Error("Some error reading the file");

        // create new temporary import lss-file
        
        await fs.writeFile(this.filePath, sourceSurveyFile, function(){}) 

        // replacing survey properties in temporary file
        let replacements = {
            "replaceStartDate": {
                files: this.filePath,
                from: /<startdate>.*<\/startdate>/,
                to: "<startdate><![CDATA["+ this.umfrageStartDate + " 00:00:00" +"]]></startdate>",
            },
            "replaceEndDate": {
                files: this.filePath,
                from: /<expires>.*<\/expires>/,
                to: "<expires><![CDATA["+ this.umfrageEndDate + " 23:59:59" +"]]></expires>",
            },
            "replaceAdminName": {
                files: this.filePath,
                from: /<admin>.*<\/admin>/,
                to: "<admin><![CDATA["+ this.adminName +"]]></admin>",
            },
            "replaceAdminEmail": {
                files: this.filePath,
                from: /<adminemail>.*<\/adminemail>/,
                to: "<adminemail><![CDATA["+ this.adminEmail +"]]></adminemail>",
            },
            "replaceUmfrageTitel": {
                files: this.filePath,
                from: /<surveyls_title>.*<\/surveyls_title>/,
                to: "<surveyls_title><![CDATA["+ "Stimmungsbarometer für Projekt " + this.umfrageTitel +"]]></surveyls_title>",
            },
            "replaceUmfrageBeschreibung": {
                files: this.filePath,
                from: /<surveyls_description>.*<\/surveyls_description>/,
                to: "<surveyls_description><![CDATA["+ this.umfrageBeschreibung +"]]></surveyls_description>",
            }
        }
        for (let replacement of Object.values(replacements)) {
            console.log(replacement.files);
            await replace(replacement);
        }

        this.created = true;
    }

    getPathToFile() {
        if (this.destroyed || !this.created) return console.log("No file has been created or it has already been destroyed.");
        return this.filePath;
    }

    async destroyFile() {
        if (!this.created) {
            throw new Error("No file has been created yet. No file was destroyed.");
        }
        if (this.destroyed) {
            throw new Error("File has already been destroyed");
        }
        await fs.unlink(this.filePath);
        this.destroyed = true;
    }
}


function getToday() {
    let d = new Date;
    let month = d.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    } 
    return '' + `${d.getFullYear()}-${month}-${d.getDate()}`
}

function handleError(error) {
    console.log(error);
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    fs.appendFile(ERROR_LOG_PATH, timeString + error + "\r\n", (error) => {});
}

function logLRPC(id, response) {
    if (!LRPC_LOGGING) return;
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    message = "LRPC-Response for '" + id + "' :: result: " + JSON.stringify(response.result) + " :: error " + JSON.stringify(response.error)
    console.log(message)
    fs.appendFile(LRPC_LOG_PATH, timeString + message + "\r\n", (error) => {});
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
    logLRPC(id, response.data)
    return response.data;
}

class ESAPI {
    #apiKey = 'eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ==';
    #esNode = 'https://localhost:9200';
    #client;

    constructor() {
        this.#client = new Client({
            node: this.#esNode,
            auth: {
              apiKey: this.#apiKey
            },
            tls: {
                ca: fssync.readFileSync(__dirname+'/../pipeline/http_ca.crt'),
                rejectUnauthorized: false
              }
        });
    }
    // async #apiHTTPRequest(method, route, data) {
    //     let retdata;
    //     await axios.request({
    //         method: method,
    //         url: 'http://localhost:5601/kibana/' + route,
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'kbn-xsrf': 'true',
    //             'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
    //         },
    //         data: data,
    //     }).then(function (response) {
    //         console.log(response.data);
    //         retdata = response.data;
    //     })
    //     .catch(function (error) {
    //         console.error(error);
    //     });
    //     return retdata;
    // }   

    // async addParticipantResponse(projektId, participantTokenId, index, document) {
    //     await this.#client.index({
    //         index: 'akcore_'+projektId+'_'+index,
    //         id:participantTokenId,
    //         refresh: true,
    //         document: {
    //             "SuveryID": 99,
    //             "Department": "Zentrallogistik",
    //             "ParticipantID": 1,
    //             "Role": "Key-User",
    //             "PartParticipant": "yes"
    //           }
    //       })
    // }

    //create responses index
    async createProjektIndices(projektId) {
        await this.#client.indices.create({
            "index": "akcore_"+projektId+"_responses",
            "mappings": {
              "_meta": {
                "created_by": "file-data-visualizer"
              },
              "properties": {
                "AvgA1": {
                  "type": "double"
                },
                "AvgA3": {
                  "type": "double"
                },
                "AvgAll": {
                  "type": "double"
                },
                "Complete": {
                  "type": "keyword"
                },
                "DateSent": {
                  "type": "date",
                  "format": "iso8601"
                },
                "Department": {
                  "type": "keyword"
                },
                "Duration": {
                  "type": "long"
                },
                "M1": {
                  "type": "keyword"
                },
                "MO1": {
                  "type": "keyword"
                },
                "MQ1": {
                  "type": "long"
                },
                "O1": {
                  "type": "keyword"
                },
                "O2": {
                  "type": "keyword"
                },
                "O3": {
                  "type": "keyword"
                },
                "O4": {
                  "type": "keyword"
                },
                "PartParticipant": {
                  "type": "keyword"
                },
                "ParticipantID": {
                  "type": "long"
                },
                "Q1": {
                  "type": "long"
                },
                "Q10": {
                  "type": "long"
                },
                "Q2": {
                  "type": "long"
                },
                "Q3": {
                  "type": "long"
                },
                "Q4": {
                  "type": "long"
                },
                "Q5": {
                  "type": "long"
                },
                "Q6": {
                  "type": "long"
                },
                "Q7": {
                  "type": "long"
                },
                "Q8": {
                  "type": "long"
                },
                "Q9": {
                  "type": "long"
                },
                "R1": {
                  "type": "long"
                },
                "R2": {
                  "type": "long"
                },
                "R3": {
                  "type": "long"
                },
                "Role": {
                  "type": "keyword"
                },
                "SurveyID": {
                  "type": "long"
                },
                "column1": {
                  "type": "long"
                }
              }
            }
          })
          //create pie index
          await this.#client.indices.create({
            "index": "akcore_"+projektId+"_pie",
            "mappings": {
                "_meta": {
                  "created_by": "file-data-visualizer"
                },
                "properties": {
                  "Department": {
                    "type": "keyword"
                  },
                  "ParticipantID": {
                    "type": "long"
                  },
                  "Percent": {
                    "type": "long"
                  },
                  "Role": {
                    "type": "keyword"
                  },
                  "Rx": {
                    "type": "long"
                  },
                  "SurveyID": {
                    "type": "long"
                  }
                }
              }
          })
          // create count index
          await this.#client.indices.create({
            "index": "akcore_"+projektId+"_count",
            "mappings": {
                "_meta": {
                  "created_by": "file-data-visualizer"
                },
                "properties": {
                  "Category": {
                    "type": "long"
                  },
                  "CountA1": {
                    "type": "long"
                  },
                  "CountA3": {
                    "type": "long"
                  },
                  "CountAll": {
                    "type": "long"
                  },
                  "Department": {
                    "type": "keyword"
                  },
                  "Role": {
                    "type": "keyword"
                  },
                  "SurveyID": {
                    "type": "long"
                  }
                }
              }
            })
    }
    
    async getIndex() {
        let result = await this.#client.search({
            index: 'akcore-projekt_01_umfr_01_responses',
            query: {
              match: {
                SuveryID: 99
              }
            }
          })
        
        console.log(result.hits.hits)
    }

    async setIndexReadOnly(index) {
        const indexName ="akcore_dev_"+index;
        const settings = {
            index: {
                blocks: {
                    read_only: false
                }
            }
        };
        await this.#client.indices.putSettings({ "index": indexName, body: settings });
    }

    // async copyIndecesToProjektSpace(projektId) {
    //     await this.#client.indices.clone({
    //         "index": 'akcore_dev_responses',
    //         "target": 'akcore_'+projektId+"_responses"
    //     });
    //     await this.#client.indices.clone({
    //         "index": 'akcore_dev_count',
    //         "target": 'akcore_'+projektId+"_count"
    //     });
    //     await this.#client.indices.clone({
    //         "index": 'akcore_dev_pie',
    //         "target": 'akcore_'+projektId+"_pie"
    //     });
    // }
}

/**
 * @class Class representing a communication interface to the LimeSurvey RPC API 
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

    isActive() {
        console.log(this.#sessionKey);
        return this.#activeConnection;

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
    async createSurvey(surveyFilePath) {
        return new Promise(async (resolve, reject)  => {
            try {
                if (!this.#activeConnection) {
                    throw new Error("No active connection! Establish a connection first by calling openConnection()!");
                }    

                var surveyFile = await fs.readFile(surveyFilePath, { encoding: 'base64' });
                if(!surveyFile) throw new Error("Some error reading the file");
    
                let data = await lrpc_req('import_survey', 'import_survey', [this.#sessionKey, surveyFile, 'lss']);
                if (data.error) throw new Error (data.error);
                let surveyId = data.result;
                // console.log("Survey created! SurveyId: " + surveyId);
                resolve(surveyId);
             } catch(error) {
                reject(error);
             }
        })
    }
    
    async activateSurvey(surveyId) {
        console.log("activate");
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('activate survey, survey ' + surveyId, 'activate_survey', [this.#sessionKey, surveyId]);
            if (data.error) throw new Error (data.error);
            // console.log("Survey activated; sid:", surveyId);
         } catch(error) {
            // console.error("Survey could not be activated; sid:", surveyId);
            throw new Error(error);
         }
    }

    async mailRegisteredParticipants(surveyId) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('invite participants, survey ' + surveyId, 'mail_registered_participants', [this.#sessionKey, surveyId, [/*use default conditions*/]]);
            if (data.error) throw new Error (data.error);
            // console.log("Participant Table initialized for survey ", surveyId);
         } catch(error) {
            // console.error("Participant Table could not be initialized for survey ", surveyId);
            throw new Error(error);
         }
    }

    async mailRegisteredParticipant(surveyId, participantToken) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('invite participants, survey ' + surveyId, 'mail_registered_participants', [this.#sessionKey, surveyId, participantToken]);
            if (data.error) throw new Error (data.error);
            // console.log("Participant Table initialized for survey ", surveyId);
         } catch(error) {
            // console.error("Participant Table could not be initialized for survey ", surveyId);
            throw new Error(error);
         }
    }

    async inviteParticipants(surveyId, participantTokens, pendingOnly) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('invite participants, survey ' + surveyId, 'invite_participants', [this.#sessionKey, surveyId, participantTokens, pendingOnly]);
            if (data.error) throw new Error (data.error);
            // console.log("participants invited ", surveyId);
         } catch(error) {
            // console.error("Participants not invited ", surveyId);
            throw new Error(error);
         }
    }

    async remindParticipants(surveyId) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('remind participants, survey ' + surveyId, 'remind_participants', [this.#sessionKey, surveyId]);
            if (data.error) throw new Error (data.error);
            // console.log("participants invited ", surveyId);
         } catch(error) {
            // console.error("Participants not invited ", surveyId);
            throw new Error(error);
         }
    }

    async activateTokens(surveyId, attributeData) {
        console.log("attribute-data:", attributeData);
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }
            let data = await lrpc_req('activate tokens, survey ' + surveyId, 'activate_tokens', [this.#sessionKey, surveyId/*, attributeData*/]);
            if (data.error) throw new Error (data.error);
            // console.log("Participant Table initialized for survey ", surveyId);
         } catch(error) {
            // console.error("Participant Table could not be initialized for survey ", surveyId);
            throw new Error(error);
         }
    }

    async addParticipants(surveyId, participantData) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }

            var data = await lrpc_req('add participant, survey ' + surveyId, 'add_participants', [this.#sessionKey, surveyId, participantData]); // not adding participant data. no longer used, since pipeline adds this to the data.
            if (data.error) throw new Error (data.error);
            // console.log(participantData.length, "participant(s) added for survey", surveyId);
            return (data.result[0].token);
         } catch(error) {
            console.error(data)
            // console.error("Participant could not be added for survey ", surveyId);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
              console.log(error.config);
         }
    }

    async deleteSurvey(surveyId) {
        console.log("deleting");
        if(!surveyId) return "No surveyId specified."
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

    async updateParticipant(surveyId, participantToken, participantData) {
        try {
            if (!this.#activeConnection) {
                throw new Error("No active connection! Establish a connection first by calling openConnection()!");
            }

            var data = await lrpc_req('set_participant_properties, survey ' + surveyId, 'set_participant_properties', [this.#sessionKey, surveyId, participantToken, participantData]); // not adding participant data. no longer used, since pipeline adds this to the data.
            if (data.error) throw new Error (data.error);
            // console.log(participantData.length, "participant(s) added for survey", surveyId);
            return (data.result[0].token);
         } catch(error) {
            console.error(data)
            // console.error("Participant could not be added for survey ", surveyId);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
        }
    }

    // async updateParticipant(surveyId, participantToken, attributeData) {
    //     try {
    //         if (!this.#activeConnection) {
    //             throw new Error("No active connection! Establish a connection first by calling openConnection()!");
    //         }
    //         let data = await lrpc_req('set_participant_properties, survey '+surveyId, 'set_participant_properties', [this.#sessionKey, surveyId, participantToken, attributeData]);
    //         if (data.error) 
    //         console.log(data.result);
    //         console.log(surveyId)
    //         return(data.result);
            
    //     } catch (error) {
    //         console.log(error);
    //         console.log(surveyId)
    //     }

    // }

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
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
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
    projektId: {
        type: DataTypes.INTEGER
    }
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
        if(!(await Organisation.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.NOT_FOUND);

        let mitarbeiter = await Mitarbeiter.findAll({where: { organisationId: organisationId}, include: [Umfrage, Projekt]});
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
        
        // const result = await Projekt.findOne({
        //     where: { projektId: projektId },
        //     include: [Mitarbeiter, Umfrage]
        // });

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
        console.log(client.isActive());

        // let surveyIds = []; // array of created surveyIds
        // adding all umfragen to projekt
        for (u of data.umfragen) {
            let surveyFile = new SurveyFile(u.umfrageStartDate, u.umfrageEndDate, "AK Core Admin", "nifranz@uni-potsdam.de", projekt.projektName, projekt.projektBeschreibung);
            await surveyFile.createFile(); // creating the file in fs
            await client.createSurvey(surveyFile.getPathToFile())
            .then( async surveyId => {     
                await client.activateSurvey(surveyId);     
                await client.activateTokens(surveyId, [1,2]);                
                // surveyIds.push(surveyId); 
                u.umfrageLimesurveyId = surveyId;
                let umfrage = await Umfrage.create(u);
                await projekt.addUmfrage(umfrage);
            }).catch(error => {
                handleError(error);
            });
            surveyFile.destroyFile();
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
                let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":"", "firstname":teilnehmer.mitarbeiterName, "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
                console.log("tokenid: ", limesurveyTokenId);

                // writing the limesurveyTokenId to database
                teilnehmer.addUmfrage(umfr, { 
                    through: { 
                        mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                        projektId: projekt.projektId 
                    } 
                })

                // ProjektTeilnahme.update(
                //     { limesurveyTokenId: limesurveyTokenId }, 
                //     { where: { mitarbeiterMitarbeiterId: teilnehmer.mitarbeiterId, projektProjektId: projekt.projektId } }
                // );
            }
        }
        // create kibana spaces and indices

        let esClient = new ESAPI();
        await createKibanaSpace(projekt.projektId, projekt.projektName);
        await esClient.createProjektIndices(projekt.projektId);

        console.log("   -> Creating Project successfull");
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


        // console.log(projekt)
        console.log(newSurveyIds);

        for (let teilnehmer of allProjektTeilnehmer) {
            for (let umfr of allProjektUmfragen) {
                console.log( newSurveyIds.includes(umfr.umfrageLimesurveyId) )
                if (newSurveyIds.includes(umfr.umfrageLimesurveyId)) { // add all teilnehmer to new surveys only
                    // adding all participants to limesurvey
                    let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":teilnehmer.mitarbeiterName.split(" ")[1] || "","firstname":teilnehmer.mitarbeiterName.split(" ")[0], "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
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
        await deleteKibanaSpace(projekt.projektId);

        // delete related kibana indices


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

app.get("/testInv/:surveyId", async(req,res) => {
    if (req.params.surveyId == "none") {
        var surveyId = 161788;
    } else {
        var surveyId = req.params.surveyId;
    }
    
    let client = new LRPC();
    await client.openConnection();
    await client.remindParticipants(surveyId);
    // await client.inviteParticipants(surveyId, ["tid = E6UMoIta0zkTMcO"], false);
    await client.mailRegisteredParticipants(surveyId);
    await client.closeConnection();
    return res.sendStatus(HTTP.OK);
});

app.get("/triggerPipe/:surveyId/:tokenId/:answerId", async(req, res) => {    
    let surveyId = req.params.surveyId;
    let tokenId = req.params.tokenId;
    let answerId = req.params.answerId;
    console.log("GET /triggerPipe/"+surveyId+"/"+tokenId+"/"+answerId);

    // get mitarbeiter data for pipeline ingestion
    let umfrage = await Umfrage.findOne({
        where: { umfrageLimesurveyId: surveyId },
    });
    if (!umfrage) return res.sendStatus(HTTP.NOT_FOUND);
    let projekt = await Projekt.findOne({
        where: { projektId: umfrage.projektId },
        include: { 
            model: Mitarbeiter,
            include: [{
                model: Umfrage,
                where: { umfrageId: umfrage.umfrageId }
            }, Abteilung]
         }
    });
    if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
    let projektMitarbeiter = projekt.mitarbeiters;
    let mitarbeiterData = {}
    for (let ma of projektMitarbeiter) {
        mitarbeiterData[ma.umfrages[0].fuelltAus.mitarbeiterLimesurveyTokenId] = { "rolle": ma.projektTeilnahme.mitarbeiterRolle, "abteilung": ma.abteilung.abteilungName };
    }
    let surveyData = {"surveyId": surveyId, "surveyStartDate": umfrage.umfrageStartDate, "surveyEndDate": umfrage.umfrageEndDate}
    let json = { "surveyData": surveyData, "teilnehmerData": mitarbeiterData };

    // create a jsonfile to read from python script with "json" variable as file content
    let filePath = __dirname + "/../pipeline/tmp." + uuid.v4() + "_survey_" + surveyId + "_mitarbeiter-data.json"
    await fs.writeFile(filePath, JSON.stringify(json), function(){})
    console.log("ya")

    exec(`python3 ${__dirname}/../pipeline/pipe.py ${filePath} `, async (error, stdout, stderr) => {
        if (error) {
            console.log('error:', error.message);
            await fs.unlink(filePath);
            return res.sendStatus(HTTP.INTERNAL_ERROR);
        }
        console.log("###########################\nExecuting python script...")
        if (stderr) {            
            console.log('stderr:', stderr);
            await fs.unlink(filePath);
            return res.sendStatus(HTTP.INTERNAL_ERROR);
        }
        console.log("stdout:", stdout);
        console.log("Done!\n###########################")
        await fs.unlink(filePath); // deleting the file after use
        return res.sendStatus(HTTP.OK);
    })
});

/** 
 * EXPERIMENTAL API ENDPOINTS
 */
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

app.get("/readSurvey/:surveyId", async (req, res) => {
    let surveyId = req.params.surveyId;
    console.log("GET /readSurvey/:surveyId")
    try {
        var surveyBaseFile = await fs.readFile(__dirname + '/../assets/limesurvey/base_survey_2.lss', { encoding: 'UTF-8' });
        if(!surveyBaseFile) throw new Error("Some error reading the file");

        // create new temporary import lss-file
        let filePath = __dirname + "/../assets/limesurvey/tmp." + uuid.v4() + "_survey-import-file_sid-" + surveyId + ".lss"
        await fs.writeFile(filePath, surveyBaseFile, function(){}) 

        // replacing survey properties in temporary file
        let umfrageStartDate = "23-02-20";
        let umfrageEndDate = "23-02-27";
        let adminName = "AK-Core Admin ye"
        let adminEmail = "nifranz@uni-potsdam.de ye"
        let umfrageTitel = "Stimmungsbarometer yx"
        let umfrageBeschreibung = "Beschreibung lets go"

        let replacements = {
            "replaceStartDate": {
                files: filePath,
                from: /<startdate>.*<\/startdate>/,
                to: "<startdate><![CDATA["+ umfrageStartDate + " 00:00:00" +"]]></startdate>",
            },
            "replaceEndDate": {
                files: filePath,
                from: /<expires>.*<\/expires>/,
                to: "<expires><![CDATA["+ umfrageEndDate + " 23:59:59" +"]]></expires>",
            },
            "replaceAdminName": {
                files: filePath,
                from: /<admin>.*<\/admin>/,
                to: "<admin><![CDATA["+ adminName +"]]></admin>",
            },
            "replaceAdminEmail": {
                files: filePath,
                from: /<adminemail>.*<\/adminemail>/,
                to: "<adminemail><![CDATA["+ adminEmail +"]]></adminemail>",
            },
            "replaceUmfrageTitel": {
                files: filePath,
                from: /<surveyls_title>.*<\/surveyls_title>/,
                to: "<surveyls_title><![CDATA["+ umfrageTitel +"]]></surveyls_title>",
            },
            "replaceUmfrageBeschreibung": {
                files: filePath,
                from: /<surveyls_description>.*<\/surveyls_description>/,
                to: "<surveyls_description><![CDATA["+ umfrageBeschreibung +"]]></surveyls_description>",
            }
        }
        for (let replacement of Object.values(replacements)) {
            await replace(replacement);
        }

        await fs.unlink(filePath); // deleting temporary file
        return res.sendStatus(HTTP.OK);        

    } catch (e) {
        console.error(e)
        res.sendStatus(HTTP.INTERNAL_ERROR);
    }
});

app.get("/kibanaApiCall/:method", async (req, res) => {
    const response = await axios.get("http://localhost:5601/kibana/api/"+req.params.method, {
        headers: {
        'Content-Type': 'application/json',
        'kbn-xsrf': 'true',
        'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
    });
    console.log(response.data.error);
    console.log(response.data)
    return res.sendStatus(HTTP.OK);
});

app.get("/kibanaApiCallDev", async (req, res) => {
    axios.request({
        method: 'GET',
        url: 'http://localhost:5601/kibana/api/spaces/space',
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
         data: {
                "id": "source",
                "name": "sourcespace",
         }
    }).then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.error(error);
    });
    return res.sendStatus(HTTP.OK);
});

async function deleteKibanaSpace(projektId) {
    await axios.request({
        method: 'DELETE',
        url: 'http://localhost:5601/kibana/api/spaces/space/'+projektId,
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        }
    }).then(function (response) {
        console.log(response.data);
    })
    .catch(function (error) {
        console.error(error);
        return null;
    });
}

app.get("/kibDeleteSpace", async (req, res) => {
    await deleteKibanaSpace("projekt0123");
    res.sendStatus(HTTP.OK);
})

async function createKibanaSpace(projektId, projektName) {
    projektId = projektId + "";
    // let projId = "proj1";
    // let projektName = "ERP System"
    let log = false;

    // creating new kibana space
    await axios.request({
        method: 'POST',
        url: 'http://localhost:5601/kibana/api/spaces/space',
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
         data: {
                "id": projektId+"",
                "name": projektName,
         }
    }).then(function (response) {
        if (log) console.log(response.data);
    })
    .catch(function (error) {
        console.error(error);
        return null;
    });

    // setting moodboard object for reference in kibana
    let moodboardSourceObject = {
        id: '66a487c9-6517-445b-85be-f37890b62af2',
        type: 'dashboard'
    }

    // copying moodboard object form kibana space "source" to new projekt space
    await axios.request({
        method: 'POST',
        url: 'http://localhost:5601/kibana/s/source/api/spaces/_copy_saved_objects',
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
         data: {
            spaces: [projektId],
            objects: [moodboardSourceObject],
            includeReferences: true
         }
    }).then(function (response) {
        if (log) console.log(response.data[projektId]);
    })
    .catch(function (error) {
        console.error(error);
        return null;
    });

    // get dataview id of the projekt-dataview used for the moodboard in the new space
    let dataviewId;
    await axios.request({
        method: 'GET',
        url: 'http://localhost:5601/kibana/s/'+projektId+'/api/data_views',
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
    }).then(function (response) {
        for (dataview of response.data["data_view"]) {
            if (dataview.name == "AKCORE_DEV") {
                dataviewId = dataview.id;
                break;
            }
        }
        if (log) console.log(response.data);
    })
    .catch(function (error) {
        console.error(error);
        return null;
    });

    // update projekt-dataview properties "name" and "title". the new title now references the correct projekt indeces, rather the old source indeces.
    await axios.request({
        method: 'POST',
        url: 'http://localhost:5601/kibana/s/'+projektId+'/api/data_views/data_view/'+dataviewId,
        headers: {
            'Content-Type': 'application/json',
            'kbn-xsrf': 'true',
            'Authorization': 'ApiKey eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ=='
        },
         data: {
            // "refresh_fields": true,
            "data_view": {
                "title": "akcore_"+projektId+"_*",
                "name": "akcore_"+projektId+"_dataview"
            }
         }
    }).then(function (response) {
        if (log) console.log(response.data);
    })
    .catch(function (error) {
        console.error(error);
        return null;
    });

    return projektId;
}

app.get("/testCron", async (req, res) => {
    console.log("CronCall");
    return res.status(HTTP.OK).send();
})

app.get("/testMail", async (req, res) => {
    console.log("GET /testMail");
    let i = 2;
    while (i > 0) {
        console.log("send ", i)
        exec(`mail -s "i = ${i}" nf.app@icloud.com <<< "Test Emails i = ${i}"`, async (error, stdout, stderr) => {
            if (error) {
                console.log('error:', error.message);
                return res.sendStatus(HTTP.INTERNAL_ERROR);
            }
            if (stderr) {            
                console.log('stderr:', stderr);
                return res.sendStatus(HTTP.INTERNAL_ERROR);
            }
            console.log("stdout:", stdout);
        })
        i -= 1;
    }
    console.log("done")
    return res.status(HTTP.OK).send()
})

app.get("/pipeTest", async (req, res) => {
    
    let projektId = "projekt0123";
    let projektName = "ERP System";

    let client = new ESAPI();
    await createKibanaSpace(projektId, projektName);
    await client.createProjektIndices(projektId);
    // await client.setIndexReadOnly("count");
    // await client.setIndexReadOnly("pie");
    // await client.setIndexReadOnly("responses");
    

    // await client.copyIndecesToProjektSpace(projektId);
    
    return res.sendStatus(HTTP.OK);
})

akcoredb
    .sync({})
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
