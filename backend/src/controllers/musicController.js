const User = require('../models/User');

const defaultState = () => ({ isPlaying: false, track: { id: 'desk-radio-1', title: 'Desk Radio', artist: 'Digital Desk', duration: '', currentTime: '', cover: '', audioUrl: '', isLiked: false }, volume: 65, isShuffle: false, isRepeat: false });
const getState = (user) => user.musicState || defaultState();

const getNowPlaying = async (req, res) => res.json({ success: true, data: getState(req.user) });
const controlPlayback = async (req, res, next) => {
  try {
    const state = getState(req.user);
    const { action, volume, isShuffle, isRepeat, track } = req.body;
    if (action === 'play') state.isPlaying = true;
    if (action === 'pause') state.isPlaying = false;
    if (action === 'toggle') state.isPlaying = !state.isPlaying;
    if (action === 'next' || action === 'previous') state.isPlaying = false;
    if (action === 'like') state.track.isLiked = !state.track.isLiked;
    if (Number.isFinite(Number(volume))) state.volume = Math.max(0, Math.min(100, Number(volume)));
    if (typeof isShuffle === 'boolean') state.isShuffle = isShuffle;
    if (typeof isRepeat === 'boolean') state.isRepeat = isRepeat;
    if (track && typeof track.audioUrl === 'string' && /^https:\/\//.test(track.audioUrl)) state.track = { ...state.track, ...track, isPlaying: false };
    req.user.musicState = state;
    await req.user.save();
    res.json({ success: true, data: state });
  } catch (error) { next(error); }
};

module.exports = { getNowPlaying, controlPlayback };
