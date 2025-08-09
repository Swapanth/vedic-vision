
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
        .select('csvId title description domain suggestedTechnologies topic selectionCount selectedByTeams isCustom createdBy createdAt updatedAt')
        .populate('createdBy', 'name email')
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

export const createCustomProblemStatement = async (req, res) => {
  try {
    const { title, description, domain, suggestedTechnologies, topic } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !description || !domain) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and domain are required'
      });
    }

    // Check if user already has a custom problem statement
    const existingCustomProblem = await ProblemStatement.findOne({
      createdBy: userId,
      isCustom: true
    });

    if (existingCustomProblem) {
      return res.status(400).json({
        success: false,
        message: 'You can only create one custom problem statement'
      });
    }

    const problem = await ProblemStatement.create({ 
      title, 
      description, 
      domain, 
      suggestedTechnologies, 
      topic,
      isCustom: true,
      createdBy: userId
    });

    await problem.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: problem,
      message: 'Custom problem statement created successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error creating custom problem statement', 
      error: err.message 
    });
  }
};

export const getMyCustomProblemStatement = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const problem = await ProblemStatement.findOne({
      createdBy: userId,
      isCustom: true
    }).populate('createdBy', 'name email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'No custom problem statement found'
      });
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching custom problem statement', 
      error: err.message 
    });
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
    // Get all problem statements with only _id, title, description, domain, and selection count fields
    const problems = await ProblemStatement.find({}, {
      _id: 1,
      title: 1,
      description: 1,
      domain: 1,
      selectionCount: 1,
      selectedByTeams: 1
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
