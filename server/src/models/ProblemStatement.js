import mongoose from 'mongoose';

const problemStatementSchema = new mongoose.Schema({
  csvId: { type: Number, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  domain: { type: String, required: true },
  suggestedTechnologies: { type: String },
  topic: { type: String },
  selectedByTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  selectionCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  }
}, { timestamps: true });

// Virtual to check if problem statement is at selection limit
problemStatementSchema.virtual('isAtLimit').get(function() {
  return this.selectionCount >= 4;
});

// Method to add team selection
problemStatementSchema.methods.addTeamSelection = function(teamId) {
  if (this.selectionCount >= 4) {
    throw new Error('Problem statement has reached the maximum selection limit of 4 teams');
  }
  
  if (!this.selectedByTeams.includes(teamId)) {
    this.selectedByTeams.push(teamId);
    this.selectionCount = this.selectedByTeams.length;
  }
  
  return this.save();
};

// Method to remove team selection
problemStatementSchema.methods.removeTeamSelection = function(teamId) {
  this.selectedByTeams = this.selectedByTeams.filter(id => 
    id.toString() !== teamId.toString()
  );
  this.selectionCount = this.selectedByTeams.length;
  
  return this.save();
};

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
