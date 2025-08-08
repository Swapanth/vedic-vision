import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema({
  csvId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  suggestedTechnologies: { type: String },
  topic: { type: String }
}, { timestamps: true });

// Add text index for search functionality
problemStatementSchema.index({
  title: 'text',
  description: 'text',
  domain: 'text',
  suggestedTechnologies: 'text',
  topic: 'text'
});

const ProblemStatement = mongoose.model('ProblemStatement', problemStatementSchema);
export default ProblemStatement;
