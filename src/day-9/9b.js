// 9b.js
const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8').trim();

const redTiles = data.split('\n').map(coordinates => {
  const [xStr, yStr] = coordinates.split(',');
  return {
    x: Number(xStr),
    y: Number(yStr),
  };
});

const calculateArea = ({ a, b }) => {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  // inclusive tile coordinates
  return (maxX + 1 - minX) * (maxY + 1 - minY);
};

const mapKey = (a, b) => {
  const keyArray = [a, b];
  keyArray.sort((p, q) => {
    if (p.x !== q.x) return p.x - q.x;
    return p.y - q.y;
  });
  return `(${keyArray[0].x},${keyArray[0].y})-(${keyArray[1].x},${keyArray[1].y})`;
};

const areaMap = new Map();

for (let i = 0; i < redTiles.length - 1; i++) {
  const a = redTiles[i];
  for (let j = i + 1; j < redTiles.length; j++) {
    const b = redTiles[j];
    const key = mapKey(a, b);
    const area = calculateArea({ a, b });
    areaMap.set(key, { a, b, area });
  }
}

const rowRanges = new Map();

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

for (let i = 0; i < redTiles.length - 1; i++) {
  minX = Math.min(redTiles[i].x, minX);
  maxX = Math.max(redTiles[i].x, maxX);
  minY = Math.min(redTiles[i].y, minY);
  maxY = Math.max(redTiles[i].y, maxY);
}

const buildEdgesFromRedTiles = (redTiles) => {
  const rowEdges = [];
  const columnEdges = [];

  const n = redTiles.length;
  for (let i = 0; i < n; i++) {
    const a = redTiles[i];
    const b = redTiles[(i + 1) % n]; // wrap to first

    if (a.x === b.x) {
      // vertical edge
      const y1 = Math.min(a.y, b.y);
      const y2 = Math.max(a.y, b.y);
      columnEdges.push({
        x: a.x,
        y1,
        y2,
      });
    } else if (a.y === b.y) {
      // horizontal edge
      const x1 = Math.min(a.x, b.x);
      const x2 = Math.max(a.x, b.x);
      rowEdges.push({
        y: a.y,
        x1,
        x2,
      });
    }
  }
  return { rowEdges, columnEdges };
}

const processSegments = (crossingPoints) => {
  let segments = [...crossingPoints]; // Make a copy

  // phase 1: both sides have uneven cs -> remove both rs
  let changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].type === 'r' && segments[i + 1].type === 'r') {
        // found consecutive rs, check both sides
        const leftCs = countCsToLeft(segments, i);
        const rightCs = countCsToRight(segments, i + 1);

        if (leftCs % 2 === 1 && rightCs % 2 === 1) {
          // both sides uneven - remove both rs
          segments.splice(i, 2);
          changed = true;
          break; // restart from beginning after modification
        }
      }
    }
  }

  // phase 2: remaining cases - remove one r to balance uneven side
  changed = true;
  while (changed) {
    changed = false;

    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].type === 'r' && segments[i + 1].type === 'r') {
        const leftCs = countCsToLeft(segments, i);
        const rightCs = countCsToRight(segments, i + 1);

        if (leftCs % 2 === 1 && rightCs % 2 === 0) {
          // uneven before, even after - remove first r
          segments.splice(i, 1);
          changed = true;
          break;
        } else if (leftCs % 2 === 0 && rightCs % 2 === 1) {
          // even before, uneven after - remove second r
          segments.splice(i + 1, 1);
          changed = true;
          break;
        }
      }
    }
  }
  return segments;
}

const countCsToLeft = (segments, startIndex) => {
  let count = 0;
  for (let i = startIndex - 1; i >= 0; i--) {
    if (segments[i].type === 'c') {
      count++;
    } else if (segments[i].type === 'r') {
      break;
    }
  }
  return count;
}

const countCsToRight = (segments, startIndex) => {
  let count = 0;
  for (let i = startIndex + 1; i < segments.length; i++) {
    if (segments[i].type === 'c') {
      count++;
    } else if (segments[i].type === 'r') {
      break;
    }
  }
  return count;
}

console.log(`absolute boundaries: y: ${minY}-${maxY}, x: ${minX}-${maxX}`)
const { columnEdges, rowEdges } = buildEdgesFromRedTiles(redTiles);

