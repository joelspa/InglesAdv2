import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Dumbbell, Flame, Map as MapIcon, RotateCcw, User, Volume2, VolumeX, Zap } from 'lucide-react';
import { curriculum, questions, topics } from './data.mjs';
import { balancedRound, dayKey, emptyProgress, levelInfo, practiceRound, restoreProgress, reviewRound, shuffled, streak } from './learning.mjs';
import { buildPath, currentNode } from './path.mjs';
import { prepare, summarize } from './lessonEngine.mjs';
import { completeNode, DAILY_GOAL, failLesson, finishSpeedRound, openChest } from './rewards.mjs';
import { play, setSoundEnabled } from './sound.mjs';
import { Path } from './Path.jsx';
import { Lesson } from './Lesson.jsx';
import { LessonComplete } from './LessonComplete.jsx';
import { Celebration, isScreenEvent, Onboarding, Toast } from './Celebrations.jsx';
import { GuideSheet } from './GuideSheet.jsx';
import { Assessment } from './Assessment.jsx';
import { Practice } from './Practice.jsx';
import { Profile } from './Profile.jsx';
import { SpeedRound } from './SpeedRound.jsx';
import { Mascot } from './Mascot.jsx';

const storageKey = 'lingoquest.progress.v1';
const path = buildPath(curriculum);
const byId = new Map(questions.map(q => [q.id, q]));
const pick = ids => ids.map(id => byId.get(id)).filter(Boolean);
const tabs = [
  { id: 'learn', label: 'Aprender', hash: '#aprender', icon: MapIcon },
  { id: 'practice', label: 'Práctica', hash: '#practica', icon: Dumbbell },
  { id: 'profile', label: 'Perfil', hash: '#perfil', icon: User }
];
const tabFromHash = () => tabs.find(tab => tab.hash === window.location.hash)?.id || 'learn';
const lessonRules = { hearts: 5, requeue: true };
const freeRules = { hearts: null, requeue: true };
const examRules = { hearts: null, requeue: false };

function load() {
  try { return restoreProgress(JSON.parse(localStorage.getItem(storageKey))); } catch { return emptyProgress(); }
}

function GoalRing({ value, size = 38 }) {
  const fraction = Math.min(value / DAILY_GOAL, 1);
  return <svg className="goal-ring" viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
    <circle cx="20" cy="20" r="16" />
    <circle cx="20" cy="20" r="16" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - fraction * 100} />
  </svg>;
}

function OutOfHearts({ onRetry, onLeave }) {
  return <motion.div className="screen out-of-hearts" role="dialog" aria-modal="true" aria-labelledby="hearts-title"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
    <div className="screen-inner">
      <Mascot mood="sad" size={140} />
      <h1 id="hearts-title" className="screen-title" tabIndex="-1">¡Te quedaste sin vidas!</h1>
      <p className="screen-sub">No pasa nada: tus errores se guardaron en Práctica. Lee las explicaciones y vuelve a intentarlo.</p>
      <div className="screen-actions">
        <button type="button" className="btn btn-primary btn-block" autoFocus onClick={onRetry}><RotateCcw size={18} aria-hidden="true" />Intentar de nuevo</button>
        <button type="button" className="btn btn-plain btn-block" onClick={onLeave}>Volver al camino</button>
      </div>
    </div>
  </motion.div>;
}

