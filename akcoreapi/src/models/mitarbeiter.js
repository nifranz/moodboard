// models/mitarbeiter.js
const { DataTypes } = require('sequelize');
const akcoredb = require('../database');

// Mitarbeiter model with fields:
// - mitarbeiterId: integer (primary key, auto-increment)
// - mitarbeiterName: string
// - mitarbeiterEmail: string
const Mitarbeiter = akcoredb.define('mitarbeiter', {
    mitarbeiterId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mitarbeiterName: {
        type: DataTypes.STRING
    },
    mitarbeiterEmail: {
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

module.exports = Mitarbeiter;