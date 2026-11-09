/* Differential test for game_hwk.js.
 *
 *   npm install
 *   npm test
 *
 * The task was to convert game_hwk.js to ES6 *without changing behaviour*, so
 * the honest test is not "does the game work" but "does the ES6 version behave
 * identically to the supplied ES5 version".  Both files are loaded into the same
 * jsdom scenario with the same seeded Math.random(), the same clicks, and their
 * observable state is compared field by field.
 *
 * game_hwk.es5.js is the supplied file, kept so this comparison stays runnable.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ES6 = fs.readFileSync(path.join(__dirname, '..', 'game_hwk.js'), 'utf8');
const ES5 = fs.readFileSync(path.join(__dirname, '..', 'game_hwk.es5.js'), 'utf8');

const TILES = Array.from({ length: 12 }, (_, i) =>
  `<button class="gametile hideTile" id="t${i + 1}"></button>`).join('\n');

const HTML = `<!DOCTYPE html><html><body>
  <div id="board">${TILES}</div>
  <button id="startGame">Start Game</button>
  <button id="endGame">End Game</button>
  <div>Timer: <span id="timer">0</span></div>
  <div>Moves: <span id="clicks">0</span></div>
  <div>Score: <span id="score">0</span></div>
</body></html>`;

// deterministic PRNG so both runs see the same "random" tile order
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function snapshot(win, logs) {
  const doc = win.document;
  const tile = (t) => ({
    id: t.getAttribute('id'),
    icon: t.getAttribute('icon'),
    guess: t.getAttribute('guess'),
    cls: t.className,
    bg: t.style.backgroundColor,
  });
  const cell = (id) => {
    const el = doc.getElementById(id);
    const text = el.textContent.trim();
    const fc = el.firstChild;
    return {
      text,
      // the script writes into el.firstChild.innerHTML / .innerText, which are
      // expando properties on a Text node - capture them so drift shows up
      childInnerHTML: fc && typeof fc === 'object' ? String(fc.innerHTML ?? '') : '',
      childInnerText: fc && typeof fc === 'object' ? String(fc.innerText ?? '') : '',
    };
  };
  return {
    logs,
    tiles: [...doc.querySelectorAll('.gametile')].map(tile),
    clicks: cell('clicks'),
    score: cell('score'),
    timer: cell('timer'),
    startDisabled: doc.getElementById('startGame').disabled,
    startText: doc.getElementById('startGame').textContent.trim(),
  };
}

async function run(scriptText, label) {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', pretendToBeVisual: true });
  const { window: win } = dom;
  const doc = win.document;

  win.Math.random = mulberry32(1337);          // same tile order every run

  // jsdom has no HTMLElement.innerText; give it browser-like semantics so the
  // `tile.innerText < 3` branch is exercised the way a real browser would
  Object.defineProperty(win.Element.prototype, 'innerText', {
    configurable: true,
    get() { return this.textContent; },
    set(v) { this.textContent = v; },
  });

  const logs = [];
  win.console = { ...console, log: (...a) => logs.push(a.map(String).join(' ')) };

  const el = doc.createElement('script');
  el.textContent = scriptText;
  doc.body.appendChild(el);
  win.dispatchEvent(new win.Event('load'));

  const click = (node) => node.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));
  const tiles = () => [...doc.querySelectorAll('.gametile')];

  const states = {};
  states.afterLoad = snapshot(win, [...logs]);

  click(doc.getElementById('startGame'));
  states.afterStart = snapshot(win, [...logs]);

  // a mismatched pair: first tile of two different icon groups
  const groups = new Map();
  for (const t of tiles()) groups.set(t.getAttribute('icon'), [...(groups.get(t.getAttribute('icon')) || []), t]);
  const gi = [...groups.values()];
  click(gi[0][0]);
  click(gi[1][0]);
  states.afterMismatch = snapshot(win, [...logs]);

  // a matched pair
  click(gi[2][0]);
  click(gi[2][1]);
  states.afterMatch = snapshot(win, [...logs]);

  // end the game with a non-zero timer, to score it
  doc.getElementById('timer').textContent = '7';
  click(doc.getElementById('endGame'));
  states.afterEnd = snapshot(win, [...logs]);

  await new Promise((r) => setTimeout(r, 1300));   // let the 1s hide-timer fire
  states.afterHideTimer = snapshot(win, [...logs]);

  win.close();
  return { label, states, groups: [...groups.entries()].map(([k, v]) => [k, v.length]) };
}

(async () => {
  const a = await run(ES5, 'ES5 (supplied)');
  const b = await run(ES6, 'ES6 (converted)');

  let failures = 0;
  const check = (label, ok, extra = '') => {
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !extra ? '' : `  <- ${extra}`}`);
    if (!ok) failures += 1;
  };

  console.log('\ndifferential: ES5 supplied vs ES6 converted');
  for (const name of Object.keys(a.states)) {
    const sa = a.states[name];
    const sb = b.states[name];
    for (const field of Object.keys(sa)) {
      const ja = JSON.stringify(sa[field]);
      const jb = JSON.stringify(sb[field]);
      check(`${name}.${field} identical`, ja === jb, `${ja} vs ${jb}`);
    }
  }

  console.log('\nbehaviour actually exercised (from the ES5 run, both are identical)');
  const L = a.states.afterLoad.logs;
  check('window.onload ran', L.includes('Page Loaded'));
  check('12 tiles got an icon', a.states.afterLoad.tiles.filter((t) => t.icon).length === 12,
    `${a.states.afterLoad.tiles.filter((t) => t.icon).length}/12`);
  check('icons come in 6 pairs', a.groups.length === 6 && a.groups.every(([, n]) => n === 2),
    JSON.stringify(a.groups));
  check('mismatch logged', a.states.afterMismatch.logs.includes('no match'));
  check('match logged', a.states.afterMatch.logs.includes('match'));
  check('matched tiles turned green',
    a.states.afterMatch.tiles.some((t) => t.bg === 'green'));
  check('start button disabled on start', a.states.afterStart.startDisabled === true);
  check('start button re-enabled at end', a.states.afterEnd.startDisabled === false);

  console.log('\nknown quirks of the supplied file, preserved by both versions');
  const clicks = a.states.afterMatch.clicks;
  const score = a.states.afterEnd.score;
  console.log(`  #clicks text is "${clicks.text}" with firstChild.innerHTML expando "${clicks.childInnerHTML}"`);
  console.log(`  #score  text is "${score.text}" with firstChild.innerHTML expando "${score.childInnerHTML}"`);
  console.log('  both write into firstChild (a Text node), so the on-screen counter never renders.');
  console.log('  That is a bug in the supplied file, not in the conversion - see README.');

  console.log(failures === 0 ? '\nall checks passed' : `\n${failures} check(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
})();
