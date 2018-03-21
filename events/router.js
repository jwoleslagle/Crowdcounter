'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const config = require('../config');

const bucketName = config.BUCKET_NAME;
const bucketRegion = config.REGION;
const IdentityPoolId = config.IDENTITY_POOL_ID;

// Load the S3 SDK for JavaScript
const AWS = require('aws-sdk');

// Create S3 service object
let s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Set the region and identity pool
AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
    })
  });

// Post to register a new event
router.post('/', jsonParser, function(req, res) {
    res.status(200).json({message: 'api/events post ran'});
});

// Get to return all event files in S3 folder.
router.get('/', (req, res) => {
    // Create the parameters for calling createBucket
    const bucketParams = {
        Bucket : bucketName
    };                                      
    // Call S3 to list items in the bucket
    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } else {
            res.json(data);
        }
    });
});

module.exports = {router};
