var fetch = require('node-fetch');
var config = require('../config');

class Blockchain {

    constructor() {
        this.enrollmentID = config.enrollmentID;
        this.enrollmentSecret = config.enrollmentSecret;
        this.peerAddress = config.peerAddress;
        this.chaincode_repo = config.chaincode_repo;
    }

    registerNewID() {

        let body = {
            "enrollId": this.enrollmentID,
            "enrollSecret": this.enrollmentSecret
        };

        return fetch(this.peerAddress + '/registrar', { method: 'POST', body: JSON.stringify(body) })
            .then(function (res) {
                return res.json();
            });
    }

    checkIDRegistration() {

        return fetch(this.peerAddress + '/registrar/' + this.enrollmentID)
            .then(function (res) {
                return res.json();
            });
    }

    deployChainCode() {
        let helloString = "hello from block chain";
        let body = {
            "jsonrpc": "2.0",
            "method": "deploy",
            "params": {
                "type": 1,
                "chaincodeID": {
                    "path": this.chaincode_repo
                },
                "ctorMsg": {
                    "function": "init",
                    "args": [
                        helloString
                    ]
                },
                "secureContext": this.enrollmentID
            },
            "id": 1
        };


        return fetch(this.peerAddress + '/chaincode', { method: 'POST', body: JSON.stringify(body) })
            .then(function (res) {
                return res.json();
            });
    }

    queryChainCode(func, args, chaincodeID) {
        let body = {
            "jsonrpc": "2.0",
            "method": "query",
            "params": {
                "type": 1,
                "chaincodeID": {
                    "name": chaincodeID
                },
                "ctorMsg": {
                    "function": func,
                    "args": args
                },
                "secureContext": this.enrollmentID
            },
            "id": 2
        };

        return fetch(this.peerAddress + '/chaincode', { method: 'POST', body: JSON.stringify(body) })
            .then(function (res) {
                return res.json();
            });
    }

    invokeChainCode(func, args, chaincodeID) {
        let body = {
            "jsonrpc": "2.0",
            "method": "invoke",
            "params": {
                "type": 1,
                "chaincodeID": {
                    "name": chaincodeID
                },
                "ctorMsg": {
                    "function": func,
                    "args": args
                },
                "secureContext": this.enrollmentID
            },
            "id": 2
        };
        
        return fetch(this.peerAddress + '/chaincode', { method: 'POST', body: JSON.stringify(body) })
            .then(function (res) {
                return res.json();
            });
    }
};

let blockchain = new Blockchain();

module.exports = blockchain;