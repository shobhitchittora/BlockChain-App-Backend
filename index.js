var express = require('express');
var app = express();

var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var config = require('./config');
var User = require('./app/models/user');


var port = process.env.PORT || 8080;

var mongooseOptions = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       

mongoose.connect(config.database,mongooseOptions);
var connection = mongoose.connection;
connection.on('error', console.error.bind(console,'connection error:'));

app.set('superSecret', config.secret);

// API MIDDLEWARES 

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(morgan('dev'));


/*
    Exporting app to be used by other modules
*/

module.exports = app;

//Setting API Routes
var apiRoutes = require('./app/api');
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

        if (err) { console.log(err); res.json(err) };

        console.log('User saved successfully');
        res.json({ success: true });
    });
});

app.listen(port).on('error', (err) => console.log(err));

console.log('Server running @ localhost: ', + port);



