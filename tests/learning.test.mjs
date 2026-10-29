import test from 'node:test';
import assert from 'node:assert/strict';
import { curriculum, topics, questions } from '../src/data.mjs';
import { assessRound, balancedRound, emptyProgress, finishSession, isCorrect, practiceRound, recordAttempt, restoreProgress, reviewRound, streak, shuffled } from '../src/learning.mjs';
import { teaching } from '../src/teaching.mjs';

test('All nine topics have valid exercises and stable question identifiers', () => {
  assert.equal(curriculum.length, 3);
  assert.equal(topics.length, 9);
  assert.equal(questions.length, 227);
  assert.equal(new Set(questions.map(q => q.id)).size, 227);
  const guide = questions.filter(q => q.lesson === 'guide');
  assert.deepEqual([...new Set(guide.map(q => q.topicId))], ['conditional', 'intensifiers', 'passive'], 'study-guide items belong to Unit 1');
  for (const topic of topics) {
    assert.equal(topic.questions.filter(q => q.lesson !== 'guide').length, 22);
    assert.equal(topic.pages, undefined);
    assert.ok(teaching[topic.id]?.hint.es);
    assert.ok(teaching[topic.id]?.hint.en);
    for (let i = 1; i <= 22; i++) assert.ok(questions.find(q => q.id === `${topic.id}-${i}`));
  }

  for (const q of questions) {
    assert.ok(q.answer, `Question ${q.id} must have answer`);
    assert.ok(q.explanation?.es, `Question ${q.id} must have Spanish explanation`);
    assert.ok(q.explanation?.en, `Question ${q.id} must have English explanation`);
    assert.ok(teaching[q.topicId], `Question ${q.id} must link to a learning hint`);
    assert.equal(q.origin, undefined);

    if (q.options) {
      assert.equal(new Set(q.options).size, q.options.length, `Options in ${q.id} must be unique`);
      assert.ok(q.options.includes(q.answer), `Options in ${q.id} must include answer: ${q.answer}`);
    }

    if (q.type === 'order') {
      assert.ok(isCorrect(q, q.words.join(' ')), `Order question ${q.id} should validate properly`);
    }

    if (q.type === 'match') {
      assert.ok(q.pairs && Object.keys(q.pairs).length >= 4, `Match question ${q.id} should have >= 4 pairs`);
      assert.ok(isCorrect(q, q.pairs), `Match question ${q.id} should validate pairs`);
      assert.equal(new Set(Object.values(q.pairs)).size, Object.values(q.pairs).length, `Match ${q.id} must have unique targets`);
    }

    if (q.type === 'listen') {
      assert.ok(q.audio && q.audio.length > 10, `Listen question ${q.id} must have audio script`);
      assert.notEqual(q.audio, q.answer, `Listen question ${q.id} must not be identical to audio text to avoid transcript leaks`);
    }

    if (q.type === 'reading') {
      assert.ok(q.story && q.story.length > 50, `Reading question ${q.id} must contain authentic story`);
    }

    if (q.type === 'error_hunt') {
      assert.ok(q.sentence && q.options.includes(q.answer), `Error hunt ${q.id} must have sentence and options`);
    }
    if (q.type === 'dialogue') {
      assert.ok(q.scene?.es && q.scene?.en && q.speaker && q.line);
      assert.ok(q.options.includes(q.answer));
    }
  }
});

test('Answer checking tolerates typography and case but rejects wrong grammar', () => {
  const qTag = questions.find(q => q.id === 'tags-1');
  assert.ok(isCorrect(qTag, " AREN'T I "));
  assert.ok(isCorrect(qTag, "aren't I"));
  assert.ok(isCorrect(qTag, 'aren’t i'));
  assert.ok(!isCorrect(qTag, "isn't I"));

  const qCond = questions.find(q => q.id === 'conditional-1');
  assert.ok(isCorrect(qCond, 'studied'));
  assert.ok(isCorrect(qCond, 'STUDIED'));
  assert.ok(!isCorrect(qCond, 'study'));
  assert.ok(!isCorrect(questions.find(q => q.id === 'conditional-5'), "wouldn't"), 'a blank before not must not accept a duplicate negation');

  const qMatch = questions.find(q => q.type === 'match');
  assert.ok(isCorrect(qMatch, qMatch.pairs));
  assert.ok(!isCorrect(qMatch, { invalid: 'pair' }));
});

