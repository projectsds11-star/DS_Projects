import express from 'express';
import { getAgencies, createAgency, updateAgency, deleteAgency } from '../controllers/agencies.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAdmin, getAgencies);
router.post('/', requireAdmin, createAgency);
router.put('/:id', requireAdmin, updateAgency);
router.delete('/:id', requireAdmin, deleteAgency);

export default router;
