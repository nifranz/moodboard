// services/authService.js
const { ACCOUNTS } = require('../accounts');

async function login (accountName, accountPasswort) {    
    let account;
    for (let acc of ACCOUNTS) { // check if there is an account matching the requested accountName
        if (acc.accountName == accountName) account = acc;
    }
    
    if (!account) { // if no account is found send back HTTP error
        throw new Error (`Invalid username or password`);
    }

    const validPassword = account.passwort == accountPasswort;

    if (!validPassword) {
        throw new Error (`Invalid username or password`);
    }

    delete account.passwort; // exclude account passwort from response account object
    return account
}

module.exports = { login, }