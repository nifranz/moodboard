// database.js
const { Sequelize } = require('sequelize')
const connection = require('./connection')

let akcoredb = new Sequelize(
    connection.db_name,
    connection.db_username,
    connection.db_password,
    {
        host: connection.db_host,
        dialect: 'mysql',
        logging: false,
    }    
)

// Establishing a connection with sequelize to the "akcoredb" database of mariadb
akcoredb.authenticate().then(() => {
    console.log('Connection to the mariadb database using sequelize has been established successfully!');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});

module.exports = akcoredb