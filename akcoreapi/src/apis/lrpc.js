const fs = require('fs/promises')
const axios = require('axios')
const connection = require('../connection')

const LIME_RPC_URL = 'http://bolarus.wi.uni-potsdam.de/index.php/admin/remotecontrol/';
const LRPC_LOGGING = true;
const LRPC_LOG_PATH = __dirname + "/../../logs/lrpc.log"

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
     * Requests all surveys from Limesurvey and returns them
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
     */
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

    /** 
     * Activates a survey
     * @param surveyId The surveyId of the survey
     */
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
    /** 
     * Activates the participant table for a survey in limesurvey
     * @param surveyId The surveyId of the survey
     */
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
}

module.exports = { LRPC, lrpc_req }