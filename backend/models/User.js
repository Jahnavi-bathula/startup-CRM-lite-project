import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Regex pattern for validating proper email formats.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * User Schema defining the structure, validations, and hooks for User documents.
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * The full name of the user.
     * Must be a trimmed string between 2 and 50 characters.
     * @type {String}
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    /**
     * The unique email address of the user.
     * Converted to lowercase, trimmed, and validated against standard email format.
     * @type {String}
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(value) {
          return EMAIL_REGEX.test(value);
        },
        message: 'Email must be a valid email address'
      }
    },

    /**
     * The password of the user.
     * Will be stored as a bcrypt hash. Minimum length is 6 characters.
     * @type {String}
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },

    /**
     * The role assigned to the user for access control.
     * Can either be 'admin' or 'user'.
     * @type {String}
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user'
      },
      default: 'user'
    },

    /**
     * Indication of whether the user account is active.
     * @type {Boolean}
     */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware to hash password before storing in the database.
 */
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified or is new
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to compare a plain text candidate password with the hashed password.
 * @param {String} candidatePassword - The plain text password to check.
 * @returns {Promise<Boolean>} True if matches, false otherwise.
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Override toJSON behavior to remove the password field from returning documents.
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Exporting both the model and schema separately
export const User = mongoose.model('User', userSchema);
export { userSchema };
