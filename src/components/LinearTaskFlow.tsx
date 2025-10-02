'use client';

import React, { useState } from 'react';
import CalendarView from './CalendarView';

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedDuration?: string;
  assignedTo?: string;
  notes?: string;
  materials?: string[];
  requirements?: string[];
  deliverables?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
  }>;
}

interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'todo';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  assignedUsers: string[];
  comments: number;
  likes: number;
  dueDate?: string;
  estimatedHours?: number;
}

interface TaskUpdate {
  status?: 'completed' | 'in-progress' | 'todo';
  progress?: number;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  [key: string]: unknown;
}

interface TaskStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  stepNumber: number;
  estimatedDuration?: string;
  dependencies?: string[];
  subTasks?: SubTask[];
  details?: {
    materials?: string[];
    requirements?: string[];
    deliverables?: string[];
    notes?: string;
  };
}

interface LinearTaskFlowProps {
  steps: TaskStep[];
  currentStep?: string;
  onStepClick?: (stepId: string) => void;
  onSubTaskUpdate?: (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => void;
  onSubTaskNotesUpdate?: (stepId: string, subTaskId: string, notes: string) => void;
  onDeliverableUpdate?: (stepId: string, subTaskId: string, deliverableId: string, status: 'completed' | 'pending') => void;
  onStepLock?: (stepId: string, locked: boolean) => void;
  onStepComplete?: (stepId: string) => void;
  onStepAdvance?: (currentStepId: string, nextStepId: string) => void;
  onStepStatusUpdate?: (stepId: string, status: 'completed' | 'in-progress' | 'pending') => void;
  onTaskUpdate?: (taskId: string, updates: TaskUpdate) => void;
  onAddTask?: (task: Omit<CalendarTask, 'id'>) => void;
}

const LinearTaskFlow: React.FC<LinearTaskFlowProps> = ({ 
  steps, 
  onStepClick,
  onSubTaskUpdate,
  onDeliverableUpdate,
  onTaskUpdate,
  onAddTask
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set(steps.map(step => step.id)));
  const [viewMode, setViewMode] = useState<'progress' | 'calendar'>('progress');
  const [showConfirmation, setShowConfirmation] = useState<{
    type: 'step' | 'subtask';
    stepId: string;
    subTaskId?: string;
    action: 'toggle-off';
  } | null>(null);

  // Helper functions
  const getNextTask = () => {
    for (const step of steps) {
      if (step.status === 'in-progress' && step.subTasks) {
        const nextSubTask = step.subTasks.find(st => st.status === 'pending');
        if (nextSubTask) {
          return { step, subTask: nextSubTask };
        }
      }
    }
    return null;
  };

  const getUpcomingTasks = () => {
    const upcoming = [];
    for (const step of steps) {
      if (step.status === 'pending' || (step.status === 'in-progress' && step.subTasks)) {
        if (step.subTasks) {
          const pendingTasks = step.subTasks.filter(st => st.status === 'pending');
          upcoming.push(...pendingTasks.slice(0, 3)); // Limit to 3 upcoming tasks
        }
      }
    }
    return upcoming.slice(0, 3);
  };

  const getDeliverableProgress = (subTask: SubTask) => {
    if (!subTask.deliverables || subTask.deliverables.length === 0) return { completed: 0, total: 0 };
    const completed = subTask.deliverables.filter(d => d.status === 'completed').length;
    return { completed, total: subTask.deliverables.length };
  };

  const getStepProgress = (step: TaskStep) => {
    if (!step.subTasks || step.subTasks.length === 0) return 0;
    const completed = step.subTasks.filter(st => st.status === 'completed').length;
    return Math.round((completed / step.subTasks.length) * 100);
  };

  const handleStepClick = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
    onStepClick?.(stepId);
  };

  const togglePhaseCollapse = (stepId: string) => {
    setCollapsedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    onSubTaskUpdate?.(stepId, subTaskId, status);
  };

  const handleDeliverableUpdate = (stepId: string, subTaskId: string, deliverableId: string, status: 'completed' | 'pending') => {
    onDeliverableUpdate?.(stepId, subTaskId, deliverableId, status);
  };

