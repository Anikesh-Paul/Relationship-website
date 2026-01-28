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

// Music player elements
const musicPlayer = document.getElementById("musicPlayer");
const musicToggle = document.getElementById("musicToggle");
const musicStatus = musicToggle
  ? musicToggle.querySelector(".music-status")
  : null;
const musicTitle = document.getElementById("musicTitle");
const audioPlayer = document.getElementById("audioPlayer");
const musicPrev = document.getElementById("musicPrev");
const musicNext = document.getElementById("musicNext");
let musicReady = false;

let interactionCount = 0;
const interactionTarget = 3;

const sliderLabels = ["A lot.", "So much.", "Too much.", "Immeasurable."];

if (entryText) {
  entryText.classList.add("is-visible");
}

const showPage = () => {
  entryGate.classList.add("is-hidden");
  entryGate.setAttribute("aria-hidden", "true");
  page.classList.add("is-visible");
  page.setAttribute("aria-hidden", "false");
  // Show music player after entering
  setTimeout(() => {
    if (musicPlayer) {
      musicPlayer.classList.add("is-visible");
    }
    // Try to play music, retry if not ready
    const tryPlay = () => {
      if (musicReady && !isPlaying) {
        toggleMusic();
      } else if (!musicReady) {
        // Retry after a short delay if music isn't ready
        setTimeout(tryPlay, 500);
      }
    };
    tryPlay();
  }, 1000);
};

if (entryButton) {
  entryButton.addEventListener("click", showPage);
}
if (entryGate) {
  entryGate.addEventListener("click", (e) => {
    if (
      e.target === entryGate ||
      e.target.classList.contains("entry-subtext")
    ) {
      showPage();
    }
  });
}

if (flipCard) {
  flipCard.addEventListener("click", () => {
    flipCard.classList.toggle("is-flipped");
    flipCard.setAttribute(
      "aria-pressed",
      flipCard.classList.contains("is-flipped") ? "true" : "false",
    );
    registerInteraction(flipCard);
  });

  flipCard.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flipCard.click();
    }
  });
}

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

if (holdCard) {
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
}

const scratchCtx = scratchCanvas ? scratchCanvas.getContext("2d") : null;
const scratchRadius = 20;
let isScratching = false;
let revealChecked = false;

const resizeScratchCanvas = () => {
  const rect = scratchCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  scratchCanvas.width = rect.width * ratio;
  scratchCanvas.height = rect.height * ratio;
  if (!scratchCtx) return;
  scratchCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  scratchCtx.globalCompositeOperation = "source-over";
  scratchCtx.fillStyle = "#c7dad3";
  scratchCtx.fillRect(0, 0, rect.width, rect.height);
  scratchCtx.globalCompositeOperation = "destination-out";
};

const checkScratchReveal = () => {
  if (revealChecked) return;
  if (!scratchCtx) return;
  const imageData = scratchCtx.getImageData(
    0,
    0,
    scratchCanvas.width,
    scratchCanvas.height,
  );
  let cleared = 0;
  for (let i = 3; i < imageData.data.length; i += 4) {
    if (imageData.data[i] === 0) cleared += 1;
  }
  const clearedRatio = cleared / (imageData.data.length / 4);
  if (clearedRatio > 0.4) {
    revealChecked = true;
    scratchCard.classList.add("is-revealed");
    scratchCard
      .querySelector(".scratch-reveal")
      .setAttribute("aria-hidden", "false");
    registerInteraction(scratchCard);
  }
};

const scratch = (event) => {
  if (!isScratching) return;
  if (!scratchCanvas || !scratchCtx) return;
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

if (scratchCanvas) {
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
}

if (slider) {
  slider.addEventListener("input", () => {
    const index = Number(slider.value);
    if (sliderResponse) sliderResponse.textContent = sliderLabels[index];
    registerInteraction(slider);
  });
}

function registerInteraction(element) {
  if (element.dataset.completed === "true") return;
  element.dataset.completed = "true";
  interactionCount += 1;
  if (interactionCount >= interactionTarget) {
    unlockNote();
  }
}

function unlockNote() {
  if (!noteCard) return;
  noteCard.classList.remove("locked");
  noteCard.classList.add("unlocked");
  const content = noteCard.querySelector(".note-content");
  if (content) content.setAttribute("aria-hidden", "false");
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
    correct: 1, // Change this index to the correct answer
  },
  {
    question: "What's our favorite thing to do together?",
    options: ["[Watch movies]", "[Cook together]", "[Go for walks]"],
    correct: 0, // Change this index to the correct answer
  },
  {
    question: "What do I love most about you?",
    options: ["[Your kindness]", "[Your humor]", "[Everything]"],
    correct: 2, // Change this index to the correct answer
  },
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
const quizObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !entry.target.dataset.initialized) {
        entry.target.dataset.initialized = "true";
        initQuiz();
      }
    });
  },
  { threshold: 0.3 },
);

