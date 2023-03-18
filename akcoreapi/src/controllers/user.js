const OrganisationModel = require('../models/organisation');
const UserModel = require('../models/user');
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

const UserController = {};

UserController.list = async (req, res) => {
    let { organisationId } = req.query;
    console.log("GET /user for org: " + organisationId);

    try {
        // Check if organization ID is provided, return error if missing
        if (!organisationId) return res.sendStatus(HTTP.BAD_REQUEST);

        // Check if organization exists, return error if not found
        if (!(await OrganisationModel.findOne({ where: { organisationId: organisationId } }))) return res.sendStatus(HTTP.NOT_FOUND);

        // Find all users for specific organization and include related surveys and projects
        let user = await UserModel.findAll({
            where: { organisationId: organisationId }
        });

        // Return JSON response with all employees
        return res.send(user);

    } catch (err) {
        console.error(err);
        res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

UserController.create = async (req, res) => {
    console.log("CREATE /user");
    try {
        data = req.body; // the data sent by the client in request body
        console.log(req.body);
        
        if (!data.username || !data.password || !data.type || !data.organisationId) {
            // Return HTTP BAD_REQUEST if required data is missing
            return res.sendStatus(HTTP.BAD_REQUEST);
        }

        // Create a new User record in the database with the provided data
        let user = await UserModel.create({
            username: data.username,
            password: data.password,
            type: data.type,
            organisationId: data.organisationId
        });

        // Return HTTP CREATED status code to indicate that the record was successfully created
        return res.status(HTTP.CREATED).send(user);
    } catch (err) {
        console.error(err);
        res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

UserController.read = async (req, res) => {
    let username = req.params.username;
    try {
        let user = await UserModel.findOne({ where: { username: username} });
        if (!user)return res.sendStatus(HTTP.NOT_FOUND);
        return res.status(HTTP.OK).send(user);
    } catch (err) {
        console.error(err);
        res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

UserController.update = async (req, res) => {
    try {
        // update a user at specific userId
        let data = req.body; // the data sent by the client in request body
        let userId = req.params.userId;

        if (!data.username || !data.password || !data.type) return res.sendStatus(HTTP.BAD_REQUEST);

        let result = await UserModel.findOne({
            where: { userId: userId },
        })
            .then(async result => {
                let user = result;

                user.update({
                    username: data.username,
                    password: data.password,
                    type: data.type
                }, { where: { userId: userId } })
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

UserController.delete = async (req, res) => {
    let userId = req.params.userId;
    console.log("DELETE /user/" + userId);
    try {
        // DELETE a user for specific userId
        let success = await UserModel.destroy({
            where: { userId: userId }
        });

        if (!success) return res.sendStatus(HTTP.NOT_FOUND);
        return res.sendStatus(HTTP.OK);

    } catch (err) {
        console.error(err);
        res.status(HTTP.INTERNAL_ERROR).send('Server error');
    }
};

module.exports = UserController;