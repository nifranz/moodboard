import axios from 'axios';


const client = axios.create({
    //baseURL: 'http://localhost:3001/',
    baseURL: 'http://bolarus.wi.uni-potsdam.de/api/',
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
    async getMitarbeiter (organisationId) {       
        console.log("API: executing getMitarbeiter()") 
        let response = await this.execute('get', `/mitarbeiter?organisationId=${organisationId}`);
        console.log(response)
        return response.data;
    },
    async getAbteilungen (organisationId) {
        console.log("API: executing getAbteilungen()")      
        let response = await this.execute('get', `/abteilung?organisationId=${organisationId}`);
        return response.data;
    },
    async createMitarbeiter (data) {
        console.log(data);
        console.log("???")
        let response = await this.execute('post', '/mitarbeiter', data);
        return response.data;
    },
    async updateMitarbeiter (data) {
        let response = await this.execute('put', '/mitarbeiter/'+ data.mitarbeiterId, data);
        return response.data;
    },
    async deleteMitarbeiter (mitarbeiterId) {
        let response = await this.execute('delete', `/mitarbeiter/${mitarbeiterId}`);
        return response.data;
    },
    // PROJEKTE API
    async getProjekte (organisationId) {        
        let response = await this.execute('get', `/projekt?organisationId=${organisationId}`);
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
    },
    async verifyLogin(data) {
        let response = await this.execute('post', '/verifyLogin', data);
        return response.data;
    },
    async createAbteilung(data) {
        let response = await this.execute('post', '/abteilung/', data);
        return response.data;
    },
    async deleteAbteilung(abteilungId) {
        let response = await this.execute('delete', `/abteilung/${abteilungId}`);
        return response.data;
    }
}
  