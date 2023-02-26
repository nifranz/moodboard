// controllers/projekt.js 
const MitarbeiterModel = require('../models/mitarbeiter');
const OrganisationModel = require('../models/organisation');
const ProjektModel = require('../models/projekt');
const UmfrageModel = require('../models/umfrage');
const AbteilungModel = require('../models/abteilung');
require('../models/associations');

const { HTTP } = require('../helper');
const { getToday, getYesterday, SurveyFile, handleError } = require('../helper');

const fs = require('fs/promises')
const cors = require('cors')
const { exec } = require('child_process')
const uuid = require('uuid')
const bodyParser = require('body-parser')

const { LRPC } = require('../apis/lrpc');
const { ESAPI } = require('../apis/esapi');
const { KIBAPI } = require('../apis/kibapi');

const ProjektController = {};

ProjektController.list = async (req, res) => {
  let organisationId = req.params.organisationId;
  console.log("GET /projekt/"+organisationId);

  try {

  } catch (err) {
    console.error(err);
    res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

ProjektController.create = async (req, res) => {
  console.log("CREATE /projekt/");
  console.log("POST /projekt");
  let client;
  
  try {
      data = req.body; // the data sent by the client in request body

      // check if all required data for creating a project is present
      if (!data.projektName || 
          !data.projektBeschreibung || 
          !data.projektStartDate || 
          !data.projektEndDate || 
          !data.teilnehmer || 
          !data.umfragen ) {
              console.log(" => incomplete request")
              return res.sendStatus(HTTP.BAD_REQUEST);
      }

      data.projektKibanaDashboardId = ""; // set the project Kibana dashboard ID to an empty string, because it has to be a defined value
      
      // create new projekt
      let projekt = await ProjektModel.create(data);

      // create a new LimeSurvey RPC client and open a connection
      client = new LRPC();
      await client.openConnection();

      // create each survey in LimeSurvey and add it to the project
      for (u of data.umfragen) {
          let surveyFile = new SurveyFile(u.umfrageStartDate, u.umfrageEndDate, "AK Core Admin", "nifranz@uni-potsdam.de", projekt.projektName, projekt.projektBeschreibung);
          await surveyFile.createFile(); // creating a new survey file from the survey source file on disk
          await client.createSurvey(surveyFile.getPathToFile())
          .then( async surveyId => {     
              await client.activateSurvey(surveyId); // activate the survey in limesurvey
              await client.activateTokens(surveyId, [1,2]); // initialize the participant table for the survey in limesurvey
              u.umfrageLimesurveyId = surveyId;
              let umfrage = await UmfrageModel.create(u);
              await projekt.addUmfrage(umfrage); // add the survey to the project
          }).catch(error => {
              handleError(error);
          });

          surveyFile.destroyFile(); // delete the survey file from disk
      }

      // add each participant to the project
      for (teiln of data.teilnehmer) {
          console.log("Teilnehmer-Data:", teiln);
          let teilnId = teiln.mitarbeiterId;
          let teilnehmer = await MitarbeiterModel.findOne({
              where: {mitarbeiterId: teilnId},
              include: [AbteilungModel]
          });

          await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } }); // add the participant to the project
      }

      // retrieve all the newly created project participants and surveys
      projekt = await ProjektModel.findOne({ 
          where: {projektId: projekt.projektId},
          include: [{ 
              model: MitarbeiterModel, 
              include: [AbteilungModel]
          }, { model: UmfrageModel }]
      });
      let projektTeilnehmer = projekt.mitarbeiters;
      let projektUmfragen = projekt.umfrages;       

      // add each participant to each survey and write the token ID to the database
      for (let teilnehmer of projektTeilnehmer) {
          for (let umfr of projektUmfragen) {
              // adding participant to limesurvey
              let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":"none", "firstname":teilnehmer.mitarbeiterName, "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
              console.log("tokenid: ", limesurveyTokenId);

              // writing the limesurveyTokenId to database
              teilnehmer.addUmfrage(umfr, { 
                  through: { 
                      mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                      projektId: projekt.projektId 
                  } 
              })
          }
      }

      // create kibana space        
      let kibClient = new KIBAPI();
      await kibClient.createKibanaSpace(projekt.projektId, projekt.projektName);
      
      // create elasticsearch indices
      let esClient = new ESAPI();
      await esClient.createProjektIndices(projekt.projektId);

      console.log(" => Creating Project successfull");
      return res // the response
          .setHeader('Location', `/projekt/${projekt.projektId}`) // setting location header for the response to the client
          .set( { 'Access-Control-Expose-Headers': 'location', } ) // exposing location header
          .sendStatus(HTTP.CREATED);
  }
  catch (error) {
      handleError(error);
      return res.status(HTTP.INTERNAL_ERROR).send('Server error');
  } 
  finally {
      if (client) await client.closeConnection();
  }
};

