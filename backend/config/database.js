/**
 * Database Configuration
 * Connects to MongoDB Atlas using environment variables
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dbName = process.env.DB_NAME || 'ZOOMUSEUMSBES';
    const mongoUri = process.env.MONGODB_URI;
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName,
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.db.databaseName}`);
    return conn;
  } catch (error) {
    console.error(`✗ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
