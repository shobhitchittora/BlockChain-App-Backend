var express = require('express');
var app = express();

/*
    Exporting app to be used by other modules
*/

module.exports = app;

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var config = require('./config');
var User = require('./app/models/user');
var apiRoutes = require('./app/api');

var port = process.env.PORT || 8080;

mongoose.connect(config.database);
app.set('superSecret', config.secret);

// API MIDDLEWARES 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use('/api', apiRoutes);


// APP ROUTES
app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/setup', function (req, res) {

    // create a sample user
    var myuser = new User({
        name: 'shobhit',
        password: 'password',
        admin: true
    });

    // save the sample user
    myuser.save(function (err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({ success: true });
    });
});

app.listen(port).on('error',(err)=>console.log(err));

console.log('Server running @ localhost: ', + port);

