// models/user.js
const { DataTypes } = require('sequelize');
const akcoredb = require('../database');

// User model with fields:
// - userId: integer (primary key, auto-increment)
// - username: string
// - password: string
// - type: string
const User = akcoredb.define('user', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
    },
}, {
    timestamps: false
});

module.exports = User;