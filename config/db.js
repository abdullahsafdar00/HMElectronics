import mongoose from "mongoose";

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

const cached = global.mongoose;

async function connectDB() {
  if (cached.conn) return cached.conn;



  // Fallback check to prevent crashing if a different key variation was used
  const connectionString = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

  if (!connectionString) {
    throw new Error("Critical Configuration Mismatch: Both MONGODB_URI and NEXT_PUBLIC_MONGODB_URI variables are completely missing or undefined.");
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: parseInt(process.env.MONGODB_POOLSIZE || "10", 10),
    };

    cached.promise = mongoose
      .connect(connectionString, opts)
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
