const fs = require('fs');
const inventory = fs.readFileSync('input.txt', 'utf8');

const indexes = [];
const ingredients = [];

let isIndexes = true;
let freshCount = 0;
inventory.split(`\n`).forEach((line) => {
  if (!line) {
    isIndexes = false;
  }
  if (isIndexes) {
    const [startStr, endStr] = line.split('-');
    indexes.push({ start: BigInt(startStr), end: BigInt(endStr) });
  } else {
    const ingredient = BigInt(line);
    ingredients.push(ingredient);
    if (indexes.find((index) => ingredient >= index.start && ingredient <= index.end)) {
      freshCount++;
    }
  }
});

let sequences = [];

const max = (a, b) => {
  return a > b ? a : b;
}

const min = (a, b) => {
  return a < b ? a : b;
}

const sorting = (a, b) => {
  if (a.start < b.start) return -1;
  if (a.start > b.start) return 1;
  return 0;
};

indexes.forEach((range) => {
  const overlaps = sequences.filter((seqIndex) =>
    max(seqIndex.start, range.start) <= min(seqIndex.end, range.end));
  if (overlaps.length) {
    const indexes = overlaps.map(overlap => sequences.findIndex(idx => overlap === idx));
    const minmax = overlaps.reduce((acc, current) => {
      if (!acc.start) {
        acc.start = min(current.start, range.start);
      } else {
        acc.start = min(min(current.start, acc.start), range.start);
      }
      if (!acc.end) {
        acc.end = max(current.end, range.end);
      } else {
        acc.end = max(max(current.end, acc.end), range.end);
      }
      return acc;
    }, {});

    indexes.sort().reverse();
    indexes.forEach((index) => sequences.splice(index, 1));

    sequences.push(minmax);
    sequences.sort(sorting);
  } else {
    sequences.push(range);
    sequences.sort(sorting);
  }
});

let count = BigInt(0);
sequences.forEach((sequence) => {
  count = count + (sequence.end - sequence.start) + 1n; // inclusive, range 1-5 will produce 4 because it's not inclusive otherwise
});

console.log(`fresh ones for a: ${freshCount}`);
console.log(`total fresh indexes: ${count}`);
