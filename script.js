const entryGate = document.getElementById("entryGate");
const entryText = document.getElementById("entryText");
const entryButton = document.getElementById("entryButton");
const page = document.getElementById("page");
const flipCard = document.querySelector(".flip-card");
const holdCard = document.querySelector(".hold-card");
const holdReveal = document.querySelector(".hold-reveal");
const scratchCard = document.querySelector(".scratch-card");
const scratchCanvas = document.querySelector(".scratch-canvas");
const slider = document.querySelector(".slider");
const sliderResponse = document.querySelector(".slider-response");
const noteCard = document.getElementById("noteCard");
const sections = document.querySelectorAll("section");
const cards = document.querySelectorAll(".card");
const confettiContainer = document.getElementById("confettiContainer");

// Quiz elements
const quizProgress = document.getElementById("quizProgress");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizResult = document.getElementById("quizResult");
const quizContent = document.getElementById("quizContent");
const quizScore = document.getElementById("quizScore");
const quizMessage = document.getElementById("quizMessage");
const quizRestart = document.getElementById("quizRestart");

// Hearts game elements
const gameArea = document.getElementById("gameArea");
const gameTimer = document.getElementById("gameTimer");
const gameScoreDisplay = document.getElementById("gameScore");
const gameStartOverlay = document.getElementById("gameStartOverlay");
const gameEndOverlay = document.getElementById("gameEndOverlay");
const gameStartBtn = document.getElementById("gameStartBtn");
const gameRestartBtn = document.getElementById("gameRestartBtn");
const finalScoreDisplay = document.getElementById("finalScore");

// Envelope element
const envelopeCard = document.getElementById("envelopeCard");

let interactionCount = 0;
const interactionTarget = 3;

const sliderLabels = ["A lot.", "So much.", "Too much.", "Immeasurable."];

entryText.classList.add("is-visible");

const showPage = () => {
  entryGate.classList.add("is-hidden");
  entryGate.setAttribute("aria-hidden", "true");
  page.classList.add("is-visible");
  page.setAttribute("aria-hidden", "false");
};

entryButton.addEventListener("click", showPage);
entryGate.addEventListener("click", () => {
  showPage();
});

flipCard.addEventListener("click", () => {
  flipCard.classList.toggle("is-flipped");
  flipCard.setAttribute(
    "aria-pressed",
    flipCard.classList.contains("is-flipped") ? "true" : "false"
  );
  registerInteraction(flipCard);
});

flipCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    flipCard.click();
  }
});

let holdTimeout;
let holdCompleted = false;

const startHold = () => {
  if (holdCompleted) return;
  holdCard.classList.add("is-holding");
  holdCard.setAttribute("aria-pressed", "true");
  holdTimeout = window.setTimeout(() => {
    holdCompleted = true;
    holdCard.classList.add("is-revealed");
    holdReveal.setAttribute("aria-hidden", "false");
    registerInteraction(holdCard);
  }, 2000);
};

const endHold = () => {
  holdCard.classList.remove("is-holding");
  if (!holdCompleted) {
    holdCard.setAttribute("aria-pressed", "false");
  }
  window.clearTimeout(holdTimeout);
};

holdCard.addEventListener("pointerdown", startHold);
holdCard.addEventListener("pointerup", endHold);
holdCard.addEventListener("pointerleave", endHold);
holdCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    startHold();
  }
});
holdCard.addEventListener("keyup", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    endHold();
  }
});

const scratchCtx = scratchCanvas.getContext("2d");
const scratchRadius = 20;
let isScratching = false;
let revealChecked = false;

const resizeScratchCanvas = () => {
  const rect = scratchCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  scratchCanvas.width = rect.width * ratio;
  scratchCanvas.height = rect.height * ratio;
  scratchCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  scratchCtx.globalCompositeOperation = "source-over";
  scratchCtx.fillStyle = "#c7dad3";
  scratchCtx.fillRect(0, 0, rect.width, rect.height);
  scratchCtx.globalCompositeOperation = "destination-out";
};

