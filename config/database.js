const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      console.log('💡 Please set MONGODB_URI in your .env file or environment variables');
      return;
    }

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // Provide specific error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('💡 Network Error: Cannot resolve MongoDB hostname');
      console.error('   - Check your MONGODB_URI connection string');
      console.error('   - Verify your internet connection');
      console.error('   - If using MongoDB Atlas, check your IP whitelist');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Authentication Error: Invalid username or password');
      console.error('   - Check your MongoDB credentials in MONGODB_URI');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Connection Timeout: MongoDB server is not reachable');
      console.error('   - Check your network connection');
      console.error('   - Verify MongoDB Atlas cluster is running');
      console.error('   - Check firewall settings');
    }
    
    console.log('⚠️  Server will continue without database connection');
    // Don't exit process - allow server to start for API testing
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Close connection on app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
