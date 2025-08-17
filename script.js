// Configuration
const SECONDS_PER_QUESTION = 15;

// Quiz data (sample)
const QUESTIONS = [
  {
    q: "Which HTML tag is used to create a hyperlink?",
    options: ["<a>", "<link>", "<href>", "<nav>"],
    answer: 0,
    explain: "Use the <a> (anchor) tag with an href attribute."
  },
  {
    q: "Which CSS property controls the text size?",
    options: ["font-weight", "text-style", "font-size", "size"],
    answer: 2,
    explain: "`font-size` sets the size of text."
  },
  {
    q: "How do you write a comment in JavaScript?",
    options: ["<!-- comment -->", "// comment", "# comment", "** comment **"],
    answer: 1,
    explain: "Use `//` for single-line comments (or /* ... */ for multi-line)."
  },
  {
    q: "Which method adds an element to the end of an array in JS?",
    options: ["add()", "push()", "append()", "insert()"],
    answer: 1,
    explain: "`push()` appends one or more elements to the end of an array."
  },
  {
    q: "Which CSS layout is best for creating responsive grids?",
    options: ["Float", "Table", "Grid/Flexbox", "Position absolute"],
    answer: 2,
    explain: "CSS Grid and Flexbox are modern responsive layout systems."
  }
];

// Elements
const startScreen = document.getElementById("start-screen");
const quizScreen  = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const perQuestionSecs = document.getElementById("per-question-secs");
const qCounter = document.getElementById("q-counter");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");

const nextBtn = document.getElementById("next-btn");
const skipBtn = document.getElementById("skip-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const finalScoreEl = document.getElementById("final-score");
const reviewEl = document.getElementById("review");

// State
let index = 0;
let score = 0;
let timer = null;
let timeLeft = SECONDS_PER_QUESTION;
let selected = null;
let review = []; // {q, chosen, correctIdx, isCorrect, explain}

// Init
perQuestionSecs.textContent = SECONDS_PER_QUESTION.toString();
timeEl.textContent = SECONDS_PER_QUESTION.toString();

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", nextQuestion);
skipBtn.addEventListener("click", skipQuestion);
restartBtn?.addEventListener("click", restart);

function startQuiz(){
  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");

  index = 0; score = 0; review = [];
  updateHeader();
  renderQuestion();
  startTimer();
}

function restart(){
  startScreen.classList.remove("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
}

function updateHeader(){
  qCounter.textContent = `Question ${index+1}/${QUESTIONS.length}`;
  scoreEl.textContent = `Score: ${score}`;
}

function renderQuestion(){
  const { q, options } = QUESTIONS[index];
  questionEl.textContent = q;

  answersEl.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "answer";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswer(i, btn));
    answersEl.appendChild(btn);
  });

  nextBtn.disabled = true;
  selected = null;
  timeLeft = SECONDS_PER_QUESTION;
  timeEl.textContent = timeLeft.toString();
}

function handleAnswer(choiceIdx, el){
  if (selected !== null) return; // prevent multiple answers
  selected = choiceIdx;

  const correctIdx = QUESTIONS[index].answer;
  const isCorrect = choiceIdx === correctIdx;

  // Mark choices
  [...answersEl.children].forEach((btn, i) => {
    btn.classList.add(i === correctIdx ? "correct" : (i === choiceIdx ? "wrong" : ""));
    btn.disabled = true;
  });

  if (isCorrect) score++;
  updateHeader();
  nextBtn.disabled = false;

  review.push({
    q: QUESTIONS[index].q,
    chosen: QUESTIONS[index].options[choiceIdx],
    correctIdx,
    isCorrect,
    explain: QUESTIONS[index].explain
  });

  // Stop timer on answer
  clearInterval(timer);
}

function startTimer(){
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft.toString();

    if (timeLeft <= 0){
      clearInterval(timer);
      autoRevealAndPushReview();
      nextBtn.disabled = false;
    }
  }, 1000);
}

function autoRevealAndPushReview(){
  // Show correct, disable all
  const correctIdx = QUESTIONS[index].answer;
  [...answersEl.children].forEach((btn, i) => {
    btn.classList.add(i === correctIdx ? "correct" : "wrong");
    btn.disabled = true;
  });

  review.push({
    q: QUESTIONS[index].q,
    chosen: "(no answer)",
    correctIdx,
    isCorrect: false,
    explain: QUESTIONS[index].explain
  });
}

function nextQuestion(){
  // If time ran out and we already pushed a review, avoid duplicate push
  if (selected === null && review.length < index + 1) {
    autoRevealAndPushReview();
  }

  index++;
  if (index < QUESTIONS.length){
    updateHeader();
    renderQuestion();
    startTimer();
  } else {
    endQuiz();
  }
}

function skipQuestion(){
  // Treat as no answer, move on
  clearInterval(timer);
  if (review.length < index + 1) autoRevealAndPushReview();
  nextQuestion();
}

function endQuiz(){
  clearInterval(timer);
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  finalScoreEl.textContent = `You scored ${score}/${QUESTIONS.length}`;
  renderReview();
}

function renderReview(){
  reviewEl.innerHTML = "";
  review.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "review-item";
    const title = document.createElement("h4");
    title.textContent = `Q${i+1}. ${item.q}`;
    const p = document.createElement("p");
    const correctness = item.isCorrect ? "✅ Correct" : "❌ Incorrect";
    p.innerHTML =
      `${correctness}<br/>Your answer: <strong>${item.chosen}</strong><br/>` +
      `Explanation: ${item.explain}`;
    div.appendChild(title);
    div.appendChild(p);
    reviewEl.appendChild(div);
  });
}
