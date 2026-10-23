import express from 'express';
import { getAgencies, createAgency, updateAgency, deleteAgency } from '../controllers/agencies.js';

const router = express.Router();

router.get('/', getAgencies);
router.post('/', createAgency);
router.put('/:id', updateAgency);
router.delete('/:id', deleteAgency);

export default router;
