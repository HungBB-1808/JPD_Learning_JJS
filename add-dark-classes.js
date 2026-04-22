const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

// Map of light class to dark class additions
const classMap = {
  // Backgrounds opacity replacements
  'bg-white/10': 'dark:bg-white/5',
  'bg-white/20': 'dark:bg-white/5',
  'bg-white/30': 'dark:bg-white/5',
  'bg-white/40': 'dark:bg-white/10',
  'bg-white/50': 'dark:bg-white/10',
  
  // Solid backgrounds
  'bg-white': 'dark:bg-slate-900',
  'bg-slate-50': 'dark:bg-slate-800',
  'bg-slate-100': 'dark:bg-slate-800',
  'bg-indigo-50': 'dark:bg-indigo-900/30',
  'bg-indigo-100': 'dark:bg-indigo-900/50',
  'bg-indigo-200/40': 'dark:bg-indigo-900/40',
  'bg-slate-200/50': 'dark:bg-slate-800/50',
  
  // Text colors
  'text-slate-600': 'dark:text-slate-300',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-400': 'dark:text-slate-500',
  'text-indigo-700': 'dark:text-indigo-300',
  'text-indigo-600': 'dark:text-indigo-400',
  'text-indigo-500': 'dark:text-indigo-400',
  
  // Hover states - Backgrounds
  'hover:bg-white/10': 'dark:hover:bg-white/10',
  'hover:bg-white/20': 'dark:hover:bg-white/10',
  
  // Hover states - Text
  'hover:text-indigo-500': 'dark:hover:text-indigo-300',
  'hover:text-indigo-600': 'dark:hover:text-indigo-300',
  'hover:text-indigo-700': 'dark:hover:text-indigo-300',
  
  // Borders
  'border-white/30': 'dark:border-white/5',
  'border-white/40': 'dark:border-white/10',
  'border-white/50': 'dark:border-white/10',
  'border-slate-100': 'dark:border-slate-800',
  
  // Gradients
  'from-primary': 'dark:from-indigo-600',
  'to-primary-container': 'dark:to-indigo-900'
};

// Apply mappings. Use word boundaries or exact string replacing carefully.
// To avoid double-adding if script is run multiple times, we'll only replace if the dark class isn't already there.
for (const [lightCls, darkCls] of Object.entries(classMap)) {
  const safeLightCls = lightCls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const safeDarkCls = darkCls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  // Look for the light class NOT followed by the dark class (to prevent dupes)
  const regex = new RegExp(`(?<!dark:)${safeLightCls}(?!.*${safeDarkCls})`, 'g');
  
  content = content.replace(regex, (match) => {
    return `${match} ${darkCls}`;
  });
}

// Remove the `!important` garbage styles previously injected
const oldStylesFile = 'css/styles.css';
let oldStyles = fs.readFileSync(oldStylesFile, 'utf8');

// I will just use regex to remove the block from `/* ============================================` to EOF
const darkSectionIndex = oldStyles.indexOf('/* ============================================\n   Dark Mode Overrides');
if (darkSectionIndex !== -1) {
  oldStyles = oldStyles.substring(0, darkSectionIndex).trim() + '\n';
}

// Append clean CSS variables for the background mesh and specific overrides 
// that Tailwind doesn't handle natively like custom background-images
oldStyles += `\n/* ============================================
   Dark Mode Custom Adjustments
   ============================================ */
.dark body.bg-mesh {
  background-color: #0b0e14;
  background-image:
    radial-gradient(at 0% 0%, rgba(136,153,255,0.08) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(64,82,182,0.05) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(136,153,255,0.08) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(64,82,182,0.05) 0px, transparent 50%);
}

.dark .glass-panel {
  background: rgba(20, 25, 30, 0.40);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dark .glass-card {
  background: rgba(30, 35, 40, 0.50);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.dark .quiz-option.correct {
  background: rgba(16, 185, 129, 0.20);
  border-color: rgba(16, 185, 129, 0.50);
}

.dark .quiz-option.wrong {
  background: rgba(239, 68, 68, 0.20);
  border-color: rgba(239, 68, 68, 0.40);
}

.dark .modal-overlay .modal-backdrop {
  background: rgba(0, 0, 0, 0.70);
}
`;

fs.writeFileSync(file, content, 'utf8');
fs.writeFileSync(oldStylesFile, oldStyles, 'utf8');

console.log("Dark mode Tailwind classes injected and styles.css cleaned up.");
