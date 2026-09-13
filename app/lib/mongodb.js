import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb://prateekrai462:Hiallguys76%2B@ac-uofz5ty-shard-00-00.byn7xrv.mongodb.net:27017,ac-uofz5ty-shard-00-01.byn7xrv.mongodb.net:27017,ac-uofz5ty-shard-00-02.byn7xrv.mongodb.net:27017/?ssl=true&replicaSet=atlas-qwmc2k-shard-0&authSource=admin&appName=Cluster0";
console.log("MONGO DEBUG:", JSON.stringify(MONGODB_URI.slice(0, 30)));

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
