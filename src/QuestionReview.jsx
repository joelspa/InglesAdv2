import React from 'react';
import { BookOpen, Check, RotateCcw } from 'lucide-react';

const local = value => typeof value === 'string' ? value : value?.es || '';

function Answer({ value }) {
  if (value && typeof value === 'object') return <dl className="review-pairs">{Object.entries(value).map(([left, right]) => <div key={left}><dt>{left}</dt><dd>{right}</dd></div>)}</dl>;
  return <p lang="en">{String(value ?? '')}</p>;
}

export function QuestionReview({ question, attempt, number }) {
  if (!question || !attempt) return null;
  return <article className={`question-review ${attempt.correct ? 'correct' : attempt.recovered ? 'recovered' : 'pending'}`}>
    <header><span><BookOpen size={15} />{'Ejercicio'} {number}</span><b>{attempt.correct ? 'Correcto al primer intento' : attempt.recovered ? 'Aprendido al reintentar' : 'Para reforzar'}</b></header>
    {question.sentence && <blockquote lang="en">{question.sentence}</blockquote>}
    {question.sourceSentence && <blockquote lang="en">{question.sourceSentence}</blockquote>}
    {question.line && <blockquote lang="en">{question.speaker}: {question.line}</blockquote>}
    <h4>{local(question.prompt)}</h4>
    {(question.story || question.audio) && <details className="review-context"><summary>{question.story ? 'Volver a leer la historia' : 'Leer lo que decía el audio'}</summary><p lang="en">{question.story || question.audio}</p></details>}
    <div className="review-answer-grid">
      {attempt.response !== undefined && question.type !== 'match' && <section className="initial-response"><h5>{'Tu primer intento'}</h5><Answer value={attempt.response} /></section>}
      <section className="expected-response"><h5><Check size={13} />{'Respuesta correcta'}</h5><Answer value={question.type === 'match' ? question.pairs : question.answer} /></section>
    </div>
    {question.type === 'match' && attempt.recovered && <p className="review-explanation">{'Completaste las parejas después de varios intentos. Repasa estas conexiones para recordarlas la próxima vez.'}</p>}
    {attempt.recovered && attempt.latestResponse !== undefined && <div className="corrected-response"><RotateCcw size={14} /><div><b>{'Así lo resolviste después'}</b><Answer value={attempt.latestResponse} /></div></div>}
    <p className="review-explanation"><b>{'Qué recordar'}: </b>{local(question.explanation)}</p>
  </article>;
}