test('Corrections clear mistakes and keep first-attempt accuracy in the round history', () => {
  const previous = emptyProgress();
  previous.mistakes = ['a', 'b'];
  const result = finishSession(previous, [
    { id: 'a', correct: false, recovered: true },
    { id: 'b', correct: false },
    { id: 'c', correct: true }
  ], null, '2026-10-24');
  assert.equal(result.right, 1);
  assert.equal(result.recovered, 1);
  assert.equal(result.percentage, 33);
  assert.deepEqual(result.progress.history[0], { date: '2026-10-24', total: 3, right: 1, recovered: 1, percentage: 33 });
  assert.deepEqual(result.progress.mistakes, ['b']);
  assert.deepEqual(result.progress.solved, ['a', 'c']);
  assert.equal(result.progress.daily['2026-10-24'], 2);
  assert.deepEqual(previous.mistakes, ['a', 'b']);
});

test('Repeated checks and retries keep a single result and retain the first attempt', () => {
  const wrong = recordAttempt([], 'a', false);
  const wrongAgain = recordAttempt(wrong, 'a', false, true);
  const recovered = recordAttempt(wrongAgain, 'a', true, true);
  assert.deepEqual(recovered, [{ id: 'a', correct: false, recovered: true, assisted: false }]);
  assert.deepEqual(wrong, [{ id: 'a', correct: false, recovered: false, assisted: false }]);
  const right = recordAttempt([], 'b', true);
  assert.deepEqual(recordAttempt(right, 'b', true), right);
  assert.deepEqual(recordAttempt([], 'match', true, true), [{ id: 'match', correct: false, recovered: true, assisted: false }]);
  assert.equal(finishSession(emptyProgress(), recovered, null, '2026-10-24').right, 0);
});

test('Review keeps the original response and corrected response without changing past attempts', () => {
  const initial = recordAttempt([], 'a', false, false, false, 'study');
  const corrected = recordAttempt(initial, 'a', true, true, false, 'studied');
  assert.equal(corrected[0].response, 'study');
  assert.equal(corrected[0].latestResponse, 'studied');
  assert.equal(corrected[0].attempts, 2);
  assert.equal(corrected[0].correct, false);
  assert.equal(corrected[0].recovered, true);
  assert.equal(initial[0].latestResponse, undefined);
  const pair = { left: 'right' };
  const snapshot = recordAttempt([], 'pair', true, false, false, pair);
  pair.left = 'changed';
  assert.deepEqual(snapshot[0].response, { left: 'right' });
});

test('Recommended practice starts with difficult exercises even if they were solved previously', () => {
  const bank = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const review = reviewRound(bank, ['d', 'd', 'unknown', 'b'], 3, ['d', 'b'], () => .2);
  assert.deepEqual(review.slice(0, 2).map(question => question.id), ['d', 'b']);
  assert.equal(new Set(review.map(question => question.id)).size, 3);
  assert.equal(reviewRound(bank, [], 10).length, 4);
  assert.deepEqual(reviewRound([], ['missing']), []);
  assert.deepEqual(reviewRound(bank, ['a'], 0), []);
});

test('History retains the name of the completed round', () => {
  const completed = finishSession(emptyProgress(), [{ id: 'a', correct: true }], null, '2026-10-24', [], 'General assessment');
  assert.equal(completed.progress.history[0].title, 'General assessment');
  assert.equal(restoreProgress(completed.progress).history[0].title, 'General assessment');
});

