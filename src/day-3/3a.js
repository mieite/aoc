const fs = require('fs')
const joltages = fs.readFileSync('input.txt', 'utf8');

let total = 0;

joltages.split('\n').forEach(bank => {
  let first = 0, second = 0;
  bank.split("").forEach((character, i) => {
    const joltage = Number(character);
    if (joltage > first && i < bank.length-1) {
      first = joltage;
      second = 0;
    } else if (joltage > second) {
      second = joltage;
    }
  });
  total += Number(`${first}${second}`);
});

console.log(`total: ${total}`);