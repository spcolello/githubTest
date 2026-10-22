export const OPERATIONS = ['addition','subtraction','multiplication','division'];

export function calculate(operation, a, b) {
  if (operation === 'addition') return a + b;
  if (operation === 'subtraction') return a - b;
  if (operation === 'multiplication') return a * b;
  if (operation === 'division') return a / b;
  throw new Error(`Unsupported operation: ${operation}`);
}

export function symbolFor(operation) {
  return { addition: '+', subtraction: '−', multiplication: '×', division: '÷' }[operation];
}

function randInt(min, max, rng = Math.random) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function ranges(difficulty) {
  if (difficulty === 'easy') return { addMax: 20, subMax: 20, multMax: 6, divMax: 6 };
  if (difficulty === 'medium') return { addMax: 100, subMax: 100, multMax: 12, divMax: 12 };
  return { addMax: 500, subMax: 500, multMax: 20, divMax: 20 };
}

export function generateQuestion(operation, difficulty = 'easy', rng = Math.random) {
  const r = ranges(difficulty);
  let a, b, answer;
  if (operation === 'addition') {
    a = randInt(difficulty === 'hard' ? 20 : 1, r.addMax, rng);
    b = randInt(difficulty === 'hard' ? 20 : 1, r.addMax, rng);
    answer = a + b;
  } else if (operation === 'subtraction') {
    a = randInt(1, r.subMax, rng);
    b = randInt(1, a, rng);
    answer = a - b;
  } else if (operation === 'multiplication') {
    a = randInt(1, r.multMax, rng);
    b = randInt(1, r.multMax, rng);
    answer = a * b;
  } else if (operation === 'division') {
    b = randInt(1, r.divMax, rng);
    answer = randInt(1, r.divMax, rng);
    a = b * answer;
  } else {
    throw new Error(`Unsupported operation: ${operation}`);
  }
  const choices = generateChoices(answer, operation, rng);
  return {
    id: `${Date.now()}-${Math.floor(rng()*1e9)}`,
    operation, difficulty, a, b, answer, choices,
    text: `${a} ${symbolFor(operation)} ${b}`
  };
}

export function generateChoices(answer, operation, rng = Math.random) {
  const set = new Set([answer]);
  const magnitude = Math.max(3, Math.ceil(Math.abs(answer) * .18));
  let guard = 0;
  while (set.size < 4 && guard < 100) {
    guard++;
    const offset = randInt(1, magnitude + (operation === 'multiplication' ? 4 : 2), rng);
    let candidate = answer + (rng() < .5 ? -offset : offset);
    if (candidate < 0) candidate = answer + offset;
    if (Number.isInteger(candidate)) set.add(candidate);
  }
  while (set.size < 4) set.add(answer + set.size + 1);
  return shuffle([...set], rng);
}

export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function generateSimilarQuestion(mistake, rng = Math.random) {
  return generateQuestion(mistake.operation, mistake.difficulty || 'easy', rng);
}

export function accuracy(correct, attempted) {
  return attempted ? Math.round((correct / attempted) * 100) : 0;
}