test('Topic mastery accumulates across short rounds and requires the full topic', () => {
  const ids = ['a', 'b', 'c'];
  const one = finishSession(emptyProgress(), [{ id: 'a', correct: true }], 'topic', '2026-10-24', ids);
  assert.equal(one.progress.completed.topic, 1 / 3);
  const two = finishSession(one.progress, [{ id: 'a', correct: true }, { id: 'b', correct: true }], 'topic', '2026-10-24', ids);
  assert.equal(two.progress.completed.topic, 2 / 3, 'replaying a solved question does not advance mastery twice');
  const all = finishSession(two.progress, [{ id: 'c', correct: false, recovered: true }], 'topic', '2026-10-24', ids);
  assert.equal(all.progress.completed.topic, 1);
});

test('Old saved progress can gain question-level progress without a reset', () => {
  const old = emptyProgress();
  delete old.solved;
  old.xp = 70;
  const result = finishSession(old, [{ id: 'a', correct: true }], null, '2026-10-24');
  assert.equal(result.progress.xp, 70, 'game XP survives a finished round');
  assert.equal('xp' in result, false);
  assert.deepEqual(result.progress.solved, ['a']);
});

test('Short rounds prioritize unseen exercises and handle smaller review banks', () => {
  const bank = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const round = practiceRound(bank, 3, ['a', 'c'], () => 0.2);
  assert.deepEqual(new Set(round.slice(0, 2).map(q => q.id)), new Set(['b', 'd']));
  assert.equal(new Set(round.map(q => q.id)).size, 3);
  assert.equal(practiceRound(bank, 10).length, 4);
  assert.equal(practiceRound([], 5).length, 0);
  assert.deepEqual(bank.map(q => q.id), ['a', 'b', 'c', 'd']);
});

test('General assessments cover every topic once before adding extra questions', () => {
  const round = balancedRound(questions, 10, [], () => .3);
  assert.equal(round.length, 10);
  assert.equal(new Set(round.map(question => question.topicId)).size, 9);
  assert.equal(new Set(round.map(question => question.id)).size, 10);
  assert.equal(balancedRound([], 10).length, 0);
  assert.equal(balancedRound(questions.slice(0, 3), 10).length, 3);
});

test('Completed practice records mistakes, preserves topic learning, and saves round results', () => {
  const first = finishSession(emptyProgress(), [{ id: 'a', correct: true }, { id: 'b', correct: false }], 'topic', '2026-10-17');
  assert.equal(first.percentage, 50);
  assert.deepEqual(first.progress.mistakes, ['b']);
  assert.equal(first.progress.completed.topic, 0.5);

  const fixed = finishSession(first.progress, [{ id: 'b', correct: true }], null, '2026-10-17');
  assert.equal(fixed.percentage, 100);
  assert.deepEqual(fixed.progress.mistakes, []);
  assert.equal(fixed.progress.daily['2026-10-17'], 2);
  assert.equal(fixed.progress.completed.topic, 0.5);

  const worse = finishSession(fixed.progress, [{ id: 'a', correct: false }], 'topic', '2026-10-17');
  assert.equal(worse.progress.completed.topic, 0.5);
  assert.equal(first.progress.history.length, 1, 'prior progress is not mutated');
});

test('Assessments separate initial accuracy, corrections, and remaining practice by topic', () => {
  const bank = [
    { id: 'a', topicId: 'tags' }, { id: 'b', topicId: 'tags' },
    { id: 'c', topicId: 'passive' }, { id: 'd', topicId: 'conditional' }
  ];
  const results = [{ id: 'a', correct: true }, { id: 'b', correct: false, recovered: true }, { id: 'c', correct: false }, { id: 'd', correct: true }];
  const report = assessRound(results, bank, topics);
  assert.equal(report.total, 4);
  assert.equal(report.percentage, 50);
  assert.equal(report.right, 2);
  assert.equal(report.recovered, 1);
  assert.equal(report.pending, 1);
  assert.equal(report.status, 'developing');
  assert.deepEqual(report.recommendations.map(topic => topic.id), ['passive', 'tags']);
  assert.equal(report.topics.length, 3, 'unassessed topics must not appear with zero scores');
  assert.equal(report.topics.find(topic => topic.id === 'tags').percentage, 50);
  assert.deepEqual(report.recommendations[0].missedIds, ['c']);
  assert.deepEqual(report.answers.map(answer => answer.state), ['correct', 'recovered', 'pending', 'correct']);
});

