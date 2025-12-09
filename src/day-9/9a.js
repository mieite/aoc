const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

const redTiles = data.split('\n').map(coordinates => ({
  x: Number(coordinates.split(',')[0]),
  y: Number(coordinates.split(',')[1]),
}));

const calculateArea = (data) => {
  const minX = Math.min(data.a.x, data.b.x);
  const maxX = Math.max(data.a.x, data.b.x);
  const minY = Math.min(data.a.y, data.b.y);
  const maxY = Math.max(data.a.y, data.b.y);
  // inclusive coordinates so off by one ffs
  return (maxX + 1 - minX) * (maxY + 1 - minY);
};

const mapKey = (a, b) => {
  const keyArray = [a, b];
  keyArray.sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  return `(${keyArray[0].x},${keyArray[0].y})-(${keyArray[1].x},${keyArray[1].y})`;
};

const areaMap = new Map();

for (let i = 0; i < redTiles.length - 1; i++) {
  const a = redTiles[i];
  for (let j = i + 1; j < redTiles.length; j++) {
    const b = redTiles[j];
    const key = mapKey(a, b);
    areaMap.set(key, { a, b, area: calculateArea({ a, b }) });
  }
}

const sortedAreaKeys = Array.from(areaMap.keys()).sort((a, b) => areaMap.get(b).area - areaMap.get(a).area);

const largestArea = areaMap.get(sortedAreaKeys[0]);

console.log(`largest rectangle from ${JSON.stringify(largestArea)} - area: ${largestArea.area}`);
console.log(`2nd largest rectangle from ${JSON.stringify(areaMap.get(sortedAreaKeys[1]))} - area: ${areaMap.get(sortedAreaKeys[1]).area}`);


// ################ B ###############

function preprocessVerticalEdges(vertices) {
  const edges = [];

  for (let i = 0; i < vertices.length; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % vertices.length];

    if (v1.x === v2.x) {
      const y1 = Math.min(v1.y, v2.y);
      const y2 = Math.max(v1.y, v2.y);
      edges.push({ x: v1.x, y1, y2 });
    }
  }

  // Sort for binary-searchable scanline lookup
  edges.sort((a, b) => a.y1 - b.y1);

  return edges;
}

const pointInOrthoPolygonFast = (px, py, edges) => {
  let inside = false;

  // Binary search to find first edge whose y2 >= py
  let lo = 0, hi = edges.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (edges[mid].y2 < py) lo = mid + 1;
    else hi = mid;
  }

  // Scan from here until edges no longer overlap py
  for (let i = lo; i < edges.length && edges[i].y1 <= py; i++) {
    const e = edges[i];

    if (py >= e.y1 && py < e.y2 && px < e.x) {
      inside = !inside;
    }
  }

  return inside;
};

const verticalEdges = preprocessVerticalEdges(redTiles);

console.log(`${new Date()}: start testing total of ${sortedAreaKeys.length} areas.`);

for (let i = 0; i < sortedAreaKeys.length; i++) {
  const area = areaMap.get(sortedAreaKeys[i]);
  const { a, b } = area;

  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);

  console.log(`${new Date()}: testing box with area of ${area.area}`);

  let inside = true;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      inside = pointInOrthoPolygonFast(x, y, verticalEdges);
      if (!inside) {
        break;
      }
    }
  }
  if (inside) {
    console.log(`${new Date()}: first that fits: ${area.area}`);
    process.exit(0);
  }
  console.log(`${new Date()}: tested ${i} boxes`);
}

