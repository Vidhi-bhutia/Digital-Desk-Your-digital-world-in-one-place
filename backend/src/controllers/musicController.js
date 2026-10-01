let musicState = {
  isPlaying: true,
  track: {
    id: '1',
    title: 'Iktara',
    artist: 'Amit Trivedi',
    album: 'Wake Up Sid',
    duration: '4:12',
    durationSeconds: 252,
    currentTime: '1:28',
    currentTimeSeconds: 88,
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
    isLiked: true,
  },
  volume: 75,
  isShuffle: false,
  isRepeat: false,
};

const getNowPlaying = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: musicState,
  });
};

const controlPlayback = async (req, res) => {
  const { action, volume, isLiked } = req.body;

  if (action === 'play') musicState.isPlaying = true;
  if (action === 'pause') musicState.isPlaying = false;
  if (action === 'toggle') musicState.isPlaying = !musicState.isPlaying;
  if (action === 'like') musicState.track.isLiked = !musicState.track.isLiked;
  if (volume !== undefined) musicState.volume = volume;

  return res.status(200).json({
    success: true,
    data: musicState,
  });
};

module.exports = {
  getNowPlaying,
  controlPlayback,
};
