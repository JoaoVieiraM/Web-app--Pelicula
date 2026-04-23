const fs = require('fs');
const js = fs.readFileSync('web/src/js/app.js', 'utf8');
console.log(js.slice(0, 300));
console.log('---');
console.log(js.split('handleLogin').length);
