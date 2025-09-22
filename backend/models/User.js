import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minLength: [2, "Last name must be at least 2 characters"],
      maxLength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]{10,15}$/, "Please enter a valid phone number"],
    },
    location: {
      type: String,
      trim: true,
      maxLength: [100, "Location cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxLength: [500, "Bio cannot exceed 500 characters"],
    },
    skills: [
      {
        type: String,
        trim: true,
        maxLength: [50, "Skill name cannot exceed 50 characters"],
      },
    ],
    experience: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      default: "entry",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

export const User = mongoose.model("User", userSchema);
