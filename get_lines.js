const fs = require('fs');
const lines = fs.readFileSync('web/index.html', 'utf8').split('\n');
lines.forEach((l, i) => { if (l.includes('utils.js') || l.includes('main.js')) console.log(`${i+1}: ${l}`); });
