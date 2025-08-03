import React, { useState } from 'react';

const TasksTab = ({ tasks, onCreateTask, onUpdateTask, onDeleteTask, onToggleTaskStatus }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    day: 'day1',
    maxScore: 100,
  });

  const [filterDay, setFilterDay] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask._id, taskForm);
    } else {
      onCreateTask(taskForm);
    }
    setTaskForm({ title: '', description: '', day: 'day1', maxScore: 100 });
    setEditingTask(null);
    setShowDialog(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      day: task.day,
      maxScore: task.maxScore,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', day: 'day1', maxScore: 100 });
  };

  const filteredTasks = filterDay === 'all'
    ? tasks
    : tasks.filter((task) => task.day === filterDay);

  return (
    <div className="relative p-6 min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Tasks Management</h2>
        <div className="flex items-center gap-4">
          <select
            value={filterDay}
            onChange={(e) => setFilterDay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Days</option>
            {[...Array(12)].map((_, i) => {
              const day = `day${i + 1}`;
              return (
                <option key={day} value={day}>
                  Day {i + 1} - {i + 1 > 10 ? 'Hackathon' : 'Bootcamp'}
                </option>
              );
            })}
          </select>
          <button
            onClick={() => setShowDialog(true)}
            className="bg-[#272757] hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  task.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {task.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{task.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Day: {task.day ? task.day.replace('day', 'Day ') + (parseInt(task.day.replace('day', '')) > 10 ? ' - Hackathon' : ' - Bootcamp') : 'Not specified'}</p>
                <p>Max Score: {task.maxScore}</p>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 text-xs font-medium rounded-md transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteTask(task._id)}
                    className="flex-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 text-xs font-medium rounded-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => onToggleTaskStatus(task._id)}
                  className={`w-full px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    task.isActive
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {task.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">No tasks found for selected day.</div>
        )}
      </div>

      {/* Dialog/Modal for Create Task */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={handleCloseDialog}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                <select
                  value={taskForm.day}
                  onChange={(e) => setTaskForm({ ...taskForm, day: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[...Array(12)].map((_, i) => {
                    const day = `day${i + 1}`;
                    return (
                      <option key={day} value={day}>
                        Day {i + 1} - {i + 1 > 10 ? 'Hackathon' : 'Bootcamp'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                <input
                  type="number"
                  value={taskForm.maxScore}
                  onChange={(e) => setTaskForm({ ...taskForm, maxScore: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#272757] hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksTab;
