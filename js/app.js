/* ==============================================
   app.js — Core Application Logic
   Navigation, localStorage, Input Modal, Dashboard
   ============================================== */

// ─── Vocabulary Store ───
const Store = {
  KEY: 'liquid_intelligence_vocab',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch { return []; }
  },

  save(list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  add(word) {
    const list = this.getAll();
    word.id = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    word.createdAt = new Date().toISOString();
    word.mastery = 0;          // 0-5
    word.reviewCount = 0;
    word.lastReviewed = null;
    list.push(word);
    this.save(list);
    return word;
  },

  remove(id) {
    const list = this.getAll().filter(w => w.id !== id);
    this.save(list);
  },

  update(id, updates) {
    const list = this.getAll();
    const idx = list.findIndex(w => w.id === id);
    if (idx !== -1) {
      Object.assign(list[idx], updates);
      this.save(list);
    }
  },

  count() { return this.getAll().length; },

  getMastered() { return this.getAll().filter(w => w.mastery >= 4); },

  getDueForReview() {
    return this.getAll().filter(w => w.mastery < 5);
  },

  search(query) {
    const q = query.toLowerCase();
    return this.getAll().filter(w =>
      w.japanese.toLowerCase().includes(q) ||
      w.vietnamese.toLowerCase().includes(q)
    );
  }
};

// ─── Activity Log ───
const ActivityLog = {
  KEY: 'liquid_intelligence_activity',

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch { return []; }
  },

  add(entry) {
    const list = this.getAll();
    entry.id = Date.now();
    entry.timestamp = new Date().toISOString();
    list.unshift(entry);
    // Keep only last 50
    if (list.length > 50) list.length = 50;
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  getRecent(n = 5) {
    return this.getAll().slice(0, n);
  }
};

// ─── Toast ───
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ─── Navigation ───
const NAV_VIEWS = ['dashboard', 'flashcards', 'quiz'];
let currentView = 'dashboard';

function navigateTo(viewName) {
  if (viewName === currentView) return;
  if (viewName === 'input') {
    openInputModal();
    return;
  }

  const oldEl = document.getElementById(`view-${currentView}`);
  const newEl = document.getElementById(`view-${viewName}`);
  if (!oldEl || !newEl) return;

  // Exit old
  oldEl.classList.remove('active');
  oldEl.classList.add('exit');

  // Enter new
  setTimeout(() => {
    oldEl.classList.remove('exit');
    newEl.classList.add('active');
  }, 150);

  currentView = viewName;
  updateNavHighlight();

  // Refresh view data
  if (viewName === 'dashboard') refreshDashboard();
  if (viewName === 'flashcards') FlashcardApp.init();
  if (viewName === 'quiz') QuizApp.resetSetup();
}

function updateNavHighlight() {
  // Top nav
  document.querySelectorAll('.top-nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.dataset.view;
    if (href === currentView) link.classList.add('active');
  });
  // Side nav
  document.querySelectorAll('.side-nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.dataset.view;
    if (href === currentView) link.classList.add('active');
  });
  // Bottom mobile nav
  document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
    const view = btn.dataset.view;
    const icon = btn.querySelector('.material-symbols-outlined');
    if (view === currentView) {
      btn.classList.remove('text-slate-500');
      btn.classList.add('text-indigo-700');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      btn.classList.remove('text-indigo-700');
      btn.classList.add('text-slate-500');
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });
}

// ─── Input Modal ───
function openInputModal() {
  const overlay = document.getElementById('modal-input');
  overlay.classList.add('open');
  setTimeout(() => {
    document.getElementById('input-japanese').focus();
  }, 300);
}

function closeInputModal() {
  const overlay = document.getElementById('modal-input');
  overlay.classList.remove('open');
  document.getElementById('input-japanese').value = '';
  document.getElementById('input-vietnamese').value = '';
}

