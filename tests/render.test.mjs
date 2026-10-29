import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { curriculum, questions, topics } from '../src/data.mjs';
import { emptyProgress } from '../src/learning.mjs';
import { buildPath } from '../src/path.mjs';
import { prepare } from '../src/lessonEngine.mjs';

let vite, Lesson, Assessment, QuestionReview, RoundHistory, Path, LessonComplete;
before(async () => {
  vite = await createServer({ configFile: false, server: { middlewareMode: true, watch: null, hmr: false, ws: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
  ({ Lesson } = await vite.ssrLoadModule('/src/Lesson.jsx'));
  ({ Assessment } = await vite.ssrLoadModule('/src/Assessment.jsx'));
  ({ QuestionReview } = await vite.ssrLoadModule('/src/QuestionReview.jsx'));
  ({ RoundHistory } = await vite.ssrLoadModule('/src/RoundHistory.jsx'));
  ({ Path } = await vite.ssrLoadModule('/src/Path.jsx'));
  ({ LessonComplete } = await vite.ssrLoadModule('/src/LessonComplete.jsx'));
});
after(async () => {
  await vite?.close();
});
const noop = () => {};
const clean = /undefined|NaN|\[object Object\]/;

test('Every exercise renders in Spanish inside a lesson', () => {
  for (const question of questions) {
    const session = { title: 'Lección', questions: prepare([question]), options: { hearts: 5, requeue: true } };
    const html = renderToStaticMarkup(React.createElement(Lesson, { session, onEnd: noop, onQuit: noop }));
    assert.ok(html.includes(`data-question-id="${question.id}"`), question.id);
    assert.ok(html.includes('Comprobar'), question.id);
    assert.ok(html.includes('5 vidas'), question.id);
    assert.doesNotMatch(html, clean, question.id);
  }
});

test('The path shows every unit, node and the first starting point', () => {
  const path = buildPath(curriculum);
  const html = renderToStaticMarkup(React.createElement(Path, { path, progress: emptyProgress(), onStart: noop, onGuide: noop }));
  assert.equal((html.match(/data-node="/g) || []).length, path.flatMap(unit => unit.nodes).length);
  for (const id of [1, 2, 3]) assert.ok(html.includes(`Unidad ${id}`));
  assert.equal((html.match(/Empieza aquí/g) || []).length, 1);
  assert.ok(html.includes('kind-guide'), 'Unit 1 includes the study guide lessons');
  assert.doesNotMatch(html, clean);
});

test('Lesson results show stars, XP, accuracy and time', () => {
  const round = questions.slice(0, 3);
  const html = renderToStaticMarkup(React.createElement(LessonComplete, {
    outcome: { summary: { xp: 40, accuracy: 100, perfect: true, bestCombo: 3 }, stars: 3, ms: 75000, questions: round, results: round.map(q => ({ id: q.id, correct: true })) },
    onContinue: noop
  }));
  assert.ok(html.includes('¡Lección perfecta!'));
  assert.ok(html.includes('3 de 3 estrellas'));
  assert.ok(html.includes('XP ganada') && html.includes('Precisión') && html.includes('1:15'), 'counters start from zero and animate on the client');
  assert.doesNotMatch(html, clean);
});

test('Exam reports explain each topic and recommend practice', () => {
  const round = questions.filter(question => question.type === 'choice').slice(0, 5);
  const render = correct => renderToStaticMarkup(React.createElement(Assessment, {
    result: { title: 'Examen', questions: round, results: round.map((question, index) => ({ id: question.id, correct: correct[index], recovered: !correct[index] && index % 2 === 0 })) },
    topics, onClose: noop, onReview: noop, onPractice: noop
  }));
  const partial = render([true, true, true, false, false]);
  const perfect = render([true, true, true, true, true]);
  assert.ok(partial.includes('<b>60%</b>'));
  assert.ok(partial.includes('Repasar los que fallé'));
  assert.ok(perfect.includes('<b>100%</b>'));
  assert.ok(perfect.includes('Respondiste todo bien'));
  assert.doesNotMatch(partial + perfect, clean);
});

test('Exercise review renders original answers, corrections and every activity type', () => {
  for (const question of questions) {
    const html = renderToStaticMarkup(React.createElement(QuestionReview, {
      question, attempt: { correct: false, recovered: true, response: question.type === 'match' ? question.pairs : 'initial response', latestResponse: question.answer }, number: 1
    }));
    assert.doesNotMatch(html, clean, question.id);
    assert.ok(html.includes('Qué recordar'), question.id);
  }
});

test('Recent-round charts show the latest eight rounds and an empty-state action', () => {
  const empty = renderToStaticMarkup(React.createElement(RoundHistory, { history: [], onStart: noop }));
  assert.ok(empty.includes('Hacer una prueba'));
  assert.ok(!empty.includes('history-column'));
  const history = Array.from({ length: 12 }, (_, index) => ({ date: '2026-10-24', total: 5, percentage: index % 2 ? 0 : 100, title: `Round ${index}` }));
  const html = renderToStaticMarkup(React.createElement(RoundHistory, { history, onStart: noop }));
  assert.equal((html.match(/class="history-column /g) || []).length, 8);
  assert.ok(html.includes('<b>Round 0</b>'), 'the latest round is selected initially');
  assert.doesNotMatch(html, /NaN|undefined/);
});
