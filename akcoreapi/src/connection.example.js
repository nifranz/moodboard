/**
 * File: connection.example.js 
 * This file demonstrates the structure of the required connection.js file, which is not included in the git repository to avoid exposing passwords and api keys.
 * It's purpose is to recreate the original file based on this structure, if it should be lost.
 */

module.exports = {
    // mariadb database-credentials
    db_name : 'akcoredb',
    db_username : 'example-username',
    db_password : '*****',
    db_host : 'localhost',
    
    // limesurvey admin-credentials
    ls_username : 'example-username',
    ls_password : '*****',
    
    // kibana admin api-key
    kibanaapikey_base64 : "*****",
}