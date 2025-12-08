const fs = require('fs');
const data = fs.readFileSync('input.txt', 'utf8');

const boxes = data.split('\n').map(box => {
  const [x, y, z] = box.split(',');
  return {
    x, y, z
  }
});

const distanceMap = new Map();

const calculateDistance = (a, b) => {
  const dx = Math.pow(b.x - a.x, 2);
  const dy = Math.pow(b.y - a.y, 2);
  const dz = Math.pow(b.z - a.z, 2);
  return Math.sqrt(dx + dy + dz);
}

const distanceKey = (a, b) => {
  const keyArray = [a, b];
  keyArray.sort((a, b) => {
    if (a.x !== b.x) {
      return a.x - b.x;
    }
    if (a.y !== b.y) {
      return a.y - b.y;
    }
    return a.z - b.z;
  });
  return `(${keyArray[0].x},${keyArray[0].y},${keyArray[0].z})-(${keyArray[1].x},${keyArray[1].y},${keyArray[1].z})`;
}

for (let i = 0; i < boxes.length-1; i++) {
  const a = boxes[i];
  for (let j = i+1; j < boxes.length; j++) {
    const b = boxes[j];
    distanceMap.set(distanceKey(a, b), { a, b, distance: calculateDistance(a, b) });
  }
}

const distanceKeys = Array.from(distanceMap.keys());
distanceKeys.sort((a, b) => {
  return distanceMap.get(a).distance - distanceMap.get(b).distance;
});

const circuits = [];

const connectToCircuits = (distance, key) => {
  if (!distance.a.circuit && !distance.b.circuit) {
    const circuitId = circuits.length;
    distance.a.circuit = circuitId;
    distance.b.circuit = circuitId;
    circuits.push([distance.a, distance.b]);
  } else if (distance.a.circuit && distance.b.circuit && distance.a.circuit === distance.b.circuit) {
    // do nothing, they are in same circuit already
  } else if (distance.a.circuit && distance.b.circuit && distance.a.circuit !== distance.b.circuit) {
    // merge circuits
    const newCircuit = distance.a.circuit;
    const oldCircuit = distance.b.circuit;
    circuits[oldCircuit].forEach((box) => {
      box.circuit = newCircuit;
      circuits[newCircuit].push(box);
    });
    circuits[oldCircuit] = [];
  } else {
    // one of them is not connected and other is, connect unconnected
    if (distance.a.circuit) {
      distance.b.circuit = distance.a.circuit;
      circuits[distance.a.circuit].push(distance.b);
    } else {
      distance.a.circuit = distance.b.circuit;
      circuits[distance.a.circuit].push(distance.a);
    }
  }
  if (circuits.filter(circuit => circuit.length === 1000).length === 1) {
    console.log(`(result to b): all connected to single circuit - last connection: ${key} - multiplication = ${distance.a.x * distance.b.x}`);
    return true;
  }
  return false;
}

for (let i = 0; i < 1000; i++) {
  const distance = distanceMap.get(distanceKeys[i]);
  // console.log(`dealing with distance ${JSON.stringify(distance)}`);
  connectToCircuits(distance, distanceKeys[i]);
}

const aCircuits = [...circuits];
aCircuits.sort((a, b) => b.length - a.length);

let aTotal = 1;
for (let i = 0; i < 3; i++) {
  aTotal *= aCircuits[i].length;
}

console.log(`result to a: ${aTotal}`);

// should be able to continue from start
for (let i = 0; i < distanceKeys.length; i++) {
  const distance = distanceMap.get(distanceKeys[i]);
  const allConnected = connectToCircuits(distance, distanceKeys[i]);
  if (allConnected) {
    break;
  }
}