  // Convert sub-tasks to calendar tasks
  const getCalendarTasks = (): CalendarTask[] => {
    const tasks: CalendarTask[] = [];
    steps.forEach(step => {
      if (step.subTasks) {
        step.subTasks.forEach(subTask => {
          const stepIndex = steps.findIndex(s => s.id === step.id);
          const baseDate = new Date();
          baseDate.setDate(baseDate.getDate() + (stepIndex * 7));
          
          tasks.push({
            id: subTask.id,
            title: subTask.title,
            description: subTask.description,
            status: subTask.status === 'completed' ? 'completed' : 
                   subTask.status === 'in-progress' ? 'in-progress' : 'todo',
            priority: step.status === 'in-progress' ? 'high' : 'medium',
            progress: subTask.status === 'completed' ? 100 : 
                     subTask.status === 'in-progress' ? 50 : 0,
            assignedUsers: subTask.assignedTo ? [subTask.assignedTo] : [],
            comments: 0,
            likes: 0,
            dueDate: baseDate.toISOString().split('T')[0],
            estimatedHours: subTask.estimatedDuration ? 
              parseInt(subTask.estimatedDuration.replace(/\D/g, '')) * 8 : 8
          });
        });
      }
    });
    return tasks;
  };

  const nextTask = getNextTask();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div 
      className="relative"
      style={{ 
        scrollBehavior: 'auto',
        scrollSnapType: 'none'
      }}
      onFocus={(e) => {
        // Prevent focus from causing scrolling
        e.preventDefault();
      }}
      onFocusCapture={(e) => {
        // Prevent focus from causing scrolling during capture phase
        e.preventDefault();
      }}
    >
      {/* Enhanced "What's Next" Section - Always visible */}
      {nextTask && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 aspect-square bg-blue-500 rounded-full animate-pulse"></div>
              <h4 className="text-sm font-medium text-blue-900">What&apos;s Next</h4>
            </div>
            <span className="text-xs sm:text-sm text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full">
              Due in {nextTask.subTask.estimatedDuration || '2 days'}
            </span>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h5 className="text-sm font-semibold text-gray-900 leading-tight">{nextTask.subTask.title}</h5>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">{nextTask.subTask.description}</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <span className="text-xs sm:text-sm text-gray-500">Phase: {nextTask.step.title}</span>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  type="button"
                  data-prevent-card-toggle
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    handleSubTaskUpdate(nextTask.step.id, nextTask.subTask.id, 'completed');
                  }}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
                  style={{ touchAction: 'manipulation' }}
                >
                  Mark Complete
                </button>
                <button
                  type="button"
                  data-prevent-card-toggle
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    handleStepClick(nextTask.step.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        {/* Project Overview Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Project Overview</h3>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 aspect-square bg-green-500 rounded-full flex-shrink-0"></div>
                  <span>{steps.filter(s => s.status === 'completed').length} phases done</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 aspect-square bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>{steps.filter(s => s.status === 'in-progress').length} in progress</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 aspect-square bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <span>{steps.filter(s => s.status === 'pending').length} upcoming</span>
                </div>
              </div>
            </div>
            <div className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
              <div className="text-center sm:text-right">
                <div className="text-sm font-semibold text-blue-600">
                  {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Complete</div>
              </div>
            </div>
          </div>
          
          {/* Overall Project Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-3 sm:mt-4">
            <div 
              className="h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Enhanced Horizontal Timeline Stepper */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="relative w-full">
            {/* Background Timeline Line */}
            <div className="absolute top-4 sm:top-6 lg:top-8 left-3 sm:left-6 right-3 sm:right-6 h-0.5 bg-gray-200 z-0"></div>
            
            <div 
              className="flex items-start justify-between w-full px-3 sm:px-6"
            >
            {steps.map((step) => {
                const isCurrentPhase = step.status === 'in-progress';
                const nextTask = step.subTasks?.find(st => st.status === 'pending');
                const completedTasks = step.subTasks?.filter(st => st.status === 'completed').length || 0;
                const totalTasks = step.subTasks?.length || 0;

              return (
                  <div 
                    key={step.id} 
                    className="relative flex flex-col items-center flex-1 group min-w-0"
                  >
                    
                    {/* Today Marker for Current Phase */}
                    {isCurrentPhase && (
                      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="w-0.5 h-5 bg-blue-500 rounded-full"></div>
                        <div className="text-xs text-blue-600 font-medium mt-2 whitespace-nowrap">Today</div>
                      </div>
                    )}
                    
                    {/* Step Circle */}
                    <div className={`relative z-10 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 aspect-square rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base transition-all duration-300 border-2 border-white ${
                      step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' :
                      step.status === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg ring-1 sm:ring-2 lg:ring-4 ring-blue-200 animate-pulse' :
                      'bg-gradient-to-br from-gray-300 to-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold">{step.stepNumber}</span>
                      )}
                    </div>
                    
                    {/* Step Label - Improved Layout with Better Spacing */}
                    <div className="mt-3 sm:mt-4 lg:mt-5 text-center px-1 sm:px-2 min-w-0 w-full">
                      <div className={`text-xs font-medium leading-tight ${
                        step.status === 'in-progress' ? 'text-blue-700' :
                        step.status === 'completed' ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        <div className="break-words hyphens-auto">
                          {step.title}
                        </div>
                      </div>
                      <div className={`text-xs mt-2 font-medium ${
                        step.status === 'in-progress' ? 'text-blue-500' :
                        step.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                      }`}>
                        {step.estimatedDuration}
                      </div>
                      {/* Progress indicator for current phase */}
                      {isCurrentPhase && step.subTasks && (
                        <div className="text-xs text-blue-600 mt-2 font-medium">
                          {completedTasks}/{totalTasks} tasks
                        </div>
                      )}
                    </div>

                    {/* Enhanced Tooltip */}
                    {nextTask && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                        <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 whitespace-nowrap shadow-xl max-w-xs">
                          <div className="font-semibold mb-1">{nextTask.title}</div>
                          <div className="text-gray-300 text-xs mb-1">
                            {nextTask.estimatedDuration || 'Due soon'}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {completedTasks}/{totalTasks} tasks complete
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
    <div>
            <h3 className="text-sm font-medium text-gray-900">Phase Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              Click on any phase card below to expand and view detailed tasks
                      </p>
                    </div>
          <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
                      <button
              type="button"
              data-prevent-card-toggle
              onClick={() => setViewMode('progress')}
              className={`flex-1 sm:flex-none px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'progress'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              Timeline
                      </button>
                      <button
              type="button"
              data-prevent-card-toggle
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              Calendar
                    </button>
                  </div>
                </div>

      {viewMode === 'progress' ? (
          <div className="space-y-4 lg:space-y-6">
            {/* Next Task Highlighting */}
            {nextTask && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 aspect-square bg-blue-500 rounded-full animate-pulse"></div>
                    <h4 className="text-sm font-medium text-blue-900">Next Task</h4>
                    </div>
                  <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full w-fit">
                    Due in {nextTask.subTask.estimatedDuration || '2 days'}
                  </span>
                </div>
                      <div className="space-y-3">
                  <h5 className="text-sm font-semibold text-gray-900">{nextTask.subTask.title}</h5>
                  <p className="text-sm lg:text-base text-gray-600">{nextTask.subTask.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <span className="text-sm text-gray-500">Phase: {nextTask.step.title}</span>
                                <div className="flex items-center space-x-3">
                                  <button
                        type="button"
                        data-prevent-card-toggle
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          handleSubTaskUpdate(nextTask.step.id, nextTask.subTask.id, 'completed');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm lg:text-base"
                        style={{ touchAction: 'manipulation' }}
                      >
                        Mark Complete
                                  </button>
                                  <button
                        type="button"
                        data-prevent-card-toggle
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          handleStepClick(nextTask.step.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm lg:text-base transition-colors"
                        style={{ touchAction: 'manipulation' }}
                      >
                        View Details →
                                  </button>
                                </div>
                              </div>
                </div>
              </div>
            )}

            {/* Upcoming Tasks Preview */}
            {upcomingTasks.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Upcoming Tasks ({upcomingTasks.length})</h4>
                                          <button
                    type="button"
                    data-prevent-card-toggle
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                  >
                    View All
                                          </button>
                    </div>
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 text-sm">
                      <span className="w-1.5 h-1.5 aspect-square bg-yellow-500 rounded-full flex-shrink-0"></span>
                      <span className="text-gray-700 truncate">{task.title}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500 flex-shrink-0">{task.estimatedDuration || '1 day'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

            {/* Timeline View */}
            <div className="space-y-6">
              {/* Enhanced instruction */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 aspect-square bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Phase Management</h4>
                    <p className="text-sm text-gray-600">
                      Click on any phase card to expand and view detailed tasks
                    </p>
                  </div>
                </div>
              </div>
              {steps.map((step, index) => {
                const isCollapsed = collapsedPhases.has(step.id);
                const progress = getStepProgress(step);
                const isCurrentPhase = step.status === 'in-progress';

              return (
                  <div key={step.id} className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                    isCurrentPhase ? 'border-blue-300 shadow-xl ring-2 ring-blue-100 scale-[1.02]' : 'border-gray-200 shadow-sm hover:shadow-md'
                  }`}>
                    {/* Phase Header */}
                    <div 
                      className={`p-3 sm:p-4 lg:p-6 cursor-pointer transition-all duration-200 ${
                        isCurrentPhase ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={(e) => {
                        // Only toggle if not clicking on interactive elements
                        const target = e.target as HTMLElement;
                        if (!target.closest('button') && 
                            !target.closest('input') && 
                            !target.closest('[role="button"]') &&
                            !target.closest('svg') &&
                            !target.closest('path') &&
                            !target.closest('.subtask-container') &&
                            !target.closest('[data-prevent-card-toggle]')) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.nativeEvent.stopImmediatePropagation();
                          togglePhaseCollapse(step.id);
                        }
                      }}
                    >
                                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                          {/* Timeline Indicator */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
                              step.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg' :
                              step.status === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-1 sm:ring-2 lg:ring-4 ring-blue-200 animate-pulse' : 
                              'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
                            }`}>
                              {step.status === 'completed' ? (
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <span className="text-xs sm:text-sm font-semibold">{step.stepNumber}</span>
                                  )}
                                </div>
                            {index < steps.length - 1 && (
                              <div className={`w-0.5 h-4 sm:h-6 lg:h-8 mt-1 sm:mt-2 ${
                                step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                            )}
                              </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                              <h3 className={`text-xs font-medium truncate ${
                                isCurrentPhase ? 'text-blue-900' : 'text-gray-900'
                              }`}>{step.title}</h3>
                  <div className="flex items-center space-x-2">
                                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full flex-shrink-0 flex items-center gap-1 sm:gap-2 ${
                                  step.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  step.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                  'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {step.status === 'completed' ? (
                                    <>
                                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span className="hidden sm:inline">Done</span>
                                      <span className="sm:hidden">✓</span>
                                    </>
                                  ) : step.status === 'in-progress' ? (
                                    <>
                                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 aspect-square bg-blue-500 rounded-full animate-pulse"></div>
                                      <span className="hidden sm:inline">In Progress</span>
                                      <span className="sm:hidden">●</span>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 aspect-square bg-yellow-500 rounded-full"></div>
                                      <span className="hidden sm:inline">Upcoming</span>
                                      <span className="sm:hidden">○</span>
                                    </>
                                  )}
                    </span>
                                {isCurrentPhase && isCollapsed && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                                    Current Phase
                                  </span>
                            )}
                          </div>
                      </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1">
                              <span className="text-xs sm:text-sm text-gray-600">{step.estimatedDuration}</span>
                              {step.subTasks && (
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {progress}% complete ({step.subTasks.filter(st => st.status === 'completed').length}/{step.subTasks.length} tasks)
                                </span>
                    )}
                  </div>

                            {/* Inline Preview for Next Task */}
                            {isCollapsed && step.subTasks && (() => {
                              const nextTask = step.subTasks.find(st => st.status === 'pending');
                              return nextTask ? (
                                <div className="mt-2 text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-md p-2">
                                  <span className="font-medium">Next Task:</span> {nextTask.title}
                                  {nextTask.estimatedDuration && (
                                    <span className="text-gray-500 ml-1 sm:ml-2">({nextTask.estimatedDuration})</span>
                )}
              </div>
                              ) : null;
                            })()}

                            {/* Current Phase - Show Next Task Prominently */}
                            {isCurrentPhase && step.subTasks && !isCollapsed && (() => {
                              const nextTask = step.subTasks.find(st => st.status === 'pending');
                              return nextTask ? (
                                <div className="mt-3 bg-blue-100 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-blue-600 font-medium">👉 Next Task:</span>
                                    <span className="font-medium text-blue-900">{nextTask.title}</span>
          </div>
                                  <div className="text-sm text-blue-700">
                                    {nextTask.estimatedDuration && `Estimated: ${nextTask.estimatedDuration}`}
                                    {nextTask.assignedTo && ` • Assigned to: ${nextTask.assignedTo}`}
        </div>
                                </div>
                              ) : null;
                            })()}
                            
                            {/* Enhanced Progress Bar */}
                            {step.subTasks && (
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-500 ${
                                    step.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                    step.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                  }`}
                                  style={{ 
                                    width: step.status === 'completed' ? '100%' : `${progress}%`
                                  }}
                                />
                              </div>
                            )}
                                  </div>
                                </div>
                        
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          {isCollapsed && (
                            <span className="text-xs text-gray-500 hidden sm:inline">
                              Click to expand
                        </span>
                      )}
                                  <button
                            type="button"
                            data-prevent-card-toggle
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.nativeEvent.stopImmediatePropagation();
                              togglePhaseCollapse(step.id);
                            }}
                            onFocus={(e) => e.preventDefault()}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            style={{ touchAction: 'manipulation' }}
                            title={isCollapsed ? 'Expand phase details' : 'Collapse phase details'}
                                  >
                                    <svg
                              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                    </div>
                  </div>
                              </div>
                            
                    {/* AI Helper Nudges for Current Phase */}
                    {isCurrentPhase && !isCollapsed && step.subTasks && (() => {
                      const nextTask = step.subTasks.find(st => st.status === 'pending');
                      const completedTasks = step.subTasks.filter(st => st.status === 'completed');
                      return nextTask ? (
                        <div 
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 p-3 sm:p-4"
                          data-prevent-card-toggle
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 aspect-square bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 font-bold text-xs sm:text-sm">AI</span>
                                        </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                                {completedTasks.length > 0 ? (
                                  <>
                                    ✅ {completedTasks[completedTasks.length - 1].title} completed. 
                                    Next up: <strong>{nextTask.title}</strong>. 
                                    Estimated {nextTask.estimatedDuration || '2-3 days'}. 
                                    Do you want me to show documents and assign tasks?
                                  </>
                                ) : (
                                  <>
                                    🚀 Ready to start <strong>{nextTask.title}</strong>? 
                                    Estimated {nextTask.estimatedDuration || '2-3 days'}. 
                                    I can help you review requirements and set up the task.
                                  </>
                                )}
                                          </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                  <button
                                  type="button"
                                  data-prevent-card-toggle
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                  className="text-xs bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                  style={{ touchAction: 'manipulation' }}
                                    >
                                  Show Docs
                                    </button>
                                        <button
                                  type="button"
                                  data-prevent-card-toggle
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-1"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  Assign Tasks
                                </button>
                                <button
                                  type="button"
                                  data-prevent-card-toggle
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800 transition-colors px-1"
                                  style={{ touchAction: 'manipulation' }}
                                >
                                  Ask AI
                  </button>
                </div>
                                    </div>
                                </div>
                              </div>
                      ) : null;
                    })()}

                    {/* Phase Content */}
                    {!isCollapsed && step.subTasks && (
                      <div 
                        className="p-3 sm:p-4 bg-white border-t border-gray-100 subtask-container"
                        data-prevent-card-toggle
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                      {step.subTasks.map((subTask) => {
                            const deliverableProgress = getDeliverableProgress(subTask);
                            const isNextTask = nextTask?.subTask.id === subTask.id;

                        return (
                              <div 
                                key={subTask.id} 
                                className={`rounded-xl border p-3 sm:p-4 lg:p-5 subtask-container transition-all duration-200 ${
                                  isNextTask ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'
                                }`}
                                data-prevent-card-toggle
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                                <button
                                        type="button"
                                        data-prevent-card-toggle
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          e.nativeEvent.stopImmediatePropagation();
                                      const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
                                      handleSubTaskUpdate(step.id, subTask.id, newStatus);
                                  }}
                                        onFocus={(e) => e.preventDefault()}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 aspect-square rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                                    subTask.status === 'completed' 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        style={{ touchAction: 'manipulation' }}
                                  >
                                    {subTask.status === 'completed' && (
                                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                </button>
                                      
                                      <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium text-xs sm:text-sm lg:text-base ${
                                          isNextTask ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                          {isNextTask && <span className="text-blue-600 mr-1 sm:mr-2">👉</span>}
                                          {subTask.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">{subTask.description}</p>
                              </div>
                            </div>

                                    {/* Deliverables Checklist */}
                                {subTask.deliverables && subTask.deliverables.length > 0 && (
                                      <div 
                                        className="mt-3 pl-6 sm:pl-8 subtask-container"
                                        data-prevent-card-toggle
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <div className="mb-2">
                                          <h5 className="text-xs sm:text-sm font-medium text-gray-700">
                                            Deliverables ({deliverableProgress.completed}/{deliverableProgress.total} complete)
                                          </h5>
                                        </div>
                                    <div className="space-y-1.5 sm:space-y-2">
                                      {subTask.deliverables.map((deliverable) => (
                                            <div key={deliverable.id} className="flex items-center space-x-2">
                                          <button
                                                type="button"
                                                data-prevent-card-toggle
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  e.stopPropagation();
                                                  e.nativeEvent.stopImmediatePropagation();
                                              const newStatus = deliverable.status === 'completed' ? 'pending' : 'completed';
                                                  handleDeliverableUpdate(step.id, subTask.id, deliverable.id, newStatus);
                                            }}
                                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 aspect-square rounded border flex items-center justify-center text-xs transition-colors ${
                                              deliverable.status === 'completed' 
                                                    ? 'bg-green-500 border-green-500 text-white' 
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                                style={{ touchAction: 'manipulation' }}
                                          >
                                                {deliverable.status === 'completed' && '✓'}
                                          </button>
                                              <span className={`text-xs sm:text-sm ${
                                                deliverable.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-700'
                                          }`}>
                                                {deliverable.title}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                    {/* Documents - Progressive Disclosure */}
                                {subTask.documents && subTask.documents.length > 0 && (
                                      <div 
                                        className="mt-3 pl-8 subtask-container"
                                        data-prevent-card-toggle
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                        }}
                                      >
                                        <details className="group" data-prevent-card-toggle>
                                          <summary className="text-xs lg:text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                                            📎 Documents ({subTask.documents.length})
                                          </summary>
                                          <div className="mt-2 space-y-1">
                                            {subTask.documents.map((doc) => (
                                              <div key={doc.id} className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600">
                                                <span>📄</span>
                                                <span className="truncate">{doc.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                        </details>
                                  </div>
                                )}
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 ml-4 flex-shrink-0">
                                    {subTask.estimatedDuration && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {subTask.estimatedDuration}
                                      </span>
                                    )}
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                      subTask.status === 'completed' ? 'text-green-800 bg-green-100 border border-green-200' : 
                                      isNextTask ? 'text-blue-800 bg-blue-100 border border-blue-200' : 'text-gray-600 bg-gray-100 border border-gray-200'
                                    }`}>
                                      {subTask.status === 'completed' ? (
                                        <>
                                          <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                          Done
                                        </>
                                      ) : isNextTask ? (
                                        <>
                                          <div className="w-2 h-2 aspect-square bg-blue-500 rounded-full inline-block mr-1 animate-pulse"></div>
                                          Next
                                        </>
                                      ) : (
                                        <>
                                          <div className="w-2 h-2 aspect-square bg-gray-400 rounded-full inline-block mr-1"></div>
                                          Pending
                                        </>
                                      )}
                                    </span>
                                </div>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
              })}
          </div>
      </div>
        ) : (
          <CalendarView
            tasks={getCalendarTasks()}
            onTaskUpdate={onTaskUpdate || (() => {})}
            onAddTask={onAddTask || (() => {})}
          />
        )}

        {/* Confirmation Modal */}
      {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 aspect-square mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to mark this as incomplete? This will affect the overall progress.
              </p>
              <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={() => setShowConfirmation(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                >
                  Cancel
                </button>
                <button
                    type="button"
                    onClick={() => {
                      setShowConfirmation(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    style={{ touchAction: 'manipulation' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LinearTaskFlow;