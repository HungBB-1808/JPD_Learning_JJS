/* ==============================================
   quiz.js — Quiz Mode Logic
   Setup, timer, scoring, Quick Pass
   ============================================== */

const QuizApp = {
  // Setup
  totalQuestions: 10,
  timeLimit: 60,       // seconds per question
  certaintyPoints: true,

  // Session
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  skippedCount: 0,
  timerInterval: null,
  timeRemaining: 0,
  sessionActive: false,
  answered: false,

  resetSetup() {
    this.stopTimer();
    this.sessionActive = false;
    this.showSetup();
    this.updateSetupUI();
  },

  updateSetupUI() {
    // Question count buttons
    document.querySelectorAll('.quiz-count-btn').forEach(btn => {
      const val = parseInt(btn.dataset.count);
      if (val === this.totalQuestions) {
        btn.className = 'py-3 bg-primary text-white rounded-2xl font-bold text-sm transition-colors';
      } else {
        btn.className = 'py-3 bg-surface-container text-on-surface-variant rounded-2xl font-bold text-sm hover:bg-surface-container-high transition-colors';
      }
    });

    // Time limit display
    document.getElementById('quiz-time-display').textContent = `${this.timeLimit} Seconds`;

    // Certainty toggle
    const toggle = document.getElementById('quiz-certainty-toggle');
    const knob = document.getElementById('quiz-certainty-knob');
    if (this.certaintyPoints) {
      toggle.classList.add('bg-primary');
      toggle.classList.remove('bg-slate-300');
      knob.classList.add('ml-auto');
      knob.classList.remove('ml-0');
    } else {
      toggle.classList.remove('bg-primary');
      toggle.classList.add('bg-slate-300');
      knob.classList.remove('ml-auto');
      knob.classList.add('ml-0');
    }

    // Stats from history
    const allWords = Store.getAll();
    const total = allWords.length;
    document.getElementById('quiz-stat-total').textContent = total;
  },

  setQuestionCount(count) {
    this.totalQuestions = count;
    this.updateSetupUI();
  },

  cycleTimeLimit() {
    const options = [15, 30, 45, 60, 90, 120];
    const idx = options.indexOf(this.timeLimit);
    this.timeLimit = options[(idx + 1) % options.length];
    this.updateSetupUI();
  },

  toggleCertainty() {
    this.certaintyPoints = !this.certaintyPoints;
    this.updateSetupUI();
  },

  startQuiz() {
    const allWords = Store.getAll();
    if (allWords.length < 4) {
      showToast('You need at least 4 vocabulary words to start a quiz.', 'error');
      return;
    }

    // Generate questions
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const count = Math.min(this.totalQuestions, shuffled.length);
    this.questions = [];

    for (let i = 0; i < count; i++) {
      const correct = shuffled[i];
      // Pick 3 distractors
      const distractors = allWords
        .filter(w => w.id !== correct.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [...distractors.map(d => d.vietnamese), correct.vietnamese]
        .sort(() => Math.random() - 0.5);

      this.questions.push({
        word: correct,
        correctAnswer: correct.vietnamese,
        options: options
      });
    }

    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.skippedCount = 0;
    this.sessionActive = true;
    this.answered = false;

    this.hideSetup();
    this.showQuizArea();
    this.renderQuestion();
  },

  renderQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.endQuiz();
      return;
    }

    this.answered = false;
    const q = this.questions[this.currentIndex];

    // Progress
    document.getElementById('quiz-progress-current').textContent = this.currentIndex + 1;
    document.getElementById('quiz-progress-total').textContent = this.questions.length;
    const pct = ((this.currentIndex) / this.questions.length) * 100;
    document.getElementById('quiz-progress-bar').style.width = pct + '%';

    // Word display
    document.getElementById('quiz-word-display').textContent = q.word.japanese;
    document.getElementById('quiz-word-reading').textContent = '';

    // Options
    const optContainer = document.getElementById('quiz-options');
    optContainer.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option group flex items-center justify-between px-8 py-5 bg-surface-container-lowest/60 hover:bg-surface-container-lowest rounded-3xl border border-white/50 text-left" data-index="${i}" onclick="QuizApp.selectAnswer(${i})">
        <span class="font-bold text-lg text-on-surface">${opt}</span>
        <span class="material-symbols-outlined text-primary-fixed-dim group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    `).join('');

    // Enable skip/next
    document.getElementById('quiz-skip-btn').disabled = false;
    document.getElementById('quiz-next-btn').classList.add('hidden');

    // Start timer
    this.startTimer();

    // Animate in
    const display = document.getElementById('quiz-question-area');
    display.style.transform = 'scale(0.97)';
    display.style.opacity = '0';
    requestAnimationFrame(() => {
      display.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      display.style.transform = 'scale(1)';
      display.style.opacity = '1';
    });
  },

  selectAnswer(index) {
    if (this.answered || !this.sessionActive) return;
    this.answered = true;
    this.stopTimer();

    const q = this.questions[this.currentIndex];
    const selectedAnswer = q.options[index];
    const correct = selectedAnswer === q.correctAnswer;

    // Highlight answers
    const buttons = document.querySelectorAll('#quiz-options .quiz-option');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (q.options[i] === q.correctAnswer) {
        btn.classList.add('correct');
      }
      if (i === index && !correct) {
        btn.classList.add('wrong');
      }
    });

    if (correct) {
      this.score++;
      this.correctCount++;
    } else {
      this.wrongCount++;
    }

    // Show next button
    setTimeout(() => {
      document.getElementById('quiz-next-btn').classList.remove('hidden');
    }, 600);
  },

  skipQuestion() {
    if (this.answered || !this.sessionActive) return;
    this.answered = true;
    this.stopTimer();

    if (this.certaintyPoints) {
      // Quick Pass: counts as 50% correct (still counts toward score)
      this.score += 0.5;
    }
    this.skippedCount++;

    // Highlight correct answer
    const q = this.questions[this.currentIndex];
    const buttons = document.querySelectorAll('#quiz-options .quiz-option');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (q.options[i] === q.correctAnswer) {
        btn.classList.add('correct');
      }
    });

    setTimeout(() => {
      document.getElementById('quiz-next-btn').classList.remove('hidden');
    }, 400);
  },

  nextQuestion() {
    this.currentIndex++;
    if (this.currentIndex >= this.questions.length) {
      this.endQuiz();
    } else {
      this.renderQuestion();
    }
  },

  // Timer
  startTimer() {
    this.stopTimer();
    this.timeRemaining = this.timeLimit;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        if (!this.answered) {
          this.wrongCount++;
          this.answered = true;

          // Highlight correct
          const q = this.questions[this.currentIndex];
          const buttons = document.querySelectorAll('#quiz-options .quiz-option');
          buttons.forEach((btn, i) => {
            btn.classList.add('disabled');
            if (q.options[i] === q.correctAnswer) btn.classList.add('correct');
          });

          showToast("Time's up!", 'error');
          setTimeout(() => {
            document.getElementById('quiz-next-btn').classList.remove('hidden');
          }, 400);
        }
      }
    }, 1000);
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  updateTimerDisplay() {
    const el = document.getElementById('quiz-timer-text');
    if (el) {
      const mins = Math.floor(this.timeRemaining / 60);
      const secs = this.timeRemaining % 60;
      el.textContent = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;

      if (this.timeRemaining <= 10) {
        el.classList.add('text-red-500');
        el.classList.remove('text-primary');
      } else {
        el.classList.remove('text-red-500');
        el.classList.add('text-primary');
      }
    }

    // Progress ring
    const ring = document.getElementById('quiz-timer-ring');
    if (ring) {
      const circumference = 2 * Math.PI * 22;
      const offset = circumference * (1 - this.timeRemaining / this.timeLimit);
      ring.style.strokeDashoffset = offset;
    }
  },

  endQuiz() {
    this.sessionActive = false;
    this.stopTimer();
    this.hideQuizArea();
    this.showResults();

    const total = this.questions.length;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;
    const finalScore = Math.round(this.score);

    document.getElementById('quiz-res-score').textContent = `${finalScore}/${total}`;
    document.getElementById('quiz-res-accuracy').textContent = accuracy + '%';
    document.getElementById('quiz-res-correct').textContent = this.correctCount;
    document.getElementById('quiz-res-wrong').textContent = this.wrongCount;
    document.getElementById('quiz-res-skipped').textContent = this.skippedCount;

    // Grade
    let grade = 'Keep Trying!';
    let gradeColor = 'text-red-500';
    if (accuracy >= 90) { grade = 'Excellent!'; gradeColor = 'text-green-600'; }
    else if (accuracy >= 70) { grade = 'Great Job!'; gradeColor = 'text-indigo-600'; }
    else if (accuracy >= 50) { grade = 'Good Effort!'; gradeColor = 'text-yellow-600'; }
    document.getElementById('quiz-res-grade').textContent = grade;
    document.getElementById('quiz-res-grade').className = `text-4xl font-black tracking-tight ${gradeColor}`;

    ActivityLog.add({
      type: 'quiz',
      icon: 'quiz',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: `Quiz: ${accuracy}% Accuracy`,
      detail: `${this.correctCount}/${total} correct, ${this.skippedCount} skipped`,
      xp: `+${this.correctCount * 10} XP`
    });
  },

  // UI toggles
  showSetup() {
    document.getElementById('quiz-setup').classList.remove('hidden');
    document.getElementById('quiz-active-area').classList.add('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
  },

  hideSetup() {
    document.getElementById('quiz-setup').classList.add('hidden');
  },

  showQuizArea() {
    document.getElementById('quiz-active-area').classList.remove('hidden');
    document.getElementById('quiz-results').classList.add('hidden');
  },

  hideQuizArea() {
    document.getElementById('quiz-active-area').classList.add('hidden');
  },

  showResults() {
    const el = document.getElementById('quiz-results');
    el.classList.remove('hidden');
    el.classList.add('results-enter');
  },

  restartQuiz() {
    document.getElementById('quiz-results').classList.add('hidden');
    this.resetSetup();
  }
};

