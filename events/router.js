'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();
const config = require('../config');

const fs = require('fs');
const path = require('path');

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

// Post to create a new folder (if the user doesn't already have one)
router.post('/new', jsonParser, function(req, res) {
    // Create the parameters for calling createBucket
    var bucketParams = {
        Bucket : req.body.username
    };            
                                    
    // Call S3 to create the bucket
    s3.createBucket(bucketParams, function(err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } else {
            res.status(201).json({message: 'Upload successful: ' + data.Location});
        }
    });
});

// Get to return all event files in S3 folder.
router.get('/', (req, res) => {
    // TODO: change 'test2' to req.username
     const bucketPrefix = 'user/' + 'test2' + '/';
    // Create the parameters for calling createBucket
    const bucketParams = { 
        Bucket: bucketName,
        Prefix: bucketPrefix 
      }                                   
    // Call S3 to list items in the bucket
    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } else {
            const objectsThatAreNotFolders = data.Contents.filter((content) => {
                return !content.Key.endsWith('/'); //if / is not in the key
              });
            res.status(200).json(objectsThatAreNotFolders);
        }
    });
});

router.post('/upload', (req, res) => {
    // call S3 to retrieve upload file to specified bucket
    const uploadParams = {Bucket: bucketName, Key: '', Body: ''};
    const file = req.file;
    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function(err) {
        console.log('File Error', err);
        });
    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(file);

    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
    if (err) {
        res.status(500).json({message: 'Internal server error: ' + err});
    } if (data) {
        res.status(201).json({message: 'Upload successful: ' + data.Location});
    }
    });
});

module.exports = {router};
