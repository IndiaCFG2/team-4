const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const authRoutes = require('./routes/authRoutes')
app.use(bodyParser.json())
app.use('/dashboard',authRoutes);

app.listen(3000, () => {console.log('Server listening to 3000')})