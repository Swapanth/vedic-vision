import express from 'express';
import { authenticateToken, judgeOnly } from '../middleware/auth.js';
import { getEvaluation, upsertEvaluation } from '../controllers/judgeController.js';

const router = express.Router();

router.use(authenticateToken, judgeOnly);

router.get('/:teamId/:round', getEvaluation);
router.post('/:teamId/:round', upsertEvaluation);

export default router;


