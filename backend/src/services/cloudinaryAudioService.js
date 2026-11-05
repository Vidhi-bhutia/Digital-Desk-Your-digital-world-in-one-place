const config = require('../config/env');
const logger = require('../utils/logger');

const audioFormats = new Set(['aac', 'aiff', 'flac', 'm4a', 'mp3', 'oga', 'ogg', 'opus', 'wav', 'wma']);
const metadataFor = publicId => {
  const id = String(publicId || '').split('/').pop().replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');
  const known = [
    [/nazm\s+nazm/i, 'Nazm Nazm', 'Arko'],
    [/tum\s+se\s+hi/i, 'Tum Se Hi', 'Mohit Chauhan'],
    [/main\s+rang\s+sharbaton\s+ka/i, 'Main Rang Sharbaton Ka', 'Atif Aslam'],
    [/tera\s+hone\s+((?:laga|lagaa)\s+)?hoon/i, 'Tera Hone Laga Hoon', 'Atif Aslam, Alisha Chinai'],
    [/dekha\s+hazaro\s+dafaa/i, 'Dekha Hazaro Dafaa', 'Arijit Singh, Palak Muchhal'],
  ];
  const match = known.find(([pattern]) => pattern.test(id));
  if (match) return { title: match[1], artist: match[2] };
  const cleaned = id.replace(/\b(full video|lyrical|official video|audio)\b/ig, '').replace(/\s+/g, ' ').trim();
  return { title: cleaned || 'Untitled track', artist: 'Uploaded to Desk Radio' };
};

let cachedTracks = null;
let cacheExpiresAt = 0;
let inflight = null;

const fetchAudioTracks = async () => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) return null;
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/video?max_results=100`;
  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Cloudinary audio library request failed (${response.status}).`);
  const result = await response.json();
  return (result.resources || [])
    .filter(asset => audioFormats.has(String(asset.format || '').toLowerCase()) && asset.secure_url)
    .map(asset => {
      const metadata = metadataFor(asset.display_name || asset.original_filename || asset.public_id);
      return {
        id: asset.public_id,
        title: metadata.title,
        artist: metadata.artist,
        audioUrl: asset.secure_url,
        duration: asset.duration ? `${Math.floor(asset.duration / 60)}:${String(Math.floor(asset.duration % 60)).padStart(2, '0')}` : '',
        cover: '',
        source: 'cloudinary',
      };
    });
};

const getCloudinaryAudioTracks = async () => {
  const now = Date.now();
  if (cachedTracks && cacheExpiresAt > now) return cachedTracks;
  if (inflight) return inflight;
  inflight = fetchAudioTracks().then(tracks => {
    if (tracks?.length) {
      cachedTracks = tracks;
      cacheExpiresAt = Date.now() + 5 * 60 * 1000;
      return tracks;
    }
    return null;
  }).catch(error => {
    logger.warn('Cloudinary audio library unavailable:', error.message);
    return null;
  }).finally(() => { inflight = null; });
  return inflight;
};

module.exports = { getCloudinaryAudioTracks };
