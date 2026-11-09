# m3-w2-d3-homework — `game_hwk.js` converted to ES6

WEB802/262-ET3-A, Module 3 Week 2 Day 3 homework.

> "Open `game_hwk.js`. Notice there are scripts already written. Your task is to
> convert **all** the functions and variable declarations to ES6."

`game_hwk.js` is the converted file. `game_hwk.es5.js` is the supplied original, kept
next to it so the conversion is diffable and the test suite can prove equivalence.

```bash
git diff --no-index game_hwk.es5.js game_hwk.js
```

## What was converted

| From | To | Where |
|---|---|---|
| `var` for values never reassigned | `const` | icon strings, element references, most state |
| `var` for reassigned values | `let` | `i`, `n`, `count`, `timer`, `newRGB`, `randomOrderArray` |
| 14 `function` declarations | arrow functions | every function in the file |
| `this.classList` in the click handler | `e.currentTarget.classList` | `displayTile` |
| `==` | `===` | `tileIcons.length % 2 === 0` |
| implicit globals | declared `let` | `timer` (`count = 0, timer = setInterval(...)`) and `tile` in `for (tile of tiles)` |
| `var n` in the `for` header | `let n` | `clearTiles` |
| `count = count + 1` style arithmetic | `+=` / `++` with `eslint-disable` where the original was odd | `setTiles`, `displayTile`, `clearTiles` |

### The one conversion that needed care

`displayTile` used `this`:

```js
function displayTile(e) {
    this.classList.remove("hideTile");     // `this` = the clicked tile
```

An arrow function has no `this` of its own, so a literal `function -> () =>` swap would
have thrown. The arrow form takes the same node explicitly:

```js
const displayTile = (e) => {
    const tile = e.currentTarget;          // identical node, no `this`
    tile.classList.remove('hideTile');
```

`e.currentTarget` is the element the listener is attached to, which is exactly what
`this` was. This is the only place in the file where `this` appeared.

## Proof the conversion did not change behaviour

`npm test` runs a **differential** test in jsdom: the supplied ES5 file and the converted
ES6 file are each loaded into the same 12-tile page, with the same seeded
`Math.random()` and the same click sequence (start → a mismatched pair → a matched pair →
end → the 1-second hide timer). Their observable state is then compared field by field.

```
npm install
npm test
```

35 comparisons across 5 phases — logs, per-tile icon/class/background/`guess` attribute,
`#clicks` / `#score` / `#timer`, and the start button's disabled state and label — all
identical. On top of that, eight assertions confirm the game is genuinely being
exercised (12 tiles iconised into 6 pairs, "match" and "no match" both logged, matched
tiles turn green, the start button disables and re-enables).

`test/harness.html` is a browser harness if you would rather click through it by hand —
open it directly, it loads `../game_hwk.js`.

## Two bugs in the supplied file that I deliberately did **not** fix

The task is conversion, not repair, so both versions behave exactly as the original does.
Worth knowing they are there:

**1. The move counter and score never appear on screen.** The supplied code writes into
`firstChild`, which for `<span id="clicks">0</span>` is a *Text node*, and Text nodes have
no `innerHTML`:

```js
document.getElementById("clicks").firstChild.innerHTML = clicks;   // goes nowhere
document.querySelector("#score").firstChild.innerHTML = calculatedScore;
```

The value is stored as an expando on the text node (the test prints it: `#clicks` shows
`"0"` while its `firstChild.innerHTML` is `"2"`), but the DOM never updates. One-line
fix if you want it:

```js
document.getElementById('clicks').textContent = clicks;
document.querySelector('#score').textContent = calculatedScore;
```

The timer has the same shape (`#timer.firstChild.innerText`) and the same outcome.

**2. `count = count++;`** in `startTimer` assigns the pre-increment value, so it is a
no-op; `count` only advances on the following line. Preserved as-is, with a comment,
because changing it changes the clock.

Say the word and I will ship a variant with both fixed.

## Layout

```
├── game_hwk.js          the ES6 conversion (this is the deliverable)
├── game_hwk.es5.js      the supplied original, for diffing and for the test
├── test/verify.js       differential ES5-vs-ES6 test (npm test)
├── test/harness.html    browser harness, 12 tiles + buttons
└── package.json         jsdom as a devDependency
```

## Run it in a browser

`test/harness.html` needs the Font Awesome stylesheet the icon strings refer to (it links
5.15.4 from cdnjs). The game itself is pure DOM — no build step, no framework.