function handleAddWord(e) {
  e.preventDefault();
  const jp = document.getElementById('input-japanese').value.trim();
  const vn = document.getElementById('input-vietnamese').value.trim();

  if (!jp || !vn) {
    showToast('Please fill in both fields.', 'error');
    return;
  }

  Store.add({ japanese: jp, vietnamese: vn });
  ActivityLog.add({
    type: 'add',
    icon: 'add_circle',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    title: `Added: ${jp}`,
    detail: `Meaning: ${vn}`,
    xp: '+5 XP'
  });

  showToast(`"${jp}" saved successfully!`, 'success');

  // Keep modal open — clear fields and re-focus for continuous adding
  document.getElementById('input-japanese').value = '';
  document.getElementById('input-vietnamese').value = '';
  document.getElementById('input-japanese').focus();

  refreshDashboard();
}

// ─── Dashboard Refresh ───
function refreshDashboard() {
  const allWords = Store.getAll();
  const mastered = Store.getMastered();
  const due = Store.getDueForReview();

  // Stats
  const totalEl = document.getElementById('stat-total-words');
  const masteredEl = document.getElementById('stat-mastered');
  const dueEl = document.getElementById('stat-due');
  const streakEl = document.getElementById('stat-streak');
  const accuracyEl = document.getElementById('stat-accuracy');

  if (totalEl) totalEl.textContent = allWords.length.toLocaleString();
  if (masteredEl) masteredEl.textContent = mastered.length;
  if (dueEl) dueEl.textContent = due.length;

  // Secondary total
  const totalEl2 = document.getElementById('stat-total-words-2');
  if (totalEl2) totalEl2.textContent = allWords.length;

  // Mastery progress bar
  const pct = allWords.length > 0 ? Math.round((mastered.length / allWords.length) * 100) : 0;
  const progressBar = document.getElementById('mastery-progress');
  if (progressBar) {
    progressBar.style.width = pct + '%';
  }
  const progressBar2 = document.getElementById('mastery-progress-2');
  if (progressBar2) {
    progressBar2.style.width = pct + '%';
  }
  const pctLabel = document.getElementById('mastery-pct');
  if (pctLabel) pctLabel.textContent = pct + '%';
  const masteredCount = document.getElementById('mastered-count');
  if (masteredCount) masteredCount.textContent = `${mastered.length} / ${allWords.length}`;

  // Review button text
  const reviewBtn = document.getElementById('btn-start-review');
  if (reviewBtn) {
    reviewBtn.textContent = due.length > 0 ? `Review ${due.length} Words` : 'All Mastered!';
  }

  // Due message
  const dueMsg = document.getElementById('due-message');
  if (dueMsg) {
    dueMsg.textContent = allWords.length === 0
      ? 'Start by adding some vocabulary words!'
      : `You have ${due.length} words due for review today.`;
  }

  // Render vocab list
  renderVocabList(allWords);

  // Recent activity
  renderRecentActivity();

  // Activity bars (simple visual)
  renderActivityBars();
}

function renderVocabList(words) {
  const container = document.getElementById('vocab-list-container');
  if (!container) return;

  if (words.length === 0) {
    container.innerHTML = `
      <div class="empty-state py-12">
        <span class="material-symbols-outlined" style="font-size:56px;color:#abadb3;">library_books</span>
        <p class="text-on-surface-variant font-semibold">Your library is empty</p>
        <p class="text-sm text-on-surface-variant/60">Add words using the + button to get started</p>
      </div>`;
    return;
  }

  container.innerHTML = words.map(w => `
    <div class="vocab-card flex items-center justify-between p-4 hover:bg-white/30 rounded-2xl transition-all cursor-pointer" data-id="${w.id}">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <span class="text-lg font-bold text-indigo-700">${w.japanese.charAt(0)}</span>
        </div>
        <div>
          <h5 class="font-bold text-base">${w.japanese}</h5>
          <p class="text-xs text-on-surface-variant">${w.vietnamese}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex flex-col items-end">
          <span class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Mastery</span>
          <div class="flex gap-0.5 mt-1">
            ${[0,1,2,3,4].map(i =>
              `<div class="w-2 h-2 rounded-full ${i < w.mastery ? 'bg-indigo-500' : 'bg-slate-200'}"></div>`
            ).join('')}
          </div>
        </div>
        <button onclick="deleteWord('${w.id}', event)" class="delete-btn w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-50 text-red-400 hover:text-red-600 transition-all">
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

function deleteWord(id, event) {
  event.stopPropagation();
  Store.remove(id);
  showToast('Word removed.', 'info');
  refreshDashboard();
}

function renderRecentActivity() {
  const container = document.getElementById('activity-list');
  if (!container) return;

  const recent = ActivityLog.getRecent(5);
  if (recent.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-on-surface-variant text-sm">
        No activity yet. Start learning!
      </div>`;
    return;
  }

  container.innerHTML = recent.map(a => {
    const ago = timeAgo(a.timestamp);
    return `
      <div class="flex items-center justify-between p-4 hover:bg-white/30 rounded-2xl transition-all cursor-pointer">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl ${a.iconBg || 'bg-indigo-100'} flex items-center justify-center ${a.iconColor || 'text-indigo-600'}">
            <span class="material-symbols-outlined">${a.icon || 'history'}</span>
          </div>
          <div>
            <h5 class="font-bold">${a.title}</h5>
            <p class="text-xs text-on-surface-variant">${a.detail || ''}</p>
          </div>
        </div>
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold ${a.xp ? 'text-green-600' : 'text-indigo-400'}">${a.xp || 'Activity'}</p>
          <p class="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">${ago}</p>
        </div>
      </div>`;
  }).join('');
}

