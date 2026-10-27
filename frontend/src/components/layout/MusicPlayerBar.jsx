import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Maximize2 
} from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export const MusicPlayerBar = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(true);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [track, setTrack] = useState({
    title: 'Desk Radio', artist: 'Digital Desk', duration: '', currentTime: '', cover: '', audioUrl: '',
  });
  const audioRef = React.useRef(null);
  const [audioError, setAudioError] = useState('');

  useEffect(() => {
    // Fetch initial playback state from API
    apiClient('/music/now-playing')
      .then(res => {
        if (res && res.data) {
          setIsPlaying(res.data.isPlaying);
          setIsLiked(res.data.track.isLiked);
          setVolume(res.data.volume);
          setIsShuffle(!!res.data.isShuffle);
          setIsRepeat(!!res.data.isRepeat);
          if (res.data.track) setTrack(res.data.track);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!track.audioUrl || !audioRef.current) return;
    audioRef.current.volume = (isMuted ? 0 : volume) / 100;
    if (isPlaying) audioRef.current.play().catch(() => { setIsPlaying(false); setAudioError('Playback blocked or stream unavailable.'); });
    else audioRef.current.pause();
  }, [isPlaying, volume, isMuted, track.audioUrl]);

  const togglePlay = () => {
    if (!track.audioUrl) { setAudioError('No audio stream configured. Add a licensed HTTPS stream URL to use Desk Radio.'); return; }
    apiClient('/music/control', { method: 'POST', body: { action: isPlaying ? 'pause' : 'play' } }).then(r => setIsPlaying(r.data.isPlaying)).catch(() => {});
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    apiClient('/music/control', { method: 'POST', body: { action: 'like' } }).catch(() => {});
  };

  return (
    <div
      className="dd-music-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '76px',
        backgroundColor: '#072015',
        color: '#FFFFFF',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Left: Track Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
        <audio ref={audioRef} src={track.audioUrl || undefined} onError={() => { setAudioError('Audio stream unavailable.'); setIsPlaying(false); }} onEnded={() => setIsPlaying(false)} />
        {track.cover ? <img
          src={track.cover}
          alt={track.title}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        /> : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#155b3a' }} />}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
            {track.title}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
            {track.artist}
          </div>
        </div>
        <button
          onClick={toggleLike}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isLiked ? '#10B981' : 'rgba(255, 255, 255, 0.5)',
            padding: '4px',
            marginLeft: '4px',
          }}
        >
          <Heart size={18} fill={isLiked ? '#10B981' : 'none'} />
        </button>
      </div>

      {/* Center: Playback Controls & Progress Scrubber */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          flex: 1,
          maxWidth: '560px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button aria-label="Shuffle" onClick={() => setIsShuffle(v => { apiClient('/music/control', {method:'POST', body:{isShuffle:!v}}).catch(()=>{}); return !v; })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffle ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }}>
            <Shuffle size={16} />
          </button>
          <button aria-label="Previous track" onClick={() => { setIsPlaying(false); apiClient('/music/control',{method:'POST',body:{action:'previous'}}).catch(()=>{}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
            <SkipBack size={18} fill="#FFFFFF" />
          </button>
          <button
            onClick={togglePlay}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              color: '#072015',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 150ms ease',
            }}
          >
            {isPlaying ? <Pause size={18} fill="#072015" /> : <Play size={18} fill="#072015" style={{ marginLeft: '2px' }} />}
          </button>
          <button aria-label="Next track" onClick={() => { setIsPlaying(false); apiClient('/music/control',{method:'POST',body:{action:'next'}}).catch(()=>{}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
            <SkipForward size={18} fill="#FFFFFF" />
          </button>
          <button aria-label="Repeat" onClick={() => setIsRepeat(v => { apiClient('/music/control', {method:'POST', body:{isRepeat:!v}}).catch(()=>{}); return !v; })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isRepeat ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }}>
            <Repeat size={16} />
          </button>
        </div>

        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
            {audioError || track.currentTime}
          </span>
          <div
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '35%',
                height: '100%',
                backgroundColor: '#10B981',
                borderRadius: '2px',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
            {track.duration}
          </span>
        </div>
      </div>

      {/* Right: Auxiliary Controls & Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px', justifyContent: 'flex-end' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)' }}>
          <ListMusic size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
            style={{ width: '80px', accentColor: '#10B981', cursor: 'pointer' }}
          />
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)' }}>
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayerBar;
