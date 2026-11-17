const { MongoClient } = require('mongodb');
const { readSecret } = require('./config/secrets');

// All connection details come from the environment so there is a single source
// of truth (see .env / .env.example). The password uses the same file-secret
// convention as the rest of the app via readSecret, so it can be supplied as a
// raw value locally (MONGO_PASSWORD) or a mounted file in production
// (MONGO_PASSWORD_FILE, e.g. a Docker secret).
const host = process.env.MONGO_HOST || 'localhost:27017';
const dbName = process.env.MONGO_DB || 'startup';
const userName = process.env.MONGO_USERNAME || 'root';

let client;
let db;

function buildUrl() {
  const password = readSecret('MONGO_PASSWORD');
  const user = encodeURIComponent(userName);
  const pass = encodeURIComponent(password);
  return `mongodb://${user}:${pass}@${host}/?authSource=admin`;
}

// Connect once and reuse the same client/db for the life of the process.
async function connect() {
  if (db) return db;
  client = new MongoClient(buildUrl());
  await client.connect();
  db = client.db(dbName);
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not connected. Call connect() first.');
  return db;
}

// Collection accessors keep collection names in one place.
const collections = {
  users: () => getDb().collection('users'),
  notes: () => getDb().collection('notes'),
};

function getUser(email) {
  if (!email) return null;
  return collections.users().findOne({ email: email });
}

function getUserByToken(token) {
  if (!token) return null;
  return collections.users().findOne({ token: token });
}

async function addUser(user) {
  await collections.users().insertOne(user);
}

async function updateUser(user) {
  await collections.users().updateOne({ email: user.email }, { $set: user });
}

async function addNote(note) {
  return collections.notes().insertOne(note);
}

function getNotes(owner) {
  return collections.notes()
    .find({ owner: owner }, { projection: { _id: 0, owner: 0 } }) // remove owner and id from results
    .sort({ createdAt: -1 })  // newest first
    .toArray();
}

// Verify connectivity (used by the db:ping script and health checks).
async function ping() {
  const database = await connect();
  await database.command({ ping: 1 });
  return true;
}

async function close() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}

module.exports = {
  connect,
  getDb,
  collections,
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addNote,
  getNotes,
  ping,
  close,
};
