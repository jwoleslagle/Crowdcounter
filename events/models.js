'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  imgS3Key: {
    type: String,
    required: true,
    unique: true
  },
  imgS3Location: {
    type: String,
    required: true
  },
  eventName: {
      type: String, 
      required: true
  },
  eventDate: {
      type: Date, 
      required: true
  },
  rekognitionData: {
    type: Object, 
    default: ''
  },
  faceBoxes: {
    type: Object,
    default: ''
  },
  crowdCount: {
    type: Number,
    default: 0
  },
  updated: {
      type: Date, 
      default: Date.now
  }
});

EventSchema.methods.serialize = function() {
  return {
    eventID: this._id || '',
    eventName: this.eventName || '',
    eventDate: this.eventDate || '',
    eventImgLocation: this.imgS3Location || '',
    eventImgKey: this.imgS3Key || ''
  };
};

EventSchema.virtual('eventId').get(function() {
    return this._id;
});

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};