const quizSection = document.getElementById("quiz");
if (quizSection) quizObserver.observe(quizSection);

// ========== CATCH HEARTS MINI-GAME ==========
let gameScore = 0;
let gameTimeLeft = 15;
let gameInterval = null;
let heartInterval = null;
let isGameRunning = false;

function startHeartsGame() {
  if (
    !gameArea ||
    !gameTimer ||
    !gameScoreDisplay ||
    !gameStartOverlay ||
    !gameEndOverlay ||
    !finalScoreDisplay
  ) {
    return;
  }
  if (gameInterval) clearInterval(gameInterval);
  if (heartInterval) clearInterval(heartInterval);
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

  spawnHeart();
  heartInterval = setInterval(spawnHeart, 600);
}

function spawnHeart() {
  if (!isGameRunning || !gameArea) return;

  const heart = document.createElement("div");
  heart.className = "falling-heart";
  heart.textContent = Math.random() > 0.9 ? "💛" : "💕";
  if (heart.textContent === "💛") heart.classList.add("golden");

  heart.style.top = "-40px";
  heart.style.left = `${10 + Math.random() * 80}%`;
  heart.style.animationName = "fall-down";
  heart.style.animationDuration = `${2 + Math.random() * 1.5}s`;
  heart.style.animationTimingFunction = "linear";
  heart.style.animationFillMode = "forwards";

  heart.addEventListener("click", () => catchHeart(heart));
  heart.addEventListener("touchstart", (e) => {
    e.preventDefault();
    catchHeart(heart);
  });

  gameArea.appendChild(heart);
  void heart.offsetHeight;

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
  if (!gameTimer || !gameScoreDisplay) return;
  gameTimer.textContent = `${gameTimeLeft}s`;
  gameScoreDisplay.textContent = `💕 ${gameScore}`;
}

function endHeartsGame() {
  isGameRunning = false;
  if (gameInterval) clearInterval(gameInterval);
  if (heartInterval) clearInterval(heartInterval);

  // Remove all hearts
  if (gameArea) {
    gameArea.querySelectorAll(".falling-heart").forEach((h) => h.remove());
  }

  if (finalScoreDisplay) finalScoreDisplay.textContent = gameScore;
  if (gameEndOverlay) gameEndOverlay.classList.remove("hidden");

  if (gameScore >= 10) {
    triggerConfetti();
  }
  registerInteraction(document.getElementById("heartsGame"));
}

if (gameStartBtn) gameStartBtn.addEventListener("click", startHeartsGame);
if (gameRestartBtn) gameRestartBtn.addEventListener("click", startHeartsGame);

if (gameArea) {
  const tryStartGame = () => {
    if (!isGameRunning) {
      if (!gameStartOverlay || !gameStartOverlay.classList.contains("hidden")) {
        startHeartsGame();
      }
    }
  };
  gameArea.addEventListener("click", tryStartGame);
  gameArea.addEventListener("pointerdown", tryStartGame);
}

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
  { threshold: 0.2 },
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
  if (!scratchCanvas || !scratchCtx) return;
  resizeScratchCanvas();
};

window.addEventListener("resize", () => {
  resizeScratchCanvas();
});

initScratch();

