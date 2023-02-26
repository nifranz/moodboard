// models/projekt.js
const { DataTypes } = require('sequelize');
const akcoredb = require('../database');

// Projekt model with fields:
// - projektId: integer (primary key, auto-increment)
// - projektName: string
// - projektBeschreibung: string
// - projektStartDate: date
// - projektEndDate: date
// - projektKibanaDashboardId: string
const Projekt = akcoredb.define('projekt', {
    projektId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    projektName: {
        type: DataTypes.STRING
    },
    projektBeschreibung: {
        type: DataTypes.STRING
    },
    projektStartDate: {
        type: DataTypes.DATEONLY

    },
    projektEndDate: {
        type: DataTypes.DATEONLY
    },
    projektKibanaDashboardId: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: false
});

module.exports = Projekt;