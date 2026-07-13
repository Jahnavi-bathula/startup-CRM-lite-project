import express from 'express';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads
} from '../controllers/leadController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection middleware globally to all lead routes
router.use(protect);

// Analytical statistical summary queries (placed before /:id routes to prevent path parameter matching conflicts)
router.get('/stats/summary', getLeadStats);
router.get('/stats/monthly', getMonthlyStats);
router.get('/search', searchLeads);

// Standard CRUD endpoints
router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.patch('/:id/status', updateLeadStatus);
router.delete('/:id', deleteLead);

export default router;
