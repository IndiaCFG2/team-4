const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const dashboardRouter = require("./back_end/routes/dashboard");

const app = express();

app.use(bodyParser.json());
app.use('/dashboard', dashboardRouter);  

//const db = require('./config/mongoDBKey').mongoURI;

/* mongoose
    .connect(db)
    .then( () => console.log('MongoDB Connection Established.') )
    .catch( err => console.log(err)); */

app.get('/', (req, res) => {
    res.json({status: 'Available'}) 
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server runnng on port ${port}`)
}); 