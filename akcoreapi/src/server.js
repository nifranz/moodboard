const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const finale = require('finale-rest')

const port = 3001;
let app = express();

app.use(cors());
app.use(bodyParser.json());

// define db with Sequelize
let database = new Sequelize({
    dialect: 'sqlite',
    storage: './test.sqlite'
});

// define Mitarbeiter model
let Mitarbeiter = database.define('mitarbeiter', {
    ma_id: Sequelize.STRING,
    ma_name: Sequelize.STRING,
    ma_email: Sequelize.STRING,
    ma_rolle: Sequelize.STRING
});

// Initialize finale
finale.initialize({
    app: app,
    sequelize: database
});

let userResource = finale.resource({
    model: Mitarbeiter,
    endpoints: ['/mitarbeiter', '/mitarbeiter/:id']
});

app.listen(port, () => {
    console.log("Example app listening on port " + port);
});