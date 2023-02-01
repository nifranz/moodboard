const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const finale = require('finale-rest')

let app = express();
const port = 3000;

// app.get("/", (req, res) => {
//     res.status(403).send("forbidden");
// })

app.listen(port, () => {
    console.log("Example app listening on port " + port);
})