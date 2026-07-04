import express from 'express';

const router = express.Router();

// Placeholder route for leads
router.get('/', (req, res) => {
  res.json({ message: 'Leads routes placeholder' });
});

export default router;
