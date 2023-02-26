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


const createProject = async (name, description, organizationId) => {
  try {
    
    return project;
  } catch (error) {
    throw new Error(`Error creating project: ${error.message}`);
  }
};

module.exports = {
  createProject,
};