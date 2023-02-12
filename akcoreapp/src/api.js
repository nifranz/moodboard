import axios from 'axios'

const client = axios.create({
    baseURL: 'http://141.89.39.93/api/',
    json: true
});

export default {
    async execute (method, resource, data) {        
        return client({
            method, 
            url: resource,
            data
        }).then(req => {
            return req;
        });
    },
    // ORGANISATION API
    async getOrganisations() {
        let response = await this.execute('get', '/organisations');
        return response.data;
    },
    // MITARBEITER API
    async getMitarbeiterAll (organisationId) {       
        console.log("API: executing getMitarbeiterAll()") 
        let response = await this.execute('get', `/mitarbeiterAll/${organisationId}`);
        console.log(response)
        return response.data;
    },
    async getAbteilungen (organisationId) {
        console.log("API: executing getMitarbeiterAll()")      
        let response = await this.execute('get', `/abteilungen/${organisationId}`);
        return response.data;
    },
    async createMitarbeiter (data) {
        console.log(data);
        console.log("???")
        let response = await this.execute('post', '/mitarbeiter', data);
        return response.data;
    },
    async updateMitarbeiter (data) {
        let response = await this.execute('put', '/mitarbeiter', data);
        return response.data;

    },
    async deleteMitarbeiter (mitarbeiterId) {
        let response = await this.execute('delete', `/mitarbeiter/${mitarbeiterId}`);
        return response.data;
    },
    // PROJEKTE API
    async getProjekte (organisationId) {        
        let response = await this.execute('get', `/projekte/${organisationId}`);
        return response.data;
    },
    async getProjekt (projektId) {
        let response = await this.execute('get', `/projekt/${projektId}`);
        return response.data;
    },
    /** 
     * @returns A relative Location-URI for the created projekt
     */
    async createProjekt (data) {
        console.log(data);
        let response = await this.execute('post', '/projekt', data);
        console.log(response);
        return response.headers.location;
    },
    async updateProjekt (data, projektId) {
        console.log(data);
        let response = await this.execute('put', `/projekt/${projektId}`, data);
        console.log(response);
        return response.headers.location;
    },
    async deleteProjekt(projektId) {
        let response = await this.execute('delete', `/projekt/${projektId}`);
        return response.data;
    }
}
  