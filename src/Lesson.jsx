import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Flame, Heart, HeartCrack, Lightbulb, RotateCcw, X } from 'lucide-react';
import { answer, answeredCount, currentId, MAX_HEARTS, next, startLesson } from './lessonEngine.mjs';
import { isCorrect } from './learning.mjs';
import { canSubmit, emptyResponse, ExerciseView, responseText } from './ExerciseView.jsx';
import { FeedbackSheet } from './FeedbackSheet.jsx';
import { Mascot } from './Mascot.jsx';
import { teaching } from './teaching.mjs';
import { buzz, play } from './sound.mjs';

const ease = [0.23, 1, 0.32, 1];
const reducer = (state, action) => action.type === 'answer' ? answer(state, action.correct, action) : action.type === 'next' ? next(state) : state;

function ProgressBar({ value, max, combo }) {
  const percent = max ? Math.max(value / max * 100, 3) : 3;
  return <div className="progress" role="progressbar" aria-label="Progreso de la lección" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
    <motion.div className={`progress-fill ${combo >= 3 ? 'hot' : ''}`} initial={false}
      animate={{ clipPath: `inset(0 ${100 - percent}% 0 0 round 999px)` }} transition={{ type: 'spring', duration: 0.6, bounce: 0.22 }} />
    <AnimatePresence>
      {combo >= 3 && <motion.span key={combo} className="combo-tag" initial={{ opacity: 0, transform: 'translateY(6px) scale(0.92)' }}
        animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }} exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ duration: 0.22, ease }}>
        <Flame size={14} aria-hidden="true" />¡{combo} seguidas!
      </motion.span>}
    </AnimatePresence>
  </div>;
}

function Hearts({ count }) {
  return <div className="hearts" aria-label={`${count} ${count === 1 ? 'vida' : 'vidas'}`} role="img">
    <motion.span key={count} className="heart" initial={false}
      animate={count < MAX_HEARTS ? { transform: ['translateX(0px)', 'translateX(-5px)', 'translateX(5px)', 'translateX(-3px)', 'translateX(0px)'] } : {}}
      transition={{ duration: 0.4 }}><Heart size={24} fill="currentColor" aria-hidden="true" /></motion.span>
    <b>{count}</b>
    {count < MAX_HEARTS && <motion.span key={`lost-${count}`} className="heart-lost" aria-hidden="true"
      initial={{ opacity: 1, transform: 'translateY(0px) rotate(0deg)' }} animate={{ opacity: 0, transform: 'translateY(34px) rotate(-28deg)' }}
      transition={{ duration: 0.75, ease }}><HeartCrack size={22} /></motion.span>}
  </div>;
}

