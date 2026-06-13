import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db } from 'mongodb';
import { DatabaseSchema, User, Note, Quiz, QuizAttempt, FlashcardSet, ChatSession, Activity } from '../types.js';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let mongoConnected = false;

// Ensure database directory and file exist locally
function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const freshSchema: DatabaseSchema = {
      users: [],
      notes: [],
      quizzes: [],
      quizAttempts: [],
      flashcards: [],
      chats: [],
      activities: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(freshSchema, null, 2), 'utf8');
  }
}

// Local read
function readDbFile(): DatabaseSchema {
  initializeDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data) as any;

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Database structure is not a valid JSON object');
    }

    const collections = ['users', 'notes', 'quizzes', 'quizAttempts', 'flashcards', 'chats', 'activities'] as const;
    let corrupted = false;
    for (const col of collections) {
      if (!Array.isArray(parsed[col])) {
        parsed[col] = [];
        corrupted = true;
      }
    }

    if (corrupted) {
      console.warn('NOTICE: db.json was missing required collection keys. Self-healed database structure successfully.');
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    }

    return parsed as DatabaseSchema;
  } catch (error) {
    console.error('CRITICAL: db.json parsing error or empty file. Re-initializing valid blank DB schema...', error);
    const freshSchema: DatabaseSchema = {
      users: [],
      notes: [],
      quizzes: [],
      quizAttempts: [],
      flashcards: [],
      chats: [],
      activities: []
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(freshSchema, null, 2), 'utf8');
    } catch (writeErr) {
      console.error('Failed to safely re-write db.json schema:', writeErr);
    }
    return freshSchema;
  }
}

// Local write
function writeDbFile(data: DatabaseSchema): void {
  initializeDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing local db file:', error);
  }
}

// Lazy/Background sync & connect to MongoDB
async function tryConnect(targetUri: string): Promise<boolean> {
  try {
    const tempClient = new MongoClient(targetUri, { serverSelectionTimeoutMS: 2000 });
    await tempClient.connect();
    mongoClient = tempClient;
    mongoDb = tempClient.db();
    mongoConnected = true;
    return true;
  } catch {
    return false;
  }
}

async function connectMongo() {
  let uri = process.env.MONGODB_URI;
  
  // If no URI or default placeholder is provided, let's see if we should try a local MongoDB instance
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/study_buddy';
  
  if (!uri) {
    console.log('NOTICE: MONGODB_URI is not set in environment. Checking if a local MongoDB server is running on your PC...');
    const connectedLocal = await tryConnect(defaultLocalUri);
    if (connectedLocal) {
      console.log('✅ Connected successfully to your local MongoDB server at 127.0.0.1:27017!');
      await initialSyncFromMongo();
      return;
    }
    console.log('NOTICE: No local MongoDB server detected running at 127.0.0.1:27017. Falling back to local offline JSON database at data/db.json.');
    return;
  }

  // Pre-validate URI scheme and placeholders to avoid MongoParseError
  let trimmedUri = uri.trim();
  
  // Clean up common copy-paste errors in .env
  if (trimmedUri.startsWith('MONGODB_URI=')) {
    trimmedUri = trimmedUri.replace('MONGODB_URI=', '').trim();
  }
  if (trimmedUri.startsWith('"') && trimmedUri.endsWith('"')) {
    trimmedUri = trimmedUri.slice(1, -1);
  }
  if (trimmedUri.startsWith("'") && trimmedUri.endsWith("'")) {
    trimmedUri = trimmedUri.slice(1, -1);
  }

  const hasValidScheme = trimmedUri.startsWith('mongodb://') || trimmedUri.startsWith('mongodb+srv://');
  const hasPlaceholders = trimmedUri.includes('<username>') || trimmedUri.includes('<password>') || trimmedUri.includes('YOUR_');

  if (!hasValidScheme || hasPlaceholders) {
    console.log(`NOTICE: MONGODB_URI contains placeholders or is invalid. Checking if a local MongoDB server is running on your PC...`);
    const connectedLocal = await tryConnect(defaultLocalUri);
    if (connectedLocal) {
      console.log('✅ Connected successfully to your local MongoDB server at 127.0.0.1:27017!');
      await initialSyncFromMongo();
      return;
    }
    console.log('NOTICE: MONGODB_URI was incomplete/placeholder and no local MongoDB server was found. Falling back to local offline JSON database at data/db.json.');
    return;
  }

  console.log(`Connecting to MongoDB using URI: ${trimmedUri.replace(/:([^@]+)@/, ':****@')} ...`);
  
  // Try connecting with configured URI first
  let success = await tryConnect(trimmedUri);
  
  // If fails and contains localhost, try IPv4 fallback (some local machines struggle with localhost IPv6 resolution)
  if (!success && trimmedUri.includes('localhost')) {
    const ipv4Uri = trimmedUri.replace('localhost', '127.0.0.1');
    console.log(`Connecting to localhost failed. Trying IPv4 fallback URI: ${ipv4Uri}...`);
    success = await tryConnect(ipv4Uri);
  }

  if (success) {
    console.log('✅ Successfully connected to MongoDB database!');
    await initialSyncFromMongo();
  } else {
    // Check if they have a local MongoDB running as secondary fallback
    const connectedLocal = await tryConnect(defaultLocalUri);
    if (connectedLocal) {
      console.log('✅ Configured MongoDB connection failed, but connected successfully to local MongoDB server at 127.0.0.1:27017!');
      await initialSyncFromMongo();
    } else {
      console.log('[Database] Active offline learning vault running on local fallback JSON database at data/db.json.');
      console.log('[Database] Ready. To connect a remote cluster, specify a valid MONGODB_URI in your environment credentials.');
    }
  }
}

