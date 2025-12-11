const fs = require('fs');
const rows = fs.readFileSync('input.txt', 'utf8');

const machines = rows.split('\n').map(row => {
  return row.split(' ').reduce((acc, data) => {
    if (data.startsWith('[')) {
      acc.startingState = data.split('').splice(1, data.length - 2).map(x => x === '#');
    } else if (data.startsWith('(')) {
      const wiring = acc.wirings ?? [];
      data = data.replace('(', '[');
      data = data.replace(')', ']');
      wiring.push(JSON.parse(data));
      acc.wirings = wiring;
    } else if (data.startsWith('{')) {
      data = data.replace('{', '[');
      data = data.replace('}', ']');
      acc.joltages = JSON.parse(data);
    }
    return acc;
  }, {});
});

const stateEquals = (state, machine) => state.every((val, i) => val === machine.startingState[i]);

const printableState = (state) => {
  let printable = '[';
  state.forEach(x => {
    printable += x ? '1' : '0';
  });
  printable += ']';
  return printable;
};

const pressButton = (wiring, state) => {
  let newState = [...state];
  for (const index of wiring) {
    newState[index] = !newState[index];
  }
  return newState;
};

const bfSolver = (machine) => {
  let visitCount = 0;
  let prunes = 0;
  let maxDepthSeen = 0;
  const seen = new Set();
  const startingState = machine.startingState.map(x => false);
  const queue = [{ state: startingState, path: [] }];
  while (queue.length) {
    visitCount++;
    const { state, path } = queue.shift();
    const stateKey = makeKey(state);
    if (seen.has(stateKey)) {
      continue;
    }
    seen.add(stateKey);
    
    maxDepthSeen = Math.max(maxDepthSeen, path.length);
    if (stateEquals(state, machine)) {
      console.log(`${visitCount}: found solve: ${printableState(state)}`);
      return path;
    }
    for (let i = 0; i < machine.wirings.length; i++) {
      const nextState = pressButton(machine.wirings[i], state);
      queue.push({ state: nextState, path: [...path, i] });
    }
    visitCount % 1000 === 0 && console.log(`${visitCount}: max depth: ${maxDepthSeen} prunes: ${prunes}`);
  }
};

const makeKey = (state) => state.join('')
const solvesA = [];

for (let i = 0; i < machines.length; i++) {
  console.log(`${i}: starting to solve machine ${printableState(machines[i].startingState)}: ${JSON.stringify(machines[i])}`);
  let bfSolvePath = bfSolver(machines[i]);
  console.log(`${i}: found path length ${bfSolvePath.length} -> ${JSON.stringify(bfSolvePath)}`)
  solvesA.push(bfSolvePath.length);
}

let resultA = solvesA.reduce((a, b) => a+b, 0);
console.log(`result for A: ${resultA} with ${JSON.stringify(solvesA)}`);
