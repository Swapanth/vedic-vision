import User from '../models/User.js';
import Team from '../models/Team.js';
import ProblemStatement from '../models/ProblemStatement.js';
import Evaluation from '../models/Evaluation.js';

export const getJudgeOverview = async (req, res) => {
  try {
    const judge = await User.findById(req.user._id).select('assignedTeams role');
    if (!judge || judge.role !== 'judge') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const teams = await Team.find({ _id: { $in: judge.assignedTeams } })
      .populate('problemStatement', 'title')
      .select('name problemStatement teamNumber');

    console.log('Raw teams data:', JSON.stringify(teams, null, 2)); // Debug log

    const teamIds = teams.map(t => t._id);
    const evaluations = await Evaluation.find({ judgeId: judge._id, teamId: { $in: teamIds } })
      .select('teamId round');

    const evalMap = new Map();
    evaluations.forEach(e => {
      const key = e.teamId.toString();
      if (!evalMap.has(key)) evalMap.set(key, { 1: false, 2: false, 3: false });
      evalMap.get(key)[e.round] = true;
    });

    const overview = teams.map(team => {
      const key = team._id.toString();
      const rounds = evalMap.get(key) || { 1: false, 2: false, 3: false };
      const mappedTeam = {
        teamId: key,
        teamName: team.name,
        teamNumber: team.teamNumber || '',
        problemStatement: team.problemStatement?.title || '',
        rounds: {
          round1: !!rounds[1],
          round2: !!rounds[2],
          round3: !!rounds[3],
        }
      };
      console.log('Mapped team:', mappedTeam); // Debug log
      return mappedTeam;
    });

    return res.json({ success: true, data: overview });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch overview', error: error.message });
  }
};

export const getEvaluation = async (req, res) => {
  try {
    const judgeId = req.user._id;
    const { teamId, round } = req.params;

    const judge = await User.findById(judgeId).select('assignedTeams role');
    if (!judge || judge.role !== 'judge') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!judge.assignedTeams.map(id => id.toString()).includes(teamId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: team not assigned' });
    }

    const evaluation = await Evaluation.findOne({ judgeId, teamId, round: Number(round) });
    if (!evaluation) {
      return res.json({ success: true, data: null });
    }
    // Only include description in response for round 1
    const evalObj = evaluation.toObject();
    if (Number(round) !== 1) {
      delete evalObj.description;
    }
    return res.json({ success: true, data: evalObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch evaluation', error: error.message });
  }
};

export const upsertEvaluation = async (req, res) => {
  try {
    const judgeId = req.user._id;
    const { teamId, round } = req.params;
    const { score, feedback, description } = req.body;

    const judge = await User.findById(judgeId).select('assignedTeams role');
    if (!judge || judge.role !== 'judge') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!judge.assignedTeams.map(id => id.toString()).includes(teamId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: team not assigned' });
    }

    if (typeof score !== 'number' || score < 1 || score > 10) {
      return res.status(400).json({ success: false, message: 'Score must be a number between 1 and 10' });
    }

    // Only save description for round 1
    const updateData = { score, feedback: feedback || '' };
    if (Number(round) === 1) {
      updateData.description = description || '';
    } else {
      updateData.description = '';
    }
    const updated = await Evaluation.findOneAndUpdate(
      { judgeId, teamId, round: Number(round) },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Only include description in response for round 1
    const updatedObj = updated.toObject();
    if (Number(round) !== 1) {
      delete updatedObj.description;
    }
    return res.json({ success: true, message: 'Evaluation saved', data: updatedObj });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate evaluation' });
    }
    return res.status(500).json({ success: false, message: 'Failed to save evaluation', error: error.message });
  }
};