test('Assessments handle perfect, zero, empty, duplicate, and unknown results', () => {
  const bank = [{ id: 'a', topicId: 'tags' }];
  const perfect = assessRound([{ id: 'a', correct: true }], bank, topics);
  assert.equal(perfect.percentage, 100);
  assert.equal(perfect.status, 'strong');
  assert.deepEqual(perfect.recommendations, []);
  assert.equal(assessRound([{ id: 'a', correct: false, recovered: true }], bank, topics).percentage, 0);
  assert.equal(assessRound([{ id: 'a', correct: false }], bank, topics).status, 'reinforce');
  const empty = assessRound([], bank, topics);
  assert.equal(empty.status, 'empty');
  assert.equal(empty.percentage, 0);
  assert.deepEqual(empty.topics, []);
  const duplicate = assessRound([{ id: 'a', correct: false }, { id: 'a', correct: true }, { id: 'unknown', correct: true }], bank, topics);
  assert.equal(duplicate.total, 1);
  assert.equal(duplicate.percentage, 100);
});

test('Hints are recorded on first attempt and lead to independent practice recommendations', () => {
  const initial = recordAttempt([], 'a', true, false, true);
  const report = assessRound(initial, [{ id: 'a', topicId: 'tags' }], topics);
  assert.equal(report.assisted, 1);
  assert.equal(report.percentage, 100);
  assert.equal(report.recommendations[0].id, 'tags');
  const retried = recordAttempt(recordAttempt([], 'b', false), 'b', true, true, true);
  assert.equal(retried[0].assisted, false, 'help after a wrong answer must not change the first-attempt record');
});

test('Migration preserves learning records, validates saved values, and bounds round history', () => {
  const saved = { ...emptyProgress(), xp: 90, sessions: 4, solved: ['a', 'a', 10], completed: { tags: .5, bad: Infinity }, daily: { today: 2, invalid: -1 } };
  const restored = restoreProgress(saved);
  assert.equal(restored.xp, 90);
  assert.equal(restored.sessions, 4);
  assert.deepEqual(restored.solved, ['a']);
  assert.deepEqual(restored.completed, { tags: .5 });
  assert.deepEqual(restored.daily, { today: 2 });
  let progress = emptyProgress();
  for (let i = 0; i < 24; i++) progress = finishSession(progress, [{ id: 'a', correct: true }], null, '2026-10-24').progress;
  assert.equal(progress.history.length, 20);
  assert.equal(progress.sessions, 24);
  assert.deepEqual(restoreProgress(null), emptyProgress());
});

test('Streak handles today, yesterday, gaps, and month boundaries', () => {
  const now = new Date(2026, 9, 1, 12);
  assert.equal(streak(['2026-09-29', '2026-09-30', '2026-10-01'], now), 3);
  assert.equal(streak(['2026-09-29', '2026-09-30'], now), 2);
  assert.equal(streak(['2026-09-29'], now), 0);
});

test('Malformed stored history cannot crash the progress view', () => {
  const progress = restoreProgress({ history: [
    { date: '2026-10-25', total: 5, percentage: 60, title: { unsafe: 'object' }, right: -1 },
    { date: '2026-02-31', total: 5, percentage: 80 },
    { date: 'not a date', total: 5, percentage: 80 }
  ] });
  assert.deepEqual(progress.history, [{ date: '2026-10-25', total: 5, percentage: 60 }]);
});

test('Shuffling preserves repeated word tiles and source order', () => {
  const source = ['I', 'had', 'I'];
  const out = shuffled(source, () => 0.1);
  assert.deepEqual(out.toSorted(), source.toSorted());
  assert.deepEqual(source, ['I', 'had', 'I']);
});