const checkScratchReveal = () => {
  if (revealChecked) return;
  const imageData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
  let cleared = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared += 1;
  }
  const clearedRatio = cleared / (imageData.data.length / 4);
  if (clearedRatio > 0.4) {
    revealChecked = true;
    scratchCard.classList.add("is-revealed");
    scratchCard.querySelector(".scratch-reveal").setAttribute("aria-hidden", "false");
    registerInteraction(scratchCard);
  }
};

const scratch = (event) => {
  if (!isScratching) return;
  const rect = scratchCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, scratchRadius, 0, Math.PI * 2);
  scratchCtx.fill();
  if (!revealChecked) {
    window.requestAnimationFrame(checkScratchReveal);
  }
};

scratchCanvas.addEventListener("pointerdown", (event) => {
  isScratching = true;
  scratchCanvas.setPointerCapture(event.pointerId);
  scratch(event);
});

scratchCanvas.addEventListener("pointermove", scratch);

scratchCanvas.addEventListener("pointerup", () => {
  isScratching = false;
});

scratchCanvas.addEventListener("pointerleave", () => {
  isScratching = false;
});

slider.addEventListener("input", () => {
  const index = Number(slider.value);
  sliderResponse.textContent = sliderLabels[index];
  registerInteraction(slider);
});

function registerInteraction(element) {
  if (element.dataset.completed === "true") return;
  element.dataset.completed = "true";
  interactionCount += 1;
  if (interactionCount >= interactionTarget) {
    unlockNote();
  }
}

function unlockNote() {
  noteCard.classList.remove("locked");
  noteCard.classList.add("unlocked");
  noteCard.querySelector(".note-content").setAttribute("aria-hidden", "false");
  window.localStorage.setItem("noteUnlocked", "true");
  triggerConfetti();
}

// ========== CONFETTI CELEBRATION ==========
function triggerConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    confettiContainer.appendChild(confetti);
  }
  setTimeout(() => {
    confettiContainer.innerHTML = "";
  }, 5000);
}

// ========== LOVE QUIZ GAME ==========
const quizData = [
  {
    question: "What did I notice first about you?",
    options: ["[Your smile]", "[Your eyes]", "[Your laugh]"],
    correct: 1 // Change this index to the correct answer
  },
  {
    question: "What's our favorite thing to do together?",
    options: ["[Watch movies]", "[Cook together]", "[Go for walks]"],
    correct: 0 // Change this index to the correct answer
  },
  {
    question: "What do I love most about you?",
    options: ["[Your kindness]", "[Your humor]", "[Everything]"],
    correct: 2 // Change this index to the correct answer
  }
];

let currentQuizIndex = 0;
let quizCorrectCount = 0;

function initQuiz() {
  currentQuizIndex = 0;
  quizCorrectCount = 0;
  quizResult.classList.remove("show");
  quizContent.style.display = "block";
  updateQuizProgress();
  showQuizQuestion();
}

function updateQuizProgress() {
  const dots = quizProgress.querySelectorAll(".quiz-dot");
  dots.forEach((dot, index) => {
    dot.classList.remove("active", "completed");
    if (index < currentQuizIndex) dot.classList.add("completed");
    if (index === currentQuizIndex) dot.classList.add("active");
  });
}

function showQuizQuestion() {
  const q = quizData[currentQuizIndex];
  quizQuestion.textContent = q.question;
  quizOptions.innerHTML = "";
  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = option;
    btn.dataset.index = index;
    btn.addEventListener("click", handleQuizAnswer);
    quizOptions.appendChild(btn);
  });
}

function handleQuizAnswer(e) {
  const selectedIndex = parseInt(e.target.dataset.index);
  const q = quizData[currentQuizIndex];
  const options = quizOptions.querySelectorAll(".quiz-option");
  
  options.forEach((opt, idx) => {
    opt.disabled = true;
    if (idx === q.correct) {
      opt.classList.add("correct");
    } else if (idx === selectedIndex && selectedIndex !== q.correct) {
      opt.classList.add("wrong");
    }
  });

  if (selectedIndex === q.correct) {
    quizCorrectCount++;
  }

  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < quizData.length) {
      updateQuizProgress();
      showQuizQuestion();
    } else {
      showQuizResult();
    }
  }, 1200);
}

