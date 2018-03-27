'use strict';
const   express = require('express'),
        bodyParser = require('body-parser'),
        router = express.Router(),
        jsonParser = bodyParser.json(),
        config = require('../config'),

        fileUpload = require('express-fileupload'),
        fs = require('fs'),
        path = require('path'),

        PImage = require('pureimage'),

        bucketName = config.BUCKET_NAME,
        bucketRegion = config.REGION,
        IdentityPoolId = config.IDENTITY_POOL_ID,
        buildDir = config.BUILD_DIR;

const {Event} = require('./models');

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

//Uses dataset bounding boxes to create marked up copy of image at /proc/usr/{username}/*.jpg, then passes copied image S3 object data to the original upload route.
function drawFaceBoxes(dataset, imgLink, usrname, mtadata) {
    let boxesOnly = dataset.FaceDetails.map((FaceDetails, index, dataset) => {
        return FaceDetails.BoundingBox;
    })
    //TODO: decodePNG / encode also available, rewrite to grab file type and if switch this
    pImage.decodeJPEGFromStream(fs.createReadStream(imgLink)).then((img) => {
        let img2 = PImage.make(img.width, img.height);
        let ctx = img2.getContext('2d');
        ctx.drawImage(img,
            0, 0, img.width, img.height, // source dimensions
            0, 0, img.width, img.height  // destination dimensions
        );
        ctx.strokeStyle = 'white';
        ctx.lineWidth = .2;
        boxesOnly.forEach((e) => {
            ctx.strokeRect({x: e.Left, y: e.Top, w: e.Width, h: e.Height});
        });
        let keyImg2 = '/proc/usr/' + usrname + '/counted_' + path.basename(imgLink);
        //In case this requires the filestreaming method:
        //var pth = path.join('temp',"img_counted.jpg");
        //pImage.encodeJPEGToStream(img2,).then(() => {
        //return await uploadImgToS3(keyImg2, img2, mtadata);;
        return uploadImgToS3(keyImg2, img2, mtadata);
        });
}

//Grabs and summarizes interesting data for use in copied image (the one with face boxes) metadata.
function rekogSummarizer(facesData) {
    console.log('rekogSummarizer ran.');
    let summary = { crowdCount: facesData.FaceDetails.length };
    return facesData;
}

//Returns face data to upload route for use in drawing bounding boxes and extracting metadata.
function runRekognition(imageKey) {
    // Construct a rekognition service for the image
    let rekognition = new AWS.Rekognition();
    const detectParams = {
        Image: {
         S3Object: {
          Bucket: bucketName, 
          Name: imageKey.Key
         } } };
    // call AWS rekognition to detect faces on the specified file
    rekognition.detectFaces(detectParams, function (err, data) {
        if (err) { 
            return err; // an error occurred
        } if (data) {
            return data;
        };
    });
}


async function asyncUploadImgToS3(s3key, imgData, metaData, user) {
    const uploadParams = {Bucket: bucketName, Key: s3key, Body: imgData, Metadata: metaData};
    return await s3.upload (uploadParams, (err, data) => {
        if (err) {
            return err; // an error occurred
        } if (data) {
            return data.Key;
        };
    });
}

async function uploadImgToS3(s3key, imgData, metaData, user) {
    const uploadParams = {Bucket: bucketName, Key: s3key, Body: imgData, Metadata: metaData};
    await s3.upload (uploadParams, (err, data) => {
        if (err) {
            return err; // an error occurred
        } if (data) {
            return data.Key;
        };
    });
}

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

