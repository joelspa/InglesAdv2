export const normalize = text => String(text ?? '')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[’‘]/g, "'")
  .replace(/[.,!?;:"“”]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export function isCorrect(question, answer) {
  if (!question) return false;
  if (question.type === 'match') {
    if (!answer || typeof answer !== 'object') return false;
    const keys = Object.keys(question.pairs || {});
    if (keys.length === 0) return false;
    return keys.every(k => normalize(answer[k]) === normalize(question.pairs[k]));
  }
  return [question.answer, ...(question.accept || [])].some(value => normalize(value) === normalize(answer));
}

export function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const emptyProgress = () => ({
  completed: {},
  mistakes: [],
  days: [],
  daily: {},
  sessions: 0,
  solved: [],
  history: [],
  xp: 0,
  xpDaily: {},
  lessons: {},
  chests: [],
  achievements: [],
  bestCombo: 0,
  perfectLessons: 0,
  speedBest: 0,
  sound: true,
  onboarded: false
});

// Keep learning records from previous versions; drop anything malformed.
export function restoreProgress(value) {
  const source = value && typeof value === 'object' ? value : {};
  const strings = items => Array.isArray(items) ? [...new Set(items.filter(item => typeof item === 'string'))] : [];
  const entries = (items, valid) => Object.fromEntries(Object.entries(items && typeof items === 'object' ? items : {}).filter(([, number]) => typeof number === 'number' && Number.isFinite(number) && valid(number)));
  const count = number => Number.isInteger(number) && number >= 0 ? number : 0;
  const lessons = Object.fromEntries(Object.entries(source.lessons && typeof source.lessons === 'object' ? source.lessons : {})
    .filter(([, item]) => item && [1, 2, 3].includes(item.stars) && Number.isFinite(item.best) && item.best >= 0 && item.best <= 100)
    .map(([id, item]) => [id, { stars: item.stars, best: item.best }]));
  const validDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    return dayKey(new Date(year, month - 1, day, 12)) === value;
  };
  const history = Array.isArray(source.history) ? source.history
    .filter(item => item && validDate(item.date) && Number.isInteger(item.total) && item.total > 0 && Number.isFinite(item.percentage) && item.percentage >= 0 && item.percentage <= 100)
    .slice(0, 20).map(item => ({
      date: item.date, total: item.total, percentage: item.percentage,
      ...(Number.isInteger(item.right) && item.right >= 0 && item.right <= item.total ? { right: item.right } : {}),
      ...(Number.isInteger(item.recovered) && item.recovered >= 0 && item.recovered <= item.total ? { recovered: item.recovered } : {}),
      ...(typeof item.title === 'string' && item.title.trim() ? { title: item.title.slice(0, 160) } : {})
    })) : [];
  return {
    completed: entries(source.completed, n => n >= 0 && n <= 1),
    mistakes: strings(source.mistakes), days: strings(source.days), solved: strings(source.solved),
    daily: entries(source.daily, n => Number.isInteger(n) && n >= 0),
    sessions: Number.isInteger(source.sessions) && source.sessions >= 0 ? source.sessions : 0,
    history,
    xp: count(source.xp),
    xpDaily: entries(source.xpDaily, n => Number.isInteger(n) && n >= 0),
    lessons,
    chests: strings(source.chests),
    achievements: strings(source.achievements),
    bestCombo: count(source.bestCombo),
    perfectLessons: count(source.perfectLessons),
    speedBest: count(source.speedBest),
    sound: source.sound !== false,
    onboarded: source.onboarded === true
  };
}

// Level n starts at 30·(n−1)·n XP: 0, 60, 180, 360, 600…
const levelStart = level => 30 * (level - 1) * level;
export function levelInfo(xp) {
  let level = 1;
  while (levelStart(level + 1) <= xp) level++;
  const start = levelStart(level), end = levelStart(level + 1);
  return { level, current: xp - start, needed: end - start, fraction: (xp - start) / (end - start) };
}

// Finishing a lesson always earns a star; accuracy earns the rest.
export const starsFor = accuracy => accuracy >= 100 ? 3 : accuracy >= 80 ? 2 : 1;

// Short rounds prefer questions the student has not learned yet.
export function practiceRound(pool, size = 5, solved = [], random = Math.random) {
  const known = new Set(solved);
  const fresh = shuffled(pool.filter(q => !known.has(q.id)), random);
  const review = shuffled(pool.filter(q => known.has(q.id)), random);
  return [...fresh, ...review].slice(0, size);
}

export function balancedRound(pool, size = 10, solved = [], random = Math.random) {
  const groups = new Map();
  for (const question of pool) {
    if (!groups.has(question.topicId)) groups.set(question.topicId, []);
    groups.get(question.topicId).push(question);
  }
  const selected = shuffled([...groups.values()], random).slice(0, size)
    .map(group => practiceRound(group, 1, solved, random)[0]);
  const ids = new Set(selected.map(question => question.id));
  selected.push(...practiceRound(pool.filter(question => !ids.has(question.id)), Math.max(0, size - selected.length), solved, random));
  return shuffled(selected, random);
}

