const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    time: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '1 hour',
    },
    type: {
      type: String,
      enum: ['meeting', 'task', 'event'],
      default: 'meeting',
    },
    meetLink: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: null,
    },
    htmlLink: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
