// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    sparse: true // Allows multiple documents to have null/undefined phone
  },
  location: {
    type: String,
    trim: true,
    maxlength: [255, 'Location cannot exceed 255 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  skills: {
    type: [String],
    validate: [
      {
        validator: function(skills) {
          return skills.length <= 20;
        },
        message: 'Cannot have more than 20 skills'
      },
      {
        validator: function(skills) {
          return skills.every(skill => skill.length >= 2 && skill.length <= 50);
        },
        message: 'Each skill must be between 2 and 50 characters'
      }
    ]
  },
  experienceLevel: {
    type: String,
    enum: {
      values: ['entry', 'mid', 'senior', 'executive'],
      message: 'Experience level must be one of: entry, mid, senior, executive'
    }
  },
  salaryExpectation: {
    type: Number,
    min: [1000, 'Salary expectation must be at least $1,000'],
    max: [10000000, 'Salary expectation must be less than $10,000,000']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      // Remove password from JSON output
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ experienceLevel: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ location: 'text' }); // Text index for location search
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find active users
userSchema.statics.findActive = function(filter = {}) {
  return this.find({ ...filter, isActive: true });
};

// Static method to search by skills
userSchema.statics.searchBySkills = function(skills, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  return this.find({
    isActive: true,
    skills: { $in: skills }
  })
  .sort({ 
    // Prioritize users with more matching skills
    $meta: 'textScore',
    createdAt: -1 
  })
  .skip(skip)
  .limit(limit)
  .select('-password');
};

// Static method for paginated search
userSchema.statics.paginate = async function(filter = {}, options = {}) {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  
  const query = { ...filter, isActive: true };
  
  const [documents, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-password'),
    this.countDocuments(query)
  ]);
  
  return {
    documents,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  };
};

// Static method to deactivate account (soft delete)
userSchema.statics.deactivateById = async function(userId) {
  return this.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;