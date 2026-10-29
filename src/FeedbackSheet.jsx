import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Zap } from 'lucide-react';
import { teaching } from './teaching.mjs';
import { es } from './ExerciseView.jsx';

const praise = ['¡Excelente!', '¡Muy bien!', '¡Perfecto!', '¡Así se hace!', '¡Genial!', '¡Impecable!'];

export function Verdict({ correct }) {
  return <svg className={`verdict ${correct ? 'good' : 'bad'}`} viewBox="0 0 52 52" aria-hidden="true">
    <circle className="verdict-circle" cx="26" cy="26" r="23" />
    {correct ? <path className="verdict-mark" d="M15 26.5 23 34 37 19" /> : <><path className="verdict-mark" d="m18 18 16 16" /><path className="verdict-mark second" d="m34 18-16 16" /></>}
  </svg>;
}

export function FeedbackSheet({ q, last, onContinue, finishing }) {
  const { correct, gain, milestone, willRepeat, retry } = last;
  const [title] = useState(() => correct ? retry ? '¡Ahora sí!' : praise[Math.floor(Math.random() * praise.length)] : 'Respuesta correcta:');
  const [why, setWhy] = useState(!correct);
  const buttonRef = useRef();
  const help = teaching[q.topicId];
  useEffect(() => { buttonRef.current?.focus({ preventScroll: true }); }, []);

  return <motion.section className={`sheet ${correct ? 'good' : 'bad'}`} role="status" aria-live="polite"
    initial={{ transform: 'translateY(100%)' }} animate={{ transform: 'translateY(0%)' }}
    exit={{ transform: 'translateY(100%)', transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
    transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}>
    <div className="sheet-inner">
      <div className="sheet-head">
        <Verdict correct={correct} />
        <div>
          <h2>{title}</h2>
          {!correct && <p className="sheet-answer" lang="en">{q.type === 'match' ? Object.entries(q.pairs).map(pair => pair.join(' → ')).join(' · ') : q.answer}</p>}
        </div>
        {correct && gain > 0 && <motion.span className={`xp-chip ${milestone ? 'combo' : ''}`} initial={{ opacity: 0, transform: 'translateY(8px) scale(0.9)' }} animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }} transition={{ delay: 0.18, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
          <Zap size={15} aria-hidden="true" />+{gain} XP{milestone && ' · ¡combo!'}
        </motion.span>}
      </div>
      {why
        ? <p className="sheet-why"><b>¿Por qué? </b>{es(q.explanation)}</p>
        : <button type="button" className="sheet-link" onClick={() => setWhy(true)}>¿Por qué es correcta?</button>}
      {!correct && help && <details className="sheet-more"><summary>Ver otro ejemplo</summary><p><code>{help.pattern}</code></p><p lang="en">{help.example}</p></details>}
      {q.type === 'listen' && <details className="sheet-more"><summary>Leer lo que dice el audio</summary><p lang="en">{q.audio}</p></details>}
      {willRepeat && <p className="sheet-note"><RotateCcw size={15} aria-hidden="true" />Volverá al final de la lección para que la corrijas.</p>}
      <button ref={buttonRef} type="button" className={`btn btn-block ${correct ? 'btn-good' : 'btn-bad'}`} onClick={onContinue}>
        {finishing ? 'Terminar' : correct ? 'Continuar' : 'Entendido'}
      </button>
    </div>
  </motion.section>;
}
