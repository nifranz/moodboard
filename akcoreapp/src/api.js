import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
    baseURL: 'http://localhost:8081/',
    json: true
});

export default {
    async execute (method, resource, data) {
        return client({
            method, url: resource,
            data
        }).then(req => {
            return req.data;
        })
    },
    getMitarbeiter () {
        return this.execute('get', '/mitarbeiter');
    },
    createMitarbeiter (data) {
        return this.execute('post', '/mitarbeiter', data);
    },
    deleteMitarbeiter (id) {
        return this.execute('delete', `/mitarbeiter/${id}`);
    }
}
  