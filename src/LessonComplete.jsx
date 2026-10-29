import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Clock3, Star, Target, Zap } from 'lucide-react';
import { Mascot } from './Mascot.jsx';
import { Dialog } from './Dialog.jsx';
import { QuestionReview } from './QuestionReview.jsx';
import { play } from './sound.mjs';

const ease = [0.23, 1, 0.32, 1];
export const confettiColors = ['#7055DD', '#22B573', '#FFB61E', '#FF6B8B', '#2F86EB'];

export function celebrate(power = 1) {
  const base = { disableForReducedMotion: true, colors: confettiColors, ticks: 220, scalar: 1.05, zIndex: 80 };
  confetti({ ...base, particleCount: Math.round(70 * power), angle: 60, spread: 62, origin: { x: 0, y: 0.75 } });
  confetti({ ...base, particleCount: Math.round(70 * power), angle: 120, spread: 62, origin: { x: 1, y: 0.75 } });
}

export function useCountUp(target, { delay = 0, duration = 900 } = {}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) { setValue(target); return; }
    let frame;
    const timer = setTimeout(() => {
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / duration, 1);
        setValue(Math.round(target * (1 - (1 - t) ** 3)));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [target, delay, duration, reduce]);
  return value;
}

const clock = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function StatCard({ icon: Icon, label, value, tone, index }) {
  return <motion.div className={`stat-card ${tone}`} initial={{ opacity: 0, transform: 'translateY(14px) scale(0.96)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
    transition={{ delay: 0.35 + index * 0.08, duration: 0.3, ease }}>
    <p>{label}</p>
    <strong><Icon size={22} aria-hidden="true" />{value}</strong>
  </motion.div>;
}

export function LessonComplete({ outcome, onContinue }) {
  const { summary, stars, ms, questions, results } = outcome;
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(reduce ? stars : 0);
  const [reviewing, setReviewing] = useState(false);
  const xp = useCountUp(summary.xp, { delay: 350 });
  const accuracy = useCountUp(summary.accuracy, { delay: 430 });

  useEffect(() => {
    play('complete');
    celebrate(summary.perfect ? 1.4 : 1);
    if (reduce) return;
    const timers = Array.from({ length: stars }, (_, i) => setTimeout(() => { setLit(i + 1); play('star'); }, 700 + i * 320));
    return () => timers.forEach(clearTimeout);
  }, []);

  const title = summary.perfect ? '¡Lección perfecta!' : stars ? '¡Lección completada!' : '¡Ronda completada!';
  return <motion.div className="screen complete-screen" role="dialog" aria-modal="true" aria-labelledby="complete-title"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.25 }}>
    <div className="screen-inner">
      <motion.div initial={{ opacity: 0, transform: 'scale(0.9)' }} animate={{ opacity: 1, transform: 'scale(1)' }} transition={{ duration: 0.35, ease }}>
        <Mascot mood="cheer" size={150} />
      </motion.div>
      {stars > 0 && <div className="big-stars" role="img" aria-label={`${stars} de 3 estrellas`}>
        {[1, 2, 3].map(n => <span key={n} className={`big-star ${n <= lit ? 'on' : ''}`}><Star size={n === 2 ? 54 : 44} fill="currentColor" aria-hidden="true" /></span>)}
      </div>}
      <h1 id="complete-title" className="screen-title" tabIndex="-1">{title}</h1>
      <p className="screen-sub">{summary.perfect ? 'Ni un solo error. ¡Eres imparable!' : summary.accuracy >= 80 ? 'Gran trabajo: dominas este tema.' : 'Cada error corregido es algo que ya aprendiste.'}</p>
      <div className="stat-row">
        <StatCard icon={Zap} label="XP ganada" value={`+${xp}`} tone="gold" index={0} />
        <StatCard icon={Target} label="Precisión" value={`${accuracy}%`} tone="good" index={1} />
        <StatCard icon={Clock3} label="Tiempo" value={clock(ms)} tone="sky" index={2} />
      </div>
      {summary.bestCombo >= 3 && <p className="combo-note">Mejor racha de aciertos: <b>{summary.bestCombo}</b></p>}
      <div className="screen-actions">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onContinue}>Continuar</button>
        <button type="button" className="btn btn-plain btn-block" onClick={() => setReviewing(true)}>Revisar mis respuestas</button>
      </div>
    </div>
    {reviewing && <Dialog label="Revisa tus respuestas" onClose={() => setReviewing(false)}>
      <h2 className="dialog-title">Revisa tus respuestas</h2>
      <div className="review-list">{results.map((attempt, i) => <QuestionReview key={attempt.id} question={questions.find(q => q.id === attempt.id)} attempt={attempt} number={i + 1} />)}</div>
    </Dialog>}
  </motion.div>;
}
