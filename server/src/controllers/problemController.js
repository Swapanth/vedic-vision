
import ProblemStatement from '../models/ProblemStatement.js';

export const getAllProblemStatements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      domain = 'all'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Add domain filter
    if (domain && domain !== 'all') {
      query.domain = new RegExp(domain, 'i');
    }

    // Add search filter
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Execute query with pagination
    const [problems, totalCount] = await Promise.all([
      ProblemStatement.find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProblemStatement.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      problems,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalProblems: totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching problem statements', error: err.message });
  }
};

export const createProblemStatement = async (req, res) => {
  try {
    const { csvId, title, description, domain, suggestedTechnologies, topic } = req.body;
    const problem = await ProblemStatement.create({ 
      csvId, 
      title, 
      description, 
      domain, 
      suggestedTechnologies, 
      topic 
    });
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Error creating problem statement', error: err.message });
  }
};

export const updateProblemStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { csvId, title, description, domain, suggestedTechnologies, topic } = req.body;
    const problem = await ProblemStatement.findByIdAndUpdate(
      id, 
      { csvId, title, description, domain, suggestedTechnologies, topic }, 
      { new: true }
    );
    if (!problem) return res.status(404).json({ message: 'Problem statement not found' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Error updating problem statement', error: err.message });
  }
};

export const getAllProblemTitles = async (req, res) => {
  try {
    // Get all problem statements with only _id, title, and description fields
    const problems = await ProblemStatement.find({}, {
      _id: 1,
      title: 1,
      description: 1,
      domain: 1
    })
    .sort({ title: 1 }) // Sort alphabetically by title
    .lean();

    res.json({
      success: true,
      data: problems
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching problem statement titles', 
      error: err.message 
    });
  }
};
