'use strict';
const   express = require('express'),
        bodyParser = require('body-parser'),
        router = express.Router(),
        jsonParser = bodyParser.json(),
        config = require('../config'),
        passport = require('passport'),
        jwt = require('jsonwebtoken'),
        fileUpload = require('express-fileupload'),

        bucketName = config.BUCKET_NAME,
        bucketRegion = config.REGION,
        IdentityPoolId = config.IDENTITY_POOL_ID;

const {Event} = require('./models');

const { router: authRouter, jwtStrategy } = require('../auth');

// Load the Node performance timing API for timing image processing.
const { performance } = require('perf_hooks');

// Load the S3 SDK for JavaScript
const AWS = require('aws-sdk');

// Load the rekognition service for  
const rekognition = new AWS.Rekognition();

// Create S3 service object
let s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Set the region and identity pool
AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
    })
  });

passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false, failureRedirect: '/login' });

// Get to return all events for user.
router.get('/', jwtAuth, (req, res) => {
    const query = { username: req.user.username };
    //fields to return from query are called projections, : 1 or : true to include, _id is always returned.
    const projections = { eventName: 1, eventDate: 1, imgS3Location: 1 }; 
    Event.find(query, projections).then((data) => {
        res.json(data);
    }).catch(err => {
        res.status(500).json({message: 'Internal server error: ' + err.message});
    });
});

// Get to return all fields from single event document.
router.get('/event/:id', jwtAuth, (req, res) => {
    const query = { _id: req.params.id };
    //fields to return from query are called projections, : 1 or : true to include, _id is always returned.
    Event.findOne(query).then((data) => {
        res.json(data);
    }).catch(err => {
        res.status(500).json({message: 'Internal server error: ' + err.message});
    });
});

// POST to upload an event image to S3, process it with Rekognition, write process results to the DB, then redirect the user to the event details page for the new event ID.
router.post('/', jwtAuth, function (req, res) {  
    console.log('Image processing started.')
    let overall_t0 = performance.now();
    // gathering params for original image
    const file = req.files.uploadFile;
    const user = req.user.username;
    const keyPath = 'user/' + user + '/' + file.name;
    const eventID = { _id: '' };

    //Uploads original image to S3 for use in face detection...
    console.log('Original image upload started.');
    const uploadParams = {  Bucket: bucketName, 
                            Key: keyPath, 
                            Body: file.data     };
    let imgDta1 = {};
    imgDta1 = s3.upload(uploadParams).promise()
    .then((imgDta1) => {
        let uploadOrig_t0 = performance.now();
        Event.create({
            username: user,
            imgS3Key: imgDta1.Key,
            imgS3Location: imgDta1.Location,
            eventName: req.body.eventName.trim(),
            eventDate: req.body.eventDate,
        })
        .then((eventData) => {
            eventID._id = eventData.id;
            let uploadOrig_t1 = performance.now();
            console.log('Original image upload completed in ' + (uploadOrig_t1 - uploadOrig_t0) + ' ms.');
            console.log('AWS Rekognition detectFaces started.');
        });
        
        //Then uses runRekognition to perform facial recognition on image...
        let rekognition = new AWS.Rekognition();
        const detectParams = {
            Image: {
                S3Object: {
                    Bucket: bucketName, 
                    Name: imgDta1.Key
                } 
            }
        };

        rekognition.detectFaces(detectParams).promise()
        .then((faceData) => {
            let faceDetect_t0 = performance.now();
            if (faceData.FaceDetails) {
                let faceDetect_t1 = performance.now();
                console.log('AWS Rekognition detectFaces completed in ' + (faceDetect_t1 - faceDetect_t0) + ' ms.');
                console.log('Summarization of facial recognition data started.');
            }

            //Then extracts interesting data from the raw facial recognition data to use as img2 metadata... 
            let summary = { crowdCount: faceData.FaceDetails.length };

            //boxesOnly is used on the client side to draw face boxes on the image.
            let boxesOnly = faceData.FaceDetails.map((FaceDetails, index, dataset) => {
                return FaceDetails.BoundingBox;
            })
            //Updates the DB entry with the data we've processed.
            Event.update(eventID, {
                rekognitionData: faceData,
                faceBoxes: boxesOnly,
                crowdCount: summary.crowdCount
            })
            .then(() => {
                //loads event details page with event ID
                const target = `/details?evnt=${encodeURI(eventID._id)}`;
                res.redirect(target);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({message: 'Internal server error: ' + err});
           });
        });
    }).catch(err => {
         console.log(err);
         res.status(500).json({message: 'Internal server error: ' + err});
    });
});

//This is actually a DELETE method but was prevented as such by browser - TODO: Research / implement 'method override"
router.post('/remove', jwtAuth, (req, res) => {
    const delKey = req.body.deleteKey;
    const delId = { _id: req.body.deleteId };
    // call S3 to delete specified object
    const deleteParams = {Bucket: bucketName, Key: delKey};
    s3.deleteObject(deleteParams).promise().then((err, data) => {
        //Add a cachebuster to prevent a cached version of the redirect page (with a deleted event) from serving. This part of the query string is meaningless.
        let rando = encodeURI([...Array(8)].map(() => Math.random().toString(36)[3]).join(''));
        res.status(301).redirect('/events?=deleteSuccess&cachebustr=' + rando); 
    }).catch(err => {
        res.status(500).json({message: 'Internal server error: ' + err.message});
    });  
});

module.exports = {router};