function showQuizResult() {
  quizContent.style.display = "none";
  quizResult.classList.add("show");
  quizScore.textContent = `${quizCorrectCount}/${quizData.length}`;
  
  if (quizCorrectCount === quizData.length) {
    quizMessage.textContent = "You know us perfectly! 💕";
  } else if (quizCorrectCount >= quizData.length / 2) {
    quizMessage.textContent = "Pretty good! We're a great team! ✨";
  } else {
    quizMessage.textContent = "We have so much more to discover together! 💗";
  }
  registerInteraction(document.getElementById("quiz"));
}

if (quizRestart) {
  quizRestart.addEventListener("click", initQuiz);
}

// Initialize quiz when visible
const quizObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.dataset.initialized) {
      entry.target.dataset.initialized = "true";
      initQuiz();
    }
  });
}, { threshold: 0.3 });

const quizSection = document.getElementById("quiz");
if (quizSection) quizObserver.observe(quizSection);

// ========== CATCH HEARTS MINI-GAME ==========
let gameScore = 0;
let gameTimeLeft = 15;
let gameInterval = null;
let heartInterval = null;
let isGameRunning = false;

function startHeartsGame() {
  gameScore = 0;
  gameTimeLeft = 15;
  isGameRunning = true;
  gameStartOverlay.classList.add("hidden");
  gameEndOverlay.classList.add("hidden");
  updateGameDisplay();
  
  gameInterval = setInterval(() => {
    gameTimeLeft--;
    updateGameDisplay();
    if (gameTimeLeft <= 0) {
      endHeartsGame();
    }
  }, 1000);

  heartInterval = setInterval(spawnHeart, 600);
}

function spawnHeart() {
  if (!isGameRunning) return;
  
  const heart = document.createElement("div");
  heart.className = "falling-heart";
  heart.textContent = Math.random() > 0.9 ? "💛" : "💕";
  if (heart.textContent === "💛") heart.classList.add("golden");
  
  const gameRect = gameArea.getBoundingClientRect();
  heart.style.left = `${10 + Math.random() * 80}%`;
  heart.style.animationDuration = `${2 + Math.random() * 1.5}s`;
  
  heart.addEventListener("click", () => catchHeart(heart));
  heart.addEventListener("touchstart", (e) => {
    e.preventDefault();
    catchHeart(heart);
  });
  
  gameArea.appendChild(heart);
  
  // Remove heart after animation
  setTimeout(() => {
    if (heart.parentNode) heart.remove();
  }, 4000);
}

function catchHeart(heart) {
  if (heart.classList.contains("caught")) return;
  heart.classList.add("caught");
  gameScore += heart.classList.contains("golden") ? 3 : 1;
  updateGameDisplay();
  
  setTimeout(() => heart.remove(), 300);
}

function updateGameDisplay() {
  gameTimer.textContent = `${gameTimeLeft}s`;
  gameScoreDisplay.textContent = `💕 ${gameScore}`;
}

function endHeartsGame() {
  isGameRunning = false;
  clearInterval(gameInterval);
  clearInterval(heartInterval);
  
  // Remove all hearts
  gameArea.querySelectorAll(".falling-heart").forEach((h) => h.remove());
  
  finalScoreDisplay.textContent = gameScore;
  gameEndOverlay.classList.remove("hidden");
  
  if (gameScore >= 10) {
    triggerConfetti();
  }
  registerInteraction(document.getElementById("heartsGame"));
}

if (gameStartBtn) gameStartBtn.addEventListener("click", startHeartsGame);
if (gameRestartBtn) gameRestartBtn.addEventListener("click", startHeartsGame);

// ========== SURPRISE ENVELOPE ==========
if (envelopeCard) {
  envelopeCard.addEventListener("click", () => {
    envelopeCard.classList.toggle("is-open");
    registerInteraction(document.getElementById("envelope"));
  });
  
  envelopeCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      envelopeCard.click();
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

sections.forEach((section) => revealObserver.observe(section));

cards.forEach((card, index) => {
  card.style.transitionDelay = `${Math.min(index * 80, 320)}ms`;
  revealObserver.observe(card);
});

if (window.localStorage.getItem("noteUnlocked") === "true") {
  unlockNote();
}

const initScratch = () => {
  resizeScratchCanvas();
};

window.addEventListener("resize", () => {
  resizeScratchCanvas();
});

initScratch();
