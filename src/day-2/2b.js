const fs = require('fs')

const patterns = fs.readFileSync('input.txt', 'utf8');

let sum = 0;

patterns.split(',').forEach((range => {
  const [ startStr, endStr ] = range.split('-');
  const start = Number(startStr);
  const end = Number(endStr);

  for (let i = start; i <= end; i++) {
    const value = String(i);
    for (let testSize = 1; testSize <= value.length/2; testSize++) {
      const re = new RegExp(String.raw`.{1,${testSize}}`, 'g');
      const parts = value.match(re);
      if (parts.some((part) => part.length !== parts[0].length)) {
        continue;
      }
      if (new Set(parts).size === 1) {
        console.log(`found ${i}`);
        sum += i;
        break;
      }
    }
  }
}));

console.log(`sum: ${sum}`);