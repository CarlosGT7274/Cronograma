import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Define MONGODB_URI en tus variables de entorno')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached.conn) {
    console.log(`🔗 Reutilizando conexión existente. Estado: ${mongoose.connection.readyState}`);
    return cached.conn;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ Nueva conexión establecida. 
      Host: ${conn.connection.host}
      Base de datos: ${conn.connection.db.databaseName}
      Estado: ${conn.connection.readyState}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error de conexión: ${error}`);
    throw error;
  }
}

export default dbConnect
