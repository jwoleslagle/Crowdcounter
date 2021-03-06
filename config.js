'use strict';
exports.DATABASE_URL =
    process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    'mongodb://localhost/crowdcounter_local';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.BUCKET_NAME = process.env.BUCKET_NAME;
exports.REGION = process.env.REGION;
exports.IDENTITY_POOL_ID = process.env.IDENTITY_POOL_ID;