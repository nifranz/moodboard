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
    getMitarbeiter (org_id) {        
        return this.execute('get', `/mitarbeiter/${org_id}`);
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
    }
}
  