export function App() {
  const [progress, setProgress] = useState(load);
  const [tab, setTab] = useState(tabFromHash);
  const [session, setSession] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [events, setEvents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [report, setReport] = useState(null);
  const [lost, setLost] = useState(null);
  const [guide, setGuide] = useState(null);
  const [speed, setSpeed] = useState(false);
  const [intro, setIntro] = useState(() => progress.onboarded ? null : 0);
  const [highlight, setHighlight] = useState(null);
  const [saved, setSaved] = useState(true);

  const today = progress.xpDaily[dayKey()] || 0;
  const days = streak(progress.days);
  const practisedToday = progress.days.includes(dayKey());
  const level = levelInfo(progress.xp);
  const overlay = Boolean(session || outcome || events.length || lost || speed || intro !== null);

  function queue(list) {
    setEvents(list.filter(isScreenEvent));
    const notes = list.filter(event => !isScreenEvent(event)).map((event, i) => ({ ...event, id: `${Date.now()}-${i}` }));
    if (notes.length) setToasts(current => [...current, ...notes]);
  }

  useEffect(() => {
    setSoundEnabled(progress.sound);
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); setSaved(true); } catch { setSaved(false); }
  }, [progress]);

  useEffect(() => {
    const sync = () => setTab(tabFromHash());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('locked', overlay); }, [overlay]);

  const firstTab = useRef(true);
  useEffect(() => {
    if (firstTab.current) { firstTab.current = false; return; }
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main')?.focus({ preventScroll: true });
    setHighlight(null);
  }, [tab]);

  function startSession(config) {
    if (!config.list.length) return;
    play('tap');
    setReport(null); setLost(null);
    setSession({ ...config, id: performance.now(), questions: prepare(config.list) });
  }

  function startNode(node) {
    if (node.kind === 'chest') {
      const result = openChest(progress, node.id, { path });
      const next = currentNode(result.progress, path)?.id;
      setProgress(result.progress);
      queue([{ type: 'chest', gain: result.gain }, ...result.events]);
      setHighlight(next);
      return;
    }
    if (node.kind === 'exam') {
      const list = balancedRound(pick(node.questionIds), 10, progress.solved);
      startSession({ title: `Examen · Unidad ${node.unitId}`, node, list, options: examRules, report: true });
      return;
    }
    startSession({ title: node.topicName ? `${node.topicName} · ${node.label}` : node.label, node, list: shuffled(pick(node.questionIds)), options: lessonRules });
  }

  function startMode(mode) {
    if (mode === 'speed') { play('tap'); setSpeed(true); return; }
    const practice = { kind: 'practice' };
    const of = type => questions.filter(q => q.type === type);
    const modes = {
      mistakes: () => ({ title: 'Repaso de errores', list: shuffled(pick(progress.mistakes)).slice(0, 10), options: freeRules }),
      general: () => ({ title: 'Desafío general', list: balancedRound(questions, 10, progress.solved), options: examRules, report: true }),
      listening: () => ({ title: 'Listening', list: practiceRound(of('listen'), 5, progress.solved), options: freeRules }),
      reading: () => ({ title: 'Reading', list: practiceRound(of('reading'), 5, progress.solved), options: freeRules })
    };
    startSession({ node: practice, ...modes[mode]() });
  }

  function practiseTopic(topicId, priorityIds = []) {
    const topic = topics.find(t => t.id === topicId);
    if (topic) startSession({ title: `Repaso · ${topic.name}`, node: { kind: 'practice' }, list: reviewRound(topic.questions, priorityIds, 5, progress.solved), options: freeRules });
  }

  function endSession(state, ms) {
    const current = session;
    setSession(null);
    if (state.status === 'lost') {
      setProgress(previous => failLesson(previous, state.results));
      setLost(current);
      return;
    }
    const summary = summarize(state);
    const before = currentNode(progress, path)?.id;
    const result = completeNode(progress, { node: current.node, summary, results: state.results, title: current.title, path });
    const after = currentNode(result.progress, path)?.id;
    setProgress(result.progress);
    setOutcome({ summary, ms, stars: result.stars, events: result.events, results: state.results, questions: current.questions, session: current, next: after !== before ? after : null });
  }

  function closeOutcome() {
    const { events: queued, session: finished, results, questions: asked, next } = outcome;
    setOutcome(null);
    queue(queued);
    if (finished.report) setReport({ title: finished.title, results, questions: asked });
    if (next) setHighlight(next);
  }

  function finishIntro(startFirst) {
    setProgress(previous => ({ ...previous, onboarded: true }));
    setIntro(null);
    if (startFirst) startNode(currentNode(progress, path) || path[0].nodes[0]);
  }

  function resetProgress() {
    setProgress({ ...emptyProgress(), sound: progress.sound, onboarded: true });
    setHighlight(null);
    window.location.hash = '#aprender';
  }

  const toggleSound = () => setProgress(previous => ({ ...previous, sound: !previous.sound }));
  const titles = { learn: 'Tu camino', practice: 'Práctica', profile: 'Tu perfil' };

  return <MotionConfig reducedMotion="user">
    <div className="app" inert={overlay}>
      <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus(); }}>Ir al contenido</a>
      <nav className="rail" aria-label="Secciones">
        <a className="brand" href="#aprender" aria-label="LingoQuest, inicio"><Mascot size={40} /><span>Lingo<b>Quest</b></span></a>
        {tabs.map(item => <a key={item.id} href={item.hash} className={`rail-link ${tab === item.id ? 'active' : ''}`} aria-current={tab === item.id ? 'page' : undefined}><item.icon size={24} aria-hidden="true" />{item.label}</a>)}
      </nav>

      <header className="topbar">
        <a className="brand compact" href="#aprender" aria-label="LingoQuest, inicio"><Mascot size={34} /></a>
        <div className="hud">
          <span className={`hud-item streak ${practisedToday ? 'lit' : ''}`} title="Días de racha"><Flame size={22} fill="currentColor" aria-hidden="true" /><b>{days}</b><span className="visually-hidden">días de racha</span></span>
          <span className="hud-item xp" title="XP total"><Zap size={22} fill="currentColor" aria-hidden="true" /><b>{progress.xp}</b><span className="visually-hidden">XP</span></span>
          <span className="hud-item goal" title="Meta diaria"><GoalRing value={today} size={30} /><b>{Math.min(today, DAILY_GOAL)}/{DAILY_GOAL}</b><span className="visually-hidden">XP de la meta diaria</span></span>
        </div>
        <button type="button" className="icon-button" onClick={toggleSound} aria-pressed={!progress.sound} aria-label={progress.sound ? 'Silenciar efectos' : 'Activar efectos de sonido'}>
          {progress.sound ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </header>

      <main id="main" className={`main view-${tab}`} tabIndex="-1">
        <h1 className={tab === 'learn' ? 'visually-hidden' : 'page-title'}>{titles[tab]}</h1>
        {tab === 'learn' && <Path path={path} progress={progress} highlight={highlight} onStart={startNode} onGuide={setGuide} />}
        {tab === 'practice' && <Practice progress={progress} onMode={startMode} />}
        {tab === 'profile' && <Profile progress={progress} onSound={toggleSound} onIntro={() => setIntro(0)} onReset={resetProgress} onGeneral={() => startMode('general')} />}
        {!saved && <p className="storage-note">Tu navegador no permite guardar el progreso. Puedes jugar, pero se perderá al cerrar.</p>}
      </main>

      <aside className="side">
        <section className="side-card goal-card">
          <GoalRing value={today} size={64} />
          <div><h2>Meta diaria</h2><p>{today >= DAILY_GOAL ? '¡Cumplida! Todo lo demás es extra.' : `${today} de ${DAILY_GOAL} XP hoy`}</p></div>
        </section>
        <section className="side-card">
          <h2>Nivel {level.level}</h2>
          <div className="level-bar"><i style={{ transform: `scaleX(${level.fraction})` }} /></div>
          <p>{level.needed - level.current} XP para el siguiente nivel</p>
        </section>
        {progress.mistakes.length > 0 && <section className="side-card">
          <h2>Errores por repasar</h2>
          <p>{progress.mistakes.length} {progress.mistakes.length === 1 ? 'ejercicio' : 'ejercicios'} sin corregir.</p>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => startMode('mistakes')}>Repasar ahora</button>
        </section>}
      </aside>

      <nav className="tabbar" aria-label="Secciones">
        {tabs.map(item => <a key={item.id} href={item.hash} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined}><item.icon size={26} aria-hidden="true" /><span>{item.label}</span></a>)}
      </nav>
    </div>

    {guide && <GuideSheet topic={topics.find(t => t.id === guide)} onClose={() => setGuide(null)}
      onPractice={() => { const id = guide; setGuide(null); practiseTopic(id); }} />}
    {report && !events.length && <Assessment result={report} topics={topics} onClose={() => setReport(null)}
      onPractice={practiseTopic}
      onReview={() => startSession({ title: 'Repaso de errores', node: { kind: 'practice' }, list: pick(report.results.filter(r => !r.correct).map(r => r.id)), options: freeRules })} />}

    <div className="toasts" aria-live="polite">
      <AnimatePresence>
        {!overlay && !report && toasts.slice(0, 3).map((event, i) => <Toast key={event.id} event={event} index={i} onDone={() => setToasts(list => list.filter(t => t.id !== event.id))} />)}
      </AnimatePresence>
    </div>

    <AnimatePresence>
      {session && <Lesson key={session.id} session={session} onEnd={endSession} onQuit={() => setSession(null)} />}
      {outcome && <LessonComplete key="complete" outcome={outcome} onContinue={closeOutcome} />}
      {!outcome && events.length > 0 && <Celebration key={`${events[0].type}-${events.length}`} event={events[0]} onDone={() => setEvents(list => list.slice(1))} />}
      {lost && <OutOfHearts key="lost" onRetry={() => startSession({ ...lost, list: shuffled(lost.list) })} onLeave={() => setLost(null)} />}
      {speed && <SpeedRound key="speed" questions={questions} best={progress.speedBest}
        onQuit={() => setSpeed(false)}
        onFinish={({ right, xp }) => {
          const result = finishSpeedRound(progress, { right, xp, path });
          setProgress(result.progress); setSpeed(false); queue(result.events);
        }} />}
      {intro !== null && <Onboarding key="intro" step={intro} setStep={setIntro} onDone={finishIntro} />}
    </AnimatePresence>
  </MotionConfig>;
}
