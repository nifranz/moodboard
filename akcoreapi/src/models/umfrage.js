// models/umfrage.js
const { DataTypes } = require('sequelize');
const akcoredb = require('../database');

// Umfrage model with fields:
// - umfrageId: integer (primary key, auto-increment)
// - umfrageStartDate: date
// - umfrageEndDate: date
// - umfrageLimesurveyId: string
const Umfrage = akcoredb.define('umfrage', {   
    umfrageId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    umfrageStartDate: {
        type: DataTypes.DATEONLY
    },
    umfrageEndDate: {
        type: DataTypes.DATEONLY
    },
    umfrageLimesurveyId: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

module.exports = Umfrage;