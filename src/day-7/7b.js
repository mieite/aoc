const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

const map = data.split('\n').map(line => line.split(''));

const cols = map.length;
const rows = map[0].length;

const SPLITTER = '^';

const startPoint = { y: 2, x: map[2].findIndex(x => x === SPLITTER)};
const getColumn = (x) => map.map((row) => row[x]).join('');

const findNextSplitter = (y, x) => {
  const column = getColumn(x);
  let pos = y;
  while (column[pos] !== SPLITTER) {
    if (!column[pos]) {
      return null;
    }
    pos++;
  }
  return { y: pos, x };
}

const startSplitter = findNextSplitter(startPoint.y, startPoint.x);

const splitters = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    if (map[y][x] === SPLITTER) splitters.push({ y, x });
  }
}
// go through from top to bottom, no backtracking -> sorting solves sums
splitters.sort((a, b) => a.y - b.y || a.x - b.x);

const splitterKey = (y, x) => `${y},${x}`;

const splitterChildren = new Map();
for (const s of splitters) {
  const left = findNextSplitter(s.y + 1, s.x - 1);
  const right = findNextSplitter(s.y + 1, s.x + 1);
  const leftKey = left ? splitterKey(left.y, left.x) : null;
  const rightKey = right ? splitterKey(right.y, right.x) : null;
  splitterChildren.set(splitterKey(s.y, s.x), { left: leftKey, right: rightKey });
}

const routes = new Map();
// count route from S -> ^, dummy
routes.set(splitterKey(startSplitter.y, startSplitter.x), 1n);

let total = 0n;

for (const splitter of splitters) {
  const key = splitterKey(splitter.y, splitter.x);
  const count = routes.get(key) ?? 0n;
  // since splitters are sorted and parsed top to bottom this is an unreachable splitter, ignore it
  if (count === 0n) continue;

  const ch = splitterChildren.get(key);

  // if a child is null route is done -> count total routes this splitter was reached with
  if (!ch.left) {
    total += count;
  } else {
    routes.set(ch.left, (routes.get(ch.left) ?? 0n) + count);
  }

  if (!ch.right) {
    total += count;
  } else {
    routes.set(ch.right, (routes.get(ch.right) ?? 0n) + count);
  }
}

console.log(`total timelines: ${total}`);