// ========== MUSIC PLAYER ==========
// Auto-load songs from /songs if possible. Falls back to this list.
let songs = [];
const fallbackSongs = [
  {
    title: "Bhalobashar Morshum (ভালবাসার মরশুম)",
    src: "songs/Bhalobashar Morshum (ভালবাসার মরশুম) ｜ X=Prem ｜ Shreya Ghoshal ｜ Sanai ｜ Srijit ｜ SVF [7NLfpsNHmZI].webm",
  },
  {
    title: "SHEESHA",
    src: "songs/SHEESHA ｜ Aakhya Mai Aakh Ghali Jo Beran ｜ Mitta Ror Ft. Swara Verma ｜ NEW HARYANVI SONGS 2024 [i52TYO13Nyg].webm",
  },
  {
    title: "Sundari",
    src: "songs/Sundari (Official Video) Sanju Rathod Ft. Yashika Jatav ｜ G-Spark ｜ Marathi Song 2025 [WpBn9w-Js_c].webm",
  },
  {
    title: "Tujh Mein Rab Dikhta Hai",
    src: "songs/Tujh Mein Rab Dikhta Hai Song ｜ Rab Ne Bana Di Jodi ｜ Shah Rukh Khan, Anushka Sharma ｜ Roop Kumar [qoq8B8ThgEM].webm",
  },
  {
    title: "Until I Found You",
    src: "songs/Stephen Sanchez - Until I Found You (Official Video) [GxldQ9eX2wo].webm",
  },
];

let currentSongIndex = 0;
let isPlaying = false;

const supportedAudioExtensions = ["mp3", "wav", "ogg", "webm", "m4a", "aac"];

function titleFromFilename(filename) {
  const decoded = decodeURIComponent(filename.replace(/\+/g, " "));
  const noExt = decoded.replace(/\.[^.]+$/, "");
  return noExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchPlaylistJson() {
  try {
    const response = await fetch("songs/playlist.json", { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    if (!Array.isArray(data)) return null;
    return data.filter((item) => item && item.src);
  } catch (err) {
    return null;
  }
}

async function fetchDirectoryListing() {
  try {
    const response = await fetch("songs/", { cache: "no-store" });
    if (!response.ok) return null;
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = Array.from(doc.querySelectorAll("a"));
    const files = links
      .map((link) => link.getAttribute("href"))
      .filter(Boolean)
      .map((href) => href.split("?")[0])
      .filter((href) => !href.endsWith("/"))
      .filter((href) => {
        const ext = href.split(".").pop().toLowerCase();
        return supportedAudioExtensions.includes(ext);
      });

    if (!files.length) return null;
    return files.map((file) => ({
      title: titleFromFilename(file),
      src: `songs/${file}`,
    }));
  } catch (err) {
    return null;
  }
}

async function initMusic() {
  if (!audioPlayer) {
    console.log("No audio player element found");
    return;
  }

  console.log("Initializing music player...");
  
  const playlist =
    (await fetchPlaylistJson()) || (await fetchDirectoryListing());
  songs = playlist && playlist.length ? playlist : fallbackSongs;

  console.log("Songs loaded:", songs.length, songs);

  if (!songs.length) {
    console.log("No songs available");
    return;
  }
  
  // Pick a random song on each page load
  currentSongIndex = Math.floor(Math.random() * songs.length);
  loadSong(currentSongIndex);
  musicReady = true;
  console.log("Music ready, loaded song:", songs[currentSongIndex].title);
}

function loadSong(index) {
  if (songs.length === 0 || !audioPlayer) return;
  const song = songs[index];
  // Encode the filename properly - split path and encode just the filename
  const parts = song.src.split('/');
  const filename = parts.pop();
  const encodedFilename = encodeURIComponent(filename);
  const encodedSrc = parts.join('/') + '/' + encodedFilename;
  console.log("Loading song:", encodedSrc);
  audioPlayer.src = encodedSrc;
  if (musicTitle) musicTitle.textContent = song.title;
}

function toggleMusic() {
  if (!audioPlayer || !musicToggle) return;
  
  // Check if music is ready
  if (!musicReady) {
    console.log("Music not ready yet");
    return;
  }
  
  if (isPlaying) {
    audioPlayer.pause();
    isPlaying = false;
    musicToggle.classList.remove("is-playing");
    if (musicStatus) musicStatus.textContent = "Play";
  } else {
    audioPlayer
      .play()
      .then(() => {
        isPlaying = true;
        musicToggle.classList.add("is-playing");
        if (musicStatus) musicStatus.textContent = "Pause";
      })
      .catch((err) => {
        console.log("Audio playback failed:", err);
      });
  }
}

function playSongAtIndex(index, shouldPlay = true) {
  if (!audioPlayer || songs.length === 0) return;
  const safeIndex = (index + songs.length) % songs.length;
  currentSongIndex = safeIndex;
  loadSong(currentSongIndex);
  if (shouldPlay) {
    audioPlayer
      .play()
      .then(() => {
        isPlaying = true;
        if (musicToggle) musicToggle.classList.add("is-playing");
        if (musicStatus) musicStatus.textContent = "Pause";
      })
      .catch((err) => {
        console.log("Audio playback failed:", err);
      });
  }
}

function nextSong(shouldPlay = true) {
  playSongAtIndex(currentSongIndex + 1, shouldPlay);
}

function prevSong(shouldPlay = true) {
  playSongAtIndex(currentSongIndex - 1, shouldPlay);
}

// When song ends, play next song
if (audioPlayer) {
  audioPlayer.addEventListener("ended", () => {
    nextSong(true);
  });
  
  // Log errors for debugging
  audioPlayer.addEventListener("error", (e) => {
    console.error("Audio error:", e);
    console.error("Failed to load:", audioPlayer.src);
  });
  
  // Log when song loads successfully
  audioPlayer.addEventListener("canplaythrough", () => {
    console.log("Song loaded:", audioPlayer.src);
  });
}

if (musicToggle) {
  musicToggle.addEventListener("click", toggleMusic);
}

if (musicNext) {
  musicNext.addEventListener("click", () => nextSong(isPlaying));
}

if (musicPrev) {
  musicPrev.addEventListener("click", () => prevSong(isPlaying));
}

initMusic();

// ========== MEMORY JAR ==========
const memoryJarBtn = document.getElementById("memoryJarBtn");
const memoryText = document.getElementById("memoryText");
const memoryNote = document.getElementById("memoryNote");

const memories = [
  "That time we stayed up all night just talking...",
  "When you made me laugh so hard I couldn't breathe",
  "Our first 'I love you' — my heart still skips",
  "The way you looked at me that rainy evening",
  "Dancing in the kitchen at midnight",
  "When you surprised me with my favorite food",
  "Our silly inside jokes that no one else gets",
  "That perfect lazy Sunday we spent together",
  "When you held my hand for the first time",
  "The moment I knew you were the one",
  "How you always know exactly what to say",
  "That road trip where we got completely lost",
  "When you fell asleep on my shoulder",
  "Our first photo together — look how awkward we were!",
  "The way you smile when you see me",
];

let lastMemoryIndex = -1;

function getRandomMemory() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * memories.length);
  } while (newIndex === lastMemoryIndex && memories.length > 1);
  lastMemoryIndex = newIndex;
  return memories[newIndex];
}

