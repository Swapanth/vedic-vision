import express from 'express';
import { authenticateToken, judgeOnly } from '../middleware/auth.js';
import { getJudgeOverview, getEvaluation, upsertEvaluation } from '../controllers/judgeController.js';

const router = express.Router();

router.use(authenticateToken, judgeOnly);

router.get('/overview', getJudgeOverview);
router.get('/evaluations/:teamId/:round', getEvaluation);
router.post('/evaluations/:teamId/:round', upsertEvaluation);

export default router;