export function reviewRound(pool, priorityIds, size = 5, solved = [], random = Math.random) {
  const byId = new Map(pool.map(question => [question.id, question]));
  const priority = [...new Set(priorityIds)].map(id => byId.get(id)).filter(Boolean).slice(0, size);
  const selected = new Set(priority.map(question => question.id));
  return [...priority, ...practiceRound(pool.filter(question => !selected.has(question.id)), Math.max(0, size - priority.length), solved, random)];
}

export function recordAttempt(previous, id, correct, retried = false, assisted = false, response) {
  const existing = previous.find(result => result.id === id);
  const firstCorrect = existing ? existing.correct : correct && !retried;
  const entry = { ...existing, id, correct: firstCorrect, recovered: !firstCorrect && (correct || Boolean(existing?.recovered)), assisted: existing ? Boolean(existing.assisted) : assisted };
  if (response !== undefined) {
    const snapshot = structuredClone(response);
    if (existing) entry.latestResponse = snapshot;
    else entry.response = snapshot;
    entry.attempts = (existing?.attempts || 0) + 1;
  }
  return existing ? previous.map(result => result.id === id ? entry : result) : [...previous, entry];
}

export function finishSession(previous, results, topicId, today = dayKey(), topicQuestionIds = [], title = '') {
  const next = restoreProgress(previous);
  const right = results.filter(r => r.correct).length;
  const recovered = results.filter(r => !r.correct && r.recovered).length;
  next.solved = [...new Set([...(next.solved || []), ...results.filter(r => r.correct || r.recovered).map(r => r.id)])];
  next.sessions += 1;
  if (!next.days.includes(today)) next.days.push(today);
  next.daily[today] = (next.daily[today] || 0) + right + recovered;
  if (topicId) {
    const fraction = topicQuestionIds.length
      ? topicQuestionIds.filter(id => next.solved.includes(id)).length / topicQuestionIds.length
      : results.length > 0 ? right / results.length : 0;
    next.completed[topicId] = Math.max(next.completed[topicId] || 0, fraction);
  }
  for (const result of results) {
    next.mistakes = next.mistakes.filter(id => id !== result.id);
    if (!result.correct && !result.recovered) next.mistakes.push(result.id);
  }
  const percentage = results.length ? Math.round(right / results.length * 100) : 0;
  if (results.length) next.history = [{ date: today, total: results.length, right, recovered, percentage, ...(title ? { title } : {}) }, ...next.history].slice(0, 20);
  return { progress: next, right, recovered, percentage };
}

export function assessRound(results, roundQuestions, topicCatalog) {
  const questionsById = new Map(roundQuestions.map(question => [question.id, question]));
  const unique = [...new Map(results.filter(result => questionsById.has(result.id)).map(result => [result.id, result])).values()];
  const total = unique.length;
  const right = unique.filter(result => result.correct).length;
  const recovered = unique.filter(result => !result.correct && result.recovered).length;
  const pending = total - right - recovered;
  const percentage = total ? Math.round(right / total * 100) : 0;
  const assessedTopics = topicCatalog.map(topic => {
    const attempts = unique.filter(result => questionsById.get(result.id).topicId === topic.id);
    const correct = attempts.filter(result => result.correct).length;
    const corrected = attempts.filter(result => !result.correct && result.recovered).length;
    return {
      id: topic.id, name: topic.name, translation: topic.translation,
      total: attempts.length, right: correct, recovered: corrected,
      assisted: attempts.filter(result => result.assisted).length,
      pending: attempts.length - correct - corrected,
      percentage: attempts.length ? Math.round(correct / attempts.length * 100) : 0,
      missedIds: attempts.filter(result => !result.correct).map(result => result.id),
      reviewIds: attempts.filter(result => !result.correct || result.assisted).map(result => result.id)
    };
  }).filter(topic => topic.total > 0);
  const recommendations = assessedTopics.filter(topic => topic.right < topic.total || topic.assisted > 0)
    .sort((a, b) => a.percentage - b.percentage || b.pending - a.pending || b.assisted - a.assisted || b.total - a.total).slice(0, 3);
  return {
    total, right, recovered, pending, percentage,
    assisted: unique.filter(result => result.assisted).length,
    status: total === 0 ? 'empty' : right / total >= .8 ? 'strong' : right / total >= .5 ? 'developing' : 'reinforce',
    topics: assessedTopics, recommendations,
    answers: unique.map(result => ({ id: result.id, state: result.correct ? 'correct' : result.recovered ? 'recovered' : 'pending' }))
  };
}

export function streak(days, now = new Date()) {
  let count = 0;
  const cursor = new Date(now);
  if (!days.includes(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.includes(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
