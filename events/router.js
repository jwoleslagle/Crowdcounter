'use strict';
const   express = require('express'),
        bodyParser = require('body-parser'),
        router = express.Router(),
        jsonParser = bodyParser.json(),
        config = require('../config'),

        fs = require('fs'),
        path = require('path'),
        fileUpload = require('express-fileupload'),
        formidable = require('formidable'),
        multer = require('multer'),
        multerS3 = require('multer-s3'),

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

let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketName,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

// Get to return all event files in S3 folder.
router.get('/', (req, res) => {
    // TODO: change 'test2' to req.username
     const bucketPrefix = 'user/' + req.headers.username + '/';
    // Create the parameters for calling createBucket
    const bucketParams = { 
        Bucket: bucketName,
        Prefix: bucketPrefix 
      };                                
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

router.post('/upload', upload.array('req.files', 1), function(req, res, next) {
    res.send('Successfully uploaded ' + req.files.length + ' files!')
  })

// router.post('/upload', (req, res) => {
//     // call S3 to retrieve upload file to specified bucket
//     const uploadParams = {Bucket: bucketName, Key: '', Body: ''};
//     const file = req.files.uploadFile;

//     let fileStream = fs.createReadStream(path.basename(file.name));
//     fileStream.on('error', function(err) {
//         console.log('File Error', err);
//         });
//     uploadParams.Body = fileStream;
//     uploadParams.Key = path.basename(file);

//     // call S3 to retrieve upload file to specified bucket
//     s3.upload (uploadParams, function (err, data) {
//     if (err) {
//         res.status(500).json({message: 'Internal server error: ' + err});
//     } if (data) {
//         res.status(201).json({message: 'Upload successful: ' + data.Location});
//     }
//     });
// });

module.exports = {router};
