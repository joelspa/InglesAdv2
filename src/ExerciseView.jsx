import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, MessageCircle, Search, Shuffle } from 'lucide-react';
import { isCorrect, shuffled } from './learning.mjs';
import { AudioPlayer } from './AudioPlayer.jsx';
import { Mascot } from './Mascot.jsx';
import { buzz, play } from './sound.mjs';

export const es = value => typeof value === 'string' ? value : value?.es || '';

const headings = {
  choice: 'Elige la opción correcta', fill: 'Completa el espacio', order: 'Ordena las palabras',
  match: 'Une las parejas', error_hunt: 'Caza el error', transform: 'Transforma la oración',
  dialogue: 'Tu turno en la conversación', reading: 'Lee y responde', listen: 'Escucha y responde'
};

export const emptyResponse = q => q.type === 'order' ? [] : q.type === 'match' ? {} : '';
export const responseText = (q, response) => q.type === 'order' ? response.map(tile => tile.word).join(' ') : response;

export function canSubmit(q, response) {
  if (q.type === 'match') return Object.keys(response).length === Object.keys(q.pairs).length;
  if (q.type === 'order') return response.length === q.tiles.length;
  return String(response).trim().length > 0;
}

// Shows the learner's current answer inside the ___ gap of a sentence.
function Gap({ text, value }) {
  const parts = text.split(/_{3,}/);
  if (parts.length === 1) return text;
  return parts.map((part, i) => <React.Fragment key={i}>{part}{i < parts.length - 1 && <span className={`gap ${value ? 'filled' : ''}`}>{value || '  '}</span>}</React.Fragment>);
}

function Options({ q, value, onPick, checked }) {
  return <div className="options" role="radiogroup" aria-label="Opciones de respuesta">
    {q.options.map((option, i) => {
      const right = checked && isCorrect(q, option);
      const picked = value === option;
      const state = checked ? right ? 'right' : picked ? 'wrong' : 'dim' : picked ? 'picked' : '';
      return <button key={option} type="button" role="radio" aria-checked={picked} className={`option ${state}`} disabled={checked}
        onClick={() => { play('pick'); onPick(option); }}>
        <kbd aria-hidden="true">{i + 1}</kbd><span lang="en">{option}</span>{right && <Check className="option-check" size={20} aria-hidden="true" />}
      </button>;
    })}
  </div>;
}

function OrderBoard({ q, tiles, setTiles, checked, idPrefix }) {
  const used = new Set(tiles.map(tile => tile.id));
  const spring = { type: 'spring', duration: 0.38, bounce: 0.18 };
  return <div className="order">
    <div className="order-line" role="group" aria-label="Tu oración" aria-live="polite">
      {tiles.length ? tiles.map(tile => <motion.button key={tile.id} layoutId={`${idPrefix}-${tile.id}`} transition={spring} type="button" className="tile" disabled={checked} lang="en"
        aria-label={`Quitar ${tile.word}`} onClick={() => { play('tap'); setTiles(tiles.filter(t => t.id !== tile.id)); }}>{tile.word}</motion.button>)
        : <span className="order-placeholder">Toca las palabras en orden</span>}
    </div>
    <div className="bank" role="group" aria-label="Banco de palabras">
      {q.tiles.map(tile => <span key={tile.id} className="tile-slot">
        <span className="tile ghost" aria-hidden="true">{tile.word}</span>
        {!used.has(tile.id) && <motion.button layoutId={`${idPrefix}-${tile.id}`} transition={spring} type="button" className="tile" disabled={checked} lang="en"
          onClick={() => { play('tap'); setTiles([...tiles, tile]); }}>{tile.word}</motion.button>}
      </span>)}
    </div>
    {!checked && tiles.length > 0 && <button type="button" className="text-button" onClick={() => setTiles([])}><Shuffle size={16} aria-hidden="true" />Empezar de nuevo</button>}
  </div>;
}

