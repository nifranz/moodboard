// controllers/abteilung.js
const MitarbeiterModel = require('../models/mitarbeiter');
const OrganisationModel = require('../models/organisation');
const AbteilungModel = require('../models/abteilung');
require('../models/associations');

const { HTTP } = require('../helper');

const AbteilungController = {};

AbteilungController.list = async (req, res) => {
  let { organisationId } = req.query;
  console.log("GET /abteilung for org: "+organisationId);

  try {
    if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);
    if(!(await OrganisationModel.findOne({where:{organisationId: organisationId}}))) return res.sendStatus(HTTP.NOT_FOUND);

    let abteilungen = await AbteilungModel.findAll({where: { organisationId: organisationId }, include: [MitarbeiterModel]});

    return res.send(abteilungen);

  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

AbteilungController.create = async (req, res) => {
  console.log("POST /projekt");
 
  try {
    data = req.body; // the data sent by the client in request body
    console.log(req.body)

    if( !data.abteilungName || !data.organisationId ) return res.sendStatus(HTTP.BAD_REQUEST); 

    let abteilung = await AbteilungModel.create({ 
        abteilungName: data.abteilungName,
        organisationId: data.organisationId
    });

    return res.status(HTTP.CREATED).send(abteilung);
      
  }
  catch (error) {
      handleError(error);
      return res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

AbteilungController.delete = async (req, res) => {
    try {
        // DELETE a abteilung for specific abteilungId
        let abteilung = await AbteilungModel.findOne({
            where: {abteilungId: req.params.abteilungId},
            include: [MitarbeiterModel]
        });
        if (!abteilung) {
            return res.sendStatus(HTTP.NOT_FOUND);
        }
        if (!abteilung.mitarbeiters.length) {
            abteilung.destroy();
            return res.sendStatus(HTTP.OK);
        } else {
            return res.sendStatus(HTTP.BAD_REQUEST);
        }
    }
    catch (error) {
        handleError(error);
        return res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

module.exports = AbteilungController;