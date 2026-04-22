const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');

const classMap = {
  'text-on-surface': 'dark:text-slate-100',
  'text-on-surface-variant': 'dark:text-slate-300',
  'bg-surface-container': 'dark:bg-slate-800/80',
  'bg-surface-container-high': 'dark:bg-slate-700',
  'text-on-primary': 'dark:text-indigo-950',
  'text-indigo-700': 'dark:text-indigo-300',
  'hover:text-on-surface': 'dark:hover:text-white',
  'bg-surface-container-low/50': 'dark:bg-slate-800/50',
  'border-white/40': 'dark:border-white/10'
};

for (const [lightCls, darkCls] of Object.entries(classMap)) {
  const safeLightCls = lightCls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const safeDarkCls = darkCls.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  
  const regex = new RegExp(`(?<!dark:)${safeLightCls}(?!.*${safeDarkCls})`, 'g');
  
  content = content.replace(regex, (match) => {
    return `${match} ${darkCls}`;
  });
}

fs.writeFileSync(file, content, 'utf8');
console.log("Enhanced CSS mappings injected.");
