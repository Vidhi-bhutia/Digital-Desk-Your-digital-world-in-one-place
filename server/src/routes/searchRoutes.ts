import { Router } from 'express';
import { protect } from '../middleware/auth';
import { handleGlobalSearch } from '../controllers/searchController';

const router = Router();

router.get('/', protect, handleGlobalSearch);

export default router;
