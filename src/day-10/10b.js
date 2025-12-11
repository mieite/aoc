const solver = require("javascript-lp-solver");

// run from project root node src/day-10/10b.js to get the above dependency
const fs = require('fs');
const rows = fs.readFileSync('src/day-10/input.txt', 'utf8');

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

const solveMachineILP = (machine) => {

  const target = machine.joltages;
  const wirings = machine.wirings;

  const model = {
    optimize: "total",
    opType: "min",
    constraints: {},
    variables: {},
    ints: {}
  };

  for (let i = 0; i < target.length; i++) {
    model.constraints["target_joltage_" + i] = { equal: target[i] };
  }

  // build variables buttons, each as an object:
  //   { total: 1, target_joltage_0: A[0][j], target_joltage_1: A[1][j], ... }
  // set integerness and bounds.
  for (let j = 0; j < wirings.length; j++) {
    const varName = "button_" + j;
    const variable = {
      total: 1  // cost coefficient is the same for all
    };

    // mark target_joltages that button wirings manipulate
    for (let i = 0; i < target.length; i++) {
      if (wirings[j].includes(i)) {
        variable["target_joltage_" + i] = 1;
      }
    }

    // upper bound for this button: min value on target_joltages this button's wirings manipulate
    // (you can only press is min(target_joltages) times, after that solution is always
    // out of bounds.
    const upperBound = wirings[j].length > 0
      ? Math.min(...wirings[j].map(i => target[i]))
      : 0;

    if (upperBound === 0) {
      // unusable wiring
      variable.max = 0;
    } else {
      variable.max = upperBound;
      variable.min = 0;
    }

    model.variables[varName] = variable;
    model.ints[varName] = 1;
  }

  console.log("solving this fucking thing");

  const result = solver.Solve(model);

  console.log(`result: ${JSON.stringify(result)}`);

  if (!result.feasible) {
    console.log("no solutions found, wtf?");
    return null;
  }

  const presses = Array(target.length).fill(0);
  for (let buttonIndex = 0; buttonIndex < target.length; buttonIndex++) {
    const name = "button_" + buttonIndex;
    if (result[name] !== undefined) {
      presses[buttonIndex] = Math.round(result[name]);
    }
  }

  return presses;
}
let total = 0;

for (const machine of machines) {
  const solution = solveMachineILP(machine);
  console.log(`Solution ${JSON.stringify(solution)}`);
  total += solution.reduce((a,b) => a+b, 0);
}
console.log("\nTotal presses:", total);