function MatchBoard({ q, matched, setMatched, checked, onComplete }) {
  const [columns] = useState(() => ({ left: shuffled(Object.keys(q.pairs)), right: shuffled(Object.values(q.pairs)) }));
  const [picked, setPicked] = useState(null);
  const [miss, setMiss] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const done = new Set([...Object.keys(matched), ...Object.values(matched)]);

  function pick(side, value) {
    if (checked || done.has(value)) return;
    if (!picked || picked.side === side) { play('pick'); setPicked(picked?.value === value ? null : { side, value }); return; }
    const left = side === 'left' ? value : picked.value;
    const right = side === 'right' ? value : picked.value;
    setPicked(null);
    if (q.pairs[left] === right) {
      play('pair');
      const next = { ...matched, [left]: right };
      setMatched(next);
      if (Object.keys(next).length === columns.left.length) timer.current = setTimeout(() => onComplete(next), 420);
    } else {
      play('wrong'); buzz(40);
      setMiss({ left, right, n: (miss?.n || 0) + 1 });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setMiss(null), 520);
    }
  }

  const card = (side, value) => {
    const state = done.has(value) ? 'matched' : miss && miss[side] === value ? 'miss' : picked?.side === side && picked.value === value ? 'picked' : '';
    return <button key={state === 'miss' ? `${value}-${miss.n}` : value} type="button" className={`match-card ${state}`} disabled={checked || done.has(value)}
      aria-pressed={state === 'picked'} lang="en" onClick={() => pick(side, value)}>{value}</button>;
  };
  return <div className="match">
    <p className="match-count" aria-live="polite">{Object.keys(matched).length} de {columns.left.length} parejas</p>
    <div className="match-grid">
      <div className="match-col">{columns.left.map(value => card('left', value))}</div>
      <div className="match-col">{columns.right.map(value => card('right', value))}</div>
    </div>
  </div>;
}

export function ExerciseView({ q, response, setResponse, checked, correct, onAutoCheck, onSubmit, idPrefix, inputRef }) {
  const mood = checked ? correct ? 'happy' : 'sad' : 'idle';
  const english = typeof q.prompt === 'string' && q.type !== 'order';
  const bubbleTypes = ['choice', 'fill', 'order'];
  return <div className={`exercise-inner type-${q.type}`}>
    <h1 className="exercise-title" tabIndex="-1">{headings[q.type]}</h1>

    {bubbleTypes.includes(q.type) && <div className="prompt-row">
      <Mascot mood={mood} size={92} key={mood} />
      <div className="bubble" {...(english ? { lang: 'en' } : {})}><Gap text={es(q.prompt)} value={q.type === 'order' ? '' : String(response)} /></div>
    </div>}

    {q.type === 'error_hunt' && <figure className="sentence-card"><figcaption><Search size={16} aria-hidden="true" />Hay un error en esta oración</figcaption><blockquote lang="en">“{q.sentence}”</blockquote></figure>}
    {q.type === 'transform' && <figure className="sentence-card"><figcaption><Shuffle size={16} aria-hidden="true" />Oración original</figcaption><blockquote lang="en">{q.sourceSentence}</blockquote></figure>}
    {q.type === 'dialogue' && <div className="chat">
      <p className="chat-scene"><MessageCircle size={16} aria-hidden="true" />{es(q.scene)}</p>
      <div className="chat-line them"><span className="avatar" aria-hidden="true">{q.speaker[0]}</span><p><b>{q.speaker}</b><span lang="en">{q.line}</span></p></div>
      <div className="chat-line you"><p><b>Tú</b><span lang="en">{response || '…'}</span></p><Mascot mood={mood} size={48} key={mood} /></div>
    </div>}
    {q.type === 'reading' && <article className="story"><h2 lang="en">{q.storyTitle}</h2><AudioPlayer key={q.id} question={q} compact /><div className="story-text" tabIndex="0" lang="en">{q.story}</div></article>}
    {q.type === 'listen' && <AudioPlayer key={q.id} question={q} />}

    {!bubbleTypes.includes(q.type) && q.type !== 'dialogue' && <p className="exercise-question">{es(q.prompt)}</p>}
    {q.type === 'dialogue' && <p className="exercise-question">{es(q.prompt)}</p>}

    {q.type === 'fill' ? <input ref={inputRef} className="answer-input" lang="en" value={response} disabled={checked}
        name="answer" placeholder="Escribe en inglés…" aria-label="Tu respuesta" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck="false" enterKeyHint="done"
        onChange={event => setResponse(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter' && !event.repeat) { event.preventDefault(); onSubmit(); } }} />
      : q.type === 'order' ? <OrderBoard q={q} tiles={response} setTiles={setResponse} checked={checked} idPrefix={idPrefix} />
      : q.type === 'match' ? <MatchBoard q={q} matched={response} setMatched={setResponse} checked={checked} onComplete={onAutoCheck} />
      : <Options q={q} value={response} onPick={setResponse} checked={checked} />}
  </div>;
}
