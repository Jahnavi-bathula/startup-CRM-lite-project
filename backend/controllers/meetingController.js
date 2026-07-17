import { Meeting } from '../models/Meeting.js';
import { Lead } from '../models/Lead.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Retrieve all scheduled meetings for the authenticated user.
 */
export const getMeetings = async (req, res, next) => {
  try {
    const meetings = await Meeting.find({ owner: req.user._id })
      .populate('lead', 'name company email')
      .sort({ date: 1 });
    return successResponse(res, meetings, 'Meetings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Schedule a new meeting and auto-log it to the lead timeline.
 */
export const createMeeting = async (req, res, next) => {
  try {
    const { title, date, time, lead, notes } = req.body;
    const meeting = await Meeting.create({
      title,
      date,
      time,
      lead: lead || null,
      notes,
      owner: req.user._id
    });
    
    // Auto-update lead timeline if a lead is associated
    if (lead) {
      const leadDoc = await Lead.findOne({ _id: lead, owner: req.user._id });
      if (leadDoc) {
        leadDoc.activities.push({
          type: 'Meeting Scheduled',
          note: `Scheduled meeting: "${title}" on ${new Date(date).toLocaleDateString()} at ${time}`,
          timestamp: new Date()
        });
        await leadDoc.save();
      }
    }
    
    const populated = await meeting.populate('lead', 'name company email');
    return successResponse(res, populated, 'Meeting scheduled successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update scheduled meeting fields.
 */
export const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, date, time, lead, notes } = req.body;
    
    const meeting = await Meeting.findOne({ _id: id, owner: req.user._id });
    if (!meeting) {
      return errorResponse(res, 'Meeting not found or unauthorized access', 404);
    }
    
    if (title !== undefined) meeting.title = title;
    if (date !== undefined) meeting.date = date;
    if (time !== undefined) meeting.time = time;
    if (lead !== undefined) meeting.lead = lead || null;
    if (notes !== undefined) meeting.notes = notes;
    
    await meeting.save();
    const populated = await meeting.populate('lead', 'name company email');
    return successResponse(res, populated, 'Meeting updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel / delete a meeting.
 */
export const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!meeting) {
      return errorResponse(res, 'Meeting not found or unauthorized access', 404);
    }
    return successResponse(res, null, 'Meeting cancelled successfully');
  } catch (error) {
    next(error);
  }
};
export default { getMeetings, createMeeting, updateMeeting, deleteMeeting };
