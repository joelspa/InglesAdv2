import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Check, ChefHat, Crown, Flame, Footprints, Gem, Heart, Medal, Star, Target, Timer, X, Zap } from 'lucide-react';
import { Mascot } from './Mascot.jsx';
import { celebrate, useCountUp } from './LessonComplete.jsx';
import { DAILY_GOAL } from './rewards.mjs';
import { play } from './sound.mjs';

const ease = [0.23, 1, 0.32, 1];
export const badgeIcons = { Footprints, Gem, Zap, Flame, Star, Timer, ChefHat, Medal, Crown };
const pop = { initial: { opacity: 0, transform: 'scale(0.8)' }, animate: { opacity: 1, transform: 'scale(1)' }, transition: { type: 'spring', duration: 0.55, bounce: 0.35 } };

function Streak({ days }) {
  const shown = useCountUp(days, { delay: 500, duration: 500 });
  const week = Array.from({ length: 7 }, (_, i) => i >= 7 - Math.min(days, 7));
  return <>
    <motion.div className="flame-badge" {...pop}><Flame size={92} fill="currentColor" strokeWidth={1.4} aria-hidden="true" /></motion.div>
    <p className="streak-number" aria-hidden="true">{Math.max(shown, days === 1 ? 1 : days - 1)}</p>
    <h1 className="screen-title" tabIndex="-1">{days === 1 ? '¡Empezaste una racha!' : `¡${days} días de racha!`}</h1>
    <p className="screen-sub">Vuelve mañana para que tu llama siga encendida.</p>
    <ol className="week" aria-label={`Racha de ${days} ${days === 1 ? 'día' : 'días'}`}>
      {week.map((on, i) => <motion.li key={i} className={on ? 'on' : ''} initial={{ opacity: 0, transform: 'scale(0.8)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ delay: 0.6 + i * 0.05, duration: 0.2, ease }}>{on && <Check size={14} aria-hidden="true" />}</motion.li>)}
    </ol>
  </>;
}

function Chest({ gain }) {
  const shown = useCountUp(gain, { delay: 1100, duration: 600 });
  return <>
    <div className="chest-stage">
      <svg className="chest" viewBox="0 0 160 140" aria-hidden="true">
        <g className="chest-rays">{Array.from({ length: 10 }, (_, i) => <rect key={i} x="78" y="0" width="4" height="34" rx="2" transform={`rotate(${i * 36} 80 76)`} />)}</g>
        <g className="chest-body">
          <rect x="22" y="66" width="116" height="62" rx="12" fill="#B9683A" />
          <rect x="22" y="66" width="116" height="14" fill="#9A5228" />
          <rect x="70" y="66" width="20" height="62" fill="#FFB61E" />
          <rect x="64" y="84" width="32" height="22" rx="6" fill="#FFD66B" stroke="#C98A00" strokeWidth="3" />
        </g>
        <g className="chest-lid">
          <path d="M22 66 V52 Q22 26 80 26 Q138 26 138 52 V66 Z" fill="#D07E46" />
          <rect x="70" y="26" width="20" height="40" fill="#FFB61E" />
        </g>
      </svg>
    </div>
    <motion.p className="chest-gain" initial={{ opacity: 0, transform: 'translateY(12px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} transition={{ delay: 1, duration: 0.3, ease }}>+{shown} XP</motion.p>
    <h1 className="screen-title" tabIndex="-1">¡Cofre abierto!</h1>
    <p className="screen-sub">Terminaste el tema. Aquí tienes tu recompensa.</p>
  </>;
}

const views = {
  streak: event => <Streak days={event.days} />,
  chest: event => <Chest gain={event.gain} />,
  level: event => <>
    <motion.div className="level-badge" {...pop}><span>{event.level}</span></motion.div>
    <h1 className="screen-title" tabIndex="-1">¡Subiste al nivel {event.level}!</h1>
    <p className="screen-sub">Tu inglés sube de nivel con cada lección.</p>
  </>,
};

// Streaks, level-ups and chests take the whole screen; goals and badges are toasts.
export const isScreenEvent = event => Boolean(views[event.type]);
const sounds = { streak: 'streak', chest: 'chest', level: 'level' };

export function Toast({ event, index, onDone }) {
  useEffect(() => {
    if (index === 0) play('star');
    const timer = setTimeout(onDone, 4200 + index * 600);
    return () => clearTimeout(timer);
  }, []);
  const goal = event.type === 'goal';
  const Icon = goal ? Target : badgeIcons[event.achievement.icon] || Award;
  return <motion.div layout className={`toast ${event.type}`}
    initial={{ opacity: 0, transform: 'translateY(-14px) scale(0.96)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
    exit={{ opacity: 0, transform: 'translateY(-8px) scale(0.98)', transition: { duration: 0.15 } }} transition={{ delay: index * 0.08, duration: 0.3, ease }}>
    <span className="toast-icon"><Icon size={26} aria-hidden="true" /></span>
    <p><b>{goal ? '¡Meta diaria cumplida!' : `Logro: ${event.achievement.name}`}</b><span>{goal ? `Ganaste ${DAILY_GOAL} XP hoy.` : event.achievement.desc}</span></p>
    <button type="button" className="icon-button" aria-label="Cerrar aviso" onClick={onDone}><X size={18} /></button>
  </motion.div>;
}

export function Celebration({ event, onDone }) {
  useEffect(() => {
    play(sounds[event.type]);
    const timer = setTimeout(() => celebrate(event.type === 'chest' ? 0.8 : 0.6), event.type === 'chest' ? 900 : 200);
    return () => clearTimeout(timer);
  }, [event]);
  return <motion.div className={`screen celebration ${event.type}`} role="dialog" aria-modal="true" aria-label="Celebración"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.22 }}>
    <div className="screen-inner">
      {views[event.type](event)}
      <div className="screen-actions">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onDone}>{event.type === 'chest' ? '¡Genial!' : 'Continuar'}</button>
      </div>
    </div>
  </motion.div>;
}

export function Onboarding({ step, setStep, onDone }) {
  return <motion.div className="screen onboarding" role="dialog" aria-modal="true" aria-label="Bienvenida"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
    <motion.div key={step} className="screen-inner" initial={{ opacity: 0, transform: 'translateX(24px)' }} animate={{ opacity: 1, transform: 'translateX(0px)' }} transition={{ duration: 0.28, ease }}>
      {step === 0 ? <>
        <Mascot mood="wave" size={170} />
        <h1 className="screen-title" tabIndex="-1">¡Hola! Soy Lingo</h1>
        <p className="screen-sub">Vamos a repasar Inglés Avanzado II jugando: lecciones cortas, explicaciones claras y premios por cada acierto.</p>
        <div className="screen-actions">
          <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => { play('tap'); setStep(1); }}>¡Vamos!</button>
          <button type="button" className="btn btn-plain btn-block" onClick={() => onDone(false)}>Ya sé jugar</button>
        </div>
      </> : <>
        <Mascot mood="happy" size={120} />
        <h1 className="screen-title" tabIndex="-1">Así se juega</h1>
        <ul className="rules">
          <li><span className="rule-icon bad"><Heart size={24} fill="currentColor" aria-hidden="true" /></span><p><b>5 vidas por lección.</b> Cada error cuesta una y la pregunta vuelve al final para que la corrijas.</p></li>
          <li><span className="rule-icon gold"><Zap size={24} fill="currentColor" aria-hidden="true" /></span><p><b>Gana XP y sube de nivel.</b> Los combos de aciertos y las lecciones perfectas dan puntos extra.</p></li>
          <li><span className="rule-icon flame"><Flame size={24} fill="currentColor" aria-hidden="true" /></span><p><b>Practica cada día.</b> Tu racha crece con cada día que juegas.</p></li>
        </ul>
        <div className="screen-actions">
          <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => onDone(true)}>Empezar mi primera lección</button>
        </div>
      </>}
    </motion.div>
  </motion.div>;
}
