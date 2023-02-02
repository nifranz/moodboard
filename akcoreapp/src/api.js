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
    // MITARBEITER API
    getMitarbeiterAll (org_id) {        
        return this.execute('get', `/mitarbeiterAll/${org_id}`);
    },
    createMitarbeiter (data) {
        console.log(data);
        return this.execute('post', '/mitarbeiter', data);
    },
    updateMitarbeiter (data) {
        return this.execute('put', '/mitarbeiter', data);

    },
    deleteMitarbeiter (ma_id) {
        return this.execute('delete', `/mitarbeiter/${ma_id}`);
    },
    // PROJEKTE API
    getProjekte (org_id) {        
        return this.execute('get', `/projekt/${org_id}`);
    },
    getProjekt (org_id, proj_id) {
        return this.execute('get', `/projekt/${org_id}/${proj_id}`);
    },
    createProjekt (data) {
        console.log(data);
        return this.execute('post', '/projekt', data);
    },
}
  