const fs = require('fs/promises')
const uuid = require('uuid')
const replace = require('replace-in-file')

const HTTP = {
    OK: 200, 
    CREATED: 201, 
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, 
    NOT_FOUND: 404,
    NOT_ACCEPTABLE: 406,
    INTERNAL_ERROR: 500,
}

/**
 * Class representing a Survey File.
 */
class SurveyFile {
    /**
     * Create a Survey File.
     * @param {string} umfrageStartDate - The start date of the survey.
     * @param {string} umfrageEndDate - The end date of the survey.
     * @param {string} adminName - The name of the survey administrator.
     * @param {string} adminEmail - The email address of the survey administrator.
     * @param {string} umfrageTitel - The title of the survey.
     * @param {string} umfrageBeschreibung - The description of the survey.
     */
    constructor(umfrageStartDate, umfrageEndDate, adminName, adminEmail, umfrageTitel, umfrageBeschreibung) {
        // initialize survey file properties
        this.umfrageStartDate = umfrageStartDate;
        this.umfrageEndDate = umfrageEndDate;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.umfrageTitel = umfrageTitel;
        this.umfrageBeschreibung = umfrageBeschreibung;

        // create a unique file path for the survey file
        this.filePath = __dirname + "/../assets/limesurvey/tmp." + uuid.v4() + "_survey-import-file_" + ".lss";

        // set the created flag to false
        this.created = false;
    }

    /**
     * Create a temporary survey file.
     * @async
     * @throws {Error} Will throw an error if the file has already been created or there is an error reading the base survey file.
     */
    async createFile() {
        // throw an error if the file has already been created
        if (this.created) throw new Error("File has already been created!");
        // read the base survey file
        let sourceSurveyFilePath = __dirname + '/../assets/limesurvey/base_survey_2.lss'
        let sourceSurveyFile = await fs.readFile(sourceSurveyFilePath, { encoding: 'UTF-8' });

        // throw an error if there was a problem reading the base survey file
        if(!sourceSurveyFile) throw new Error("Some error reading the file");

        // create new temporary import lss-file        
        await fs.writeFile(this.filePath, sourceSurveyFile, function(){}) 

        // replacing survey properties in temporary file
        let replacements = {
            "replaceStartDate": {
                files: this.filePath,
                from: /<startdate>.*<\/startdate>/,
                to: "<startdate><![CDATA["+ this.umfrageStartDate + " 00:00:00" +"]]></startdate>",
            },
            "replaceEndDate": {
                files: this.filePath,
                from: /<expires>.*<\/expires>/,
                to: "<expires><![CDATA["+ this.umfrageEndDate + " 23:59:59" +"]]></expires>",
            },
            "replaceAdminName": {
                files: this.filePath,
                from: /<admin>.*<\/admin>/,
                to: "<admin><![CDATA["+ this.adminName +"]]></admin>",
            },
            "replaceAdminEmail": {
                files: this.filePath,
                from: /<adminemail>.*<\/adminemail>/,
                to: "<adminemail><![CDATA["+ this.adminEmail +"]]></adminemail>",
            },
            "replaceUmfrageTitel": {
                files: this.filePath,
                from: /<surveyls_title>.*<\/surveyls_title>/,
                to: "<surveyls_title><![CDATA["+ "Stimmungsbarometer für Projekt " + this.umfrageTitel +"]]></surveyls_title>",
            },
            "replaceUmfrageBeschreibung": {
                files: this.filePath,
                from: /<surveyls_description>.*<\/surveyls_description>/,
                to: "<surveyls_description><![CDATA["+ this.umfrageBeschreibung +"]]></surveyls_description>",
            }
        }
        for (let replacement of Object.values(replacements)) {
            console.log(replacement.files);
            await replace(replacement);
        }

        this.created = true;
    }
    /**
     * Gets the path to the survey file.
     */
    getPathToFile() {
        if (this.destroyed || !this.created) return console.log("No file has been created or it has already been destroyed.");
        return this.filePath;
    }
    /**
     * Destroys the survey file.
     * @throws {Error} If no file has been created yet or if the file has already been destroyed.
     * @returns {Promise<void>} A promise that resolves when the file has been destroyed.
     */
    async destroyFile() {
        if (!this.created) {
            throw new Error("No file has been created yet. No file was destroyed.");
        }
        if (this.destroyed) {
            throw new Error("File has already been destroyed");
        }
        await fs.unlink(this.filePath);
        this.destroyed = true;
    }
}
/**
 * Returns the current date in the format 'YYYY-MM-DD'.
 * @return {string} The current date as a string in the format 'YYYY-MM-DD'.
 */
function getToday() {
    let d = new Date;
    let month = d.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    // Return the current date as a string in the format 'YYYY-MM-DD'.
    return '' + `${d.getFullYear()}-${month}-${day}`
}
/**
 * Returns the previous day's date in the format 'YYYY-MM-DD'.
 * @return {string} The previous day's date as a string in the format 'YYYY-MM-DD'.
 */
function getYesterday() {
    let d = new Date(new Date(getToday()).getTime() - 60*60*24*1000);
    let month = d.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    } 
    let day = d.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    // Return the previous day's date as a string in the format 'YYYY-MM-DD'.
    return '' + `${d.getFullYear()}-${month}-${day}`
}

const ERROR_LOG_PATH = __dirname + "/../logs/error.log"
function handleError(error) {
    console.log(error);
    let dateString = (new Date(Date.now()).toString()).split(" ");
    let timeString = dateString[1] + " " + dateString[2] + " " + dateString[3] + " " + dateString[4] + " => "
    fs.appendFile(ERROR_LOG_PATH, timeString + error + "\r\n", (error) => {});
}

module.exports = { HTTP, SurveyFile, getToday, getYesterday, handleError }