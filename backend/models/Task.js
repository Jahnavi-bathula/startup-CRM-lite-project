import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required']
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
taskSchema.index({ owner: 1, deadline: 1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ lead: 1 });

export const Task = mongoose.model('Task', taskSchema);
export default Task;
