
const { DataTypes } = require('sequelize')
const akcoredb = require('../database')

// Mitarbeiter model with fields:
// - mitarbeiterId: integer (primary key, auto-increment)
// - mitarbeiterName: string
// - mitarbeiterEmail: string
// const Mitarbeiter = akcoredb.define('mitarbeiter', {
//     mitarbeiterId:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     mitarbeiterName: {
//         type: DataTypes.STRING
//     },
//     mitarbeiterEmail: {
//         type: DataTypes.STRING
//     },
// }, {
//     timestamps: false
// });

// Organisation model with fields:
// - organisationId: integer (primary key, auto-increment)
// - organisationName: string
// const Organisation = akcoredb.define('organisation', {
//     organisationId:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     organisationName:{
//         type: DataTypes.STRING
//     }
// }, {
//     timestamps: false
// });

// const Account = akcoredb.define('mitarbeiter', {
//     accountId:{
//         type: DataTypes.INTEGER,
//         autoIncrement: true
//     },
//     accountName:{
//         type: DataTypes.STRING
//     },
//     accountPasswort:{
//         type: DataTypes.STRING
//     },
//     accountType: {
//         type: DataTypes.STRING
//     }
// }, {
//     timestamps: false
// });

// Abteilung model with fields:
// - abteilungId: integer (primary key, auto-increment)
// - abteilungName: string (not null)
// const Abteilung = akcoredb.define('abteilung', {
//     abteilungId: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     abteilungName: {
//         type: DataTypes.STRING,
//         allowNull: false,
//     }
// }, {
//     timestamps: false
// });

// Projekt model with fields:
// - projektId: integer (primary key, auto-increment)
// - projektName: string
// - projektBeschreibung: string
// - projektStartDate: date
// - projektEndDate: date
// - projektKibanaDashboardId: string
// const Projekt = akcoredb.define('projekt', {
//     projektId:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     projektName: {
//         type: DataTypes.STRING
//     },
//     projektBeschreibung: {
//         type: DataTypes.STRING
//     },
//     projektStartDate: {
//         type: DataTypes.DATEONLY

//     },
//     projektEndDate: {
//         type: DataTypes.DATEONLY
//     },
//     projektKibanaDashboardId: {
//         type: DataTypes.STRING,
//     }
// }, {
//     timestamps: false
// });

// Umfrage model with fields:
// - umfrageId: integer (primary key, auto-increment)
// - umfrageStartDate: date
// - umfrageEndDate: date
// - umfrageLimesurveyId: string
// const Umfrage = akcoredb.define('umfrage', {   
//     umfrageId:{
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     }, 
//     umfrageStartDate: {
//         type: DataTypes.DATEONLY
//     },
//     umfrageEndDate: {
//         type: DataTypes.DATEONLY
//     },
//     umfrageLimesurveyId: {
//         type: DataTypes.STRING
//     }
// }, {
//     timestamps: false
// });

// // ProjektTeilnahme model (join table for Projekt and Mitarbeiter) with fields:
// // - mitarbeiterRolle: string
// const ProjektTeilnahme = akcoredb.define('projektTeilnahme', {
//     mitarbeiterRolle:{
//         type: DataTypes.STRING
//     },
// }, {
//     timestamps: false
// });

// // FuelltAus model (join table for Mitarbeiter and Umfrage) with fields:
// // - mitarbeiterLimesurveyTokenId: string
// // - projektId: integer
// const FuelltAus = akcoredb.define('fuelltAus', {
//     mitarbeiterLimesurveyTokenId:{
//         type: DataTypes.STRING
//     },
//     projektId: {
//         type: DataTypes.INTEGER
//     }
// }, {
//     timestamps: false
// });

// // Defining associations:
// // Organisation 1 :: n Mitarbeiter
// Organisation.hasMany(Mitarbeiter, {foreignKey: 'organisationId'});
// Mitarbeiter.belongsTo(Organisation, {foreignKey: 'organisationId'});

// // Organisation 1 :: n Abteilung
// Organisation.hasMany(Abteilung, {foreignKey: 'organisationId'});
// Abteilung.belongsTo(Organisation, {foreignKey: 'organisationId'});

// // Abteilung 1 :: n Mitarbeiter
// Abteilung.hasMany(Mitarbeiter, {foreignKey: 'abteilungId'});
// Mitarbeiter.belongsTo(Abteilung, {foreignKey: 'abteilungId'});

// // Organisation 1 :: n Projekt
// Organisation.hasMany(Projekt, {foreignKey: 'organisationId'});
// Projekt.belongsTo(Organisation, {foreignKey: 'organisationId'});

// // Projekt 1 :: n Umfrage
// Projekt.hasMany(Umfrage, {foreignKey: 'projektId'});
// Umfrage.belongsTo(Projekt, {foreignKey: 'projektId'});

// // Projekt m :: n Mitarbeiter
// Projekt.belongsToMany(Mitarbeiter, { through: ProjektTeilnahme });
// Mitarbeiter.belongsToMany(Projekt, { through: ProjektTeilnahme });

// // Mitarbeiter m :: n Umfrage
// Mitarbeiter.belongsToMany(Umfrage, { through: FuelltAus });
// Umfrage.belongsToMany(Mitarbeiter, { through: FuelltAus });


// module.exports = { Organisation, Projekt, Umfrage, Abteilung, FuelltAus, ProjektTeilnahme }
// module.exports = { Organisation, Projekt, Abteilung }