for (let y = minY; y <= maxY; y++) {
  const ranges = [];
  const filteredC = columnEdges.filter((edge) => edge.y1 <= y && y <= edge.y2);
  const filteredR = rowEdges.filter((edge) => edge.y === y).sort();
  // console.log(`${y}: row edges: ${JSON.stringify(filteredR)}. column edges: ${JSON.stringify(filteredC)}`);
  const crossingPoints = filteredC.map(edge => {
    let type = 'c';
    if (filteredR.some(r => r.x1 === edge.x || r.x2 === edge.x)) {
      type = 'r';
    }
    return { x: edge.x, type }
  }).sort((a, b) => a.x - b.x);

  const segments = processSegments(crossingPoints);

  const print = JSON.stringify(segments) !== JSON.stringify(crossingPoints);

  // if (print) {
  //   console.log(`${y}: row edges: ${JSON.stringify(filteredR)}. column edges: ${JSON.stringify(filteredC)}`);
  //   console.log(`${y}: crossing points: ${JSON.stringify(crossingPoints)}`);
  //   console.log(`${y}: segments: ${JSON.stringify(segments)}`);
  // }

  for (let i = 0; i < segments.length; i = i+2) {
    const pair = { start: segments[i].x, end: segments[i + 1].x };
    ranges.push(pair);
  }
  // print && console.log(`${y}: ended up with ranges: ${JSON.stringify(ranges)}`);
  rowRanges.set(y, ranges);
}

const testIsInArea = (x, y) => {
  const ranges = rowRanges.get(y);
  if (!ranges) {
    return false;
  }
  const range = ranges.find((r) => x >= r.start && x <= r.end);
  if (range) {
    return range;
  }
}

const checked = [];

let bestArea;

for (let i = 0; i < redTiles.length; i++) {
  const tile = redTiles[i];
  console.log(`${new Date()}: ${i+1}/${redTiles.length}: testing tile ${JSON.stringify(tile)}`);

  const filteredKeys = Array.from(areaMap.keys()).filter((key) => {
    const value = areaMap.get(key);
    return value.a === tile || value.b === tile;
  })

  filteredKeys.sort((a, b) => areaMap.get(b).area - areaMap.get(a).area);

  for (const key of filteredKeys) {
    if (checked.includes(key)) {
      continue;
    }
    checked.push(key);

    const area = areaMap.get(key);
    if (bestArea && area.area < bestArea.area) {
      // sorted so none of this node can have a better oen
      // console.log(`area: ${area.area} rest of this tile are smaller than ${bestArea.area}, skipping`)
      break;
    }
    const { a, b } = area;

    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);

    let inside = true;

    // test edges first
    for (let x = minX; x <= maxX; x++) {
      inside = !!testIsInArea(x, minY);
      if (!inside) {
        break;
      }
    }
    if (!inside) {
      continue;
    }
    for (let x = minX; x <= maxX; x++) {
      inside = !!testIsInArea(x, maxY);
      if (!inside) {
        break;
      }
    }
    if (!inside) {
      continue;
    }
    for (let y = minY; y <= maxY; y++) {
      inside = !!testIsInArea(minX, y);
      if (!inside) {
        break;
      }
    }
    if (!inside) {
      continue;
    }
    for (let y = minY; y <= maxY; y++) {
      inside = !!testIsInArea(maxX, y);
      if (!inside) {
        break;
      }
    }
    if (!inside) {
      continue;
    }

    console.log(`${new Date()}: testing the whole damn box with ${JSON.stringify(area)}`)
    for (let x = minX; x <= maxX && inside; x++) {
      for (let y = minY; y <= maxY; y++) {
        inside = !!testIsInArea(x, y);
        if (!inside) {
          break;
        }
      }
    }
    if (inside) {
      if (!bestArea) {
        bestArea = area;
        console.log(`${new Date()}: first that fits: ${JSON.stringify(bestArea)}`);
      } else if (area.area > bestArea.area) {
        console.log(`improved from ${JSON.stringify(bestArea)} to ${JSON.stringify(area)}`);
        bestArea = area;
      }
    }
  }
}

console.log(`biggest area found: ${JSON.stringify(bestArea)}`);


