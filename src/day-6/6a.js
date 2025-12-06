const fs = require('fs');
const inventory = fs.readFileSync('input.txt', 'utf8');

let problems = [];

inventory.split('\n').forEach(line => {
  line.split(/\s+/).forEach((part, index) => {
    const problemParts = problems[index] ?? [];
    problemParts.push(part);
    problems[index] = problemParts;
  });
});

let count = 0;

problems.forEach((problem, index) => {
  const operator = problem[problem.length - 1];
  let sum = 0;
  for (let i = 0; i < problem.length-1; i++) {
    const value = Number(problem[i]);
    sum = operator === '+' ? (sum + value) : (sum === 0 ? value : (sum * value));
  }
  count += sum;
});

console.log(`answer to a: ${count}`);