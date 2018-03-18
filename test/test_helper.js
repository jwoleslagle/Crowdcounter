//const mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

//before((done) => {
//    mongoose.connect('mongodb://localhost/crowdcounter_test', {
//        useMongoClient: true,
//});

//mongoose.connection
//    .once('open', () => {done();})
//    .on('error', (error) => {
//        console.warn('warning', error);
//    });
//});

//beforeEach(() => {
//    mongoose.connection.collections.users.drop(() => {
//        done();
//    });
//});