var express = require('express');
var apiRoutes = express.Router();
var jwt = require('jsonwebtoken');

var app = require('../index');
var User = require('./models/user');

var BlockChain = require('./blockchain');


apiRoutes.get('/', (req, res) => {
    res.json({ message: 'Welcome to my API!' });
});

apiRoutes.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        res.json(users);
    })
});

apiRoutes.get('/registrar', (req, res) => {
    let promise = BlockChain.checkIDRegistration();
    promise.then((jsonresp) => {
        console.log(jsonresp);
        res.send(jsonresp);
    })
});

apiRoutes.get('/registrar/new', (req, res) => {
    let promise = BlockChain.registerNewID();
    promise.then((jsonresp) => {
        console.log(jsonresp);
        res.send(jsonresp);
    });
});

apiRoutes.get('/chaincode/transactions/:id', (req, res) => {

    let promise = BlockChain.checkTransaction(req.params.id);
    promise.then(jsonresp => {
        if (jsonresp.Error)
            console.log('Transaction not found');
        else
            console.log('Transaction found with timestamp - ' + jsonresp.timestamp.seconds);

        res.send(jsonresp);

    }).catch(err => console.log(err));

});

apiRoutes.get('/chaincode/deploy', (req, res) => {
    let promise = BlockChain.deployChainCode();
    promise.then((jsonresp) => {

        if (jsonresp.result.status == "OK") {
            let chainCodeID = jsonresp.result.message;
            app.set('chaincodeID', chainCodeID);            //***** Setting the GLOBAL chainCODE ID  *****//

            console.log('CHAINCODE ID -> ', app.get('chaincodeID'));
        }
        console.log(jsonresp);
        res.send(jsonresp);
    }).catch(err => console.log(err));
});


apiRoutes.post('/chaincode/invoke', (req, res) => {
    let func = req.body.func;
    let args = req.body.args;
    //let chaicodeID = app.get('chaicodeID');
    if (!app.get('chaincodeID')) {
        res.json({ 'error': 'No Chaincode ID found' });
        return;
    }

    //let chaicodeID = "d43766b84927af0725ea9d521c990eb9ffdfb8a3f2d2eef6aa91c9f55c329a4cc5ac68dcd7c5e4bc2550d066a2debd9ec4436fe710f21e6e9add78cf71b5623d";

    let chaincodeID = app.get('chaincodeID');

    let promise = BlockChain.invokeChainCode(func, JSON.parse(args), chaincodeID);
    promise.then(jsonresp => {
        if (jsonresp.result.status == "OK") {
            console.log('TRANSACTION ID --> ', jsonresp.result.message);
        }
        res.send(jsonresp);
    }).catch(err => {
        console.log('Err -> ', err);
        res.end();
    });

});


/**
 * Encountered some erros when using /chaincode/query with the form post with 'func' as one of the field
 * So weird
 */

apiRoutes.post('/chaincode/query', (req, res) => {

    let func = req.body.func;
    let args = req.body.args;
    //let chaicodeID = app.get('chaicodeID');
    
    if (!app.get('chaincodeID')) {
        res.json({ 'error': 'No Chaincode ID found' });
        return;
    }


    //let chaicodeID = "d43766b84927af0725ea9d521c990eb9ffdfb8a3f2d2eef6aa91c9f55c329a4cc5ac68dcd7c5e4bc2550d066a2debd9ec4436fe710f21e6e9add78cf71b5623d";

    let chaincodeID = app.get('chaincodeID');

    let promise = BlockChain.queryChainCode(func, JSON.parse(args), chaincodeID);
    promise.then(jsonresp => {
        if (jsonresp.result.status == "OK") {
            console.log(jsonresp.result.message);
        }
        res.send(jsonresp);
    }).catch(err => {
        console.log('Error ==> ', err);
        res.end();
    });

});

// un-protected path
apiRoutes.post('/auth', (req, res) => {

    // find the user
    User.findOne({
        name: req.body.name
    }, function (err, user) {

        if (err) { console.log(err); res.json(err) };

        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

                // if user is found and password is right
                // create a token
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 86400 // expires in 24 hours ( 24*60*60 )
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});

// MIDDLEWARE to protect any paths defined from this point on
apiRoutes.use(function (req, res, next) {

    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});



module.exports = apiRoutes;