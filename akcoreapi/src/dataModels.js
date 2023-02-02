const {DataTypes, Model} = require('sequelize')

/* Defining the Data Models
 Tables (Models): 
    Organisation: PK org_id, org_name;
    Mitarbeiter: PK ma_id, FK org_id, ma_name, ma_email, ma_rolle;
    Projekt: tbd
    Umfrage: tbd
*/

const dataModels = async function init (sequelize) {
    class Organisation extends Model {}
    Organisation.init({
    orgId: {
            type: DataTypes.INTEGER,
            field: 'org_id',
            primaryKey: true,
            autoIncrement: true
        },
        orgName: {
            type: DataTypes.STRING,
            field: 'org_name'
        }
    }, {
        sequelize: sequelize,
        modelName: 'organisation'
    });


    class Mitarbeiter extends Model {}
    Mitarbeiter.init({
        maId: {
            type: DataTypes.INTEGER,
            field: 'ma_id',
            primaryKey: true,
            autoIncrement: true
        },
        maName: {
            type: DataTypes.STRING,
            field: 'ma_name'
        },
        maEmail: {
            type: DataTypes.STRING,
            field: 'ma_email'
        },
        maRolle: {
            type: DataTypes.STRING,
            field: 'ma_rolle'
        }
    }, {
        sequelize: sequelize,
        modelName: 'mitarbeiter'
    });
}

module.exports = { dataModels }