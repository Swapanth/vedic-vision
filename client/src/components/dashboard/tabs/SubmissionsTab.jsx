import React, { useState } from 'react';

const SubmissionsTab = ({ submissions, onGradeSubmission }) => {
  const [gradingForm, setGradingForm] = useState({
    score: '',
    feedback: '',
  });

  const handleGrade = (submissionId) => {
    onGradeSubmission(submissionId, gradingForm);
    setGradingForm({ score: '', feedback: '' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submissions Management</h2>
      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">Task: {submission.taskId?.title || 'Unknown Task'}</h4>
                <p className="text-sm text-gray-600">Student: {submission.userId?.name || 'Unknown User'}</p>
                <p className="text-xs text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  submission.score ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {submission.score ? `Score: ${submission.score}` : 'Not graded'}
                </span>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-700">
                {submission.content?.text || submission.description || 'No description'}
              </p>
              {submission.content?.fileUrl && (
                <a href={submission.content.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                  📎 Download File
                </a>
              )}
              {submission.content?.link && (
                <a href={submission.content.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm ml-2">
                  🔗 View Link
                </a>
              )}
            </div>

            {submission.feedback && (
              <div className="mb-3 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-700"><strong>Feedback:</strong> {submission.feedback}</p>
              </div>
            )}
            
            {!submission.score && (
              <div className="border-t pt-3">
                <h5 className="font-medium text-gray-900 mb-2">Grade Submission</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Score"
                    value={gradingForm.score}
                    onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    placeholder="Feedback"
                    value={gradingForm.feedback}
                    onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                    rows="2"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => handleGrade(submission._id)}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Grade
                </button>
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="text-center py-8 text-gray-500">No submissions found.</div>
        )}
      </div>
    </div>
  );
};

export default SubmissionsTab; 