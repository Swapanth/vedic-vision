import Config from '../models/Config.js';

export const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching config', error: err.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({});
    }
    if (typeof req.body.teamFormationEnabled === 'boolean') {
      config.teamFormationEnabled = req.body.teamFormationEnabled;
    }
    if (typeof req.body.votingEnabled === 'boolean') {
      config.votingEnabled = req.body.votingEnabled;
    }
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error updating config', error: err.message });
  }
};
