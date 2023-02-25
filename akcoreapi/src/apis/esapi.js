const fssync = require('fs');
const { Client } = require('@elastic/elasticsearch');

/**
 * A class representing the Elasticsearch API.
 * @class
 */
class ESAPI {
    #apiKey = 'eDdSV1o0WUJXUzk3dlFqZi1HY2U6M1R4ZHJEcjFTT3lfTV8teU1LSGM1UQ==';
    #esNode = 'https://localhost:9200';
    #client;

    /**
     * Create a new instance of the ESAPI class.
     * @constructor
     */
    constructor() {
        this.#client = new Client({
            node: this.#esNode,
            auth: {
              apiKey: this.#apiKey
            },
            tls: {
                ca: fssync.readFileSync(__dirname+'/../../pipeline/http_ca.crt'),
                rejectUnauthorized: false
              }
        });
    }

    /**
     * Create response, pie, and count indices for a given project ID.
     * @async
     * @param {string} projektId - The ID of the project.
     */
    async createProjektIndices(projektId) {
        // create response index
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
        }).then(function(resp) {
            console.log(`Successfully created index akcore_${projektId}_responses!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });

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
        }).then(function(resp) {
            console.log(`Successfully created index akcore_${projektId}_pie!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });

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
        }).then(function(resp) {
            console.log(`Successfully created index akcore_${projektId}_count!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });
    }

    /**
     * Delete response, pie, and count indices for a given project ID.
     * @async
     * @param {string} projektId - The ID of the project.
     */
    async deleteProjectIndices(projektId) {
        // create count index
        await this.#client.indices.delete({
            index: "akcore_"+projektId+"_count" 
        }).then(function(resp) {
            console.log(`Successfully deleted index akcore_${projektId}_count!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });

        // create pie index
        await this.#client.indices.delete({
            index: "akcore_"+projektId+"_pie" 
        }).then(function(resp) {
            console.log(`Successfully deleted index akcore_${projektId}_pie!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });

        // create responses index
        await this.#client.indices.delete({
            index: "akcore_"+projektId+"_responses" 
        }).then(function(resp) {
            console.log(`Successfully deleted index akcore_${projektId}_responses!`);
            console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });
    }

    /** Writes data to an index in Elasticsearch.
     * @async
     * @param {string} indexId - The ID of the index to write data to.
     * @param {string} documentId - The ID of the document to be written.
     * @param {Object} data - The data to be written to the index.
     * @param {boolean} refresh - Set to true to force a refresh of the index after writing data.
     * @returns {null}
     */
    async writeDataToDocument(indexId, documentId, data, refresh) {
        let documentLog = false;

        // If DateSent is an empty string, remove it from the data.
        if (data.DateSent === '') delete data.DateSent;
        // If DateSent is not an empty string, replace the space with "T".
        if (data.DateSent) data.DateSent = (data.DateSent).replace(" ", "T");
        await this.#client.index({
            index: indexId,
            id: documentId,
            refresh: refresh,
            document: data
        }).then(function(resp) {
            if (documentLog) console.log(`Successfully wrote document (id: "${documentId}") to index "${indexId}"!`);
            // console.log(JSON.stringify(resp, null, 4));
        }, function(err) {
            console.trace(err.message);
        });
        
        if (documentLog) {
            console.log("indexId:",indexId);
            console.log("documentId:",documentId);
            console.log("data:",data);
        }
        return null;
    }
}

module.exports = {ESAPI};