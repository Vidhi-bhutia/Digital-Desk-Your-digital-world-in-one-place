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
      required: true,
      default: '2:00 PM',
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
      default: 'https://meet.google.com/abc-defg-hij',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

module.exports = CalendarEvent;
