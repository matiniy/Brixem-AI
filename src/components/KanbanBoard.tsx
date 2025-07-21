"use client";
import React, { useState } from "react";
import TaskModal from "./TaskModal";

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

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: (task: Omit<Task, "id">) => void;
  onDeleteTask: (taskId: string) => void;
}

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

const priorityLabels = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority"
};

export default function KanbanBoard({ tasks, onTaskUpdate, onAddTask, onDeleteTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    { id: "todo", title: "To Do", color: "bg-blue-50 border-blue-200" },
    { id: "in-progress", title: "In Progress", color: "bg-orange-50 border-orange-200" },
    { id: "completed", title: "Completed", color: "bg-green-50 border-green-200" }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskUpdate(draggedTask, { status: status as Task["status"] });
      setDraggedTask(null);
    }
  };

  const handleAddTask = (status: string) => {
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle,
        status: status as Task["status"],
        priority: "medium",
        progress: 0,
        assignedUsers: [],
        comments: 0,
        likes: 0
      });
      setNewTaskTitle("");
      setShowAddTask(null);
    }
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    onTaskUpdate(taskId, updates);
    if (selectedTask) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    onDeleteTask(taskId);
    handleModalClose();
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 lg:gap-6 h-full overflow-x-auto p-2 sm:p-3 lg:p-6 w-full">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`flex-shrink-0 w-full md:w-80 ${column.color} rounded-lg border-2 p-2 sm:p-3 lg:p-4 flex flex-col h-full max-h-full min-h-[400px]`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg">{column.title}</h3>
              <span className="text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded-full">
                {getTasksByStatus(column.id).length}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto min-h-0">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => handleCardClick(task)}
                  className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 touch-manipulation hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskUpdate(task.id, { progress: task.progress === 100 ? 0 : 100 });
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base leading-tight">{task.title}</h4>
                  
                  {task.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{task.description}</p>
                  )}

                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div
                        className={`h-1.5 sm:h-2 rounded-full transition-all ${
                          task.progress === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {task.assignedUsers.slice(0, 2).map((user, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center text-white text-xs font-medium"
                        >
                          {user.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {task.assignedUsers.length > 2 && (
                        <span className="text-xs text-gray-500">+{task.assignedUsers.length - 2}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500">
                      {task.comments > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="hidden sm:inline">{task.comments}</span>
                        </div>
                      )}
                      {task.likes > 0 && (
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span className="hidden sm:inline">{task.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Task Button */}
              {showAddTask === column.id ? (
                <div className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddTask(column.id);
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAddTask(column.id)}
                      className="px-2 sm:px-3 py-1 text-xs bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-md hover:opacity-90 transition touch-manipulation"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddTask(null);
                        setNewTaskTitle("");
                      }}
                      className="px-2 sm:px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition touch-manipulation"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTask(column.id)}
                  className="w-full p-2 sm:p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs sm:text-sm">Add Task</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
      />
    </>
  );
} 