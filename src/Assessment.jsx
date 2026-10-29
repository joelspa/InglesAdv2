import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Dialog } from './Dialog.jsx';
import { assessRound } from './learning.mjs';
import { reviewPlans } from './teaching.mjs';
import { QuestionReview } from './QuestionReview.jsx';

const ease = [0.23, 1, 0.32, 1];
const states = { correct: 'Correcta al primer intento', recovered: 'Corregida después', pending: 'Para repasar' };
const headline = { strong: '¡Buen dominio!', developing: 'Vas por buen camino', reinforce: 'Ya sabes qué repasar', empty: 'Una nueva oportunidad' };

// Topic-by-topic report shown after a unit exam or a general challenge.
export function Assessment({ result, topics, onClose, onReview, onPractice }) {
  const report = useMemo(() => assessRound(result.results, result.questions, topics), [result, topics]);
  const [selected, setSelected] = useState(null);
  const index = result.questions.findIndex(q => q.id === selected);

  return <Dialog label="Informe de la ronda" onClose={onClose} className="report-dialog">
    <header className="report-head">
      <p className="guide-kicker">{result.title}</p>
      <h2>{headline[report.status]}</h2>
      <p><b>{report.percentage}%</b> al primer intento · {report.right} de {report.total} ejercicios</p>
    </header>

    <section className="report-topics" aria-label="Resultado por tema">
      {report.topics.map((topic, i) => <div key={topic.id} className="report-topic">
        <div><span lang="en">{topic.name}</span><b>{topic.right}/{topic.total}</b></div>
        <div className="report-bar" role="img" aria-label={`${topic.name}: ${topic.right} correctas, ${topic.recovered} corregidas, ${topic.pending} para repasar`}>
          {[['correct', topic.right], ['recovered', topic.recovered], ['pending', topic.pending]].map(([state, count]) => count > 0 &&
            <motion.i key={state} className={state} style={{ flexGrow: count }} initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0% 0 0)' }} transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease }} />)}
        </div>
      </div>)}
      <p className="report-legend"><span className="correct">Al primer intento</span><span className="recovered">Corregida</span><span className="pending">Para repasar</span></p>
    </section>

    <section className="report-answers">
      <h3>Toca un ejercicio para revisarlo</h3>
      <div className="answer-dots">{report.answers.map((answer, i) => <button key={answer.id} type="button" className={answer.state} aria-pressed={selected === answer.id}
        aria-label={`Ejercicio ${i + 1}: ${states[answer.state]}`} onClick={() => setSelected(selected === answer.id ? null : answer.id)}>{i + 1}</button>)}</div>
      {index >= 0 && <QuestionReview key={selected} question={result.questions[index]} attempt={result.results.find(r => r.id === selected)} number={index + 1} />}
    </section>

    <section className="report-plan">
      <h3>Tu próximo paso</h3>
      {report.recommendations.length ? report.recommendations.map(topic => <article key={topic.id} className="plan-item">
        <div><h4 lang="en">{topic.name}</h4><b>{reviewPlans[topic.id]?.focus.es}</b><p>{reviewPlans[topic.id]?.task.es}</p></div>
        <button type="button" className="btn btn-small" onClick={() => onPractice(topic.id, topic.reviewIds)}>Practicar<ArrowRight size={16} aria-hidden="true" /></button>
      </article>) : <article className="plan-item"><Sparkles size={24} aria-hidden="true" /><p>Respondiste todo bien al primer intento. ¡Sigue con la siguiente unidad!</p></article>}
    </section>

    <div className="report-actions">
      {report.right < report.total && <button type="button" className="btn btn-secondary btn-block" onClick={onReview}><RotateCcw size={18} aria-hidden="true" />Repasar los que fallé</button>}
      <button type="button" className="btn btn-primary btn-block" onClick={onClose}>Volver al camino</button>
    </div>
  </Dialog>;
}
