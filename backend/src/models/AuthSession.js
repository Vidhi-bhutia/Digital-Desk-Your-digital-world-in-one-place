const mongoose = require('mongoose');
const schema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, tokenId: { type: String, required: true, unique: true }, device: { type: String, default: 'Unknown device' }, ip: { type: String, default: '' }, lastSeenAt: { type: Date, default: Date.now }, expiresAt: { type: Date, required: true, index: { expires: 0 } } }, { timestamps: true });
module.exports = mongoose.model('AuthSession', schema);
