const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

const map = data.split('\n').map(line => line.split(''));

const rows = map.length;
const cols = map[0].length;

const printMap = () => {
  console.log(map.map((item) => item.join('')).join(`\n`));
}

const BEAM = '|';
const SPLITTER = '^';

let splitCount = 0;

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const pos = map[y][x];
    if (pos === 'S') {
      map[y+1][x] = BEAM;
      break;
    }

    const parent = map[y-1]?.[x] ?? '.';
    if (parent === BEAM) {
      if (pos === SPLITTER) {
        splitCount++;
        if (x >= 1) {
          map[y][x - 1] = BEAM;
        }
        if (x < cols - 1) {
          map[y][x + 1] = BEAM;
        }
      } else {
        map[y][x] = BEAM;
      }
    }
  }
}

printMap();
console.log(splitCount);