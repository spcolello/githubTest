import { OPERATIONS, generateQuestion, generateSimilarQuestion, accuracy, symbolFor } from './math.js';

const STORAGE_KEY = 'mathPracticeDataV1';
const DEFAULT_DATA = {
  totalAttempted: 0,
  totalCorrect: 0,
  totalIncorrect: 0,
  mistakes: [],
  history: [],
  byOperation: Object.fromEntries(OPERATIONS.map(op => [op, { attempted: 0, correct: 0 }]))
};

const app = document.querySelector('#app');
let setup = { operations: ['addition'], difficulty: 'easy', length: 10 };
let session = null;
let lastSummary = null;

function cloneDefault() { return JSON.parse(JSON.stringify(DEFAULT_DATA)); }
function loadData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return cloneDefault();
    const base = cloneDefault();
    return {
      ...base,
      ...parsed,
      byOperation: { ...base.byOperation, ...(parsed.byOperation || {}) },
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch { return cloneDefault(); }
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); updateMistakeBadge(); }
function getData() { return loadData(); }

function updateMistakeBadge() {
  const count = getData().mistakes.length;
  const badge = document.querySelector('#mistakeBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.hidden = count === 0;
}

function renderTemplate(id) {
  app.replaceChildren(document.querySelector(id).content.cloneNode(true));
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

function setActiveNav(routeName) {
  document.querySelectorAll('[data-nav]').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle(
      'active',
      href === `#/${routeName}` || (routeName === 'practice' && href === '#/home')
    );
  });
}

function route() {
  const value = location.hash.replace('#/', '') || 'home';
  const routeName = value.startsWith('similar/') ? 'similar' : value;

  if (routeName === 'home') renderHome();
  else if (routeName === 'practice') session ? renderPractice() : location.hash = '#/home';
  else if (routeName === 'summary') lastSummary ? renderSummary() : location.hash = '#/home';
  else if (routeName === 'mistakes') renderMistakes();
  else if (routeName === 'stats') renderStats();
  else if (routeName === 'similar') startSimilarSession(value.split('/')[1]);
  else location.hash = '#/home';

  setActiveNav(routeName === 'similar' ? 'mistakes' : routeName);
  updateMistakeBadge();
}