ProjektController.read = async (req, res) => {
  let projektId = req.params.projektId;
  console.log("GET /projekt/" + projektId);   
  if (!projektId) return res.sendStatus(HTTP.BAD_REQUEST);
  try {      
      const result = await ProjektModel.findOne({
          where: {projektId: projektId},
          include: [{ 
              model: MitarbeiterModel, 
              include: [AbteilungModel, {
                  model: UmfrageModel,
                  where: { projektId: projektId }
              }]
          }, {
              model: UmfrageModel
          }]
      });      
      if (!result) return res.sendStatus(HTTP.NOT_FOUND);
      return res.send(result);
    
  } catch (err) {
      console.error(err);
      res.status(HTTP.INTERNAL_ERROR).send('Server error');
  }
};

ProjektController.update = async (req, res) => {
  let projektId = req.params.projektId;
  console.log("PUT /projekt/"+projektId);
  let client;

  try {        
      data = req.body; // the data sent by the client in request body

      if (!data.projektName || 
          !data.projektBeschreibung || 
          !data.projektStartDate || 
          !data.projektEndDate || 
          !data.teilnehmer || 
          !data.umfragen ) {
              console.log(" => incomplete request!")
              return res.sendStatus(HTTP.BAD_REQUEST);
      }
  
      var projekt = await ProjektModel.findOne({where: {projektId: projektId}});
      if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
      // update projekt meta-data
      projekt.set({
          projektName: data.projektName,
          projektBeschreibung: data.projektBeschreibung,
          projektStartDate: data.projektStartDate,
          projektEndDate: data.projektEndDate,
      })
      await projekt.save()

      data.teilnehmerNew = data.teilnehmer.filter(teiln => {
          return teiln.new;
      });

      data.umfragenNew = data.umfragen.filter(umfr => {
          return !umfr.readOnly;
      });

      // Opening a connection to LimeSurvey RPC
      client = new LRPC();
      await client.openConnection();

      // creating an array presentSurveyIds that contains all surveyIds of all surveys that existed in the Projekt before updating it.
      var presentUmfragen = await UmfrageModel.findAll({
          where: {projektId: projekt.projektId},
      });
      let presentSurveyIds = [];
      for (umfr of presentUmfragen) {
          presentSurveyIds.push(umfr.umfrageLimesurveyId);
      }
      console.log("Present surveyIds:",presentSurveyIds);

      var newSurveyIds = []; // array of newly created surveyIds
      for (u of data.umfragenNew) {
          let surveyFile = new SurveyFile(u.umfrageStartDate, u.umfrageEndDate, "AK Core Admin", "nifranz@uni-potsdam.de", projekt.projektName, projekt.projektBeschreibung);
          await surveyFile.createFile(); // creating the file in fs
          await client.createSurvey(surveyFile.getPathToFile())
          .then( async surveyId => {          
              await client.activateSurvey(surveyId);
              await client.activateTokens(surveyId, [1,2]);    
              newSurveyIds.push(""+surveyId); 
              u.umfrageLimesurveyId = surveyId;
              let umfrage = await UmfrageModel.create(u);
              await projekt.addUmfrage(umfrage);
          }).catch(error => {
              throw new Error(error);
          });
      }

      let newTeilnehmerMitarbeiterIds = []; // array that will contain the mitarbeiterIds of all new teilnehmers; for later use
      for (teiln of data.teilnehmerNew) {
          newTeilnehmerMitarbeiterIds.push(teiln.mitarbeiterId);
          console.log("Teilnehmer-Data:", teiln);
          let teilnId = teiln.mitarbeiterId;
          let teilnehmer = await MitarbeiterModel.findOne({
              where: {mitarbeiterId: teilnId},
              include: [AbteilungModel]
          });
          await projekt.addMitarbeiter(teilnehmer, { through: { mitarbeiterRolle: teiln.mitarbeiterRolle } });
      }

      projekt = await ProjektModel.findOne({ 
          where: {projektId: projekt.projektId},
          include: [{ 
              model: MitarbeiterModel, 
              include: [AbteilungModel]
          }, { model: UmfrageModel }]
      });
      let allProjektTeilnehmer = projekt.mitarbeiters;
      let allProjektUmfragen = projekt.umfrages;

      console.log(newSurveyIds);

      for (let teilnehmer of allProjektTeilnehmer) {
          for (let umfr of allProjektUmfragen) {
              console.log( newSurveyIds.includes(umfr.umfrageLimesurveyId) )
              if (newSurveyIds.includes(umfr.umfrageLimesurveyId)) { // add all teilnehmer to new surveys only
                  // adding all participants to limesurvey
                  let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname": "none","firstname":teilnehmer.mitarbeiterName, "email":teilnehmer.mitarbeiterEmail/*,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName*/} ]);
                  console.log("tokenid: ", limesurveyTokenId);

                  teilnehmer.addUmfrage(umfr, { 
                      through: { 
                          mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                          projektId: projekt.projektId 
                      } 
                  })

                  // writing the limesurveyTokenId to database
                  
              } else if (newTeilnehmerMitarbeiterIds.includes(teilnehmer.mitarbeiterId)) { // add only new teilnehmer to only already existing surveys 
                  let limesurveyTokenId = await client.addParticipants(umfr.umfrageLimesurveyId, [ {"lastname":teilnehmer.mitarbeiterName,"firstname":"TBD","email":teilnehmer.mitarbeiterEmail,"attribute_1":teilnehmer.projektTeilnahme.mitarbeiterRolle, "attribute_2":teilnehmer.abteilung.abteilungName} ]);
                  teilnehmer.addUmfrage(umfr, { 
                      through: { 
                          mitarbeiterLimesurveyTokenId: limesurveyTokenId,
                          projektId: projekt.projektId 
                      } 
                  })
              }                
          }
      }

      console.log("returning HTTP.CREATED");
      return res // the response
          .setHeader('Location', `/projekt/${projekt.projektId}`) // setting location header for the response to the client
          .set( { 'Access-Control-Expose-Headers': 'location', } )
          .sendStatus(HTTP.CREATED);
  }
  catch (error) {
      handleError(error);
      return res.status(HTTP.INTERNAL_ERROR).send('Server error');
  } 
  finally {
      if (client) await client.closeConnection();
  }
};

ProjektController.delete = async (req, res) => {
  let projektId = req.params.projektId;
  console.log("DELETE /projekt/"+projektId)
  let client;
  try {
      let projekt = await ProjektModel.findOne({where: {projektId: projektId},include: [UmfrageModel]});
      if (!projekt) return res.sendStatus(HTTP.NOT_FOUND);
      var projektUmfragen = projekt.umfrages;
  
      client = new LRPC();
      await client.openConnection();
  
      for (umfr of projektUmfragen) {
          console.log("lsid:",umfr.umfrageLimesurveyId);
          await client.deleteSurvey(umfr.umfrageLimesurveyId);
          await umfr.destroy();
      }
      
      // deleted related kibana space
      let kibClient = new KIBAPI();
      await kibClient.deleteKibanaSpace(projekt.projektId);

      // delete related elasticsearch indices
      let esClient = new ESAPI();
      await esClient.deleteProjectIndices(projekt.projektId);

      // delete projekt from akcoredb
      await projekt.destroy();
      
      return res.sendStatus(HTTP.OK);
  } catch (error) {
      handleError(error);
      res.status(HTTP.INTERNAL_ERROR).send('Server error');
  } finally {
      if (client) client.closeConnection();
  }
};

module.exports = ProjektController;