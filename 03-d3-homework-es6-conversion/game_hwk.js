/* ==========================================================================
   game_hwk.js  -  memory / matching game, ES6 version

   Week 2 Day 3 homework: "Your task is to convert all the functions and
   variable declarations to ES6."  Behaviour is unchanged - this is the same
   game as the supplied game_hwk.js, expressed with const/let, arrow functions
   and template literals.

   Two rules guided the conversion:
     * var  -> const (never reassigned) or let (reassigned)
     * function declarations -> arrow functions, EXCEPT where `this` was the
       clicked element; there the arrow takes `e.currentTarget` instead, which
       is the same node.  That is why displayTile is an arrow too - see the
       note above it.
   ========================================================================== */

/* ----------------------------------------------------- element references */

const startButton = document.getElementById('startGame');
const endButton = document.getElementById('endGame');
const tiles = document.querySelectorAll('.gametile');

/* ------------------------------------------------------------------ state */

let i = 0;                  // tile cursor used by setTiles
let clicks;                 // number of moves, used by the score
let timeScore;              // elapsed seconds, read from #timer
let count;                  // timer tick
let n = 0;                  // index of the pair currently being compared
let timer;                  // setInterval handle (was an implicit global)
let newRGB;                 // generated colour, kept for future levels
let randomOrderArray = [];  // reassigned by endGame, so `let` not `const`

/* ------------------------------------------------------------------ icons */

const football = '<i class="fas fa-football-ball"></i>';
const mask = '<i class="fas fa-ufo"></i>';
const pizza = '<i class="fas fa-pizza-slice"></i>';
const lightning = '<i class="far fa-bolt"></i>';
const bulb = '<i class="fal fa-lightbulb"></i>';
const rocket = '<i class="fas fa-rocket"></i>';
const bacteria = '<i class="fas fa-bacterium"></i>';
const kiwi = '<i class="fas fa-kiwi-bird"></i>';
const cocktail = '<i class="fas fa-cocktail"></i>';

/* ------------------------------------------------------------- game setup */

/* creates `numberOfTiles` distinct random numbers, 1..numberOfTiles */
const setRandomTileOrder = (numberOfTiles) => {
  while (randomOrderArray.length < numberOfTiles) {
    let randomNum = Math.random();
    randomNum = randomNum * (numberOfTiles - 1);
    randomNum = Math.round(randomNum) + 1;

    if (randomOrderArray.includes(randomNum)) {
      continue;
    }
    randomOrderArray.push(randomNum);
  }
};

/* writes the numbers into the tiles, then swaps each number for an icon */
const setTiles = () => {
  for (const tile of tiles) {
    tile.innerHTML = randomOrderArray[i];
    i += 1;

    // replace numerical values with icon pairs
    if (tile.innerText < 3) {
      tile.innerHTML = rocket;
      tile.setAttribute('icon', 'rocket');
    } else if (tile.innerHTML < 5) {
      tile.innerHTML = bacteria;
      tile.setAttribute('icon', 'bacteria');
    } else if (tile.innerHTML < 7) {
      tile.innerHTML = cocktail;
      tile.setAttribute('icon', 'cocktail');
    } else if (tile.innerHTML < 9) {
      tile.innerHTML = football;
      tile.setAttribute('icon', 'football');
    } else if (tile.innerHTML < 11) {
      tile.innerHTML = pizza;
      tile.setAttribute('icon', 'pizza');
    } else if (tile.innerHTML < 13) {
      tile.innerHTML = kiwi;
      tile.setAttribute('icon', 'kiwi');
    } else {
      console.log('Error: too many tiles');
    }
  }
};

/* ---------------------------------------------------------------- scoring */

/* starts the timer; clears any running one first so a restart is safe */
const startTimer = () => {
  clearInterval(timer);
  count = 0;
  // `count = count++` is preserved from the supplied file on purpose: it
  // assigns the pre-increment value, so `count` only advances on the next
  // line.  Fixing it would change the game's timing, which is not this task.
  timer = setInterval(() => {
    count = count++;                                            // eslint-disable-line no-plusplus
    document.getElementById('timer').firstChild.innerText = count++; // eslint-disable-line no-plusplus

    // stop at 60 seconds and show "Game Over"
    if (count === 60) {
      clearInterval(timer);
      document.getElementById('timer').firstChild.innerText = 'Game Over';
    }
  }, 1000);
};

