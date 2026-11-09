# WEB802 — Module 3, Week 2 (Fall 2026, Session 2)

Coursework for **WEB802/262-ET3-A — Online + Florida — Fall 2026 — Session 2 — Professor Khatmi**
(course id `32063` on GAP), week of **2 November – 8 November 2026**.

Topic: **MongoDB → JavaScript ES6**.

Same layout as `web802-week1`: one folder per GAP dropbox.

| # | GAP dropbox | Folder |
|---|---|---|
| 1 | Week 2 Day 1 In-Class Exercise | `01-d1-exercise-mongodb/` |
| 2 | Week 2 Day 1 Homework | `02-d1-homework-mongodb/` |
| 3 | Week 2 Day 2 In-Class Exercise | — CodePen forks, no folder (see below) |
| 4 | Week 2 Day 2 Homework | — CodePen forks, no folder (see below) |
| 5 | Week 2 Day 3 Assignment | ⚠️ not published on GAP (see below) |
| 6 | Week 2 Day 3 Homework | `03-d3-homework-es6-conversion/` |

`SUBMISSION.md` has the exact links to paste into GAP. Each folder has its own `README.md`
describing what the assignment asked and how to run it.

## Requirements

- **Node.js 18+ and npm**
- **MongoDB** for folders 01 and 02, running on `mongodb://localhost:27017`

```bash
# Linux / WSL
sudo systemctl start mongod
# macOS
brew services start mongodb-community
# Windows
mongod                              # keep the window open
```

```bash
cd 01-d1-exercise-mongodb   # or 02-d1-homework-mongodb
npm install
npm start
```

Folder `03` needs no database:

```bash
cd 03-d3-homework-es6-conversion
npm install
npm test          # differential ES5-vs-ES6 check in jsdom
```

Nothing depends on the other folders — every project is self contained.

## Day 2 has no folder, on purpose

The Day 2 exercises and homework are 41 CodePens, not repositories. The deck says: open
each pen, **fork** it into your own CodePen account, activate the lines the slide asks
for, and submit the fork URLs. Instructor sources are pulled offline for reference in the
Google Drive copy (`week2/codepens/`), but forking has to happen in your own account, so
there is nothing to commit here. Submission is 28 links for the exercise and 13 for the
homework.

## Day 3 assignment is missing from GAP

The Day 3 *Lab Assignment* and *Project 2* items appear in the course as empty labels —
the resources behind them (cmids 2137923, 2137925, 2137927, 2137928) all redirect away, and
the section dropped from 45 items to 41 between 1 and 8 November. Dropbox 5 still asks for
"GitHub URL with commit #2", so it presumes work that was never published. Raised with the
instructor; only the Day 3 *homework* is in this repo.

## Environment everything was verified on

- Ubuntu 26.04 (WSL), Node v24.20.0, `mongodb` driver 7.8.0
- MongoDB Community Server 9.0.4, `systemctl enable --now mongod`, `127.0.0.1:27017`
- Every console message cross-checked against the PDF slides in `GAP week 2`
