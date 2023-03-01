const axios = require('axios')
const Projekt = require('../models/projekt')
require('../models/associations')
const { kibanaapikey_base64 } = require('../connection')

const kibanaBaseUrl = 'http://localhost:5601/kibana/';

class KIBAPI {
    #headers = {
        'Content-Type': 'application/json',
        'kbn-xsrf': 'true',
        'Authorization': 'ApiKey ' + kibanaapikey_base64
    }

    constructor() {}

    /**
     * Deletes a Kibana space with the given project ID.
     * 
     * @async
     * @function deleteKibanaSpace
     * @param {string} projektId - The ID of the project/space to be deleted.
     * @returns {string|null} The ID of the deleted space, or null if an error occurred.
     */
    async deleteKibanaSpace(projektId) {
        await axios.request({
            method: 'DELETE',
            url: kibanaBaseUrl + 'api/spaces/space/'+projektId,
            headers: this.#headers,
        }).then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.error(error);
            return null;
        });
    }

    /**
     * Creates a new Kibana space with the specified project ID and name,
     * and copies a dashboard from the source Kibana space to the new space.
     * Also updates the data view properties of the project.
     * 
     * @async
     * @param {string} projektId - The project ID.
     * @param {string} projektName - The project name.
     * @returns {string} ID of the new Kibana space.
     */
    async createKibanaSpace(projektId, projektName) {
        projektId = projektId + "";
        let log = false;
    
        // creating new kibana space
        await axios.request({
            method: 'POST',
            url: kibanaBaseUrl + 'api/spaces/space',
            headers: this.#headers,
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
    
        // the source dashboard in kibana; this will be copied to the new kibana project  space
        let moodboardSourceObject = {
            id: '66a487c9-6517-445b-85be-f37890b62af2',
            type: 'dashboard'
        }
    
        // copying moodboard object from kibana space "source" to new projekt space
        await axios.request({
            method: 'POST',
            url: kibanaBaseUrl + 's/source/api/spaces/_copy_saved_objects',
            headers: this.#headers,
             data: {
                spaces: [projektId],
                objects: [moodboardSourceObject],
                includeReferences: true
             }
        }).then(async function (response) {
            if (log) console.log(response.data[projektId]);
            console.log(response.data[projektId].successResults);
    
            // saving the id of the dashboard (kibana saved object) to projekt database for later reference
            let projektKibanaDashboardId = "";
            for (let savedObject of response.data[projektId].successResults) {
                // of all saved objects that have been copied to the new kibana-space: get the one saved object that matches the source dashboard id (moodboardSourceObject) and save its destination id (new object) to db
                if (savedObject.id == moodboardSourceObject.id) {
                    projektKibanaDashboardId = savedObject.destinationId;
                }
            }
            let projekt = await Projekt.findOne({
                where: {projektId: projektId}
            });
            // save the projektKibanaDashboardId to projekt
            projekt.set({
                projektKibanaDashboardId: projektKibanaDashboardId,
            });
            await projekt.save();
        })
        .catch(function (error) {
            console.error(error);
            return null;
        });
    
        // get dataview id of the projekt-dataview used for the moodboard in the new space
        let dataviewId;
        await axios.request({
            method: 'GET',
            url: kibanaBaseUrl + 's/'+projektId+'/api/data_views',
            headers: this.#headers,
        }).then(function (response) {
            for (let dataview of response.data["data_view"]) {
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
            url: kibanaBaseUrl + 's/'+projektId+'/api/data_views/data_view/'+dataviewId,
            headers: this.#headers,
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
}

module.exports = { KIBAPI }