const countMoves = () => {
  clicks = n;
  document.getElementById('clicks').firstChild.innerHTML = clicks;
};

const calculateScore = () => {
  timeScore = parseInt(timeScore, 10);
  const calculatedScore = timeScore + clicks;
  console.log(calculatedScore);
  document.querySelector('#score').firstChild.innerHTML = calculatedScore;
};

/* ------------------------------------------------------------ tile clicks */

const tileIcons = [];
const tileIds = [];
let tileIcon;
const selectedTile = '';

/* Reveals the tile, records its icon and id, and compares pairs.
   `this` in the supplied version was the clicked tile, so the arrow form takes
   e.currentTarget - identical node, valid ES6, no reliance on `this`. */
const displayTile = (e) => {
  const tile = e.currentTarget;

  // reveal tile: change background and font size
  tile.classList.remove('hideTile');
  tile.classList.add('displayTile');

  // log the value of the tile's icon and id
  tileIcon = e.target.getAttribute('icon');
  tileIcons.push(tileIcon);
  const tileId = e.target.getAttribute('id');
  tileIds.push(tileId);

  countMoves();

  if (tileIcons.length % 2 === 0) {
    checkMatch(tileIcons, tileIds, n);
    n += 2;
  }
};

const checkMatch = (tileIcons, tileIds, n) => {
  console.log(n);
  console.log(n + 1);
  if (tileIcons[n] !== tileIcons[n + 1]) {
    console.log('no match');
    setTimeout(() => {
      document.getElementById(tileIds[n + 1]).classList.remove('displayTile');
      document.getElementById(tileIds[n]).classList.remove('displayTile');
    }, 1000);
  } else {
    console.log('match');
    console.log(n);
    document.getElementById(tileIds[n]).style.backgroundColor = 'green';
    document.getElementById(tileIds[n + 1]).style.backgroundColor = 'green';
    document.getElementById(tileIds[n]).setAttribute('guess', 'correct');
    document.getElementById(tileIds[n + 1]).setAttribute('guess', 'correct');
    document.getElementById(tileIds[n]).removeEventListener('click', displayTile);
    document.getElementById(tileIds[n + 1]).removeEventListener('click', displayTile);
  }
};

/* ------------------------------------------------------------ game phases */

const resetTiles = () => {
  for (const tile of tiles) {
    tile.style.backgroundColor = '#44445a';
    tile.removeAttribute('state');
    tile.classList.remove('hideTile');
    tile.classList.remove('displayTile');
  }
};

/* Clear tiles when a new game is started */
const clearTiles = () => {
  for (let n = 0; n < tiles.length; n += 1) {
    tiles[n].style.fontSize = '0em';
    tiles[n].style.backgroundColor = '#44445a';
  }
};

/* starts the game: wire the tiles, reset the board, start the clock */
const startGame = () => {
  tiles.forEach((tile) => tile.addEventListener('click', displayTile));
  resetTiles();
  startButton.disabled = true;
  console.log(randomOrderArray);
  startTimer();
};

/* stops the game, freezes the clock and scores it */
const endGame = () => {
  const endTimer = () => {
    timeScore = document.getElementById('timer').innerText;
    console.log(timeScore);
    clearInterval(timer);
  };

  randomOrderArray = [];
  startButton.innerText = 'New Game';
  startButton.disabled = false;
  endTimer();
  calculateScore();
};

/* ------------------------------------------------- additional difficulty */

/* random 0-255 channel value */
const generateRandomColor = () => {
  let r = Math.random();
  r *= 255;
  r = Math.round(r);
  return r;
};

/* builds an `rgb(r,g,b)` string for future difficulty levels */
const generateRGBVal = () => {
  const rgbValue = [];
  for (let i = 0; i <= 2; i += 1) {
    const singleVal = generateRandomColor();
    rgbValue.push(singleVal);
  }
  newRGB = `rgb(${rgbValue[0]},${rgbValue[1]},${rgbValue[2]})`;
  return newRGB;
};

/* --------------------------------------------------------------- lifecycle */

tiles.forEach((tile) => tile.addEventListener('click', displayTile));

startButton.addEventListener('click', startGame);
endButton.addEventListener('click', endGame);

window.onload = () => {
  console.log('Page Loaded');
  setRandomTileOrder(12);
  setTiles();
};

/* additional iterations / future development
   - publish leaderboard
   - use an API to generate random icons or pictures */
