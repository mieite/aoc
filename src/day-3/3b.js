const fs = require('fs')
const joltages = fs.readFileSync('input.txt', 'utf8');

let total = 0n;
joltages.split('\n').forEach(bank => {
  let values = [];

  let window = 0;
  for (let bankIndex = 0; bankIndex < 12; bankIndex++) {
    let bestCandidate = -1;
    for (let i = window; i + (12-values.length) <= bank.length; i++) {
      const joltage = Number(bank[i]);
      if (joltage > bestCandidate) {
        window = i+1;
        bestCandidate = joltage;
      }
    }
    values[bankIndex] = bestCandidate;
  }
  total += BigInt(values.join(''));
});

console.log(`total: ${total.toString()}`);