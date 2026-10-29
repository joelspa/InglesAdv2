import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import audioManifest from './audio-manifest.json';

const timeLabel = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function AudioPlayer({ question, compact = false }) {
  const clip = audioManifest[question.id];
  const audioRef = useRef();
  const playRequest = useRef(0);
  const freshPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(!clip);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(clip?.seconds || 0);
  const [rate, setRate] = useState(1);
  const [plays, setPlays] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    const pauseWhenHidden = () => { if (document.hidden) { playRequest.current++; audio?.pause(); setLoading(false); } };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      playRequest.current++;
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      audio?.pause();
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !clip) return;
    if (!audio.paused || loading) {
      playRequest.current++; audio.pause(); setPlaying(false); setLoading(false); return;
    }
    const request = ++playRequest.current;
    const fromStart = audio.currentTime < .1 || audio.ended;
    freshPlayback.current = fromStart;
    if (audio.ended) audio.currentTime = 0;
    if (error) { audio.load(); setError(false); }
    setLoading(true);
    audio.playbackRate = rate;
    audio.preservesPitch = true;
    try {
      await audio.play();
      if (playRequest.current !== request) return;
      setLoading(false);
    } catch (failure) {
      if (playRequest.current !== request) return;
      setLoading(false); setPlaying(false);
      if (failure.name !== 'AbortError') setError(true);
    }
  }

  function rewind() {
    playRequest.current++;
    freshPlayback.current = false;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPosition(0); setPlaying(false); setLoading(false);
  }

  function changeRate() {
    const next = rate === 1 ? .85 : 1;
    setRate(next);
    if (audioRef.current) { audioRef.current.playbackRate = next; audioRef.current.preservesPitch = true; }
  }

  const playLabel = playing || loading ? 'Pausar audio' : position > 0 && position < duration - .1 ? 'Continuar audio' : plays ? 'Volver a escuchar' : compact ? 'Escuchar historia narrada' : 'Reproducir audio';
  return <div className={`recorded-player ${compact ? 'compact' : ''} ${playing ? 'playing' : ''}`}>
    <audio ref={audioRef} src={clip?.src} preload="none"
      onLoadedMetadata={event => { if (Number.isFinite(event.currentTarget.duration)) setDuration(event.currentTarget.duration); }}
      onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
      onPlaying={() => { setPlaying(true); setLoading(false); if (freshPlayback.current) { freshPlayback.current = false; setPlays(count => count + 1); } }}
      onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); setPosition(audioRef.current.duration); }}
      onError={() => { setError(true); setPlaying(false); setLoading(false); }}
    />
    <div className="recorded-main">
      <button className="recorded-play" onClick={toggle} disabled={!clip} aria-label={playLabel} aria-busy={loading}>{loading ? <LoaderCircle className="audio-loading" size={24} aria-hidden="true" /> : playing ? <Pause size={25} aria-hidden="true" /> : <Play size={25} aria-hidden="true" />}</button>
      <div className="recorded-description"><b>{compact ? 'Escucha la historia' : 'Listening'}</b><span>{loading ? 'Cargando audio…' : playing ? 'Escuchando…' : 'Pulsa ▶ para escuchar'}</span></div>
      <span className="recorded-voice"><Volume2 size={14} aria-hidden="true" />{clip?.voices.length > 1 ? 'Dos voces' : 'Voz natural'}</span>
    </div>
    <div className="recorded-timeline"><span>{timeLabel(position)}</span><input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(position, duration || 1)} disabled={!clip || duration <= 0} aria-label={'Posición del audio'} aria-valuetext={`${timeLabel(position)} / ${timeLabel(duration)}`} onChange={event => { const next = Number(event.target.value); audioRef.current.currentTime = next; setPosition(next); }} /><span>{timeLabel(duration)}</span></div>
    <div className="recorded-controls"><button onClick={rewind} disabled={!clip} aria-label={'Volver al inicio del audio'}><RotateCcw size={15} aria-hidden="true" />{'Desde el inicio'}</button><button onClick={changeRate} aria-label={`${'Velocidad del audio'}: ${rate}x`}>{rate === 1 ? 'Velocidad normal' : 'Más despacio'} · {rate}x</button></div>
    {!compact && <p className="recorded-note">{'Puedes pausar, repetir o escuchar más despacio antes de responder.'}</p>}
    <small className="audio-disclosure">{'Voz generada con IA'}{plays > 0 ? ` · ${'Reproducciones'}: ${plays}` : ''}</small>
    {error && <div className="audio-fallback" role="status"><b>{'Puedes practicar leyendo'}</b><p>{'El audio no se pudo cargar. Vuelve a pulsar reproducir para intentarlo de nuevo.'}</p><blockquote lang="en">{question.audio || question.story}</blockquote></div>}
  </div>;
}
