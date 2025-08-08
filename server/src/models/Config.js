import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  teamFormationEnabled: { type: Boolean, default: true },
  votingEnabled: { type: Boolean, default: false },
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
export default Config;
