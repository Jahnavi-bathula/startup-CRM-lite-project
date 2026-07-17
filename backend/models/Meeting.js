import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Meeting date is required']
    },
    time: {
      type: String,
      required: [true, 'Meeting time is required']
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },
    notes: {
      type: String,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Meeting owner is required']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
meetingSchema.index({ owner: 1, date: 1 });
meetingSchema.index({ lead: 1 });

export const Meeting = mongoose.model('Meeting', meetingSchema);
export default Meeting;
