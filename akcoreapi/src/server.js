const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {Sequelize, DataTypes, Model} = require('sequelize')
const finale = require('finale-rest')
try {
    var connection = require('./connection')
} catch (e) {
    console.log('Missing "connection.js"-file in /src/. No connection established.')
}

const port = 3001;
let app = express();

// app.listen(port, () => {
//     console.log("Example app listening on port " + port);
// });

app.use(cors());
app.use(bodyParser.json());

{
/*// define sqlitedb with sequelize
let sqlitedb = new Sequelize({
    dialect: 'sqlite',
    storage: './db/test.sqlite'
});

// define sqliteMitarbeiter model
let sqliteMitarbeiter = sqlitedb.define('sqliteMitarbeiter', {
    ma_id: Sequelize.STRING,
    ma_name: Sequelize.STRING,
    ma_email: Sequelize.STRING,
    ma_rolle: Sequelize.STRING
});

// Initialize finale
finale.initialize({
    app: app,
    sequelize: sqlitedb
});

// Create the dynamic REST resource for our model
let userResource = finale.resource({
    model: sqliteMitarbeiter,
    endpoints: ['/mitarbeiter', '/mitarbeiter/:id']
});

// Resets the database and launches the express app on :8081

sqlitedb
  .sync({ force: true })
  .then(() => {
    app.listen(port, () => {
      console.log('listening to port localhost:'+ port)
    })
  })
  */
} 

// Defining the connection to mariadb on localhost with sequalize
if (!connection) return;

let mysqldb = new Sequelize(
    connection.db_name,
    connection.db_username,
    connection.db_password,
    {
        host: connection.db_host,
        dialect: 'mariadb'
    }    
)

// Establishing a connection with sequlalize to the mysql "sequalizedb" database
mysqldb.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

class Organisation extends Model {}
Organisation.init({
    org_id: {
        type: DataTypes.INTEGER,
        field: 'org_id',
        primaryKey: true,
        autoIncrement: true
    },
    org_name: {
        type: DataTypes.STRING,
        field: 'org_name'
    }
}, {
    sequelize: mysqldb,
    modelName: 'organisation'
});

// recreating the table
// Organisation.sync({force:true});
// Organisation.create({org_id: 1, org_name: "LSWI-Lehrstuhl"});


class Mitarbeiter extends Model {}
Mitarbeiter.init({
    ma_id: {
        type: DataTypes.INTEGER,
        field: 'ma_id',
        primaryKey: true,
        autoIncrement: true
    },
    ma_name: {
        type: DataTypes.STRING,
        field: 'ma_name'
    },
    ma_email: {
        type: DataTypes.STRING,
        field: 'ma_email'
    },
    ma_rolle: {
        type: DataTypes.STRING,
        field: 'ma_rolle'
    }
}, {
    sequelize: mysqldb,
    modelName: 'mitarbeiter'
});

class Projekt extends Model {}
Projekt.init({
    proj_id: {
        type: DataTypes.INTEGER,
        field: 'proj_id',
        primaryKey: true,
        autoIncrement: true
    },
    proj_name: {
        type: DataTypes.STRING,
        field: 'proj_name'
    },
    proj_descr: {
        type: DataTypes.STRING,
        field: 'proj_descr'
    },
    proj_startDate: {
        type: DataTypes.DATEONLY,
        field: 'proj_startDate'
    },
    proj_endDate: {
        type: DataTypes.DATEONLY,
        field: 'proj_endDate'
    }
}, {
    sequelize: mysqldb,
    modelName: 'projekt'
});

class Umfrage extends Model {}
Umfrage.init({
    umfr_id: {
        type: DataTypes.INTEGER,
        field: 'umfr_id',
        primaryKey: true,
        autoIncrement: true
    },
    proj_startDate: {
        type: DataTypes.DATEONLY,
        field: 'umfr_startDate'
    },
    proj_endDate: {
        type: DataTypes.DATEONLY,
        field: 'umfr_endDate'
    }
}, {
    sequelize: mysqldb,
    modelName: 'umfrage'
});

Mitarbeiter.belongsTo(Organisation, { foreignKey: "org_id" });

Projekt.belongsTo(Organisation, { foreignKey: "org_id" });

Umfrage.belongsTo(Projekt, { foreignKey: "proj_id" })

Mitarbeiter.belongsToMany(Projekt, { through: 'nimmt_teil' })

// Create REST API endpoints
// C for Create: HTTP POST
// R for Read: HTTP GET
// U for Update: HTTP PUT
// D for Delete: HTTP DELETE

app.get("/mitarbeiterAll/:org_id", async (req, res) => {
    let org_id = req.params.org_id;
    if (!org_id) return res.sendStatus(400);
    let mitarbeiter = await Mitarbeiter.findAll({where: { org_id: org_id}});
    return res.send(mitarbeiter);
});

app.post("/mitarbeiter", async (req, res) => {
    console.log("POST /mitarbeiter; request-body: ");
    data = req.body;

    if(!data.ma_name || !data.ma_email || !data.ma_rolle) return res.status(400).send("NO");
    console.log("inserting");
    await Mitarbeiter.create({ma_name: data.ma_name, ma_email: data.ma_email, ma_rolle: data.ma_rolle, org_id: data.org_id});

    return res.sendStatus(200);
});

app.put("/mitarbeiter", async (req, res) => {
    console.log("PUT /mitarbeiter; request-body: ");
    data = req.body;

    if(!data.ma_name || !data.ma_email || !data.ma_rolle) return res.status(400).send("NO");

    await Mitarbeiter.update(
        { ma_name: data.ma_name, ma_email: data.ma_email, ma_rolle: data.ma_rolle },
        { where: { ma_id: data.ma_id } }
    ).then(result => {
        return res.sendStatus(200);
    }).catch(result => {
        return res.sendStatus(400);
    })
});

app.delete("/mitarbeiter/:ma_id", (req, res) => {    
    console.log("DELETE /mitarbeiter; request-params: ");
    Mitarbeiter.destroy({
        where: {ma_id: req.params.ma_id}
    })
    return res.send("GET: Mitarbeiter");
});

app.get("/projekte/:org_id", async (req, res) => {
    let org_id = req.params.org_id;

    if (!org_id) return res.sendStatus(400);
    
    let projekte = await Projekt.findAll({where: { org_id: org_id }});

    return res.send(projekte);
});

app.post("/projekt", async (req, res) => {
    console.log("POST /projekt; request-body: ");
    data = req.body;

    if(!data.proj_name || !data.proj_descr || !data.proj_startDate || !data. proj_endDate) return res.status(400).send("NO");
    console.log("inserting");
    await Projekt.create(data);

    return res.sendStatus(200);
});



mysqldb
    .sync({ alter: true })
    .then(() => {
        app.listen(port, () => {
            console.log('listening to port localhost:' + port)
        })
    })



