const fs = require('fs')

const instructions = fs.readFileSync('input.txt', 'utf8');

let zeroes = 0;

let position = 50;

instructions.split('\n').forEach((line) => {
  const dir = line.substring(0, 1);
  const amount = Number(line.substring(1));

  position = dir === 'R' ? (position + amount) % 100 : (position - amount) % 100;
  if (position === 0) {
    zeroes++;
  }
});

console.log(`total of ${zeroes}`);
