// utils/database.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/recruitment-platform';
      
      const options = {
       
        maxPoolSize: 10, // Maximum number of connections in the pool
        minPoolSize: 2,  // Minimum number of connections in the pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
        bufferMaxEntries: 0, // Disable mongoose buffering
      };

      // Development-specific options
      if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', true); // Enable query logging in development
      }

      // Production-specific options
      if (process.env.NODE_ENV === 'production') {
        options.ssl = true;
        options.sslValidate = true;
      }

      this.connection = await mongoose.connect(mongoURI, options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);
      
      // Handle connection events
      this.setupEventHandlers();
      
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      
      // In production, exit the process if database connection fails
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      throw error;
    }
  }

  setupEventHandlers() {
    const db = mongoose.connection;

    db.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    db.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    db.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await db.close();
        console.log('📴 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV !== 'test') {
        throw new Error('Database can only be dropped in test environment');
      }
      await mongoose.connection.dropDatabase();
      console.log('🗑️ Database dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping database:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Create singleton instance
const database = new Database();

// Utility functions for database operations
const dbUtils = {
  // Health check function
  async healthCheck() {
    try {
      const isConnected = database.isConnected();
      const stats = await mongoose.connection.db.admin().serverStatus();
      
      return {
        status: 'healthy',
        connected: isConnected,
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        uptime: stats.uptime,
        version: stats.version
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  },

  // Get database statistics
  async getStats() {
    try {
      const stats = await mongoose.connection.db.stats();
      return {
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes
      };
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`);
    }
  },

  // Seed database with initial data (for development/testing)
  async seedDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database seeding is not allowed in production');
    }

    try {
      const { Company, Recruiter, JobPosting, User } = require('../models');

      // Create sample company
      const sampleCompany = await Company.create({
        name: 'TechCorp Inc.',
        description: 'Leading technology solutions provider',
        website: 'https://techcorp.com',
        location: 'San Francisco, CA',
        size: 'large',
        industry: 'Technology'
      });

      // Create sample recruiter
      const sampleRecruiter = await Recruiter.create({
        email: 'recruiter@techcorp.com',
        password: 'Recruiter123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0199',
        company: sampleCompany._id
      });

      // Create sample job posting
      await JobPosting.create({
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full stack developer to join our team.',
        requirements: [
          'Bachelor\'s degree in Computer Science',
          '5+ years of experience',
          'Strong problem-solving skills'
        ],
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        experienceLevel: 'senior',
        salaryRange: {
          min: 90000,
          max: 130000
        },
        location: 'San Francisco, CA',
        remoteFriendly: true,
        company: sampleCompany._id,
        recruiter: sampleRecruiter._id
      });

      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error.message);
      throw error;
    }
  },

  // Clear all data (for testing)
  async clearDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Database clearing is not allowed in production');
    }

    try {
      const collections = mongoose.connection.collections;
      
      await Promise.all(
        Object.values(collections).map(collection => collection.deleteMany({}))
      );
      
      console.log('🗑️ Database cleared successfully');
    } catch (error) {
      console.error('❌ Database clearing failed:', error.message);
      throw error;
    }
  }
};

module.exports = {
  database,
  dbUtils,
  // For backward compatibility
  connect: () => database.connect(),
  disconnect: () => database.disconnect()
};