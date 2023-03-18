const MitarbeiterModel = require('../models/mitarbeiter');
const OrganisationModel = require('../models/organisation');
const ProjektModel = require('../models/projekt');
const UmfrageModel = require('../models/umfrage');
const AbteilungModel = require('../models/abteilung');
require('../models/associations');

const { HTTP } = require('../helper')

const fs = require('fs/promises')
const cors = require('cors')
const { exec } = require('child_process')
const uuid = require('uuid')
const bodyParser = require('body-parser')

const { LRPC } = require('../apis/lrpc');
const { ESAPI } = require('../apis/esapi');
const { KIBAPI } = require('../apis/kibapi')

const MitarbeiterController = {};

MitarbeiterController.list = async (req, res) => {
    let { organisationId } = req.query;
    console.log("GET /mitarbeiter for org: "+organisationId);

    try {
        // Check if organization ID is provided, return error if missing
        if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);

        // Check if organization exists, return error if not found
        if(!(await OrganisationModel.findOne( { where: { organisationId: organisationId } } ))) return res.sendStatus(HTTP.NOT_FOUND);

        // Find all employees for specific organization and include related surveys and projects
        let mitarbeiter = await MitarbeiterModel.findAll( { 
            where: { organisationId: organisationId}, 
            include: [UmfrageModel, ProjektModel]
        });
        
        // Return JSON response with all employees
        return res.send(mitarbeiter);

  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

MitarbeiterController.create = async (req, res) => {
console.log("CREATE /mitarbeiter/");
  try {
    data = req.body; // the data sent by the client in request body
        if( !data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId || !data.organisationId ) {
            // Return HTTP BAD_REQUEST if required data is missing
            return res.sendStatus(HTTP.BAD_REQUEST);
        }

        // Create a new Mitarbeiter record in the database with the provided data
        let mitarbeiter = await MitarbeiterModel.create({ 
            mitarbeiterName: data.mitarbeiterName, 
            mitarbeiterEmail: data.mitarbeiterEmail, 
            abteilungId: data.abteilungId,
            organisationId: data.organisationId
        });

        // Return HTTP CREATED status code to indicate that the record was successfully created
        return res.status(HTTP.CREATED).send(mitarbeiter);
  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

MitarbeiterController.read = async (req, res) => {
    let mitarbeiterId = req.params.mitarbeiterId;
    try {
        let mitarbeiter = await MitarbeiterModel.findOne( { where: {mitarbeiterId: mitarbeiterId } });
        if (!mitarbeiter) return res.sendStatus(HTTP.NOT_FOUND);
        return res.status(HTTP.OK).send(mitarbeiter);
    } catch (err) {
        console.error(err);
        res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

MitarbeiterController.update = async (req, res) => {
  try {
    // update a mitarbeiter at specific mitarbeiterId
    let data = req.body; // the data sent by the client in request body
    let mitarbeiterId = req.params.mitarbeiterId;

    if(!data.mitarbeiterName || !data.mitarbeiterEmail || !data.abteilungId) return res.sendStatus(HTTP.BAD_REQUEST);

    // let wtf = await Umfrage.findAll({
    //     include: [FuelltAus]
    // })
    let result = await MitarbeiterModel.findOne({
        where: { mitarbeiterId: mitarbeiterId },
        include: [UmfrageModel, ProjektModel] 
    })
    .then(async result => {
        let mitarbeiter = result;
        // console.log("result", result);
        console.log(mitarbeiter.umfrages);
        console.log(mitarbeiter.projekts);

        if ( mitarbeiter.mitarbeiterEmail != data.mitarbeiterEmail || mitarbeiter.mitarbeiterName != data.mitarbeiterName ) {
            let client = new LRPC();
            await client.openConnection();
            for (umfr of mitarbeiter.umfrages) {
                // await client.updateParticipant(umfr.umfrageLimesurveyId, umfr.fuelltAus.mitarbeiterLimesurveyTokenId, ["email = test",]);
            }                
            await client.closeConnection();
        }

        mitarbeiter.update({ 
            mitarbeiterName: data.mitarbeiterName, 
            mitarbeiterEmail: data.mitarbeiterEmail, 
            abteilungId: data.abteilungId
        }, { where: { mitarbeiterId: mitarbeiterId } })
        return res.sendStatus(HTTP.CREATED);
    })
    .catch(err => {
        throw new Error(err);
    })

  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

MitarbeiterController.delete = async (req, res) => {
    let mitarbeiterId = req.params.mitarbeiterId;
    console.log("DELETE /mitarbeiter/"+mitarbeiterId);
    try {
        // DELETE a mitarbeiter for specific mitarbeiterId
        let success = await MitarbeiterModel.destroy({
            where: {mitarbeiterId: mitarbeiterId}
        });

        if (!success) return res.sendStatus(HTTP.NOT_FOUND);
        return res.sendStatus(HTTP.OK);
        
  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

module.exports = MitarbeiterController;