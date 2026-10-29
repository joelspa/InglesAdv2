// Turns finished lessons, chests and speed rounds into saved progress plus
// the celebration events the UI should show (streak, level, goal, badges).
import { dayKey, finishSession, levelInfo, restoreProgress, starsFor, streak } from './learning.mjs';
import { isDone, unitComplete } from './path.mjs';

export const DAILY_GOAL = 50;

export const achievementList = [
  { id: 'first-lesson', icon: 'Footprints', name: 'Primer paso', desc: 'Completa tu primera lección', test: p => Object.keys(p.lessons).length >= 1 },
  { id: 'perfect', icon: 'Gem', name: 'Impecable', desc: 'Termina una lección sin errores', test: p => p.perfectLessons >= 1 },
  { id: 'combo-10', icon: 'Zap', name: 'Imparable', desc: 'Consigue 10 aciertos seguidos', test: p => p.bestCombo >= 10 },
  { id: 'streak-3', icon: 'Flame', name: 'En llamas', desc: 'Practica 3 días seguidos', test: (p, ctx) => streak(p.days, ctx.now) >= 3 },
  { id: 'xp-500', icon: 'Star', name: 'Coleccionista', desc: 'Reúne 500 XP', test: p => p.xp >= 500 },
  { id: 'speed-15', icon: 'Timer', name: 'Rayo', desc: '15 aciertos en el desafío relámpago', test: p => p.speedBest >= 15 },
  { id: 'chef', icon: 'ChefHat', name: 'Chef de la gramática', desc: 'Completa todas las lecciones Guía EGT', test: (p, ctx) => {
    const guides = ctx.path.flatMap(unit => unit.nodes.filter(node => node.kind === 'guide'));
    return guides.length > 0 && guides.every(node => isDone(p, node));
  } },
  { id: 'unit-master', icon: 'Medal', name: 'Maestro de unidad', desc: 'Completa todas las lecciones de una unidad', test: (p, ctx) => ctx.path.some(unit => unitComplete(p, unit)) },
  { id: 'legend', icon: 'Crown', name: 'Leyenda', desc: 'Completa las tres unidades', test: (p, ctx) => ctx.path.every(unit => unitComplete(p, unit)) }
];

function addXp(progress, gain, today) {
  progress.xp += gain;
  progress.xpDaily[today] = (progress.xpDaily[today] || 0) + gain;
}

function settle(before, after, path, today, now) {
  const events = [];
  if (!before.days.includes(today) && after.days.includes(today)) events.push({ type: 'streak', days: streak(after.days, now) });
  const level = levelInfo(after.xp).level;
  if (level > levelInfo(before.xp).level) events.push({ type: 'level', level });
  if ((before.xpDaily[today] || 0) < DAILY_GOAL && (after.xpDaily[today] || 0) >= DAILY_GOAL) events.push({ type: 'goal' });
  for (const achievement of achievementList) {
    if (after.achievements.includes(achievement.id) || !achievement.test(after, { path, now })) continue;
    after.achievements.push(achievement.id);
    events.push({ type: 'achievement', achievement });
  }
  return events;
}

// node is a path node, or { kind: 'practice' } for rounds outside the path.
export function completeNode(previous, { node, summary, results, title = '', path, now = new Date() }) {
  const today = dayKey(now);
  const before = restoreProgress(previous);
  const { progress } = finishSession(before, results, null, today, [], title);
  addXp(progress, summary.xp, today);
  let stars = 0;
  if (node.kind !== 'practice') {
    stars = starsFor(summary.accuracy);
    const saved = progress.lessons[node.id];
    progress.lessons[node.id] = { stars: Math.max(saved?.stars || 0, stars), best: Math.max(saved?.best || 0, summary.accuracy) };
  }
  progress.bestCombo = Math.max(progress.bestCombo, summary.bestCombo);
  if (summary.perfect) progress.perfectLessons += 1;
  return { progress, stars, events: settle(before, progress, path, today, now) };
}

// A lost lesson earns nothing, but its unresolved mistakes are kept for review.
export function failLesson(previous, results) {
  const progress = restoreProgress(previous);
  for (const result of results) if (!result.correct && !result.recovered && !progress.mistakes.includes(result.id)) progress.mistakes.push(result.id);
  return progress;
}

export function openChest(previous, nodeId, { path, random = Math.random, now = new Date() }) {
  const today = dayKey(now);
  const before = restoreProgress(previous);
  const progress = restoreProgress(before);
  if (progress.chests.includes(nodeId)) return { progress, gain: 0, events: [] };
  const gain = 20 + Math.floor(random() * 11);
  progress.chests.push(nodeId);
  addXp(progress, gain, today);
  return { progress, gain, events: settle(before, progress, path, today, now) };
}

export function finishSpeedRound(previous, { right, xp, path, now = new Date() }) {
  const today = dayKey(now);
  const before = restoreProgress(previous);
  const progress = restoreProgress(before);
  const record = right > progress.speedBest;
  progress.speedBest = Math.max(progress.speedBest, right);
  if (right > 0 && !progress.days.includes(today)) progress.days.push(today);
  addXp(progress, xp, today);
  return { progress, record, events: settle(before, progress, path, today, now) };
}
