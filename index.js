var express = require("express");
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config/keys.js');
var passport = require('passport');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
require('./config/passport')(passport);
mongoose.connect(config.database);
var db = mongoose.connection;
app.set('view engine','jade');
app.set('/views','./views')
db.on('error',function(err){
    console.log('No connection to DB')
})
db.once('open',function(error){
    console.log('DB has been connected!')
})
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })

}));
app.use(passport.initialize());
app.use(passport.session());
//routes
var shop = require('./routes/index.js')
app.use('/',shop);








app.listen(process.env.PORT || 7000,function(){
    console.log('app running on port 7000')
})