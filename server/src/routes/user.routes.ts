import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Profile update for authenticated user
router.put('/profile', updateProfile);

// Admin-only management
router.use(authorize(['Admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
