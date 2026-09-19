import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getTimeline, getActivity, getAttention, triggerSync } from '../controllers/timelineController';

const router = Router();

router.get('/timeline', protect, getTimeline);
router.get('/activity', protect, getActivity);
router.get('/attention', protect, getAttention);
router.post('/sync', protect, triggerSync);

export default router;
