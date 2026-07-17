import express from 'express';
import { getMeetings, createMeeting, updateMeeting, deleteMeeting } from '../controllers/meetingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Secure all meeting routes
router.use(protect);

router.route('/')
  .get(getMeetings)
  .post(createMeeting);

router.route('/:id')
  .put(updateMeeting)
  .delete(deleteMeeting);

export default router;
