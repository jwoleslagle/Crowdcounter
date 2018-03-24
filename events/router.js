'use strict';
const   express = require('express'),
        bodyParser = require('body-parser'),
        router = express.Router(),
        jsonParser = bodyParser.json(),
        config = require('../config'),

        fileUpload = require('express-fileUpload'),
        fs = require('fs'),
        path = require('path'),

        bucketName = config.BUCKET_NAME,
        bucketRegion = config.REGION,
        IdentityPoolId = config.IDENTITY_POOL_ID;

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

// Get to return all event files in S3 folder.
router.get('/', (req, res) => {
    // TODO: change 'test2' to req.username
     const bucketPrefix = 'user/' + req.headers.username + '/';
    // Create the parameters for calling createBucket
    const bucketParams = { 
        Bucket: bucketName,
        Prefix: bucketPrefix };                                
    // Call S3 to list items in the bucket
    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } else {
            const objectsThatAreNotFolders = data.Contents.filter((content) => {
                return !content.Key.endsWith('/'); //if / is not in the key
              });
            res.json(objectsThatAreNotFolders);
        }
    });
});

router.post('/', (req, res) => {
    // call S3 to retrieve upload file to specified bucket
    const uploadParams = {Bucket: bucketName, Key: '', Body: ''};
    const file = req.files.uploadFile;
    const keyPath = 'user/' + req.body.ulUsername + '/';
    uploadParams.Body = file.data;
    uploadParams.Key = keyPath + file.name;

    // call S3 to retrieve upload file to specified bucket
    s3.upload (uploadParams, function (err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } if (data) {
            res.status(201).json({  message:        'Upload successful',
                                    dataLocation:   data.Location,
                                    dataETag:       data.ETag});
        }
    });
});

router.post('/remove', (req, res) => {
    // call S3 to retrieve upload file to specified bucket
    const deleteParams = {Bucket: bucketName, Key: ''};
    const decodedKey = (req.body.deleteKey);
    deleteParams.Key = decodedKey;

    // call S3 to retrieve upload file to specified bucket
    s3.deleteObject(deleteParams, function (err, data) {
        if (err) {
            res.status(500).json({message: 'Internal server error: ' + err});
        } if (data) {
            res.status(204).json({  message: 'Delete successful'});
        }
    });
});


module.exports = {router};
