import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

export interface MongoConnectionState {
  db: Db | null;
  connected: boolean;
  error?: Error;
}

// Load .env from project root (one level up from backend/src).
const __filename = fileURLToPath(import.meta.url);
const __envDirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__envDirname, "..", "..", "..", ".env"),
  override: true
});

let client: MongoClient | null = null;
let dbInstance: Db | null = null;

const DEFAULT_URI = "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "bizmind";

/**
 * Connect to MongoDB. Connection string comes from MONGODB_URI env var,
 * with a localhost fallback for local development.
 */
export async function connectMongo(uri?: string): Promise<Db> {
  if (dbInstance) return dbInstance;

  const connectionString = uri ?? process.env.MONGODB_URI ?? DEFAULT_URI;

  client = new MongoClient(connectionString, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    dbInstance = client.db(DB_NAME);
    console.log(`MongoDB connected: ${DB_NAME} (${connectionString.replace(/\/\/.*@/, "//***@")})`);
    return dbInstance;
  } catch (error) {
    const err = error as Error;
    console.warn("MongoDB connection failed, continuing with fallback seed data:", err.message);
    client = null;
    throw err;
  }
}

export async function connectMongoWithFallback(uri?: string): Promise<MongoConnectionState> {
  try {
    const db = await connectMongo(uri);
    return { db, connected: true };
  } catch (error) {
    return {
      db: null,
      connected: false,
      error: error as Error,
    };
  }
}

export function getDb(): Db {
  if (!dbInstance) {
    throw new Error("MongoDB not connected. Call connectMongo() first.");
  }
  return dbInstance;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    dbInstance = null;
  }
}