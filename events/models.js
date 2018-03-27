'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
  _id: {
    type: ObjectId,
    required: true,
    unique: true
    },
  user: {
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
    type: Mixed, 
    default: ''
  },
  updated: {
      type: Date, 
      default: Date.now
  }
});

EventSchema.methods.serialize = function() {
  return {
    user: this.user || '',
    eventName: this.eventName || '',
    eventDate: this.eventDate || ''
  };
};

Schema_Category.virtual('eventId').get(function() {
    return this._id;
});

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};