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
  const [track, setTrack] = useState({
    title: 'Iktara',
    artist: 'Amit Trivedi',
    duration: '4:12',
    currentTime: '1:28',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
  });

  useEffect(() => {
    // Fetch initial playback state from API
    apiClient('/music/now-playing')
      .then(res => {
        if (res && res.data) {
          setIsPlaying(res.data.isPlaying);
          setIsLiked(res.data.track.isLiked);
          setVolume(res.data.volume);
        }
      })
      .catch(() => {});
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    apiClient('/music/control', { method: 'POST', body: { action: 'toggle' } }).catch(() => {});
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
        <img
          src={track.cover}
          alt={track.title}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        />
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
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)' }}>
            <Shuffle size={16} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
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
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
            <SkipForward size={18} fill="#FFFFFF" />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.6)' }}>
            <Repeat size={16} />
          </button>
        </div>

        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
            {track.currentTime}
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
