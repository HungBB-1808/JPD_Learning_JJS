<p align="center">
  <img src="https://img.shields.io/badge/Japanese-Vocabulary-6366f1?style=for-the-badge&logoColor=white" alt="JPD Learning" />
</p>

<h1 align="center">🌊 Liquid Intelligence</h1>
<h3 align="center">Japanese Vocabulary Learning App — Liquid Glass Edition</h3>

<p align="center">
  <a href="https://hungbb-1808.github.io/JPD_Learning_JJS/">
    <img src="https://img.shields.io/badge/🔗_Live_Demo-Visit_Site-6366f1?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Pages-222?style=flat-square&logo=github&logoColor=white" />
</p>

---

## ✨ Overview

**Liquid Intelligence** is a premium, zero-dependency web application for learning Japanese vocabulary with Vietnamese meanings. Built with a **macOS 26-inspired "Liquid Glass"** aesthetic, the app features glassmorphism panels, fluid transitions, and an immersive study experience — all running entirely in the browser with no backend required.

> 🌐 **Live:** [hungbb-1808.github.io/JPD_Learning_JJS](https://hungbb-1808.github.io/JPD_Learning_JJS/)

---

## 🎯 Features

| Module | Description |
|--------|-------------|
| **📚 Dashboard** | Real-time stats (total words, mastered, due for review), weekly activity chart, and vocabulary bank overview |
| **✏️ Input Modal** | Add Japanese words with Vietnamese meanings — modal stays open for continuous batch entry |
| **🃏 Flashcards** | 3D flip animation with mastery tracking (0–5 scale), "I Know This" / "Need Practice" / "Skip" actions |
| **📝 Quiz** | Configurable assessments with timer, randomized multiple-choice, Quick Pass (50% credit), and hint system |
| **🌙 Dark Mode** | Smooth **ripple transition effect** using the native View Transitions API — expands from your click coordinates |
| **🔍 Search** | Instantly filter your vocabulary library by Japanese or Vietnamese text |
| **📱 Responsive** | Desktop sidebar + mobile bottom navigation for seamless use across all devices |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Structure | HTML5 semantic elements |
| Styling | Tailwind CSS (CDN) + custom glassmorphism CSS |
| Logic | Vanilla JavaScript (ES6+) |
| Data | Browser `localStorage` |
| Fonts | [Manrope](https://fonts.google.com/specimen/Manrope) via Google Fonts |
| Icons | [Material Symbols Outlined](https://fonts.google.com/icons) |
| Transitions | View Transitions API + Web Animations API |
| Hosting | GitHub Pages |

**No build step, no npm, no backend — just open and go.**

---

## 📁 Project Structure

```
JPD_Learning_JJS/
├── index.html          # Single Page Application shell (all views)
├── css/
│   └── styles.css      # Glassmorphism, animations, dark mode, View Transitions
├── js/
│   ├── app.js          # Core routing, localStorage store, dashboard, theme toggle
│   ├── flashcards.js   # 3D flip cards, session tracking, mastery updates
│   └── quiz.js         # Quiz engine, timer, scoring, Quick Pass logic
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Open directly
Simply double-click `index.html` in your browser.

### Option 2 — Local server

```bash
# Python
python -m http.server 3000

# Node.js
npx serve .
```

Then visit **http://localhost:3000**

---

## 📖 How to Use

1. **Add words** — Click the `+` button or "Input" nav to open the add modal. Enter a Japanese word and its Vietnamese meaning, then click "Save to Bank". The modal stays open so you can keep adding.
2. **Study flashcards** — Navigate to "Practice". Cards show the Japanese word; tap to flip and reveal the meaning. Mark as "I Know This", "Need Practice", or "Skip".
3. **Take a quiz** — Navigate to "Quiz". Choose your question count and time limit, then click "Begin Assessment". Answer multiple-choice questions or use Quick Pass to skip.
4. **Track progress** — The Dashboard shows your total words, mastery percentage, weekly activity, and recent actions.
5. **Toggle dark mode** — Click the 🌙/☀️ icon in the top nav. Watch the ripple transition expand from your click!

---

## 💾 Data Storage

All data lives in `localStorage` under these keys:

| Key | Contents |
|-----|----------|
| `liquid_intelligence_vocab` | Array of vocabulary objects (word, meaning, mastery, timestamps) |
| `liquid_intelligence_activity` | Recent activity log (last 50 actions) |
| `theme` | User's theme preference (`light` or `dark`) |

> ⚠️ Clearing your browser's site data will erase all saved vocabulary and progress.

---

## 🌐 Deployment

This is a fully static app — deploy anywhere:

- **GitHub Pages** — Push to GitHub → Settings → Pages → Deploy from `main` branch, root `/`
- **Vercel / Netlify** — Connect the repo and deploy with zero configuration
- **Any web server** — Just serve the files as-is

---

## 📄 License

This project is for educational purposes.

---

<p align="center">
  Built with 💜 by <a href="https://github.com/HungBB-1808">HungBB-1808</a>
</p>
