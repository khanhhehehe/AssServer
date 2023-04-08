var express = require('express')
var expressHbs = require('express-handlebars')
var session = require('express-session')
const apiRouter = require('./routes/api')
const config = require('./config/database')
const mongoose = require('mongoose')
const post = 3000

var app = express()
app.engine('.hbs', expressHbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: 'views/layouts/',
}))

app.use(session({
    secret: 'NDFHnafidsfnadhf23nfsdhf23njNDFInn34djnfjkhanhhehehehehehehehehehe',
    resave: true,
    saveUninitialized: true
}))


app.set('view engine', '.hbs')
app.use('/api',apiRouter)
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = app;
app.listen(post, () => {
    console.log("Application started and Listening on port "+post);
})