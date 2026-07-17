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
     * The monetary value of the lead/deal.
     * @type {Number}
     */
    value: {
      type: Number,
      default: 0
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
    },

    /**
     * AI-based Lead Score (1-100)
     */
    leadScore: {
      type: Number,
      default: 0
    },

    /**
     * Priority category derived from the score
     */
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },

    /**
     * Historical log of activities performed on this lead
     */
    activities: [
      {
        type: {
          type: String,
          enum: ['Created', 'Updated', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
          required: true
        },
        note: {
          type: String
        },
        timestamp: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true,
    // Enable virtual fields to be included when converting to JSON or Object format
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save middleware to compute AI Lead Score, Priority and log activity timeline
leadSchema.pre('save', function(next) {
  // 1. Log creation activity
  if (this.isNew) {
    this.activities = [{
      type: 'Created',
      note: 'Lead records created in system.',
      timestamp: new Date()
    }];
  }

  // 2. Recalculate AI score and priority if relevant fields modified
  if (this.isModified('value') || this.isModified('status') || this.isModified('source') || this.isModified('email') || this.isModified('phone') || this.isNew) {
    let score = 20; // base score

    // Status weighting
    if (this.status === 'Won') score += 40;
    else if (this.status === 'Proposal Sent') score += 30;
    else if (this.status === 'Meeting Scheduled') score += 20;
    else if (this.status === 'Contacted') score += 10;
    else if (this.status === 'Lost') score = 5;

    // Value weighting
    const val = Number(this.value) || 0;
    if (val >= 25000) score += 25;
    else if (val >= 10000) score += 20;
    else if (val >= 5000) score += 15;
    else if (val >= 1000) score += 10;

    // Source weighting
    if (this.source === 'Referral') score += 15;
    else if (this.source === 'LinkedIn') score += 10;
    else if (this.source === 'Website') score += 5;

    // Integrity checks (has email/phone)
    if (this.email && !this.email.match(/@(gmail|yahoo|outlook|hotmail)\.com$/i)) score += 10;
    if (this.phone) score += 5;

    this.leadScore = Math.min(100, Math.max(1, score));

    // Priority allocation
    if (this.leadScore >= 75) {
      this.priority = 'High';
    } else if (this.leadScore >= 40) {
      this.priority = 'Medium';
    } else {
      this.priority = 'Low';
    }
  }

  // 3. Log status changes
  if (!this.isNew && this.isModified('status')) {
    this.activities.push({
      type: this.status === 'New' ? 'Created' : this.status,
      note: `Lead stage changed to ${this.status}.`,
      timestamp: new Date()
    });
  }

  next();
});

// Indexes
// Compound index on owner and status for fast filtered dashboard/pipeline queries
leadSchema.index({ owner: 1, status: 1 });
// Single field index on email for fast lookups
leadSchema.index({ email: 1 });
// Compound index on owner and status and createdAt for filtering and sorting
leadSchema.index({ owner: 1, status: 1, createdAt: -1 });
// Compound index on owner and source and createdAt for filtering and sorting
leadSchema.index({ owner: 1, source: 1, createdAt: -1 });
// Compound index on owner and createdAt for pagination sort and stats aggregation
leadSchema.index({ owner: 1, createdAt: -1 });
// Compound indexes for quick autocomplete searches scoped to owner
leadSchema.index({ owner: 1, name: 1 });
// Compound index on owner and priority for high priority queries
leadSchema.index({ owner: 1, priority: 1, leadScore: -1 });
leadSchema.index({ owner: 1, company: 1 });

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
