/* ==============================================
   flashcards.js — Flashcard Mode Logic
   3D flip, session tracking, mastery updates
   ============================================== */

const FlashcardApp = {
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  knownCount: 0,
  practiceCount: 0,
  skippedCount: 0,
  sessionActive: false,

  init() {
    this.cards = Store.getDueForReview();
    this.shuffleCards();
    this.currentIndex = 0;
    this.isFlipped = false;
    this.knownCount = 0;
    this.practiceCount = 0;
    this.skippedCount = 0;
    this.sessionActive = true;

    if (this.cards.length === 0) {
      this.showEmpty();
      return;
    }

    this.hideEmpty();
    this.hideResults();
    this.showCardArea();
    this.bindEvents();
    this.renderCard();
    this.updateProgress();
  },

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  },

  renderCard() {
    if (this.currentIndex >= this.cards.length) {
      this.showResults();
      return;
    }

    const card = this.cards[this.currentIndex];
    // Front
    document.getElementById('fc-category').textContent = `Card ${this.currentIndex + 1} of ${this.cards.length}`;
    document.getElementById('fc-japanese').textContent = card.japanese;
    document.getElementById('fc-reading').textContent = '';

    // Back
    document.getElementById('fc-meaning').textContent = card.vietnamese;
    document.getElementById('fc-back-japanese').textContent = card.japanese;

    // Reset flip
    this.isFlipped = false;
    const inner = document.getElementById('fc-inner');
    inner.classList.remove('flipped');

    // Show reveal hint
    document.getElementById('fc-reveal-btn').style.opacity = '0.4';

    // Animate in
    const scene = document.getElementById('fc-scene');
    scene.style.transform = 'scale(0.95)';
    scene.style.opacity = '0';
    requestAnimationFrame(() => {
      scene.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      scene.style.transform = 'scale(1)';
      scene.style.opacity = '1';
    });
  },

  flipCard() {
    const inner = document.getElementById('fc-inner');
    this.isFlipped = !this.isFlipped;
    if (this.isFlipped) {
      inner.classList.add('flipped');
      document.getElementById('fc-reveal-btn').style.opacity = '0';
    } else {
      inner.classList.remove('flipped');
      document.getElementById('fc-reveal-btn').style.opacity = '0.4';
    }
  },

  markKnown() {
    if (!this.sessionActive || this.currentIndex >= this.cards.length) return;
    const card = this.cards[this.currentIndex];
    const newMastery = Math.min(5, card.mastery + 1);
    Store.update(card.id, {
      mastery: newMastery,
      reviewCount: card.reviewCount + 1,
      lastReviewed: new Date().toISOString()
    });
    this.knownCount++;
    this.nextCard();
  },

  markPractice() {
    if (!this.sessionActive || this.currentIndex >= this.cards.length) return;
    const card = this.cards[this.currentIndex];
    const newMastery = Math.max(0, card.mastery - 1);
    Store.update(card.id, {
      mastery: newMastery,
      reviewCount: card.reviewCount + 1,
      lastReviewed: new Date().toISOString()
    });
    this.practiceCount++;
    this.nextCard();
  },

  skipCard() {
    if (!this.sessionActive || this.currentIndex >= this.cards.length) return;
    this.skippedCount++;
    this.nextCard();
  },

  nextCard() {
    this.currentIndex++;
    this.updateProgress();

    if (this.currentIndex >= this.cards.length) {
      this.showResults();
      return;
    }

    // Animate out then in
    const scene = document.getElementById('fc-scene');
    scene.style.transition = 'all 0.25s ease-in';
    scene.style.transform = 'scale(0.95) translateX(-30px)';
    scene.style.opacity = '0';

    setTimeout(() => {
      scene.style.transition = 'none';
      scene.style.transform = 'scale(0.95) translateX(30px)';
      this.renderCard();
    }, 280);
  },

  updateProgress() {
    const bar = document.getElementById('fc-progress-bar');
    const label = document.getElementById('fc-progress-label');
    if (bar) {
      const pct = this.cards.length > 0 ? ((this.currentIndex) / this.cards.length) * 100 : 0;
      bar.style.width = pct + '%';
    }
    if (label) {
      label.textContent = `Card ${Math.min(this.currentIndex + 1, this.cards.length)} of ${this.cards.length}`;
    }
  },

  showEmpty() {
    document.getElementById('fc-empty').classList.remove('hidden');
    document.getElementById('fc-card-area').classList.add('hidden');
    document.getElementById('fc-results').classList.add('hidden');
  },

  hideEmpty() {
    document.getElementById('fc-empty').classList.add('hidden');
  },

  showCardArea() {
    document.getElementById('fc-card-area').classList.remove('hidden');
    document.getElementById('fc-results').classList.add('hidden');
  },

  hideResults() {
    document.getElementById('fc-results').classList.add('hidden');
  },

  showResults() {
    this.sessionActive = false;
    document.getElementById('fc-card-area').classList.add('hidden');
    const results = document.getElementById('fc-results');
    results.classList.remove('hidden');
    results.classList.add('results-enter');

    const total = this.knownCount + this.practiceCount + this.skippedCount;
    document.getElementById('fc-res-total').textContent = total;
    document.getElementById('fc-res-known').textContent = this.knownCount;
    document.getElementById('fc-res-practice').textContent = this.practiceCount;
    document.getElementById('fc-res-skipped').textContent = this.skippedCount;

    const accuracy = total > 0 ? Math.round((this.knownCount / total) * 100) : 0;
    document.getElementById('fc-res-accuracy').textContent = accuracy + '%';

    ActivityLog.add({
      type: 'flashcard_session',
      icon: 'amp_stories',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      title: `Reviewed ${total} Cards`,
      detail: `${this.knownCount} known, ${this.practiceCount} need practice`,
      xp: `+${this.knownCount * 5} XP`
    });
  },

  bindEvents() {
    // Only bind once — use a flag to prevent duplicate listeners
    if (this._eventsBound) return;
    this._eventsBound = true;

    document.getElementById('fc-reveal-btn').addEventListener('click', () => this.flipCard());
    document.getElementById('fc-know-btn').addEventListener('click', () => this.markKnown());
    document.getElementById('fc-practice-btn').addEventListener('click', () => this.markPractice());
    document.getElementById('fc-skip-btn').addEventListener('click', () => this.skipCard());
    document.getElementById('fc-restart-btn').addEventListener('click', () => this.init());
    document.getElementById('fc-scene').addEventListener('click', (e) => {
      if (!e.target.closest('button')) this.flipCard();
    });
  }
};