function renderActivityBars() {
  const barsContainer = document.getElementById('activity-bars');
  if (!barsContainer) return;

  const activities = ActivityLog.getAll();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = activities.filter(a => a.timestamp && a.timestamp.startsWith(key)).length;
    days.push(count);
  }
  const max = Math.max(...days, 1);

  barsContainer.innerHTML = days.map((c, i) => {
    const h = Math.max(10, (c / max) * 100);
    const opacity = 0.2 + (i / 6) * 0.6;
    return `<div class="flex-1 bg-indigo-400 rounded-t-xl transition-all duration-500" style="height:${h}%;opacity:${opacity}"></div>`;
  }).join('');
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Search ───
function handleSearch(e) {
  const q = e.target.value.trim();
  if (q.length === 0) {
    renderVocabList(Store.getAll());
    return;
  }
  renderVocabList(Store.search(q));
}

// ─── Theme Toggle ───
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    html.classList.add('dark');
    html.classList.remove('light');
    if(themeIcon) themeIcon.textContent = 'light_mode';
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    if(themeIcon) themeIcon.textContent = 'dark_mode';
  }
  
  if(themeToggle) {
    themeToggle.addEventListener('click', async (e) => {
      const isDark = html.classList.contains('dark');
      const nextThemeDark = !isDark;
      
      const applyTheme = () => {
        if (nextThemeDark) {
          html.classList.add('dark');
          html.classList.remove('light');
          localStorage.setItem('theme', 'dark');
          themeIcon.textContent = 'light_mode';
        } else {
          html.classList.remove('dark');
          html.classList.add('light');
          localStorage.setItem('theme', 'light');
          themeIcon.textContent = 'dark_mode';
        }
      };

      // 1. Safe Fallback
      if (!document.startViewTransition) {
        applyTheme();
        return;
      }

      // 2. Capture coordinates from the user's mouse click
      const x = e.clientX;
      const y = e.clientY;

      // 3. Calculate max radius
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // 4. Start view transition
      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      // 5. Wait for the new DOM layout
      await transition.ready;

      // 6. Native Web Animation for the circle clip-path
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 600,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: nextThemeDark ? '::view-transition-new(root)' : '::view-transition-old(root)',
          direction: nextThemeDark ? 'normal' : 'reverse',
        }
      );
    });
  }
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Show dashboard by default
  document.getElementById('view-dashboard').classList.add('active');
  updateNavHighlight();
  refreshDashboard();

  // Nav links
  document.querySelectorAll('[data-view]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.view);
    });
  });

  // Input modal form
  document.getElementById('input-form').addEventListener('submit', handleAddWord);
  document.getElementById('btn-close-modal').addEventListener('click', closeInputModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeInputModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeInputModal);

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', handleSearch);

  // Start Review button → go to flashcards
  document.getElementById('btn-start-review').addEventListener('click', () => {
    navigateTo('flashcards');
  });
});
