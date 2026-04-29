import { connect, connection, ConnectOptions } from 'mongoose';

// Mongoose connection options
const options: ConnectOptions = {
  appName: 'devrel.vercel.integration',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// Connecting to database
export async function runDB(url: string): Promise<void> {
  try {
    await connect(url, options);
    console.log('Successfully connected to database');
  } catch (e) {
    throw new Error(`Failed to connect to database: ${e}`);
  }
}

export async function stopDb() {
  try {
    await connection.close();
    console.log('Database connection closed');
  } catch (e) {
    throw new Error(`Error closing database connection: ${e}`);
  }
}

// Export connection for use in other parts of the application
export { connection };
