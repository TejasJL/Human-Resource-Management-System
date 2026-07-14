import express from 'express';
import { getEmploymentTypes, createEmploymentType, updateEmploymentType, deleteEmploymentType } from '../controllers/employmentTypeController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, getEmploymentTypes);
router.post('/', authenticate, authorizeAdmin, createEmploymentType);
router.put('/:id', authenticate, authorizeAdmin, updateEmploymentType);
router.delete('/:id', authenticate, authorizeAdmin, deleteEmploymentType);

export default router;
