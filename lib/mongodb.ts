import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";
const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached?.conn) return cached.conn;
  if (!cached) throw new Error("Mongoose cache not initialized");
  if (!MONGODB_URI) {
    if (IS_PRODUCTION_BUILD) {
      console.warn("[mongodb] MONGODB_URI is missing during build. Skipping DB connection.");
      return null;
    }
    throw new Error("Missing MONGODB_URI");
  }

  try {
    cached.promise =
      cached.promise ??
      mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    if (IS_PRODUCTION_BUILD) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(`[mongodb] Failed to connect during build: ${message}`);
      return null;
    }

    throw error;
  }
}

