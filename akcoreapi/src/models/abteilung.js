// models/abteilung.js
const { DataTypes } = require('sequelize');
const akcoredb = require('../database');

// Abteilung model with fields:
// - abteilungId: integer (primary key, auto-increment)
// - abteilungName: string (not null)
const Abteilung = akcoredb.define('abteilung', {
    abteilungId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    abteilungName: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: false
});

module.exports = Abteilung;