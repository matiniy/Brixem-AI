"use client";
import React, { useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  progress: number;
  assignedUsers: string[];
  comments: number;
  likes: number;
  dueDate?: string;
  estimatedHours?: number;
}

interface ListViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200"
};

const priorityLabels = {
  high: "High",
  medium: "Medium",
  low: "Low"
};

const statusColors = {
  todo: "bg-blue-100 text-blue-800 border-blue-200",
  "in-progress": "bg-orange-100 text-orange-800 border-orange-200",
  completed: "bg-green-100 text-green-800 border-green-200"
};

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed"
};

export default function ListView({ tasks, onTaskUpdate, onAddTask }: ListViewProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    status: "todo" as "todo" | "in-progress" | "completed",
    dueDate: ""
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        progress: 0,
        assignedUsers: [],
        comments: 0,
        likes: 0,
        dueDate: newTask.dueDate
      });
      setNewTask({ title: "", description: "", priority: "medium", status: "todo", dueDate: "" });
      setShowAddTask(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">List View</h2>
          <p className="text-sm sm:text-base text-gray-600">All project tasks in organized list format</p>
        </div>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm touch-manipulation"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30"
                  placeholder="Enter task title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30"
                  rows={3}
                  placeholder="Enter task description..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask(prev => ({ ...prev, status: e.target.value as "todo" | "in-progress" | "completed" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-md hover:opacity-90 transition touch-manipulation"
              >
                Add Task
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile List Layout */}
      <div className="block sm:hidden">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {task.description}
                    </p>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mb-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onTaskUpdate(task.id, { progress: task.progress === 100 ? 0 : 100 })}
                  className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation flex-shrink-0"
                  title={task.progress === 100 ? "Mark as incomplete" : "Mark as complete"}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                    {statusLabels[task.status]}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {task.comments > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{task.comments}</span>
                    </div>
                  )}
                  {task.likes > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{task.likes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      task.progress === 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {task.assignedUsers.slice(0, 3).map((user, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center text-white text-xs font-medium"
                      title={user}
                    >
                      {user.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {task.assignedUsers.length > 3 && (
                    <span className="text-xs text-gray-500 font-medium">
                      +{task.assignedUsers.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop List Layout */}
      <div className="hidden sm:block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-700">
              <div className="col-span-6 sm:col-span-4">Task</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Progress</div>
              <div className="hidden sm:block sm:col-span-1">Assigned</div>
              <div className="hidden sm:block sm:col-span-1">Actions</div>
            </div>
          </div>

          {/* Task List */}
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center">
                  {/* Task Info */}
                  <div className="col-span-6 sm:col-span-4">
                    <div className="flex flex-col">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed hidden sm:block">
                          {task.description}
                        </p>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[task.status]}`}>
                      {statusLabels[task.status]}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                            task.progress === 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[1.5rem] sm:min-w-[2rem]">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Assigned Users */}
                  <div className="hidden sm:block sm:col-span-1">
                    <div className="flex items-center gap-1">
                      {task.assignedUsers.slice(0, 2).map((user, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center text-white text-xs font-medium"
                          title={user}
                        >
                          {user.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {task.assignedUsers.length > 2 && (
                        <span className="text-xs text-gray-500 font-medium">
                          +{task.assignedUsers.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="hidden sm:block sm:col-span-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTaskUpdate(task.id, { progress: task.progress === 100 ? 0 : 100 })}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                        title={task.progress === 100 ? "Mark as incomplete" : "Mark as complete"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      
                      {/* Comments & Likes */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {task.comments > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{task.comments}</span>
                          </div>
                        )}
                        {task.likes > 0 && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{task.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="px-6 py-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first task</p>
              <button
                onClick={() => setShowAddTask(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition touch-manipulation"
              >
                Add First Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 