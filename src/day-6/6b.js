const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

let lines = data.split('\n');

const columnBreaks = [];
lines[lines.length - 1].split('').forEach((char, index) => {
  char !== ' ' && columnBreaks.push(index);
});

const opRow = lines.length - 1;

let total = BigInt(0);

for (let i = 0; i < columnBreaks.length; i++) {
  let start = columnBreaks[i];
  // -2 from the next operator cause there's a space between
  let end = columnBreaks[i+1] ? columnBreaks[i+1]-2 : lines[0].length-1;

  const operator = lines[opRow][start];
  let sum = BigInt(0);

  for (let pos = end; pos >= start; pos--) {
    let numStr = '';
    for (let row = 0; row < opRow; row++) {
      numStr += lines[row][pos].trim();
    }
    let value = BigInt(numStr);
    sum = operator === '+' ? (sum + value) : (sum === BigInt(0) ? value : (sum * value));
  }
  total += sum;
}

console.log(`answer to b is ${total}`);

