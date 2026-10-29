// The learning path: units → topics → lesson nodes, chests and a unit exam.
// Node ids are derived from topic ids, so saved progress survives content edits.

const typeRank = { choice: 0, match: 0, dialogue: 0, fill: 1, order: 1, transform: 1, error_hunt: 2, listen: 2, reading: 2 };
export const lessonLabels = ['Reconoce', 'Construye', 'Aplica'];

// Recognition first, then production, then application. Order is deterministic.
export function splitLessons(questions, parts = 3) {
  const sorted = questions
    .map((question, index) => ({ question, index }))
    .sort((a, b) => (typeRank[a.question.type] ?? 1) - (typeRank[b.question.type] ?? 1) || a.index - b.index)
    .map(item => item.question);
  const lessons = [];
  let start = 0;
  for (let i = 0; i < parts; i++) {
    const size = Math.floor(sorted.length / parts) + (i < sorted.length % parts ? 1 : 0);
    lessons.push(sorted.slice(start, start + size));
    start += size;
  }
  return lessons.filter(lesson => lesson.length);
}

export function buildPath(curriculum) {
  return curriculum.map(unit => {
    const nodes = [];
    for (const topic of unit.topics) {
      const regular = topic.questions.filter(q => q.lesson !== 'guide');
      const guide = topic.questions.filter(q => q.lesson === 'guide');
      const lessons = splitLessons(regular);
      const base = { topicId: topic.id, topicName: topic.name, topicLabel: topic.translation, unitId: unit.id };
      lessons.forEach((questions, i) => nodes.push({
        ...base, id: `${topic.id}:L${i + 1}`, kind: 'lesson', index: i, count: lessons.length,
        label: lessonLabels[i] || `Lección ${i + 1}`, questionIds: questions.map(q => q.id)
      }));
      if (guide.length) nodes.push({ ...base, id: `${topic.id}:guide`, kind: 'guide', label: 'Guía EGT', questionIds: guide.map(q => q.id) });
      nodes.push({ ...base, id: `${topic.id}:chest`, kind: 'chest', label: 'Cofre' });
    }
    nodes.push({
      id: `unit-${unit.id}:exam`, kind: 'exam', unitId: unit.id, label: 'Examen de unidad',
      topicIds: unit.topics.map(topic => topic.id),
      questionIds: unit.topics.flatMap(topic => topic.questions.map(q => q.id))
    });
    return { id: unit.id, title: unit.title.es, subtitle: unit.subtitle.es, nodes };
  });
}

export const isDone = (progress, node) => node.kind === 'chest' ? progress.chests.includes(node.id) : Boolean(progress.lessons[node.id]);

// locked | available | done. The first lesson and the study-guide lesson of each
// topic are always open so students can review before an exam; the rest unlock in order.
export function nodeState(progress, node, unit) {
  if (isDone(progress, node)) return 'done';
  if (node.kind === 'exam') {
    const ready = node.topicIds.every(id => unit.nodes.some(n => n.topicId === id && n.kind === 'lesson' && isDone(progress, n)));
    return ready ? 'available' : 'locked';
  }
  if (node.kind === 'guide' || (node.kind === 'lesson' && node.index === 0)) return 'available';
  const siblings = unit.nodes.filter(n => n.topicId === node.topicId && n.kind !== 'chest');
  if (node.kind === 'chest') return siblings.every(n => isDone(progress, n)) ? 'available' : 'locked';
  const previous = siblings.filter(n => n.kind === 'lesson')[node.index - 1];
  return previous && isDone(progress, previous) ? 'available' : 'locked';
}

// The highlighted node: the first open, unfinished node in path order.
export function currentNode(progress, path) {
  for (const unit of path) for (const node of unit.nodes) if (nodeState(progress, node, unit) === 'available') return node;
  return null;
}

export function unitComplete(progress, unit) {
  return unit.nodes.filter(node => node.kind === 'lesson' || node.kind === 'guide').every(node => isDone(progress, node));
}
