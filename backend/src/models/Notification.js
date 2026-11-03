const mongoose = require('mongoose');
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, category: { type: String, enum: ['tasks','integrations','security','system'], required: true }, title: { type: String, required: true }, message: { type: String, default: '' }, link: { type: String, default: '/' }, channels: { type: [String], default: ['inApp'] }, dedupeKey: { type: String, required: true }, readAt: { type: Date, default: null } }, { timestamps: true });
schema.index({ userId: 1, dedupeKey: 1 }, { unique: true });
module.exports = mongoose.model('Notification', schema);