// Merge arrays utility using individual ID as the unique key
function mergeArrays<T extends { id: string }>(localArr: T[], mongoArr: T[]): T[] {
  const map = new Map<string, T>();
  if (localArr && Array.isArray(localArr)) {
    localArr.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
  }
  if (mongoArr && Array.isArray(mongoArr)) {
    mongoArr.forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
  }
  return Array.from(map.values());
}

// Mirror all collections from Mongo to Local or vice versa
async function initialSyncFromMongo() {
  if (!mongoDb) return;
  try {
    const localDbData = readDbFile();
    const collections = ['users', 'notes', 'quizzes', 'quizAttempts', 'flashcards', 'chats', 'activities'] as const;
    const mongoData: any = {};

    for (const col of collections) {
      const records = await mongoDb.collection(col).find({}).toArray();
      mongoData[col] = records.map(r => {
        const { _id, ...clean } = r;
        return clean;
      });
    }

    // Determine if Mongo has any records
    const hasMongoData = collections.some(col => mongoData[col] && mongoData[col].length > 0);

    if (hasMongoData) {
      console.log('Merging local database cache with active remote MongoDB collections...');
      const mergedDb: DatabaseSchema = {
        users: mergeArrays(localDbData.users, mongoData.users),
        notes: mergeArrays(localDbData.notes, mongoData.notes),
        quizzes: mergeArrays(localDbData.quizzes, mongoData.quizzes),
        quizAttempts: mergeArrays(localDbData.quizAttempts, mongoData.quizAttempts),
        flashcards: mergeArrays(localDbData.flashcards, mongoData.flashcards),
        chats: mergeArrays(localDbData.chats, mongoData.chats),
        activities: mergeArrays(localDbData.activities, mongoData.activities)
      };

      writeDbFile(mergedDb);
      await writeAllToMongo(mergedDb);
      console.log('Sync finished! Both Local Cache and MongoDB are fully merged and identical.');
    } else {
      // MongoDB is completely empty (new sandbox/cluster), seed it with whatever we have in db.json
      const hasLocalData = collections.some(col => localDbData[col] && localDbData[col].length > 0);
      if (hasLocalData) {
        console.log('MongoDB cluster is empty! Seeding academic collections from existing local JSON file state...');
        await writeAllToMongo(localDbData);
      }
    }
  } catch (error) {
    console.error('Error during database initial sync from MongoDB:', error);
  }
}

// Bulk update helpers for MongoDB
async function writeAllToMongo(data: DatabaseSchema): Promise<void> {
  if (!mongoDb) return;
  const collections = ['users', 'notes', 'quizzes', 'quizAttempts', 'flashcards', 'chats', 'activities'] as const;

  for (const col of collections) {
    const arr = data[col] || [];
    const mongoCol = mongoDb.collection(col);

    const activeIds = arr.map(e => e.id).filter(Boolean);

    // Delete elements that are no longer in our tracking list
    if (activeIds.length > 0) {
      await mongoCol.deleteMany({ id: { $nin: activeIds } });
    } else {
      await mongoCol.deleteMany({});
    }

    // Bulk write/upsert current items
    if (arr.length > 0) {
      const bulkOps = arr.map(item => ({
        updateOne: {
          filter: { id: item.id },
          update: { $set: item },
          upsert: true
        }
      }));
      await mongoCol.bulkWrite(bulkOps);
    }
  }
}

// Start async connect task in background immediately
connectMongo().catch(err => {
  console.error('Core background MongoDB initialization routine failed:', err);
});

// EXPORTED READ ROUTINE
export function readDb(): DatabaseSchema {
  return readDbFile();
}

// EXPORTED WRITE ROUTINE
export function writeDb(data: DatabaseSchema): void {
  // Write to local json immediately (synchronous state for server session)
  writeDbFile(data);

  // Background non-blocking sync to connected MongoDB instance
  if (mongoConnected && mongoDb) {
    writeAllToMongo(data).catch(err => {
      console.error('Background write session failed to upload to MongoDB:', err);
    });
  }
}

// Hash password with SHA256 + salt
export function hashPassword(password: string): string {
  const salt = 'study_buddy_salt_2026';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Utility to generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Activity logging utility
export function logActivity(userId: string, type: Activity['type'], title: string, details: string): Activity {
  const db = readDb();
  const newActivity: Activity = {
    id: generateId(),
    userId,
    type,
    title,
    details,
    timestamp: new Date().toISOString()
  };
  db.activities.unshift(newActivity); // Add to beginning
  writeDb(db);
  return newActivity;
}
