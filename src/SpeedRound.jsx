import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Timer, X, Zap } from 'lucide-react';
import { isCorrect, shuffled } from './learning.mjs';
import { es } from './ExerciseView.jsx';
import { Mascot } from './Mascot.jsx';
import { celebrate } from './LessonComplete.jsx';
import { buzz, play } from './sound.mjs';

const ease = [0.23, 1, 0.32, 1];
export const SPEED_SECONDS = 60;
const BONUS = 2;
const quickTypes = ['choice', 'error_hunt', 'transform', 'dialogue'];

function promptOf(q) {
  if (q.type === 'error_hunt') return { lead: es(q.prompt), en: `“${q.sentence}”` };
  if (q.type === 'transform') return { lead: es(q.prompt), en: q.sourceSentence };
  if (q.type === 'dialogue') return { lead: `${q.speaker}: ¿qué respondes?`, en: q.line };
  return { lead: 'Elige la opción correcta', en: es(q.prompt) };
}

// One-tap questions against the clock. Every hit adds two seconds.
export function SpeedRound({ questions, best, onFinish, onQuit }) {
  const deck = useMemo(() => shuffled(questions.filter(q => quickTypes.includes(q.type))).map(q => ({ ...q, options: shuffled(q.options) })), [questions]);
  const [phase, setPhase] = useState('ready');
  const [index, setIndex] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [right, setRight] = useState(0);
  const [combo, setCombo] = useState(0);
  const [xp, setXp] = useState(0);
  const [picked, setPicked] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const lastTick = useRef(0);
  const q = deck[index % deck.length];
  const left = Math.max(0, deadline - now);

  useEffect(() => {
    if (phase !== 'playing') return;
    let frame;
    const loop = () => { setNow(performance.now()); frame = requestAnimationFrame(loop); };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const seconds = Math.ceil(left / 1000);
    if (seconds <= 5 && seconds > 0 && seconds !== lastTick.current) { lastTick.current = seconds; play('tick'); }
    if (left <= 0 && now > 0) {
      setPhase('over');
      play('complete');
      if (right > best && right > 0) celebrate(1);
    }
  }, [left, phase]);

  function start() {
    const t = performance.now();
    setNow(t); setDeadline(t + SPEED_SECONDS * 1000); setPhase('playing'); play('tap');
  }

  function pick(option) {
    if (phase !== 'playing' || picked) return;
    const ok = isCorrect(q, option);
    setPicked({ option, ok });
    if (ok) {
      const gain = 2 + (combo + 1 >= 5 ? 1 : 0);
      play('correct'); setRight(n => n + 1); setCombo(n => n + 1); setXp(n => n + gain);
      setDeadline(d => d + BONUS * 1000);
      setFloaters(list => [...list.slice(-3), { id: performance.now(), text: `+${BONUS}s` }]);
    } else { play('wrong'); buzz(60); setCombo(0); }
    setTimeout(() => { setPicked(null); setIndex(i => i + 1); }, ok ? 380 : 900);
  }

  useEffect(() => {
    function keydown(event) {
      if (event.repeat) return;
      if (phase === 'playing' && /^[1-4]$/.test(event.key) && q.options[Number(event.key) - 1]) pick(q.options[Number(event.key) - 1]);
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });

  const prompt = q && promptOf(q);
  const fraction = Math.min(left / (SPEED_SECONDS * 1000), 1);
  return <motion.div className="screen speed" role="dialog" aria-modal="true" aria-label="Desafío relámpago"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
    <button type="button" className="icon-button speed-close" onClick={phase === 'over' ? () => onFinish({ right, xp }) : onQuit} aria-label="Cerrar el desafío"><X size={26} /></button>
    {phase === 'ready' && <div className="screen-inner">
      <div className="speed-badge"><Zap size={64} fill="currentColor" aria-hidden="true" /></div>
      <h1 className="screen-title" tabIndex="-1">Desafío relámpago</h1>
      <p className="screen-sub">Responde todas las preguntas que puedas en {SPEED_SECONDS} segundos. Cada acierto suma {BONUS} segundos. Tu récord: <b>{best}</b>.</p>
      <div className="screen-actions"><button type="button" className="btn btn-primary btn-block" autoFocus onClick={start}>¡Empezar!</button></div>
    </div>}

    {phase === 'playing' && <div className="speed-play">
      <div className="speed-hud">
        <span className={`speed-time ${left < 10000 ? 'low' : ''}`} aria-live="off"><Timer size={20} aria-hidden="true" />{Math.ceil(left / 1000)} s</span>
        <span className="speed-score" aria-live="polite"><Zap size={18} fill="currentColor" aria-hidden="true" />{right}</span>
        {combo >= 3 && <span className="speed-combo">×{combo}</span>}
        <AnimatePresence>{floaters.map(f => <motion.span key={f.id} className="floater" initial={{ opacity: 1, transform: 'translateY(0px)' }} animate={{ opacity: 0, transform: 'translateY(-30px)' }} transition={{ duration: 0.8, ease }} onAnimationComplete={() => setFloaters(list => list.filter(x => x.id !== f.id))}>{f.text}</motion.span>)}</AnimatePresence>
      </div>
      <div className="speed-bar"><i style={{ transform: `scaleX(${fraction})` }} className={left < 10000 ? 'low' : ''} /></div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={index} className="speed-card" initial={{ opacity: 0, transform: 'translateY(10px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ duration: 0.18, ease }}>
          <p className="speed-lead">{prompt.lead}</p>
          <p className="speed-q" lang="en">{prompt.en}</p>
          <div className="options">{q.options.map((option, i) => {
            const state = picked ? (isCorrect(q, option) ? 'right' : picked.option === option ? 'wrong' : 'dim') : '';
            return <button key={option} type="button" className={`option ${state}`} disabled={Boolean(picked)} onClick={() => pick(option)}><kbd aria-hidden="true">{i + 1}</kbd><span lang="en">{option}</span></button>;
          })}</div>
        </motion.div>
      </AnimatePresence>
    </div>}

    {phase === 'over' && <div className="screen-inner">
      <Mascot mood={right > best ? 'cheer' : 'happy'} size={140} />
      <h1 className="screen-title" tabIndex="-1">{right > best && right > 0 ? '¡Nuevo récord!' : '¡Tiempo!'}</h1>
      <p className="screen-sub">Acertaste <b>{right}</b> {right === 1 ? 'pregunta' : 'preguntas'} y ganaste <b>{xp} XP</b>.</p>
      <div className="screen-actions">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => onFinish({ right, xp })}>Continuar</button>
      </div>
    </div>}
  </motion.div>;
}