if (memoryJarBtn && memoryText) {
  memoryJarBtn.addEventListener("click", () => {
    memoryText.textContent = getRandomMemory();
    memoryNote.classList.remove("pop");
    void memoryNote.offsetWidth; // Trigger reflow
    memoryNote.classList.add("pop");
  });

  memoryJarBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      memoryJarBtn.click();
    }
  });
}

// ========== COUNTDOWN TIMER ==========
// SET YOUR TARGET DATE HERE (format: 'YYYY-MM-DD HH:MM:SS' or 'Month DD, YYYY HH:MM:SS')
const targetDate = new Date("2026-02-14 00:00:00"); // Valentine's Day example

const countdownDays = document.getElementById("countdownDays");
const countdownHours = document.getElementById("countdownHours");
const countdownMins = document.getElementById("countdownMins");
const countdownSecs = document.getElementById("countdownSecs");

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    if (countdownDays) countdownDays.textContent = "00";
    if (countdownHours) countdownHours.textContent = "00";
    if (countdownMins) countdownMins.textContent = "00";
    if (countdownSecs) countdownSecs.textContent = "00";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (countdownDays) countdownDays.textContent = String(days).padStart(2, "0");
  if (countdownHours)
    countdownHours.textContent = String(hours).padStart(2, "0");
  if (countdownMins) countdownMins.textContent = String(mins).padStart(2, "0");
  if (countdownSecs) countdownSecs.textContent = String(secs).padStart(2, "0");
}

// Update countdown every second
if (countdownDays && countdownHours && countdownMins && countdownSecs) {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Observe new sections
const newSections = document.querySelectorAll(
  "#reasons, #memoryJar, #firsts, #loveLetter, #countdown",
);
newSections.forEach((section) => revealObserver.observe(section));
