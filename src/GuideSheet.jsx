import React from 'react';
import { ArrowRight, Lightbulb, UtensilsCrossed } from 'lucide-react';
import { Dialog } from './Dialog.jsx';
import { teaching } from './teaching.mjs';
import { guideNotes } from './guideNotes.mjs';
import { es } from './ExerciseView.jsx';

export function GuideSheet({ topic, onClose, onPractice }) {
  const help = teaching[topic.id];
  const notes = guideNotes[topic.id];
  return <Dialog label={`Guía: ${topic.name}`} onClose={onClose} className="guide-dialog">
    <header className="guide-head">
      <p className="guide-kicker">Guía del tema</p>
      <h2 lang="en">{topic.name}</h2>
      <p>{topic.translation}. {es(topic.description)}</p>
    </header>
    <section className="guide-rule">
      <code>{help.pattern}</code>
      <p>{es(topic.rule)}</p>
      <blockquote lang="en">{topic.example}</blockquote>
    </section>
    {notes && <section className="guide-egt">
      <h3><UtensilsCrossed size={18} aria-hidden="true" />En gastronomía y turismo</h3>
      <p>{notes.context}</p>
      <dl>{notes.rows.map(([form, rule, example]) => <div key={form}><dt>{form}</dt><dd>{rule}<span lang="en">{example}</span></dd></div>)}</dl>
      <p className="guide-tip"><Lightbulb size={17} aria-hidden="true" />{notes.tip}</p>
    </section>}
    <section className="guide-rule soft">
      <h3>Truco para recordarlo</h3>
      <p>{help.hint.es}</p>
      <blockquote lang="en">{help.example}</blockquote>
    </section>
    {onPractice && <button type="button" className="btn btn-primary btn-block" onClick={onPractice}>Practicar este tema<ArrowRight size={18} aria-hidden="true" /></button>}
  </Dialog>;
}
