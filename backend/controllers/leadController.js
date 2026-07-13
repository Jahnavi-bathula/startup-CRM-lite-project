import mongoose from 'mongoose';
import { Lead } from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

/**
 * Get all leads for the authenticated user with advanced filters and pagination.
 * Supports filtering by status, source, date range (createdAt), and name/company/email text search.
 * Supports dynamic sorting (sortBy and sortOrder).
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user details.
 * @param {string} req.user._id - ID of the authenticated user.
 * @param {Object} req.query - Query parameters.
 * @param {number} [req.query.page=1] - Page number for pagination.
 * @param {number} [req.query.limit=10] - Number of records per page.
 * @param {string} [req.query.sortBy='createdAt'] - Field to sort by.
 * @param {string} [req.query.sortOrder='desc'] - Sort direction ('asc' or 'desc').
 * @param {string} [req.query.status] - Filter by lead status.
 * @param {string} [req.query.source] - Filter by lead source channel.
 * @param {string} [req.query.search] - Search term matching name, company, or email.
 * @param {string} [req.query.dateFrom] - Start date for createdAt range filter (ISO date string).
 * @param {string} [req.query.dateTo] - End date for createdAt range filter (ISO date string).
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing list of leads and pagination object.
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      source,
      dateFrom,
      dateTo
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Scoped only to the logged-in user
    const query = { owner: req.user._id };

    // Dynamic filters
    if (status && status !== 'All') {
      query.status = status;
    }

    if (source && source !== 'All') {
      query.source = source;
    }

    if (search) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex }
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Dynamic sorting
    const sortField = sortBy || 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDir };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead for the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, value, notes } = req.body;
    
    // Create new lead assigning authenticated user as the owner
    const newLead = await Lead.create({
      name,
      company,
      email,
      phone,
      status: status || 'New',
      source: source || 'Website',
      value: Number(value) || 0,
      notes,
      owner: req.user._id
    });
    
    return successResponse(res, newLead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing lead owned by the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, status, source, value, notes } = req.body;
    
    // Find lead and verify owner
    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found or unauthorized access', 404);
    }
    
    // Update lead attributes
    if (name !== undefined) lead.name = name;
    if (company !== undefined) lead.company = company;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (status !== undefined) lead.status = status;
    if (source !== undefined) lead.source = source;
    if (value !== undefined) lead.value = Number(value) || 0;
    if (notes !== undefined) lead.notes = notes;
    
    await lead.save();
    
    return successResponse(res, lead, 'Lead updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update the status of a lead owned by the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }
    
    // Find lead and verify owner
    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found or unauthorized access', 404);
    }
    
    lead.status = status;
    await lead.save();
    
    return successResponse(res, lead, 'Lead status updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead owned by the authenticated user.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found or unauthorized access', 404);
    }
    
    await lead.deleteOne();
    
    return successResponse(res, null, 'Lead deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve statistical summary for the authenticated user's leads.
 * Uses a single database aggregation query for performance.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user details.
 * @param {string} req.user._id - ID of the authenticated user.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing statistical breakdown.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

    const stats = await Lead.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                wonLeads: {
                  $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] }
                },
                thisMonthCount: {
                  $sum: {
                    $cond: [
                      { $gte: ["$createdAt", startOfThisMonth] },
                      1,
                      0
                    ]
                  }
                },
                lastMonthCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ["$createdAt", startOfLastMonth] },
                          { $lt: ["$createdAt", startOfThisMonth] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],
          sourceBreakdown: [
            {
              $group: {
                _id: "$source",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const rawSummary = stats[0]?.summary?.[0] || {
      totalLeads: 0,
      wonLeads: 0,
      thisMonthCount: 0,
      lastMonthCount: 0
    };

    const totalLeads = rawSummary.totalLeads;
    const wonLeads = rawSummary.wonLeads;
    const thisMonthLeads = rawSummary.thisMonthCount;
    const lastMonthLeads = rawSummary.lastMonthCount;

    // Conversion rate: (won / total) * 100, rounded to 1 decimal. Handle division by zero.
    const conversionRate = totalLeads > 0
      ? Math.round((wonLeads / totalLeads) * 100 * 10) / 10
      : 0.0;

    // Growth rate: ((thisMonth - lastMonth) / lastMonth) * 100, rounded to 1 decimal. Handle division by zero.
    const growthRate = lastMonthLeads > 0
      ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 * 10) / 10
      : 0.0;

    // Initialize all standard pipeline status values to 0
    const statusBreakdown = {
      'New': 0,
      'Contacted': 0,
      'Meeting Scheduled': 0,
      'Proposal Sent': 0,
      'Won': 0,
      'Lost': 0
    };
    stats[0]?.statusBreakdown?.forEach(item => {
      if (item._id && item._id in statusBreakdown) {
        statusBreakdown[item._id] = item.count;
      }
    });

    // Initialize all standard source values to 0
    const sourceBreakdown = {
      'Website': 0,
      'Referral': 0,
      'LinkedIn': 0,
      'Cold Call': 0,
      'Email Campaign': 0,
      'Other': 0
    };
    stats[0]?.sourceBreakdown?.forEach(item => {
      if (item._id && item._id in sourceBreakdown) {
        sourceBreakdown[item._id] = item.count;
      }
    });

    return successResponse(res, {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate
    }, 'Lead stats retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve monthly analytics breakdown for the active user's leads over the last 6 calendar months.
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user details.
 * @param {string} req.user._id - ID of the authenticated user.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response with the 6-month historical array.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    const now = new Date();
    const monthlyData = [];

    // Pre-populate last 6 calendar months (chronological: oldest first, so i starts at 5 and goes to 0)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthName = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
      const label = `${monthName} ${d.getUTCFullYear()}`;
      const yearMonth = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      monthlyData.push({
        month: label,
        yearMonth,
        total: 0,
        won: 0,
        lost: 0,
        conversionRate: 0.0
      });
    }

    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const results = await Lead.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user._id),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: 1 },
          won: {
            $sum: { $cond: [{ $eq: ["$status", "Won"] }, 1, 0] }
          },
          lost: {
            $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] }
          }
        }
      }
    ]);

    results.forEach(item => {
      const yearMonth = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      const matched = monthlyData.find(m => m.yearMonth === yearMonth);
      if (matched) {
        matched.total = item.total;
        matched.won = item.won;
        matched.lost = item.lost;
        matched.conversionRate = item.total > 0
          ? Math.round((item.won / item.total) * 100 * 10) / 10
          : 0.0;
      }
    });

    // Strip yearMonth helper attribute before returning
    const finalMonthlyStats = monthlyData.map(({ month, total, won, lost, conversionRate }) => ({
      month,
      total,
      won,
      lost,
      conversionRate
    }));

    return successResponse(res, finalMonthlyStats, 'Monthly stats retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single lead by its ID.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export const getLeadById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    // Check if the lead exists and is owned by the authenticated user
    if (!lead || lead.owner.toString() !== req.user._id.toString()) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    return res.status(200).json(lead);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * Autocomplete / quick search endpoint for leads.
 * Matches name, company, or email with a case-insensitive regex.
 * Limited to 5 results for query performance.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.user - Authenticated user details.
 * @param {string} req.user._id - ID of the authenticated user.
 * @param {Object} req.query - Query parameters.
 * @param {string} req.query.q - The search query term.
 * @param {number} [req.query.limit=5] - Maximum number of search results to return.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<Object>} JSON response containing array of matching leads with projected fields.
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q) {
      return successResponse(res, [], 'Search query parameter q is required');
    }
    
    const limitNum = parseInt(limit, 10) || 5;
    const searchRegex = { $regex: q.trim(), $options: 'i' };
    
    const query = {
      owner: req.user._id,
      $or: [
        { name: searchRegex },
        { company: searchRegex },
        { email: searchRegex }
      ]
    };
    
    const leads = await Lead.find(query)
      .select('_id name company email status')
      .limit(limitNum);
      
    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};
