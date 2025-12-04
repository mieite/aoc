const fs = require('fs');
const rolls = fs.readFileSync('input.txt', 'utf8');

let rows = [];

let totalCount = 0;

const init = () => {
  rows = [];
  rolls.split('\n').forEach(rowString => {
    rows.push(rowString.split(''))
  });
}

const isPaper = (x, y) => rows[y]?.[x] === '@';

const round = () => {
  const removable = [];
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const value = rows[y][x];
      if (value !== '@') {
        continue;
      }
      let count = 0;
      if (isPaper(x - 1, y - 1)) {
        count++;
      }
      if (isPaper(x - 1, y)) {
        count++;
      }
      if (isPaper(x - 1, y + 1)) {
        count++;
      }
      if (isPaper(x, y - 1)) {
        count++;
      }
      if (isPaper(x, y + 1)) {
        count++;
      }
      if (isPaper(x + 1, y - 1)) {
        count++;
      }
      if (isPaper(x + 1, y)) {
        count++;
      }
      if (isPaper(x + 1, y + 1)) {
        count++;
      }
      if (count < 4) {
        removable.push({x, y});
      }
    }
  }
  return removable;
}

const a = () => {
  init();
  const removable = round();
  console.log(`totalCount for a: ${removable.length}`);
}

const b = () => {
  let removable = round();
  let totalCount = 0;
  while (removable.length > 0) {
    totalCount += removable.length;
    removable.forEach(coord => {
      rows[coord.y][coord.x] = '.';
    })
    removable = round();
  }
  console.log(`totalCount for b: ${totalCount}`);
}

a();
b();