// Bind setup events after DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Question count buttons
  document.querySelectorAll('.quiz-count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      QuizApp.setQuestionCount(parseInt(btn.dataset.count));
    });
  });

  // Time limit cycling
  document.getElementById('quiz-time-cycle').addEventListener('click', () => {
    QuizApp.cycleTimeLimit();
  });

  // Certainty toggle
  document.getElementById('quiz-certainty-toggle').addEventListener('click', () => {
    QuizApp.toggleCertainty();
  });

  // Start quiz
  document.getElementById('quiz-start-btn').addEventListener('click', () => {
    QuizApp.startQuiz();
  });

  // Skip
  document.getElementById('quiz-skip-btn').addEventListener('click', () => {
    QuizApp.skipQuestion();
  });

  // Next
  document.getElementById('quiz-next-btn').addEventListener('click', () => {
    QuizApp.nextQuestion();
  });

  // Hint
  document.getElementById('quiz-hint-btn').addEventListener('click', () => {
    if (!QuizApp.sessionActive || QuizApp.answered) return;
    const q = QuizApp.questions[QuizApp.currentIndex];
    showToast(`Hint: starts with "${q.correctAnswer.charAt(0)}..."`, 'info');
  });

  // Restart
  document.getElementById('quiz-restart-btn').addEventListener('click', () => {
    QuizApp.restartQuiz();
  });
});
