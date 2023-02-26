// models/organisation.js
const { DataTypes } = require('sequelize')
const akcoredb = require('../database')

// Organisation model with fields:
// - organisationId: integer (primary key, auto-increment)
// - organisationName: string
const Organisation = akcoredb.define('organisation', {
    organisationId:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organisationName:{
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

module.exports = Organisation