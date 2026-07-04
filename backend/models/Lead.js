import mongoose from 'mongoose';

/**
 * Regex pattern for validating proper email formats.
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Lead Schema defining the structure, validations, indexes, and virtual fields for Lead documents.
 */
const leadSchema = new mongoose.Schema(
  {
    /**
     * The full name of the lead contact.
     * Must be a trimmed string between 2 and 100 characters.
     * @type {String}
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters long'],
      maxlength: [100, 'Lead name cannot exceed 100 characters']
    },

    /**
     * The company or organization the lead belongs to.
     * @type {String}
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },

    /**
     * The email address of the lead.
     * Validated for proper email format.
     * @type {String}
     */
    email: {
      type: String,
      required: [true, 'Lead email is required'],
      trim: true,
      validate: {
        validator: function(value) {
          return EMAIL_REGEX.test(value);
        },
        message: 'Email must be a valid email address'
      }
    },

    /**
     * The phone number of the lead.
     * Optional field.
     * @type {String}
     */
    phone: {
      type: String,
      trim: true
    },

    /**
     * The current status of the lead.
     * Must match one of the predefined values.
     * @type {String}
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost'
      },
      default: 'New'
    },

    /**
     * The source from which the lead was generated.
     * Must match one of the predefined values.
     * @type {String}
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message: 'Source must be one of: Website, Referral, LinkedIn, Cold Call, Email Campaign, Other'
      },
      default: 'Website'
    },

    /**
     * Optional detailed notes or description about the lead.
     * Maximum length of 1000 characters.
     * @type {String}
     */
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },

    /**
     * Reference to the User (owner/creator) of the lead.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead owner is required']
    }
  },
  {
    timestamps: true,
    // Enable virtual fields to be included when converting to JSON or Object format
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/**
 * Compound index on (owner, status) for fast filtered queries.
 */
leadSchema.index({ owner: 1, status: 1 });

/**
 * Single index on email for fast lookups.
 */
leadSchema.index({ email: 1 });

/**
 * Virtual field to compute the age of the lead in days.
 * Useful for sales velocity and timing analytics.
 * @returns {Number} Days elapsed since the lead was created.
 */
leadSchema.virtual('age').get(function() {
  if (!this.createdAt) {
    return 0;
  }
  const diffInMs = Date.now() - this.createdAt.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.floor(diffInDays);
});

// Exporting both the model and schema separately
export const Lead = mongoose.model('Lead', leadSchema);
export { leadSchema };