export function Lesson({ session, onEnd, onQuit }) {
  const [state, dispatch] = useReducer(reducer, session, s => startLesson(s.questions.map(q => q.id), s.options));
  const byId = useMemo(() => new Map(session.questions.map(q => [q.id, q])), [session]);
  const q = byId.get(currentId(state));
  const turnKey = `${q?.id}-${state.turn}`;
  const [responses, setResponses] = useState({});
  const [hint, setHint] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const startedAt = useRef(Date.now());
  const rootRef = useRef();
  const inputRef = useRef();
  const checked = state.phase === 'feedback';
  const response = q ? responses[turnKey] ?? emptyResponse(q) : '';
  const setResponse = value => setResponses({ [turnKey]: value });
  const ready = q && canSubmit(q, response);
  const isRetry = q && state.results.some(r => r.id === q.id) && !checked;
  const finishing = checked && (state.hearts === 0 || (state.queue.length === 1 && (state.last.correct || !state.requeue)));

  useEffect(() => { if (state.phase === 'done') onEnd(state, Date.now() - startedAt.current); }, [state.phase]);

  useEffect(() => {
    if (!q) return;
    const focus = setTimeout(() => {
      const active = document.activeElement;
      if (active && active !== document.body && rootRef.current?.contains(active)) return;
      const fine = window.matchMedia?.('(pointer: fine)').matches;
      (q.type === 'fill' && fine ? inputRef.current : rootRef.current?.querySelector('.exercise-title'))?.focus({ preventScroll: true });
    }, 260);
    return () => clearTimeout(focus);
  }, [turnKey]);

  function check(value = response) {
    if (checked || !q || !canSubmit(q, value)) return;
    const text = responseText(q, value);
    const correct = q.type === 'match' || isCorrect(q, text);
    dispatch({ type: 'answer', correct, response: q.type === 'match' ? value : text, assisted: hint === turnKey });
    if (correct) play('correct');
    else { play('wrong'); buzz(80); if (state.hearts !== null) setTimeout(() => play('heart'), 260); }
    if (correct && (state.combo + 1) % 5 === 0) setTimeout(() => play('combo'), 220);
  }

  function proceed() {
    if (!checked) return;
    play('tap');
    dispatch({ type: 'next' });
  }

  useEffect(() => {
    function keydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); setLeaving(open => !open); return; }
      if (leaving || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
      const control = event.target.closest?.('button,input,textarea,select,summary,a');
      if (control && !control.closest('.options')) return;
      if (event.key === 'Enter') { event.preventDefault(); checked ? proceed() : check(); }
      else if (!checked && q?.options && /^[1-9]$/.test(event.key)) {
        const option = q.options[Number(event.key) - 1];
        if (option) { event.preventDefault(); play('pick'); setResponse(option); }
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });

  if (!q) return null;
  const help = teaching[q.topicId];

  return <motion.div ref={rootRef} className="lesson" role="dialog" aria-modal="true" aria-label={session.title}
    initial={{ opacity: 0, transform: 'translateY(16px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.28, ease }}>
    <header className="lesson-top" inert={leaving}>
      <button type="button" className="icon-button" onClick={() => setLeaving(true)} aria-label="Salir de la lección"><X size={26} /></button>
      <ProgressBar value={answeredCount(state)} max={state.total} combo={state.combo} />
      {state.hearts !== null && <Hearts count={state.hearts} />}
    </header>

    <main className="lesson-body" inert={leaving}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section key={turnKey} className="exercise" data-question-id={q.id}
          initial={{ opacity: 0, transform: 'translateX(28px)' }} animate={{ opacity: 1, transform: 'translateX(0px)' }}
          exit={{ opacity: 0, transform: 'translateX(-28px)', transition: { duration: 0.14 } }} transition={{ duration: 0.24, ease }}>
          {isRetry && <p className="retry-chip"><RotateCcw size={15} aria-hidden="true" />Error anterior · ¡ahora sí!</p>}
          <ExerciseView q={q} response={response} setResponse={setResponse} checked={checked} correct={state.last?.correct}
            onAutoCheck={check} onSubmit={() => check()} idPrefix={turnKey} inputRef={inputRef} />
          <AnimatePresence>
            {hint === turnKey && !checked && help && <motion.aside className="hint-card" initial={{ opacity: 0, transform: 'translateY(-4px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease }}>
              <code>{help.pattern}</code><p>{help.hint.es}</p>
            </motion.aside>}
          </AnimatePresence>
        </motion.section>
      </AnimatePresence>
    </main>

    <footer className={`lesson-footer ${checked ? 'covered' : ''}`} inert={leaving || checked}>
      <div className="footer-inner">
        {help && q.type !== 'match' ? <button type="button" className="btn btn-ghost" aria-expanded={hint === turnKey} disabled={checked}
          onClick={() => { play('tap'); setHint(hint === turnKey ? null : turnKey); }}><Lightbulb size={20} aria-hidden="true" />Pista</button> : <span />}
        <button type="button" className="btn btn-primary btn-check" disabled={!ready || checked} onClick={() => check()}>Comprobar</button>
      </div>
    </footer>

    <AnimatePresence>{checked && !leaving && <FeedbackSheet key={turnKey} q={q} last={state.last} finishing={finishing} onContinue={proceed} />}</AnimatePresence>

    <AnimatePresence>
      {leaving && <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
        <motion.div className="confirm" role="alertdialog" aria-modal="true" aria-labelledby="leave-title"
          initial={{ opacity: 0, transform: 'scale(0.95)' }} animate={{ opacity: 1, transform: 'scale(1)' }} exit={{ opacity: 0, transform: 'scale(0.97)' }} transition={{ duration: 0.2, ease }}>
          <Mascot mood="sad" size={88} />
          <h2 id="leave-title">¿Seguro que quieres salir?</h2>
          <p>Perderás el progreso de esta lección.</p>
          <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => setLeaving(false)}>Seguir aprendiendo</button>
          <button type="button" className="btn btn-plain btn-block" onClick={onQuit}>Salir</button>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </motion.div>;
}
