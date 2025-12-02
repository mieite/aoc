const fs = require('fs')

const patterns = fs.readFileSync('input.txt', 'utf8');

let sum = 0;

patterns.split(',').forEach((range => {
  const [ startStr, endStr ] = range.split('-');
  const start = Number(startStr);
  const end = Number(endStr);

  for (let i = start; i <= end; i++) {
    const value = String(i);
    const firstHalf = value.slice(0, value.length/2);
    const lastHalf = value.slice(value.length/2, value.length);
    if (firstHalf === lastHalf) {
      console.log(`found ${i}`);
      sum += i;
    }
  }
}));

console.log(`sum: ${sum}`);