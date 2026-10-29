// Pure lesson state machine: queue, re-queued mistakes, hearts, combo and XP.
import { recordAttempt, shuffled } from './learning.mjs';

export const MAX_HEARTS = 5;
export const XP = { first: 10, recovered: 5, comboEvery: 5, comboBonus: 5, perfect: 10 };

export function startLesson(ids, { hearts = MAX_HEARTS, requeue = true } = {}) {
  return {
    queue: [...ids], total: ids.length, hearts, requeue,
    results: [], combo: 0, bestCombo: 0, xp: 0, mistakes: 0,
    phase: 'answering', status: 'playing', last: null, turn: 0
  };
}

// Shuffle options and word tiles once per session so they stay put while playing.
export const prepare = questions => questions.map(q => ({
  ...q,
  options: q.options ? shuffled(q.options) : undefined,
  tiles: q.words ? shuffled(q.words.map((word, id) => ({ word, id }))) : undefined
}));

export const currentId = state => state.queue[0];
export const answeredCount = state => state.results.filter(r => r.correct || r.recovered).length + (state.requeue ? 0 : state.results.filter(r => !r.correct && !r.recovered).length);

export function answer(state, correct, { response, assisted = false } = {}) {
  if (state.phase !== 'answering' || state.status !== 'playing') return state;
  const id = currentId(state);
  const existing = state.results.find(r => r.id === id);
  const results = recordAttempt(state.results, id, correct, Boolean(existing), assisted, response);
  const combo = correct ? state.combo + 1 : 0;
  const milestone = correct && combo % XP.comboEvery === 0;
  const gain = correct ? (existing ? XP.recovered : XP.first) + (milestone ? XP.comboBonus : 0) : 0;
  const hearts = !correct && state.hearts !== null ? state.hearts - 1 : state.hearts;
  return {
    ...state, results, combo, bestCombo: Math.max(state.bestCombo, combo), xp: state.xp + gain,
    mistakes: state.mistakes + (correct ? 0 : 1), hearts, phase: 'feedback',
    last: { id, correct, gain, milestone, retry: Boolean(existing), willRepeat: !correct && state.requeue && hearts !== 0 }
  };
}

export function next(state) {
  if (state.phase !== 'feedback') return state;
  const [head, ...rest] = state.queue;
  const queue = state.last.correct || !state.requeue ? rest : [...rest, head];
  if (state.hearts === 0) return { ...state, queue, phase: 'done', status: 'lost' };
  if (!queue.length) {
    const perfect = state.mistakes === 0;
    return { ...state, queue, phase: 'done', status: 'won', xp: state.xp + (perfect ? XP.perfect : 0), perfect };
  }
  return { ...state, queue, phase: 'answering', last: null, turn: state.turn + 1 };
}

// The share of questions answered correctly on the first try.
export function summarize(state) {
  const right = state.results.filter(r => r.correct).length;
  const recovered = state.results.filter(r => !r.correct && r.recovered).length;
  const total = state.results.length || state.total;
  return {
    total, right, recovered, xp: state.xp, bestCombo: state.bestCombo,
    accuracy: total ? Math.round(right / total * 100) : 0,
    perfect: state.status === 'won' && state.mistakes === 0
  };
}
