import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:3001/',
    json: true
});

export default {
    async execute (method, resource, data) {        
        return client({
            method, 
            url: resource,
            data
        }).then(req => {
            return req.data;
        });
    },
    // ORGANISATION API
    getOrganisations() {
        return this.execute('get', '/organisations')
    },    
    // MITARBEITER API
    getMitarbeiterAll (organisationId) {        
        return this.execute('get', `/mitarbeiterAll/${organisationId}`);
    },
    getAbteilungen (organisationId) {        
        return this.execute('get', `/abteilungen/${organisationId}`);
    },
    createMitarbeiter (data) {
        console.log(data);
        console.log("???")
        return this.execute('post', '/mitarbeiter', data);
    },
    updateMitarbeiter (data) {
        return this.execute('put', '/mitarbeiter', data);

    },
    deleteMitarbeiter (mitarbeiterId) {
        return this.execute('delete', `/mitarbeiter/${mitarbeiterId}`);
    },
    // PROJEKTE API
    getProjekte (organisationId) {        
        return this.execute('get', `/projekte/${organisationId}`);
    },
    getProjekt (projektId) {
        return this.execute('get', `/projekt/${projektId}`);
    },
    createProjekt (data) {
        console.log(data);
        return this.execute('post', '/projekt', data);
    },
}
  