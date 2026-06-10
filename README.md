# JPD Learning JJS

JPD Learning JJS is a lightweight browser app for learning Japanese vocabulary with Vietnamese meanings. It runs as a static website and stores vocabulary, learning progress, and recent activity in the browser with `localStorage`.

## Features

- Add Japanese vocabulary with Vietnamese translations.
- Review saved words from a searchable vocabulary library.
- Practice with animated flashcards and track mastery from 0 to 5.
- Take multiple-choice quizzes with configurable question counts and timer settings.
- Skip uncertain quiz questions with optional certainty scoring.
- View dashboard stats, review progress, recent activity, and weekly activity bars.
- Switch between light and dark themes with a smooth view-transition animation.
- Responsive layout with desktop side navigation and mobile bottom navigation.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Tailwind CSS CDN
- Google Fonts and Material Symbols
- Browser `localStorage`

No build step or backend server is required.

## Project Structure

```text
.
|-- index.html
|-- README.md
|-- css/
|   `-- styles.css
|-- js/
|   |-- app.js
|   |-- flashcards.js
|   `-- quiz.js
|-- add-dark-classes.js
`-- add-dark-classes2.js
```

## Getting Started

Open `index.html` directly in a browser, or serve the folder with any static file server.

Example with Node.js:

```bash
npx serve .
```

Example with Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How To Use

1. Open the app in your browser.
2. Click the add button or open the Input view.
3. Enter a Japanese word and its Vietnamese meaning.
4. Use Library to search and manage saved words.
5. Use Practice to review flashcards and update mastery.
6. Use Quiz to test vocabulary with timed multiple-choice questions.

## Data Storage

The app stores data only in the current browser through `localStorage`.

Main storage keys:

- `liquid_intelligence_vocab`
- `liquid_intelligence_activity`
- `theme`

Clearing browser site data will remove saved vocabulary and progress.

## Deployment

Because this is a static app, it can be deployed on GitHub Pages, Netlify, Vercel, or any static hosting provider.

For GitHub Pages:

1. Push the repository to GitHub.
2. Open repository settings.
3. Enable GitHub Pages from the `main` branch.
4. Select the repository root as the publishing source.

## Repository

GitHub: [HungBB-1808/JPD_Learning_JJS](https://github.com/HungBB-1808/JPD_Learning_JJS)
