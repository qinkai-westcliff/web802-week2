# m3-w2-d1-homework — Week 2 Day 1 Homework (MongoDB)

WEB802/262-ET3-A, Module 3 Week 2 Day 1. Eight tasks against a `statsdb` database and a
`uscensus` collection, starting from the six census records shipped in
`wk2-day1-homework.zip`.

## Requirements

- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

```bash
sudo systemctl start mongod        # Linux / WSL
brew services start mongodb-community   # macOS
mongod                              # Windows
```

## Run

```bash
npm install
npm start                # all eight tasks, in order
```

Task by task — each in its own process, so nothing is inserted twice. This is also how
the screenshots in `screenshots/` were produced:

```bash
node app.js --reset      # empty database
node app.js 1            # Database created!
node app.js 2            # Collection created!
node app.js 3            # Number of documents inserted: 6
node app.js 4            # Number of documents inserted: 2
node app.js 5            # Corona, NY zip code: 11368
node app.js 6            # income for all California cities
node app.js 7            # 1 document updated
node app.js 8            # sorted ascending by state
```

## The eight tasks

| # | Task | Output |
|---|---|---|
| 1 | Create a database `statsdb` | `Database created!` |
| 2 | Create a collection `uscensus` | `Collection created!` |
| 3 | Add the given data | `Number of documents inserted: 6` |
| 4 | Add `Pacoima 91331 CA 60360 33` and `Ketchikan 99950 AK 00000 00` | `Number of documents inserted: 2` |
| 5 | Find the zip code for Corona, NY | `Corona, NY zip code: 11368` |
| 6 | Find the income for all cities in California | 3 cities: Los Angeles `$36954`, Norwalk `$66453`, Pacoima `$60360` |
| 7 | Update income and age for Alaska to `38910` and `46` | `1 document updated` → Ketchikan, AK |
| 8 | Sort records in ascending order by state ( `1` = asc, `-1` = desc ) | the 8 records, AK → TX |

Screenshots for each task are in `screenshots/1.png` … `screenshots/8.png`, named by task
number as the homework asks. They were rendered from the real terminal output of each
run; the raw text of every one is in `run-output/taskN.txt` if you would rather paste the
text, or re-run the command and take your own shot.

## Notes on the data

- The supplied records store `income` and `age` as **strings** (`'34781'`, `'44'`), so
  task 7 writes `'38910'` and `'46'` as strings too, keeping the collection consistent.
  Cast to numbers only if a later assignment needs arithmetic.
- `Corona, NY` already exists in the given data, so task 5 is a lookup rather than an
  insert.
- Task 6's slide shows the regex form as a hint (`{ address: /^S/ }` — matches every
  value *starting with* "S"). Since the filter here is on `state`, a plain equality
  query `{ state: 'CA' }` is equivalent; the regex form `{ state: /^CA$/ }` is also
  noted in the code. Either way three California cities match, including Pacoima, which
  only becomes a California city after task 4 — so **task 6 must run after task 4**.
- There is no Alaska record until task 4 inserts Ketchikan, which is why task 7 updates
  by `{ state: 'AK' }`.

## Layout

```
├── app.js                 the eight tasks (given data preserved at the top)
├── screenshots/1-8.png    terminal capture per task
├── run-output/task1-8.txt raw text of the same runs
└── package.json
```

## Shell check

```js
show dbs                 // statsdb
use statsdb
db.uscensus.countDocuments()   // 8
db.uscensus.find().sort({ state: 1 })
```
