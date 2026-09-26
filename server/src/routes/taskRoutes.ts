import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskComplete,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';

const router = Router();

// Protect all task endpoints with authentication middleware
router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', toggleTaskComplete);

export default router;
