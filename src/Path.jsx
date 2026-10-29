import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen, Check, ChefHat, Gift, Lock, Star, Trophy } from 'lucide-react';
import { nodeState, currentNode } from './path.mjs';
import { Mascot } from './Mascot.jsx';
import { play } from './sound.mjs';

const ease = [0.23, 1, 0.32, 1];
const offsets = [0, 54, 82, 54, 0, -54, -82, -54];
const icons = { lesson: Star, guide: ChefHat, chest: Gift, exam: Trophy };

function Stars({ count }) {
  return <span className="node-stars" aria-hidden="true">{[1, 2, 3].map(n => <Star key={n} size={13} className={n <= count ? 'on' : ''} fill="currentColor" />)}</span>;
}

function describe(node, state) {
  if (node.kind === 'chest') return state === 'locked' ? 'Termina las lecciones de este tema para abrirlo.' : state === 'done' ? 'Ya abriste este cofre.' : '¡Tu recompensa te espera!';
  if (node.kind === 'exam') return state === 'locked' ? 'Completa al menos una lección de cada tema para desbloquearlo.' : '10 preguntas de toda la unidad, sin vidas y con informe por tema.';
  if (state === 'locked') return 'Completa la lección anterior para desbloquearla.';
  if (node.kind === 'guide') return `${node.questionIds.length} ejercicios de la guía de estudio de la Unidad 1, con escenas de restaurante, hotel y cocina.`;
  return `${node.questionIds.length} ejercicios · Lección ${node.index + 1} de ${node.count}`;
}

function NodePopover({ node, state, progress, onStart, onGuide }) {
  const saved = progress.lessons[node.id];
  const title = node.kind === 'exam' ? node.label : node.kind === 'chest' ? 'Cofre del tema' : node.kind === 'guide' ? 'Guía EGT: gastronomía y turismo' : node.label;
  const action = node.kind === 'chest' ? 'Abrir cofre' : state === 'done' ? 'Practicar otra vez' : node.kind === 'exam' ? 'Empezar examen' : 'Empezar';
  return <motion.div className={`node-pop ${state}`} role="dialog" aria-label={title}
    initial={{ opacity: 0, transform: 'translateX(-50%) translateY(-6px) scale(0.95)' }} animate={{ opacity: 1, transform: 'translateX(-50%) translateY(0px) scale(1)' }}
    exit={{ opacity: 0, transform: 'translateX(-50%) translateY(-4px) scale(0.97)', transition: { duration: 0.12 } }} transition={{ duration: 0.2, ease }}>
    {node.topicName && <p className="pop-topic" lang="en">{node.topicName}</p>}
    <h3>{title}</h3>
    <p>{describe(node, state)}</p>
    {saved && <p className="pop-best"><Stars count={saved.stars} /> Mejor resultado: {saved.best}%</p>}
    {state !== 'locked' && !(node.kind === 'chest' && state === 'done') && <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => onStart(node)}>{action}</button>}
    {node.topicId && node.kind !== 'chest' && <button type="button" className="btn btn-plain btn-block" onClick={() => onGuide(node.topicId)}><BookOpen size={18} aria-hidden="true" />Ver la guía</button>}
  </motion.div>;
}

export function Path({ path, progress, onStart, onGuide, highlight }) {
  const [open, setOpen] = useState(null);
  const current = currentNode(progress, path);
  const rootRef = useRef();

  useEffect(() => {
    const target = rootRef.current?.querySelector(highlight ? `[data-node="${highlight}"]` : '.node.current');
    target?.scrollIntoView({ block: 'center', behavior: highlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }, [highlight]);

  useEffect(() => {
    if (!open) return;
    const close = event => { if (!event.target.closest?.('.node-wrap')) setOpen(null); };
    const escape = event => {
      if (event.key !== 'Escape') return;
      setOpen(null);
      rootRef.current?.querySelector(`[data-node="${open}"]`)?.focus();
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [open]);

  return <div className="path" ref={rootRef}>
    {path.map(unit => {
      let step = 0;
      const groups = [];
      for (const node of unit.nodes) {
        const key = node.topicId || 'exam';
        if (groups.at(-1)?.key !== key) groups.push({ key, nodes: [] });
        groups.at(-1).nodes.push(node);
      }
      return <section key={unit.id} className={`unit unit-${unit.id}`} aria-labelledby={`unit-${unit.id}`}>
        <header className="unit-banner">
          <p>Unidad {unit.id}</p>
          <h2 id={`unit-${unit.id}`}>{unit.title}</h2>
          <span>{unit.subtitle}</span>
        </header>
        {groups.map(group => <div key={group.key} className="topic-group">
          {group.key !== 'exam' && <div className="topic-divider">
            <span><b lang="en">{group.nodes[0].topicName}</b>{group.nodes[0].topicLabel}</span>
            <button type="button" className="chip-button" onClick={() => onGuide(group.key)}><BookOpen size={16} aria-hidden="true" />Guía</button>
          </div>}
          <ol className="nodes">
            {group.nodes.map(node => {
              const state = nodeState(progress, node, unit);
              const isCurrent = current?.id === node.id;
              const x = offsets[step++ % offsets.length];
              const Icon = state === 'locked' ? Lock : state === 'done' && node.kind === 'lesson' ? Check : icons[node.kind];
              const saved = progress.lessons[node.id];
              return <li key={node.id} className="node-wrap" style={{ '--x': `${x}px` }}>
                {isCurrent && <motion.span className="start-tag" aria-hidden="true" initial={{ opacity: 0, transform: 'translateX(-50%) translateY(6px)' }} animate={{ opacity: 1, transform: 'translateX(-50%) translateY(0px)' }} transition={{ duration: 0.3, ease }}>{node.kind === 'chest' ? '¡Ábreme!' : 'Empieza aquí'}</motion.span>}
                <button type="button" data-node={node.id}
                  className={`node kind-${node.kind} ${state} ${isCurrent ? 'current' : ''} ${highlight === node.id ? 'unlocked-now' : ''}`}
                  aria-label={`${node.topicName ? node.topicName + ', ' : ''}${node.kind === 'lesson' ? `lección ${node.index + 1}` : node.label}: ${state === 'locked' ? 'bloqueada' : state === 'done' ? 'completada' : 'disponible'}`}
                  aria-expanded={open === node.id}
                  onClick={() => { play('tap'); setOpen(open === node.id ? null : node.id); }}>
                  <Icon size={node.kind === 'exam' ? 34 : 30} strokeWidth={2.6} aria-hidden="true" />
                </button>
                {saved && node.kind !== 'chest' && <Stars count={saved.stars} />}
                {isCurrent && <span className={`path-mascot ${x > 0 ? 'left' : 'right'}`}><Mascot mood={node.kind === 'chest' ? 'cheer' : 'wave'} size={78} /></span>}
                <AnimatePresence>
                  {open === node.id && <NodePopover node={node} state={state} progress={progress} onStart={n => { setOpen(null); onStart(n); }} onGuide={id => { setOpen(null); onGuide(id); }} />}
                </AnimatePresence>
              </li>;
            })}
          </ol>
        </div>)}
      </section>;
    })}
    <div className="path-end"><Mascot mood="think" size={84} /><p>Más aventuras pronto. ¡Sigue practicando!</p></div>
  </div>;
}
