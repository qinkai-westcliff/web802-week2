// WEB802 Module 3 - Week 2 Day 1
// In-Class Demo: MongoDB from Node.js
//
//   node app.js            run all nine steps in order
//   node app.js 4          run step 4 only (this is what the slides do: the
//                          previous step is "deactivated" so it does not run twice)
//   node app.js --reset    drop the database and start over
//
// Every console message below is the exact message the slide deck expects.

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'nodemongo';
const COLLECTION = 'customers';

// data.txt holds bare object literals, one per line - wrap them in [] for an array
function readData() {
  const raw = fs.readFileSync(path.join(__dirname, 'data.txt'), 'utf8').trim();
  return eval('[' + raw.replace(/,\s*$/, '') + ']'); // eslint-disable-line no-eval
}

/* ------------------------------------------------------------------ steps */

// 1. create the database
async function createDatabase(db) {
  // Connecting only gives us a database *handle*. MongoDB creates the database
  // the moment it first holds a collection - so this message is printed here and
  // the database is verified in the shell right after step 2.
  console.log('Database created!');
}

// 2. create a collection
async function createCollection(db) {
  await db.createCollection(COLLECTION);
  console.log('Collection created!');
}

// 3. insert a single document
async function insertOne(db) {
  const res = await db.collection(COLLECTION).insertOne({
    name: 'Westcliff Inc',
    address: 'Irvine CA',
  });
  // the v7 driver's insertOne result carries insertedId, not a count
  console.log(`${res.acknowledged ? 1 : 0} document inserted`);
}

// 4. insert many documents (the 14 rows from data.txt)
async function insertMany(db) {
  const res = await db.collection(COLLECTION).insertMany(readData());
  console.log(`Number of documents inserted: ${res.insertedCount}`);
}

// 5. findOne()
async function findOne(db) {
  const result = await db.collection(COLLECTION).findOne({});
  console.log(result.name);
}

// 6. find() with a query object - first argument limits the search
async function findWithQuery(db) {
  const cursor = db.collection(COLLECTION).find({ address: /^S/ });
  for await (const doc of cursor) console.log(`${doc.name} - ${doc.address}`);
}

// 7. sort() - 1 = ascending, -1 = descending
async function sortDocuments(db) {
  const cursor = db.collection(COLLECTION).find({}).sort({ name: 1 });
  for await (const doc of cursor) console.log(doc.name);
}

// 8. deleteOne()
async function deleteOne(db) {
  const res = await db.collection(COLLECTION).deleteOne({ name: 'Amy' });
  console.log(`${res.deletedCount} document deleted`);
}

// 9. updateOne() - only the first match is updated
async function updateOne(db) {
  const res = await db.collection(COLLECTION).updateOne(
    { name: 'Richard' },
    { $set: { address: 'Sky st 333' } }
  );
  console.log(`${res.modifiedCount} document updated`);
}

const STEPS = [
  ['create the database', createDatabase],
  ['create the collection', createCollection],
  ['insert one document', insertOne],
  ['insert many documents', insertMany],
  ['findOne', findOne],
  ['find with a query', findWithQuery],
  ['sort', sortDocuments],
  ['deleteOne', deleteOne],
  ['updateOne', updateOne],
];

/* ------------------------------------------------------------------- main */

(async () => {
  const arg = process.argv[2];
  const client = await MongoClient.connect(MONGO_URL);
  const db = client.db(DB_NAME);

  try {
    if (arg === '--reset') {
      await db.dropDatabase();
      console.log(`database ${DB_NAME} dropped`);
      return;
    }

    const only = arg ? Number(arg) : null;
    if (arg && (!Number.isInteger(only) || only < 1 || only > STEPS.length)) {
      console.error(`usage: node app.js [1-${STEPS.length} | --reset]`);
      process.exitCode = 2;
      return;
    }

    for (const [i, [label, fn]] of STEPS.entries()) {
      const n = i + 1;
      if (only && n !== only) continue;
      if (!only) console.log(`--- step ${n}: ${label} ---`);
      await fn(db);
    }
  } finally {
    await client.close();
  }
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
