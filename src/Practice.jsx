import React from 'react';
import { BookOpen, Headphones, RotateCcw, Swords, Zap } from 'lucide-react';
import { Mascot } from './Mascot.jsx';

export function Practice({ progress, onMode }) {
  const mistakes = progress.mistakes.length;
  const modes = [
    { id: 'speed', icon: Zap, tone: 'gold', title: 'Desafío relámpago', text: `60 segundos, preguntas de un toque. Tu récord: ${progress.speedBest}.`, action: 'Jugar' },
    { id: 'general', icon: Swords, tone: 'grape', title: 'Desafío general', text: '10 preguntas de los 9 temas, con informe de tus fortalezas.', action: 'Empezar' },
    { id: 'listening', icon: Headphones, tone: 'sky', title: 'Listening', text: 'Escucha audios con voces naturales y responde.', action: 'Escuchar' },
    { id: 'reading', icon: BookOpen, tone: 'good', title: 'Reading', text: 'Lee historias cortas y comprueba lo que entendiste.', action: 'Leer' }
  ];
  return <div className="practice">
    <section className={`review-hero ${mistakes ? '' : 'clear'}`}>
      <Mascot mood={mistakes ? 'think' : 'happy'} size={96} />
      <div>
        <h2>{mistakes ? 'Repasa tus errores' : 'No tienes errores pendientes'}</h2>
        <p>{mistakes ? `${mistakes} ${mistakes === 1 ? 'ejercicio te espera' : 'ejercicios te esperan'}. Sin vidas: practica hasta que salgan solos.` : 'Cuando falles un ejercicio, aparecerá aquí para que lo practiques.'}</p>
      </div>
      <button type="button" className="btn btn-primary" disabled={!mistakes} onClick={() => onMode('mistakes')}><RotateCcw size={18} aria-hidden="true" />Repasar</button>
    </section>
    <div className="mode-grid">
      {modes.map(mode => <button key={mode.id} type="button" className={`mode-card ${mode.tone}`} onClick={() => onMode(mode.id)}>
        <span className="mode-icon"><mode.icon size={30} aria-hidden="true" /></span>
        <h3>{mode.title}</h3>
        <p>{mode.text}</p>
        <span className="mode-action">{mode.action}</span>
      </button>)}
    </div>
  </div>;
}
