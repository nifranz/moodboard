// models/associations.js
const akcoredb = require('../database')
const DataTypes = require('sequelize')
const Organisation = require('./organisation')
const Mitarbeiter = require('./mitarbeiter')
const Projekt = require('./projekt')
const Umfrage = require('./umfrage')
const Abteilung = require('./abteilung')

/**
 * ProjektTeilnahme model (join table for Projekt and Mitarbeiter) with fields:
 * - mitarbeiterRolle: string
 */
const ProjektTeilnahme = akcoredb.define('projektTeilnahme', {
    mitarbeiterRolle:{
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

/** FuelltAus model (join table for Mitarbeiter and Umfrage) with fields:
 * - mitarbeiterLimesurveyTokenId: string
 * - projektId: integer
 */
const FuelltAus = akcoredb.define('fuelltAus', {
    mitarbeiterLimesurveyTokenId:{
        type: DataTypes.STRING
    },
    projektId: {
        type: DataTypes.INTEGER
    }
}, {
    timestamps: false
});

// Defining associations:
// Organisation 1 :: n Mitarbeiter
Organisation.hasMany(Mitarbeiter, {foreignKey: 'organisationId'});
Mitarbeiter.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Organisation 1 :: n Abteilung
Organisation.hasMany(Abteilung, {foreignKey: 'organisationId'});
Abteilung.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Abteilung 1 :: n Mitarbeiter
Abteilung.hasMany(Mitarbeiter, {foreignKey: 'abteilungId'});
Mitarbeiter.belongsTo(Abteilung, {foreignKey: 'abteilungId'});

// Organisation 1 :: n Projekt
Organisation.hasMany(Projekt, {foreignKey: 'organisationId'});
Projekt.belongsTo(Organisation, {foreignKey: 'organisationId'});

// Projekt 1 :: n Umfrage
Projekt.hasMany(Umfrage, {foreignKey: 'projektId'});
Umfrage.belongsTo(Projekt, {foreignKey: 'projektId'});

// Projekt m :: n Mitarbeiter
Projekt.belongsToMany(Mitarbeiter, { through: ProjektTeilnahme });
Mitarbeiter.belongsToMany(Projekt, { through: ProjektTeilnahme });

// Mitarbeiter m :: n Umfrage
Mitarbeiter.belongsToMany(Umfrage, { through: FuelltAus });
Umfrage.belongsToMany(Mitarbeiter, { through: FuelltAus });