function renderHome() {
  renderTemplate('#homeTemplate');

  document.querySelectorAll('[data-op]').forEach(btn => {
    btn.classList.toggle('active', setup.operations.includes(btn.dataset.op));
    btn.addEventListener('click', () => {
      const op = btn.dataset.op;
      setup.operations = setup.operations.includes(op)
        ? setup.operations.filter(x => x !== op)
        : [...setup.operations, op];
      btn.classList.toggle('active', setup.operations.includes(op));
      document.querySelector('#setupError').hidden = setup.operations.length > 0;
    });
  });

  document.querySelector('#selectAllOps').addEventListener('click', () => {
    setup.operations = [...OPERATIONS];
    document.querySelectorAll('[data-op]').forEach(b => b.classList.add('active'));
    document.querySelector('#setupError').hidden = true;
  });

  document.querySelectorAll('[data-difficulty]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.difficulty === setup.difficulty);
    btn.addEventListener('click', () => {
      setup.difficulty = btn.dataset.difficulty;
      document.querySelectorAll('[data-difficulty]').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  document.querySelectorAll('[data-length]').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.length) === setup.length);
    btn.addEventListener('click', () => {
      setup.length = Number(btn.dataset.length);
      document.querySelectorAll('[data-length]').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  document.querySelector('#startSession').addEventListener('click', () => {
    if (!setup.operations.length) {
      document.querySelector('#setupError').hidden = false;
      return;
    }
    startSession(setup);
  });
}

function startSession(config, fixedQuestions = null) {
  const questions = fixedQuestions || Array.from(
    { length: config.length },
    (_, i) => generateQuestion(config.operations[i % config.operations.length], config.difficulty)
  );

  if (!fixedQuestions) questions.sort(() => Math.random() - .5);

  session = {
    config,
    questions,
    index: 0,
    correct: 0,
    incorrect: 0,
    results: [],
    answered: false
  };
  location.hash = '#/practice';
}

function renderPractice() {
  renderTemplate('#practiceTemplate');
  const q = session.questions[session.index];
  const count = session.index + 1;

  document.querySelector('#progressText').textContent = `Question ${count} of ${session.questions.length}`;
  document.querySelector('#sessionScore').textContent = `${session.correct} correct`;
  document.querySelector('#progressBar').style.width = `${(session.index / session.questions.length) * 100}%`;
  document.querySelector('#questionOperation').textContent = `${q.operation} • ${q.difficulty}`;
  document.querySelector('#questionText').textContent = `${q.text} = ?`;

  const answers = document.querySelector('#answers');
  q.choices.forEach(choice => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-button';
    button.textContent = choice;
    button.addEventListener('click', () => answerQuestion(choice, button));
    answers.appendChild(button);
  });

  document.querySelector('#revealAnswer').addEventListener('click', revealAnswer);
  document.querySelector('#markCorrect').addEventListener('click', () => selfReport(true));
  document.querySelector('#markIncorrect').addEventListener('click', () => selfReport(false));
  document.querySelector('#nextQuestion').addEventListener('click', nextQuestion);
  document.querySelector('#quitSession').addEventListener('click', () => {
    if (confirm('Quit this practice session? Your unfinished session will not be counted.')) {
      session = null;
      location.hash = '#/home';
    }
  });
}

function answerQuestion(choice, button) {
  if (session.answered) return;
  const q = session.questions[session.index];
  const isCorrect = Number(choice) === q.answer;
  session.answered = true;

  document.querySelectorAll('.answer-button').forEach(b => {
    b.disabled = true;
    if (Number(b.textContent) === q.answer) b.classList.add('correct');
  });
  if (!isCorrect) button.classList.add('incorrect');

  const feedback = document.querySelector('#feedback');
  feedback.hidden = false;
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.textContent = isCorrect
    ? 'Correct! Keep going.'
    : `Not quite. The correct answer is ${q.answer}.`;

  document.querySelector('#revealAnswer').hidden = true;
  recordAnswer(isCorrect, choice, false);
  document.querySelector('#nextQuestion').hidden = false;
}

function revealAnswer() {
  if (session.answered) return;
  const q = session.questions[session.index];

  document.querySelectorAll('.answer-button').forEach(b => {
    b.disabled = true;
    if (Number(b.textContent) === q.answer) b.classList.add('correct');
  });

  const feedback = document.querySelector('#feedback');
  feedback.hidden = false;
  feedback.className = 'feedback correct';
  feedback.textContent = `The answer is ${q.answer}.`;

  document.querySelector('#revealAnswer').hidden = true;
  document.querySelector('#selfReport').hidden = false;
}

function selfReport(isCorrect) {
  if (session.answered) return;
  session.answered = true;
  recordAnswer(isCorrect, null, true);
  document.querySelector('#selfReport').hidden = true;
  document.querySelector('#nextQuestion').hidden = false;
}

function recordAnswer(isCorrect, selectedAnswer, revealed) {
  const q = session.questions[session.index];
  if (isCorrect) session.correct++;
  else session.incorrect++;
  session.results.push({ question: q, isCorrect, selectedAnswer, revealed });
}

function nextQuestion() {
  if (!session.answered) return;
  if (session.index < session.questions.length - 1) {
    session.index++;
    session.answered = false;
    renderPractice();
  } else {
    finishSession();
  }
}

function finishSession() {
  const data = getData();
  const attempted = session.results.length;

  data.totalAttempted += attempted;
  data.totalCorrect += session.correct;
  data.totalIncorrect += session.incorrect;

  session.results.forEach(result => {
    const op = data.byOperation[result.question.operation] || { attempted: 0, correct: 0 };
    op.attempted++;
    if (result.isCorrect) op.correct++;
    data.byOperation[result.question.operation] = op;

    if (!result.isCorrect) {
      data.mistakes.unshift({
        id: `mistake-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        operation: result.question.operation,
        difficulty: result.question.difficulty,
        a: result.question.a,
        b: result.question.b,
        answer: result.question.answer,
        text: result.question.text,
        selectedAnswer: result.selectedAnswer,
        createdAt: new Date().toISOString()
      });
    }
  });

  data.mistakes = data.mistakes.slice(0, 100);

  data.history.unshift({
    id: `session-${Date.now()}`,
    date: new Date().toISOString(),
    attempted,
    correct: session.correct,
    incorrect: session.incorrect,
    accuracy: accuracy(session.correct, attempted),
    operations: [...new Set(session.questions.map(q => q.operation))],
    difficulty: session.config.difficulty
  });
  data.history = data.history.slice(0, 30);

  saveData(data);
  lastSummary = {
    attempted,
    correct: session.correct,
    incorrect: session.incorrect,
    accuracy: accuracy(session.correct, attempted)
  };
  session = null;
  location.hash = '#/summary';
}

function renderSummary() {
  renderTemplate('#summaryTemplate');
  document.querySelector('#summaryAccuracy').textContent = `${lastSummary.accuracy}%`;
  document.querySelector('#summaryCorrect').textContent = lastSummary.correct;
  document.querySelector('#summaryIncorrect').textContent = lastSummary.incorrect;
  document.querySelector('#summarySubtitle').textContent =
    `You answered ${lastSummary.correct} of ${lastSummary.attempted} questions correctly.`;
  document.querySelector('#summaryTitle').textContent =
    lastSummary.accuracy >= 90 ? 'Excellent work!' :
    lastSummary.accuracy >= 70 ? 'Nice work!' : 'Keep practicing!';
  document.querySelector('#practiceAgain').addEventListener('click', () => location.hash = '#/home');
}

function renderMistakes() {
  renderTemplate('#mistakesTemplate');
  const list = document.querySelector('#mistakesList');
  const data = getData();

  if (!data.mistakes.length) {
    list.innerHTML = '<div class="empty-state"><strong>No mistakes to review</strong>Missed questions will appear here after a practice session.</div>';
    return;
  }

  data.mistakes.forEach(mistake => {
    const card = document.createElement('article');
    card.className = 'mistake-card';

    const left = document.createElement('div');
    left.innerHTML = `<p class="eyebrow">${mistake.operation} • ${mistake.difficulty}</p><h3>${mistake.text} = ${mistake.answer}</h3><p>${mistake.selectedAnswer == null ? 'Revealed during practice' : `Your answer: ${mistake.selectedAnswer}`}</p>`;

    const actions = document.createElement('div');
    actions.className = 'mistake-actions';

    const similar = document.createElement('button');
    similar.type = 'button';
    similar.className = 'primary-button';
    similar.textContent = 'Practice similar';
    similar.addEventListener('click', () => {
      location.hash = `#/similar/${encodeURIComponent(mistake.id)}`;
    });

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'secondary-button';
    remove.textContent = 'Mark reviewed';
    remove.addEventListener('click', () => {
      const next = getData();
      next.mistakes = next.mistakes.filter(x => x.id !== mistake.id);
      saveData(next);
      renderMistakes();
    });

    actions.append(similar, remove);
    card.append(left, actions);
    list.appendChild(card);
  });
}

function startSimilarSession(id) {
  const mistake = getData().mistakes.find(x => x.id === decodeURIComponent(id || ''));
  if (!mistake) {
    location.hash = '#/mistakes';
    return;
  }

  const questions = Array.from({ length: 5 }, () => generateSimilarQuestion(mistake));
  session = {
    config: { operations: [mistake.operation], difficulty: mistake.difficulty, length: 5 },
    questions,
    index: 0,
    correct: 0,
    incorrect: 0,
    results: [],
    answered: false
  };
  location.hash = '#/practice';
}

function renderStats() {
  renderTemplate('#statsTemplate');
  const data = getData();

  const cards = [
    ['Total attempted', data.totalAttempted],
    ['Correct', data.totalCorrect],
    ['Incorrect', data.totalIncorrect],
    ['Overall accuracy', `${accuracy(data.totalCorrect, data.totalAttempted)}%`]
  ];

  const stats = document.querySelector('#statsCards');
  cards.forEach(([label, value]) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    stats.appendChild(card);
  });

  const ops = document.querySelector('#operationStats');
  OPERATIONS.forEach(op => {
    const s = data.byOperation[op] || { attempted: 0, correct: 0 };
    const pct = accuracy(s.correct, s.attempted);
    const row = document.createElement('div');
    row.innerHTML =
      `<div class="bar-label"><span>${symbolFor(op)} ${op[0].toUpperCase() + op.slice(1)}</span><span>${s.correct}/${s.attempted} • ${pct}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    ops.appendChild(row);
  });

  const history = document.querySelector('#historyList');
  if (!data.history.length) {
    history.innerHTML = '<div class="empty-state"><strong>No sessions yet</strong>Complete a practice session to start your history.</div>';
  } else {
    data.history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      const date = new Date(item.date).toLocaleString([], {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
      });
      row.innerHTML =
        `<div><p><strong>${item.operations.map(op => op[0].toUpperCase() + op.slice(1)).join(', ')}</strong></p><small>${date} • ${item.difficulty} • ${item.attempted} questions</small></div><div class="history-score">${item.accuracy}%</div>`;
      history.appendChild(row);
    });
  }

  document.querySelector('#resetData').addEventListener('click', () => {
    if (confirm('Reset all saved practice data? This cannot be undone.')) {
      saveData(cloneDefault());
      renderStats();
    }
  });
}

window.addEventListener('hashchange', route);
window.addEventListener('storage', updateMistakeBadge);
route();
