import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn('MONGODB_URI not found. Running in local storage mode.');
      return;
    }

    await mongoose.connect(mongoUri, {
      // Remove deprecated options for newer mongoose versions
    });

    console.log('✅ MongoDB Atlas connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // Don't exit process in production, allow fallback to local storage
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Continuing with local storage fallback');
    } else {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during mongoose disconnection:', error);
    process.exit(1);
  }
});

export default connectDB;
