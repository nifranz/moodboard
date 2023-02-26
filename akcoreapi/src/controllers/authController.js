// controllers/authController.js

const { HTTP } = require('../helper');
const { login } = require('../services/authService');

AuthController = {}

AuthController.login = async (req, res) => {
    let accountName = "";
    let accountPasswort = "";
    try {
        throw new Error("abc ")
        let token = login(accountName, accountPasswort);

        console.log(" => login successful for user " + accountName);

        return res.send(token);
    } catch (err) {
        console.log(err)
        console.log(" => login unsuccessful for user " + accountName);

        return res.status(HTTP.UNAUTHORIZED).send(err);
    }
}

module.exports = AuthController;