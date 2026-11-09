# m3-w2-d1-exercise — Week 2 Day 1 In-Class Demo (MongoDB)

WEB802/262-ET3-A, Module 3 Week 2 Day 1. The demo deck walks through MongoDB by
building one `app.js` step by step: after each run you *deactivate* the previous step
so it does not run a second time. This repository is that demo, finished.

## Requirements

- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`

```bash
# Linux / WSL
sudo systemctl start mongod        # once; it stays up
# macOS
brew services start mongodb-community
# Windows
mongod                              # keep the window open
```

## Run

```bash
npm install
npm start                # all nine steps, in order
```

Or step by step, the way the slides do it — one step per process, so nothing runs twice:

```bash
node app.js --reset      # start from an empty database
node app.js 1            # Database created!
node app.js 2            # Collection created!
node app.js 3            # 1 document inserted
node app.js 4            # Number of documents inserted: 14
node app.js 5            # Westcliff Inc
node app.js 6            # find({ address: /^S/ })
node app.js 7            # sort({ name: 1 })
node app.js 8            # 1 document deleted
node app.js 9            # 1 document updated
```

Verify each stage in the shell (`mongosh`, in a second terminal):

```js
show dbs                 // nodemongo appears after step 2
use nodemongo
show collections         // customers
db.customers.find()
```

> The slides say `mongo`. That legacy shell was removed in MongoDB 6 — the current
> shell is **`mongosh`**, and every command above is identical.

## What each step does

| # | Step | Call | Expected message |
|---|---|---|---|
| 1 | create the database | connect to `nodemongo` | `Database created!` |
| 2 | create a collection | `db.createCollection('customers')` | `Collection created!` |
| 3 | insert one document | `insertOne({ name: 'Westcliff Inc', address: 'Irvine CA' })` | `1 document inserted` |
| 4 | insert many documents | `insertMany(<14 rows from data.txt>)` | `Number of documents inserted: 14` |
| 5 | read one | `findOne({})` | `Westcliff Inc` |
| 6 | query | `find({ address: /^S/ })` | `Richard - Sky st 331`, `Viola - Sideway 1633` |
| 7 | sort | `find({}).sort({ name: 1 })` | the 15 names, alphabetical |
| 8 | delete | `deleteOne({ name: 'Amy' })` | `1 document deleted` |
| 9 | update | `updateOne({ name: 'Richard' }, { $set: { address: 'Sky st 333' } })` | `1 document updated` |

### Two details worth knowing

**A database is not created until it has content.** Step 1 only opens a handle — the
`nodemongo` database actually springs into existence when step 2 creates its first
collection. That is why `show dbs` lists it after step 2, not after step 1.

**`insertOne` / `updateOne` / `deleteOne` report the number of documents *touched*.**
The MongoDB 7 driver (installed here) dropped callback-style API entirely, so the code
is `async`/`await`. The messages are unchanged.

## Layout

```
├── app.js         the nine steps
├── data.txt       the 14 customer records handed out with the exercise
├── transcript.txt real output of `npm start` against a local mongod
└── package.json
```

`transcript.txt` is the actual terminal output, for reference.
