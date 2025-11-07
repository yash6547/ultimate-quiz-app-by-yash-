let questions = [];
let currentQuestion = 0;
let timer;
let timeLeft;
let correctMarks = 4;
let wrongMarks = 1;
let quizData = [];
let questionTimes = [];
let quizStartTime;

// Add Question Manually
document.getElementById("add-question-btn").addEventListener("click", () => {
  if (questions.length >= 200) return alert("Chutiye! 200 question ka kya karega 😆");
  
  const qText = prompt("Enter Question Text:");
  if (!qText) return;
  const optCount = parseInt(prompt("Kitne options (2–5)?"));
  if (optCount < 2 || optCount > 5) return alert("Between 2–5 options only!");
  
  let opts = [];
  for (let i = 0; i < optCount; i++) {
    opts.push(prompt(`Option ${i + 1}:`));
  }
  const ans = parseInt(prompt("Correct Option Number (1–" + optCount + "):")) - 1;
  
  questions.push({ qText, opts, ans });
  showQuestionList();
});

function showQuestionList() {
  let div = document.getElementById("question-list");
  div.innerHTML = "<h3>Added Questions:</h3>";
  questions.forEach((q, i) => {
    div.innerHTML += `<div>${i + 1}. ${q.qText}</div>`;
  });
}

function startTest() {
  if (questions.length === 0) return alert("Add at least 1 question first!");

  correctMarks = parseInt(document.getElementById("marks-correct").value);
  wrongMarks = parseInt(document.getElementById("marks-wrong").value);
  timeLeft = parseInt(document.getElementById("time-limit").value) * 60;

  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  
  quizData = new Array(questions.length).fill(null);
  questionTimes = new Array(questions.length).fill(0);
  quizStartTime = Date.now();

  showQuestion();
  startTimer();
}

function startTimer() {
  const timerEl = document.getElementById("timer");
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      submitQuiz();
    }
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    timerEl.innerText = `${min}:${sec < 10 ? "0" + sec : sec}`;
    timeLeft--;
  }, 1000);
}

function showQuestion() {
  const q = questions[currentQuestion];
  const container = document.getElementById("question-container");
  const countEl = document.getElementById("question-count");
  countEl.innerText = `Q ${currentQuestion + 1} / ${questions.length}`;
  
  let html = `<h3>${q.qText}</h3>`;
  q.opts.forEach((opt, i) => {
    let selected = quizData[currentQuestion] === i ? "selected" : "";
    html += `<div class="option ${selected}" onclick="selectOption(${i})">${opt}</div>`;
  });
  container.innerHTML = html;
}

function selectOption(index) {
  const currentTime = Math.floor((Date.now() - quizStartTime) / 1000);
  questionTimes[currentQuestion] = currentTime;
  quizData[currentQuestion] = index;
  showQuestion();
}

function nextQuestion() {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
}

function submitQuiz() {
  clearInterval(timer);
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  let score = 0;
  let correct = 0;
  questions.forEach((q, i) => {
    if (quizData[i] === q.ans) {
      score += correctMarks;
      correct++;
    } else if (quizData[i] != null) {
      score -= wrongMarks;
    }
  });

  const percent = (correct / questions.length) * 100;
  const msgEl = document.getElementById("result-message");
  const detailsEl = document.getElementById("details");

  if (percent === 100) {
    msgEl.innerHTML = "🟡 GOD LEVEL! Bhai tu to legend nikla 😱🔥";
    document.body.style.background = "linear-gradient(135deg, white, gold)";
    document.body.style.color = "black";
  } else if (percent >= 90) {
    msgEl.innerHTML = "💫 Bhai Confirm hai, paaka selection! 💪";
    document.body.style.background = "linear-gradient(135deg, #fef9d7, #d299c2)";
  } else if (percent >= 50) {
    msgEl.innerHTML = "😎 Bhai tera selection ho jayega! Keep pushing!";
  } else {
    msgEl.innerHTML = "💀 Bhaiya ji sorry... apka ni ho payega 😭";
    document.body.style.background = "linear-gradient(135deg, #111, #400)";
  }

  let detailHTML = `
    <p>Total Questions: ${questions.length}</p>
    <p>Correct Answers: ${correct}</p>
    <p>Score: ${score}</p>
    <p>Accuracy: ${percent.toFixed(1)}%</p>
    <h3>⏱️ Answer Time Details:</h3>
  `;
  questions.forEach((q, i) => {
    detailHTML += `<div>Q${i + 1}: answered in ${questionTimes[i]}s</div>`;
  });

  detailsEl.innerHTML = detailHTML;
}
