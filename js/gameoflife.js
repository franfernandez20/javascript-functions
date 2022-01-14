function seed(...arg) {
  return arg
}

function same([x, y], [j, k]) {
  return x === j && y === k
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  const [x, y] = cell
  return this.some(cell => same(cell, [x, y]))
}

const result = contains.bind([
  [1, 2],
  [3, 4],
  [4, 4]
])([7, 4]);

console.log("result", result)

const printCell = (cell, state) => {
  return contains.call(state, cell) ? '\u25A3' : '\u25A2'
};

const corners = (state = []) => {
  let topRight = [0, 0]
  let bottomLeft = state.length === 0 
    ? [0, 0]
    : Array.from(state[0])
  state.forEach(([x, y]) => {
    if (x > topRight[0]) topRight[0] = x
    if (y > topRight[1]) topRight[1] = y
    if (x < bottomLeft[0]) bottomLeft[0] = x
    if (y < bottomLeft[1]) bottomLeft[1] = y
  })
  return { topRight, bottomLeft }
};

const printCells = (state) => {
  const {topRight, bottomLeft} = corners(state)
  const game = Array.from(Array(topRight[1] + 1 ), () => new Array(topRight[0] + 1).fill(''))
  for (let i = 0; i < topRight[0] + 1; i++) {
    for (let j = 0; j < game.length; j++) {
      game[j][i] = printCell([i, j], state)
    }
  }
  return game
          .map(row => row.slice(bottomLeft[0]).join(' '))
          .slice(bottomLeft[1])
          .reverse()
          .join('\n')
};

// console.log(printCells([[3,2],[2,3],[3,3],[3,4],[4,4]]))
// console.log('-----')
// console.log(printCells([
//   [3, 2],
//   [5, 2]
// ]))
// console.log('-----')
// console.log(printCells([
//   [3, 2],
//   [5, 2],
//   [3,2],[2,3],[3,3],[3,4],[4,4],
//   [8, 8]

// ]))

const getNeighborsOf = ([x, y]) => {
  const neighbors = []
  for (let i = -1; i < 2; i++) {
    for (let j = 1; j > -2; j--) {
      if (i === 0 && j === 0) continue
      neighbors.push([x + i, y + j])
    }
  }
  return neighbors
};

const getLivingNeighbors = (cell, state) => {
  return getNeighborsOf(cell).filter(neighbor => contains.call(state, neighbor))
};

// console.log(getLivingNeighbors([4, 4], [[1, 1], [2, 2], [3, 3]]))

const willBeAlive = (cell, state) => {
  const neighbors = getLivingNeighbors(cell, state)
  return (
    neighbors.length === 3 || 
    (contains.call(state, cell) && neighbors.length === 2)
  )
};

const rPentomino = [
  [3, 2],
  [2, 3],
  [3, 3],
  [3, 4],
  [4, 4]
];

const cells = [
  [2, 4],
  [3, 4],
  [4, 4],
  [2, 3],
  [3, 3], // false
  [4, 3],
  [2, 2],
  [3, 2],
  [4, 2] // false
];

const state1 = [
  // [2, 2]
  [3, 2],
  [2, 3],
  // [2, 4]
  [3, 4],
  [3, 3], // no
  [4, 4]
]


const calculateNext = (state) => {
  const { bottomLeft, topRight } = corners(state);
  let result = [];
  for (let y = topRight[1] + 1; y >= bottomLeft[1] - 1; y--) {
    for (let x = bottomLeft[0] - 1; x <= topRight[0] + 1; x++) {
      result = willBeAlive([x, y], state) ? [...result, [x, y]] : result
    }
  }
  return result;
};

// Not ready yet
const iterateRec = (state, iterations) => {
  let result = []
  if (iterations === 0) return state
  return [state, ...iterate(calculateNext(state), iterations - 1)]
};

const iterate = (state, iterations) => {
  const states = [state];
  for(let i = 0; i < iterations; i++) {
      states.push(calculateNext(states[states.length-1]));
  }
  return states;
};



const main = (pattern, iterations) => {
  const result = iterate(startPatterns[pattern], iterations);
  return result.map(state => console.log(printCells(state), '\n'))
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;