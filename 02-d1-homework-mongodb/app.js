// WEB802 Module 3 - Week 2 Day 1 Homework
// m3-w2-d1-homework: create a database, a collection, insert, query, update, sort.
//
//   node app.js            run all eight tasks in order
//   node app.js 5          run task 5 only (the slides: "deactivate script(s) of a
//                          previous task before moving on to the next one", and take a
//                          screenshot of each task's message)
//   node app.js --reset    drop the database and start over
//
// The `stats` array below is the starter data shipped with the homework.

const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'statsdb';
const COLLECTION = 'uscensus';

// ---------------------------------------------------------------------------
// given data (exactly as supplied in app.js of wk2-day1-homework.zip)
// ---------------------------------------------------------------------------
const stats = [
  {
    'city': 'San Juan',
    'zip': '00926',
    'state': 'PR',
    'income': '34781',
    'age': '44'
  },
  {
    'city': 'Corona',
    'zip': '11368',
    'state': 'NY',
    'income': '50797',
    'age': '32'
  },
  {
    'city': 'Chicago',
    'zip': '60629',
    'state': 'IL',
    'income': '42019',
    'age': '31'
  },
  {
    'city': 'El Paso',
    'zip': '79936',
    'state': 'TX',
    'income': '54692',
    'age': '31'
  },
  {
    'city': 'Los Angeles',
    'zip': '90011',
    'state': 'CA',
    'income': '36954',
    'age': '28'
  },
  {
    'city': 'Norwalk',
    'zip': '90650',
    'state': 'CA',
    'income': '66453',
    'age': '35'
  }
];

// task 4 asks for these two extra records
const extra = [
  { 'city': 'Pacoima', 'zip': '91331', 'state': 'CA', 'income': '60360', 'age': '33' },
  { 'city': 'Ketchikan', 'zip': '99950', 'state': 'AK', 'income': '00000', 'age': '00' }
];

/* ------------------------------------------------------------------ tasks */

// 1. create a database called statsdb
async function task1(db) {
  // MongoDB creates the database with its first collection (task 2), so we just
  // open the handle here and report it, exactly like the Day 1 demo.
  console.log('Database created!');
  console.log(`  database: ${DB_NAME}`);
}

// 2. create a collection called uscensus
async function task2(db) {
  await db.createCollection(COLLECTION);
  console.log('Collection created!');
  console.log(`  collection: ${DB_NAME}.${COLLECTION}`);
}

// 3. add the given data to the collection
async function task3(db) {
  const res = await db.collection(COLLECTION).insertMany(stats);
  console.log(`Number of documents inserted: ${res.insertedCount}`);
}

// 4. add the two extra records
async function task4(db) {
  const res = await db.collection(COLLECTION).insertMany(extra);
  console.log(`Number of documents inserted: ${res.insertedCount}`);
  for (const doc of extra) console.log(`  inserted: ${doc.city}, ${doc.state}`);
}

// 5. find out the zip code for Corona, NY
async function task5(db) {
  const doc = await db.collection(COLLECTION).findOne({ city: 'Corona', state: 'NY' });
  console.log(`Corona, NY zip code: ${doc.zip}`);
}

// 6. find out the income for all cities in California
async function task6(db) {
  // The slide's hint shows the regex form ( { address: /^S/ } - fields starting with
  // "S" ). Here the filter is on the state field, so an equality query does the job:
  const query = { state: 'CA' };
  // regex equivalent, for reference:  { state: /^CA$/ }
  const docs = await db.collection(COLLECTION).find(query).toArray();
  console.log(`Income for all cities in California (${docs.length} cities):`);
  for (const doc of docs) console.log(`  ${doc.city.padEnd(12)} $${doc.income}`);
}

// 7. update the income and age for Alaska: 38910 and 46
async function task7(db) {
  const res = await db.collection(COLLECTION).updateOne(
    { state: 'AK' },
    { $set: { income: '38910', age: '46' } }
  );
  const doc = await db.collection(COLLECTION).findOne({ state: 'AK' });
  console.log(`1 document updated (matched ${res.matchedCount})`);
  console.log(`  ${doc.city}, ${doc.state} -> income ${doc.income}, age ${doc.age}`);
}

// 8. sort records in ascending order by state
async function task8(db) {
  //  1 = ascending, -1 = descending
  const docs = await db.collection(COLLECTION).find({}).sort({ state: 1 }).toArray();
  console.log('Records sorted in ascending order by state:');
  for (const doc of docs) {
    console.log(`  ${doc.state}  ${doc.city.padEnd(12)} ${doc.zip}  $${doc.income}  age ${doc.age}`);
  }
}

const TASKS = [
  ['create database statsdb', task1],
  ['create collection uscensus', task2],
  ['add the given data', task3],
  ['add Pacoima and Ketchikan', task4],
  ['zip code for Corona, NY', task5],
  ['income for all cities in California', task6],
  ['update income and age for Alaska', task7],
  ['sort ascending by state', task8],
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
    if (arg && (!Number.isInteger(only) || only < 1 || only > TASKS.length)) {
      console.error(`usage: node app.js [1-${TASKS.length} | --reset]`);
      process.exitCode = 2;
      return;
    }

    for (const [i, [label, fn]] of TASKS.entries()) {
      const n = i + 1;
      if (only && n !== only) continue;
      if (!only) console.log(`--- task ${n}: ${label} ---`);
      await fn(db);
    }
  } finally {
    await client.close();
  }
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
