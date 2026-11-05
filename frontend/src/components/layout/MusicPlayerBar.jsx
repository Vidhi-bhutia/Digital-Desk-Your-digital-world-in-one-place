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
  Maximize2,
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [library, setLibrary] = useState([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const formatTime = value => Number.isFinite(value) ? `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}` : '0:00';
  const sendControl = async body => {
    const response = await apiClient('/music/control', { method: 'POST', body });
    if (response?.data) {
      setIsPlaying(!!response.data.isPlaying); setIsLiked(!!response.data.track?.isLiked);
      setVolume(response.data.volume ?? volume); setIsShuffle(!!response.data.isShuffle); setIsRepeat(!!response.data.isRepeat);
      if (response.data.track) setTrack(response.data.track);
    }
    return response?.data;
  };

  useEffect(() => {
    // Fetch initial playback state from API
    apiClient('/music/now-playing')
      .then(res => {
        if (res && res.data) {
          setIsPlaying(false);
          setIsLiked(!!res.data.track?.isLiked);
          setVolume(res.data.volume);
          setIsShuffle(!!res.data.isShuffle);
          setIsRepeat(!!res.data.isRepeat);
          setLibrary(res.data.tracks || []);
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
    if (!track.audioUrl) { setAudioError('Radio stream is not configured on the server.'); return; }
    setAudioError('');
    sendControl({ action: isPlaying ? 'pause' : 'play' }).catch(() => setAudioError('Playback state could not be saved.'));
  };

  const toggleLike = () => {
    sendControl({ action: 'like' }).catch(() => setAudioError('Could not update saved track state.'));
  };
  const skip = direction => {
    const audio = audioRef.current;
    if (!audio) return;
    if (direction === 'previous' && audio.currentTime > 3) audio.currentTime = 0;
    else { audio.currentTime = 0; setCurrentTime(0); }
    setAudioError('');
    sendControl({ action: direction }).catch(() => {});
  };

  return (
    <div
      className="dd-music-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 'var(--dd-sidebar-width, 260px)',
        right: 0,
        minHeight: '76px',
        height: 'auto',
        flexWrap: 'wrap',
        backgroundColor: '#072015',
        color: '#FFFFFF',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        zIndex: 50,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Left: Track Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
        <audio ref={audioRef} src={track.audioUrl || undefined} onLoadedMetadata={e => setDuration(e.currentTarget.duration || 0)} onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime || 0)} onError={() => { setAudioError('Audio stream unavailable.'); setIsPlaying(false); }} onEnded={() => { if (isRepeat) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => setIsPlaying(false)); } else { setIsPlaying(false); setCurrentTime(0); } }} />
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
        /> : null}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
            {track.title}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>
            {track.artist}
          </div>
          {track.attributionUrl && <span style={{ display: 'flex', gap: 5, fontSize: 10 }}><a href={track.attributionUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,.58)' }}>Credit: {track.artist}</a>{track.licenseUrl && <a href={track.licenseUrl} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,.42)' }}>{track.license || 'License'}</a>}</span>}
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
          <button aria-label="Shuffle" onClick={() => sendControl({ isShuffle: !isShuffle }).catch(() => {})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isShuffle ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }}>
            <Shuffle size={16} />
          </button>
          <button aria-label="Previous track" onClick={() => skip('previous')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
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
          <button aria-label="Next track" onClick={() => skip('next')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FFFFFF' }}>
            <SkipForward size={18} fill="#FFFFFF" />
          </button>
          <button aria-label="Repeat" onClick={() => sendControl({ isRepeat: !isRepeat }).catch(() => {})} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isRepeat ? '#10B981' : 'rgba(255, 255, 255, 0.6)' }}>
            <Repeat size={16} />
          </button>
        </div>

        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
            {audioError || formatTime(currentTime)}
          </span>
          <div
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              position: 'relative',
              cursor: track.audioUrl ? 'pointer' : 'not-allowed',
            }}
            onClick={e => { if (!audioRef.current || !duration) return; const bounds = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = Math.max(0, Math.min(duration, ((e.clientX - bounds.left) / bounds.width) * duration)); }}
          >
            <div
              style={{
                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                height: '100%',
                backgroundColor: '#10B981',
                borderRadius: '2px',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontFamily: 'monospace' }}>
            {duration ? formatTime(duration) : track.duration || '0:00'}
          </span>
        </div>
      </div>

      {/* Right: Auxiliary Controls & Volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '180px', justifyContent: 'flex-end' }}>
        <button aria-label="Open music library" title="Desk Radio library" onClick={() => setLibraryOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255, 255, 255, 0.7)' }}>
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
            onChange={(e) => { const next = Number(e.target.value); setVolume(next); setIsMuted(false); if (audioRef.current) audioRef.current.volume = next / 100; sendControl({ volume: next }).catch(() => {}); }}
            style={{ width: '80px', accentColor: '#10B981', cursor: 'pointer' }}
          />
        </div>

        <button aria-label="Expand player" title="Player is already in the dashboard bar" style={{ background: 'none', border: 'none', cursor: 'default', color: 'rgba(255, 255, 255, 0.35)' }}>
          <Maximize2 size={16} />
        </button>
      </div>
      {libraryOpen && <div role="dialog" aria-label="Desk Radio library" style={{ position: 'absolute', right: 90, bottom: 'calc(100% + 10px)', width: 'min(360px, calc(100vw - 24px))', maxHeight: 360, overflowY: 'auto', background: '#0b2c1d', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: 14, boxShadow: '0 12px 35px rgba(0,0,0,.35)' }}><strong style={{ display: 'block', marginBottom: 8 }}>Desk Radio - Music library</strong>{library.map(item => <div key={item.id} style={{ padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,.12)' }}><button onClick={() => { setAudioError(''); sendControl({ trackId: item.id }).catch(() => setAudioError('Could not load this track.')); setLibraryOpen(false); }} style={{ width: '100%', textAlign: 'left', border: 0, color: '#fff', background: 'transparent', cursor: 'pointer' }}><b>{item.title}</b></button><small style={{ display: 'flex', gap: 7, color: 'rgba(255,255,255,.65)' }}><span>{item.artist}</span>{item.attributionUrl && <a href={item.attributionUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>Credit</a>}{item.licenseUrl && <a href={item.licenseUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>{item.license || 'License'}</a>}</small></div>)}</div>}
    </div>
  );
};

export default MusicPlayerBar;
