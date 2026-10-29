import test from 'node:test';
import assert from 'node:assert/strict';
import { curriculum, questions } from '../src/data.mjs';
import { buildPath, currentNode, nodeState, splitLessons } from '../src/path.mjs';
import { answer, currentId, MAX_HEARTS, next, startLesson, summarize, XP } from '../src/lessonEngine.mjs';
import { emptyProgress, levelInfo, restoreProgress, starsFor } from '../src/learning.mjs';
import { completeNode, failLesson, finishSpeedRound, openChest } from '../src/rewards.mjs';

const path = buildPath(curriculum);
const play = (state, outcomes) => outcomes.reduce((s, ok) => next(answer(s, ok)), state);

test('The path covers every question exactly once in lessons, with stable ids', () => {
  assert.equal(path.length, 3);
  const lessonIds = path.flatMap(unit => unit.nodes.filter(n => n.kind === 'lesson' || n.kind === 'guide').flatMap(n => n.questionIds));
  assert.equal(lessonIds.length, questions.length);
  assert.equal(new Set(lessonIds).size, questions.length);
  for (const unit of path) {
    assert.equal(unit.nodes.at(-1).kind, 'exam');
    for (const topic of curriculum.find(u => u.id === unit.id).topics) {
      const ids = unit.nodes.filter(n => n.topicId === topic.id).map(n => n.id);
      assert.deepEqual(ids.filter(id => /:L\d$/.test(id)), [`${topic.id}:L1`, `${topic.id}:L2`, `${topic.id}:L3`]);
      assert.equal(ids.at(-1), `${topic.id}:chest`);
    }
  }
  assert.deepEqual(splitLessons([1, 2, 3, 4, 5, 6, 7].map(i => ({ id: i, type: 'choice' }))).map(l => l.length), [3, 2, 2]);
});

test('First lessons are open, later nodes unlock in order and the exam needs every topic', () => {
  const unit = path[0];
  const [l1, l2] = unit.nodes;
  let progress = emptyProgress();
  assert.equal(nodeState(progress, l1, unit), 'available');
  assert.equal(nodeState(progress, l2, unit), 'locked');
  assert.equal(nodeState(progress, unit.nodes.find(n => n.kind === 'guide'), unit), 'available', 'study-guide lessons are always open');
  const chest = unit.nodes.find(n => n.kind === 'chest');
  assert.equal(nodeState(progress, chest, unit), 'locked');
  const done = { ...progress, lessons: Object.fromEntries(unit.nodes.filter(n => n.topicId === chest.topicId && n.kind !== 'chest').map(n => [n.id, { stars: 1, best: 50 }])) };
  assert.equal(nodeState(done, chest, unit), 'available', 'the chest opens once every lesson of the topic is done');
  assert.equal(nodeState(progress, unit.nodes.at(-1), unit), 'locked');
  assert.equal(currentNode(progress, path).id, l1.id);
  progress = { ...progress, lessons: { [l1.id]: { stars: 2, best: 80 } } };
  assert.equal(nodeState(progress, l1, unit), 'done');
  assert.equal(nodeState(progress, l2, unit), 'available');
  for (const node of unit.nodes.filter(n => n.kind === 'lesson' && n.index === 0)) progress.lessons[node.id] = { stars: 1, best: 50 };
  assert.equal(nodeState(progress, unit.nodes.at(-1), unit), 'available');
});

test('Wrong answers cost a heart and come back at the end of the lesson', () => {
  let state = startLesson(['a', 'b', 'c']);
  state = answer(state, false);
  assert.equal(state.hearts, MAX_HEARTS - 1);
  assert.equal(state.last.willRepeat, true);
  state = next(state);
  assert.deepEqual(state.queue, ['b', 'c', 'a']);
  state = play(state, [true, true, true]);
  assert.equal(state.status, 'won');
  const summary = summarize(state);
  assert.equal(summary.right, 2);
  assert.equal(summary.recovered, 1);
  assert.equal(summary.accuracy, 67);
  assert.equal(summary.xp, XP.first * 2 + XP.recovered);
  assert.equal(summary.perfect, false);
});

test('Losing every heart ends the lesson; combos and perfect lessons earn bonus XP', () => {
  const lost = play(startLesson(['a', 'b']), [false, false, false, false, false]);
  assert.equal(lost.status, 'lost');
  assert.equal(lost.hearts, 0);
  const ids = Array.from({ length: 5 }, (_, i) => `q${i}`);
  const won = play(startLesson(ids), ids.map(() => true));
  assert.equal(won.bestCombo, 5);
  assert.equal(won.xp, 5 * XP.first + XP.comboBonus + XP.perfect);
  assert.equal(summarize(won).perfect, true);
  const exam = play(startLesson(['a', 'b'], { hearts: null, requeue: false }), [false, true]);
  assert.equal(exam.status, 'won');
  assert.equal(exam.hearts, null);
  assert.equal(currentId(exam), undefined);
});

test('Completing nodes saves stars, XP and celebration events', () => {
  const now = new Date(2026, 9, 29, 12);
  const node = path[0].nodes[0];
  let state = play(startLesson(node.questionIds), node.questionIds.map(() => true));
  const first = completeNode(emptyProgress(), { node, summary: summarize(state), results: state.results, path, now });
  assert.equal(first.stars, 3);
  assert.deepEqual(first.progress.lessons[node.id], { stars: 3, best: 100 });
  assert.ok(first.progress.xp > 0);
  assert.ok(first.events.some(e => e.type === 'streak' && e.days === 1));
  assert.ok(first.events.some(e => e.type === 'achievement' && e.achievement.id === 'first-lesson'));
  assert.ok(first.events.some(e => e.type === 'achievement' && e.achievement.id === 'perfect'));
  state = play(startLesson(node.questionIds), [false, ...node.questionIds.map(() => true)]);
  const again = completeNode(first.progress, { node, summary: summarize(state), results: state.results, path, now });
  assert.equal(again.progress.lessons[node.id].stars, 3, 'the best result is kept');
  assert.ok(!again.events.some(e => e.type === 'streak'));

  const chest = openChest(again.progress, 'conditional:chest', { path, random: () => 0, now });
  assert.equal(chest.gain, 20);
  assert.equal(openChest(chest.progress, 'conditional:chest', { path, now }).gain, 0);

  const speed = finishSpeedRound(emptyProgress(), { right: 16, xp: 32, path, now });
  assert.equal(speed.record, true);
  assert.ok(speed.events.some(e => e.type === 'achievement' && e.achievement.id === 'speed-15'));

  const failed = failLesson(emptyProgress(), [{ id: 'conditional-1', correct: false, recovered: false }, { id: 'conditional-2', correct: true }]);
  assert.deepEqual(failed.mistakes, ['conditional-1']);
});

test('Levels, stars and restored game fields stay valid', () => {
  assert.equal(levelInfo(0).level, 1);
  assert.equal(levelInfo(59).level, 1);
  assert.equal(levelInfo(60).level, 2);
  assert.equal(levelInfo(180).level, 3);
  assert.equal(starsFor(40), 1);
  assert.equal(starsFor(80), 2);
  assert.equal(starsFor(100), 3);
  const restored = restoreProgress({ xp: -4, lessons: { a: { stars: 9, best: 50 }, b: { stars: 2, best: 90 } }, sound: false, onboarded: 'yes', chests: ['x', 'x', 3] });
  assert.equal(restored.xp, 0);
  assert.deepEqual(restored.lessons, { b: { stars: 2, best: 90 } });
  assert.equal(restored.sound, false);
  assert.equal(restored.onboarded, false);
  assert.deepEqual(restored.chests, ['x']);
});