// POST to upload an event image and respond with a copied image with face boxes and Rekognition metadata.
router.post('/', function (req, res) {
    
    // const faceData = runRekognition(imgDta1);
    // const fdSummary = rekogSummarizer(faceData);
    // const imgDta2 = drawFaceBoxes(faceData, imgDta1.Location, user, metaDta);

    // if (err) {
    //     console.log(err.message);
    //     //return err; // an error occurred
    // } 

    
    (async () => {
        console.log('Image processing started.')
        let overall_t0 = performance.now();
        // gathering params for original image
        const file = req.files.uploadFile;
        const user = req.body.ulUsername;
        const keyPath = 'user/' + user + '/' + file.name;
        const metaDta = {   eventName: req.body.eventName, 
                            eventDate: req.body.eventDate      };

        //Uploads original image to S3 for use in face detection...
        console.log('Original image upload started.');
        const uploadParams = {  Bucket: bucketName, 
                                Key: keyPath, 
                                Body: file.data, 
                                Metadata: metaDta   };
        let imgDta1 = {};
        imgDta1 = await s3.upload (uploadParams).promise();
        let uploadOrig_t0 = performance.now();
        if (imgDta1.Key) {
            let uploadOrig_t1 = performance.now();
            console.log('Original image upload completed in ' + (uploadOrig_t1 - uploadOrig_t0) + ' ms.');
            console.log('AWS Rekognition detectFaces started.');
        }
        
        //Then uses runRekognition to perform facial recognition on image...
        let rekognition = new AWS.Rekognition();
        const detectParams = {
            Image: {
             S3Object: {
              Bucket: bucketName, 
              Name: imgDta1.Key
             } } };
        let faceData = {};

        faceData = await rekognition.detectFaces(detectParams).promise();
        let faceDetect_t0 = performance.now();
        if (faceData.FaceDetails) {
            let faceDetect_t1 = performance.now();
            console.log('AWS Rekognition detectFaces completed in ' + (faceDetect_t1 - faceDetect_t0) + ' ms.');
            console.log('Summarization of facial recognition data started.');
        }

        //Then extracts interesting data from the raw facial recognition data to use as img2 metadata... 
        let summary = { crowdCount: faceData.FaceDetails.length };

        //Then creates a copy of the image and draws face boxes on it, and saves it in a separate S3 folder. creates key to the marked up image.
        let boxesOnly = faceData.FaceDetails.map((FaceDetails, index, dataset) => {
            return FaceDetails.BoundingBox;
        })
        //TODO: decodePNG / encode also available, rewrite to grab file type and if switch this
        
        let faceBoxImg_t0 = performance.now();
        console.log('FaceBox image processing started');
        
        const img1Params = {    Bucket: bucketName, 
                                Key:    imgDta1.Key };
        
        let randomFileName = [...Array(12)].map(() => Math.random().toString(36)[3]).join('');
        let outFileName = randomFileName + '.jpg';
        let outPath = buildDir + '/out/' + outFileName;
        
        PImage.decodeJPEGFromStream(s3.getObject(img1Params).createReadStream()).then((img) => {
            let img2 = PImage.make(img.width, img.height);
            let ctx = img2.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height); // source dimensions
            //     0, 0, img.width, img.height,                 // destination dimensions
            // );
            //ctx.fillStyle = 'rgba(0,0,0, 0.0)';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;

            const imgWidth = img.width;
            const imgHeight = img.height;

            boxesOnly.forEach((e) => {
                ctx.strokeRect(e.Left * imgWidth, e.Top * imgHeight, e.Width * imgWidth, e.Height * imgHeight);
            });
            let keyImg2 = 'proc/usr/' + user + '/counted_' + path.basename(imgDta1.Key);
            //In case this requires the filestreaming method:
            //var pth = path.join('temp',"img_counted.jpg");
            let imgDta2 = {};

            PImage.encodeJPEGToStream(img2,fs.createWriteStream(outPath)).then(() => {            
                const boxImg = fs.createReadStream(outPath);
                const boxImgParams = {  Bucket: bucketName, 
                                        Key: keyImg2, 
                                        Body: boxImg
                                        //Metadata: JSON.stringify(summary)  //TODO: Fix metadata
                                        };
                let boxImgData = {};
                s3.upload(boxImgParams).promise().then((data) => {
                    boxImgData = data;
                    let faceBoxImg_t1 = performance.now();
                    console.log('FaceBox image processing completed in ' + ((faceBoxImg_t1 - faceBoxImg_t0) / 1000) + ' ms.');
                    let overall_t1 = performance.now();
                    console.log('Overall image processing completed in ' + ((overall_t1 - overall_t0) / 1000) + ' ms.');
                    const target = `/details?evnt=${encodeURI(boxImgData.Key)}`;
                    res.redirect(target);
                });
            });
        });
    })().catch(err => {
        console.log(err);
        //res.status(500).json({message: 'Internal server error: ' + err});
    });
});

async function s3uploader(s3PathToFile, base64data, metadata) {
    const uploadParams = {  Bucket: bucketName, 
                            Key: s3PathToFile, 
                            Body: base64data, 
                            Metadata: metadata   };
    const s3ObjData = await s3.upload(uploadParams).promise();
    return s3ObjData;
}

// POST to upload image to S3 and create db entry.
router.post('/create'), (req, res) => {
    (async () => {
        console.log('Image processing started.')
        let overall_t0 = performance.now();
        // gathering params for original image
        const file = req.files.uploadFile;
        const user = req.body.ulUsername;
        const keyPath = 'user/' + user + '/' + file.name;
        const metaDta = {   eventName: req.body.eventName, 
                            eventDate: req.body.eventDate      };
        const originalImgS3Data = await s3uploader(keyPath, file.data, metaDta);
        console.log(originalImgs3Data);
    });
}


// POST for testing, gets AWS rekognition data.
router.post('/detectFaces', (req, res) => {
    // Construct a rekognition service for the image
    let rekognition = new AWS.Rekognition();
    const detectParams = {
        Image: {
         S3Object: {
          Bucket: bucketName, 
          Name: req.body.key
         } } };

    // call AWS rekognition to detect faces on the specified file
    rekognition.detectFaces(detectParams, function (err, data) {
        if (err) { 
            res.status(500).json({message: 'Internal server error: ' + err + err.stack}); // an error occurred
        } if (data) {
            const summary = rekogSummarizer(data);
            res.status(200).json(summary); }
      });
});

//This is actually a DELETE method but was prevented as such by browser - TODO: Research / implement 'method override"
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
            res.status(301).redirect('/events?=deleteSuccess'); }
    });
});


module.exports = {router};
