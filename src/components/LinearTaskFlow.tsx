'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  currentStep,
  onStepClick,
  onSubTaskUpdate,
  onSubTaskNotesUpdate,
  onDeliverableUpdate,
  onStepLock,
  onStepComplete,
  onStepAdvance,
  onStepStatusUpdate,
  onTaskUpdate,
  onAddTask
}) => {
  // Debug: Log the steps data to see what we're receiving
  console.log('LinearTaskFlow received steps:', steps);
  console.log('First step sub-tasks:', steps[0]?.subTasks);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [collapsedSubTasks, setCollapsedSubTasks] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>('');
  const [lockedSteps, setLockedSteps] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'progress' | 'calendar'>('progress');
  const [showConfirmation, setShowConfirmation] = useState<{
    type: 'step' | 'subtask';
    stepId: string;
    subTaskId?: string;
    action: 'toggle-off';
  } | null>(null);

  // Check if all sub-tasks in a step are completed
  const areAllSubTasksCompleted = (step: TaskStep) => {
    if (!step.subTasks || step.subTasks.length === 0) return false;
    return step.subTasks.every(subTask => subTask.status === 'completed');
  };

  // Handle auto-advancement when all sub-tasks are completed
  const handleAutoAdvancement = useCallback((stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step) {
      console.log('Step not found:', stepId);
      return;
    }

    console.log('Checking auto-advancement for step:', step.title, 'Status:', step.status);
    console.log('Sub-tasks:', step.subTasks?.map(st => ({ title: st.title, status: st.status })));

    // Check if all sub-tasks are completed
    if (areAllSubTasksCompleted(step)) {
      console.log('All sub-tasks completed! Auto-advancing...');
      
      // Mark current step as completed
      onStepComplete?.(stepId);
      
      // Find next step
      const currentIndex = steps.findIndex(s => s.id === stepId);
      const nextStep = steps[currentIndex + 1];
      
      if (nextStep) {
        console.log('Advancing to next step:', nextStep.title);
        // Advance to next step
        onStepAdvance?.(stepId, nextStep.id);
      } else {
        console.log('No next step found - this is the last step');
      }
    } else {
      console.log('Not all sub-tasks completed yet');
    }
  }, [steps, onStepComplete, onStepAdvance]);

  // Check for auto-advancement on mount and when steps change
  useEffect(() => {
    console.log('Checking for auto-advancement on mount/update');
    steps.forEach(step => {
      if (step.status === 'in-progress' && areAllSubTasksCompleted(step)) {
        console.log('Found completed step on mount:', step.title);
        handleAutoAdvancement(step.id);
      }
    });
  }, [steps, handleAutoAdvancement]);

  // Update expanded step when currentStep changes
  useEffect(() => {
    if (currentStep && currentStep !== expandedStep) {
      console.log('Updating expanded step from', expandedStep, 'to', currentStep);
      setExpandedStep(currentStep);
    }
  }, [currentStep, expandedStep]);

  // Initialize expanded step on mount
  useEffect(() => {
    if (currentStep && !expandedStep) {
      console.log('Initializing expanded step to', currentStep);
      setExpandedStep(currentStep);
    }
  }, [currentStep, expandedStep]);

  // Check if a step has incomplete sub-tasks
  const hasIncompleteSubTasks = (step: TaskStep) => {
    if (!step.subTasks) return false;
    return step.subTasks.some(subTask => subTask.status !== 'completed');
  };

  const getStepIcon = (step: TaskStep, stepIndex: number) => {
    const isLocked = lockedSteps.has(step.id);
    const hasIncomplete = hasIncompleteSubTasks(step);
    const currentStepIndex = steps.findIndex(s => s.status !== 'completed');
    const isPreviousStep = stepIndex < currentStepIndex;
    
    if (step.status === 'completed') {
      return (
        <div className="relative">
          <div className={`w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ${isLocked ? 'ring-2 ring-blue-500' : ''}`}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Lock icon */}
          {isLocked && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {/* Notification icon for incomplete sub-tasks */}
          {isPreviousStep && hasIncomplete && !isLocked && (
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center z-10 animate-pulse">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );
    } else if (step.status === 'in-progress') {
      return (
        <div className="relative">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="relative">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xs font-medium">{step.stepNumber}</span>
          </div>
        </div>
      );
    }
  };

  const getStepColor = (step: TaskStep) => {
    if (step.status === 'completed') return 'text-green-600';
    if (step.status === 'in-progress') return 'text-blue-600';
    return 'text-gray-400';
  };

  const getConnectorColor = (currentStep: TaskStep) => {
    if (currentStep.status === 'completed') return 'bg-green-500';
    if (currentStep.status === 'in-progress') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const handleStepClick = (stepId: string) => {
    // Allow viewing any step, even completed ones
    setExpandedStep(expandedStep === stepId ? null : stepId);
    onStepClick?.(stepId);
  };

  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    // If trying to toggle off a completed sub-task, show confirmation
    if (status === 'pending') {
      const step = steps.find(s => s.id === stepId);
      const subTask = step?.subTasks?.find(st => st.id === subTaskId);
      if (subTask?.status === 'completed') {
        setShowConfirmation({
          type: 'subtask',
          stepId,
          subTaskId,
          action: 'toggle-off'
        });
        return;
      }
    }
    
    onSubTaskUpdate?.(stepId, subTaskId, status);
    
    // Check for auto-advancement after a short delay to allow state updates
    setTimeout(() => {
      handleAutoAdvancement(stepId);
    }, 100);
  };

  const handleStepStatusUpdate = (stepId: string, status: 'completed' | 'in-progress' | 'pending') => {
    // If trying to toggle off a completed step, show confirmation
    if (status !== 'completed') {
      const step = steps.find(s => s.id === stepId);
      if (step?.status === 'completed') {
        setShowConfirmation({
          type: 'step',
          stepId,
          action: 'toggle-off'
        });
        return;
      }
    }
    onStepStatusUpdate?.(stepId, status);
  };

  const toggleSubTaskCollapse = (subTaskId: string) => {
    setCollapsedSubTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subTaskId)) {
        newSet.delete(subTaskId);
      } else {
        newSet.add(subTaskId);
      }
      return newSet;
    });
  };

  const handleNotesEdit = (stepId: string, subTaskId: string, currentNotes: string) => {
    setEditingNotes(`${stepId}-${subTaskId}`);
    setNotesValue(currentNotes || '');
  };

  const handleNotesSave = (stepId: string, subTaskId: string) => {
    onSubTaskNotesUpdate?.(stepId, subTaskId, notesValue);
    setEditingNotes(null);
    setNotesValue('');
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setNotesValue('');
  };

  const handleNotesKeyPress = (e: React.KeyboardEvent, stepId: string, subTaskId: string) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleNotesSave(stepId, subTaskId);
    } else if (e.key === 'Escape') {
      handleNotesCancel();
    }
  };

  // Handle step locking
  const handleStepLock = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLockedSteps = new Set(lockedSteps);
    if (newLockedSteps.has(stepId)) {
      newLockedSteps.delete(stepId);
    } else {
      newLockedSteps.add(stepId);
    }
    setLockedSteps(newLockedSteps);
    onStepLock?.(stepId, newLockedSteps.has(stepId));
  };

  // Check if sub-task can be toggled (step not locked)
  const canToggleSubTask = (stepId: string) => {
    return !lockedSteps.has(stepId);
  };

  // Handle confirmation actions
  const handleConfirmationConfirm = () => {
    if (!showConfirmation) return;
    
    if (showConfirmation.type === 'subtask' && showConfirmation.subTaskId) {
      onSubTaskUpdate?.(showConfirmation.stepId, showConfirmation.subTaskId, 'pending');
    } else if (showConfirmation.type === 'step') {
      // Find the current step status and toggle it
      const step = steps.find(s => s.id === showConfirmation.stepId);
      if (step) {
        const newStatus = step.status === 'completed' ? 'in-progress' : 'pending';
        onStepStatusUpdate?.(showConfirmation.stepId, newStatus);
      }
    }
    
    setShowConfirmation(null);
  };

  const handleConfirmationCancel = () => {
    setShowConfirmation(null);
  };

  // Convert sub-tasks to calendar tasks
  const getCalendarTasks = (): CalendarTask[] => {
    const tasks: CalendarTask[] = [];
    steps.forEach(step => {
      if (step.subTasks) {
        step.subTasks.forEach(subTask => {
          // Generate a due date based on step order and estimated duration
          const stepIndex = steps.findIndex(s => s.id === step.id);
          const baseDate = new Date();
          baseDate.setDate(baseDate.getDate() + (stepIndex * 7)); // Each step gets a week
          
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


  return (
    <div>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('progress')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'progress'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === 'progress' ? (
        <div className="relative mb-6">
          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:block">
            <div className="flex items-start justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const isExpanded = expandedStep === step.id;

              return (
                <div key={step.id} className="flex items-start flex-1">
                  {/* Step Circle and Content */}
                  <div className="flex flex-col items-center flex-1 relative">
                    <div
                      className={`cursor-pointer transition-all duration-200 ${isExpanded ? 'scale-110' : 'hover:scale-105'}`}
                      onClick={() => handleStepClick(step.id)}
                    >
                      {getStepIcon(step, index)}
                    </div>
                    
                    {/* Lock button for completed steps */}
                    {step.status === 'completed' && (
                      <button
                        onClick={(e) => handleStepLock(step.id, e)}
                        className={`mt-1 p-1 rounded-full transition-colors ${
                          lockedSteps.has(step.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={lockedSteps.has(step.id) ? 'Unlock step' : 'Lock step'}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}

                    {/* Step status toggle button */}
                    {onStepStatusUpdate && (
                      <button
                        onClick={() => {
                          const newStatus = step.status === 'completed' ? 'in-progress' : 
                                           step.status === 'in-progress' ? 'pending' : 'completed';
                          handleStepStatusUpdate(step.id, newStatus);
                        }}
                        className="mt-1 p-1 rounded-full transition-colors bg-gray-100 text-gray-400 hover:bg-gray-200"
                        title={`Toggle step status: ${step.status === 'completed' ? 'Mark as in-progress' : 
                                                      step.status === 'in-progress' ? 'Mark as pending' : 'Mark as completed'}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}

                    {/* Step Title */}
                    <div className="mt-2 text-center max-w-24 min-w-0">
                      <h4 className={`text-xs font-medium leading-tight ${getStepColor(step)} truncate`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {step.estimatedDuration}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div className="flex-1 h-0.5 mx-2 mt-4">
                      <div className={`w-full h-full ${getConnectorColor(step)}`}></div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden space-y-4">
            {steps.map((step) => {
              const isExpanded = expandedStep === step.id;

              return (
                <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Step Header - Always Visible */}
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step, steps.findIndex(s => s.id === step.id))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${getStepColor(step)} truncate`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {step.estimatedDuration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getStepColor(step)}`}>
                      {step.status === 'completed' ? 'Completed' :
                       step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                    </span>
                    
                    {/* Lock button for completed steps */}
                    {step.status === 'completed' && (
                      <button
                        onClick={(e) => handleStepLock(step.id, e)}
                        className={`p-1 rounded-full transition-colors ${
                          lockedSteps.has(step.id) 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={lockedSteps.has(step.id) ? 'Unlock step' : 'Lock step'}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}

                    {/* Step status toggle button */}
                    {onStepStatusUpdate && (
                      <button
                        onClick={() => {
                          const newStatus = step.status === 'completed' ? 'in-progress' : 
                                           step.status === 'in-progress' ? 'pending' : 'completed';
                          handleStepStatusUpdate(step.id, newStatus);
                        }}
                        className="p-1 rounded-full transition-colors bg-gray-100 text-gray-400 hover:bg-gray-200"
                        title={`Toggle step status: ${step.status === 'completed' ? 'Mark as in-progress' : 
                                                      step.status === 'in-progress' ? 'Mark as pending' : 'Mark as completed'}`}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '' : 'rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Step Content - Collapsible */}
                {isExpanded && (
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                    
                    {/* Sub-tasks */}
                    {step.subTasks && step.subTasks.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-sm font-semibold text-gray-900">Sub-tasks</h5>
                        {step.subTasks.map((subTask) => {
                          const isSubTaskCollapsed = collapsedSubTasks.has(subTask.id);
                          return (
                            <div key={subTask.id}>
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <button
                                    onClick={() => {
                                      if (canToggleSubTask(step.id)) {
                                        const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
                                        handleSubTaskUpdate(step.id, subTask.id, newStatus);
                                      }
                                    }}
                                    disabled={!canToggleSubTask(step.id)}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                      canToggleSubTask(step.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                    } ${
                                      subTask.status === 'completed' 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                                        subTask.status === 'completed' ? 'translate-x-7' : 'translate-x-1'
                                      }`}
                                    >
                                      {subTask.status === 'completed' && (
                                        <svg className="h-4 w-4 text-green-500 m-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {subTask.status === 'pending' && (
                                        <svg className="h-4 w-4 text-gray-400 m-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </span>
                                  </button>
                                  <div className="flex-1">
                                    <h6 className="text-sm font-medium text-gray-900">{subTask.title}</h6>
                                    <p className="text-xs text-gray-600">{subTask.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {subTask.estimatedDuration && (
                                    <span className="text-xs text-gray-500">{subTask.estimatedDuration}</span>
                                  )}
                                  <span className={`text-xs font-medium ${
                                    subTask.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                  }`}>
                                    {subTask.status === 'completed' ? 'Complete' : 'Not Complete'}
                                  </span>
                                  <button
                                    onClick={() => toggleSubTaskCollapse(subTask.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                    title={isSubTaskCollapsed ? 'Expand details' : 'Collapse details'}
                                  >
                                    <svg
                                      className={`w-4 h-4 transition-transform ${isSubTaskCollapsed ? 'rotate-180' : ''}`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            
                            {/* Sub-task Details - Collapsible */}
                            {!isSubTaskCollapsed && (
                              <div className="mt-3 space-y-4">
                                {/* Deliverables Section */}
                                {subTask.deliverables && subTask.deliverables.length > 0 && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Deliverables</h6>
                                    <div className="space-y-2">
                                      {subTask.deliverables.map((deliverable) => (
                                        <div key={deliverable.id} className="flex items-center space-x-3">
                                          <button
                                            onClick={() => {
                                              // Toggle deliverable status
                                              const newStatus = deliverable.status === 'completed' ? 'pending' : 'completed';
                                              // Call the deliverable update handler
                                              onDeliverableUpdate?.(step.id, subTask.id, deliverable.id, newStatus);
                                            }}
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors hover:scale-110 ${
                                              deliverable.status === 'completed' 
                                                ? 'bg-green-500 border-green-500 hover:bg-green-600' 
                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                            }`}
                                          >
                                            {deliverable.status === 'completed' && (
                                              <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                          </button>
                                          <span className="text-sm text-gray-700 flex-1">{deliverable.title}</span>
                                          <span className={`text-xs italic ${
                                            deliverable.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                                          }`}>
                                            {deliverable.status === 'completed' ? 'Completed' : 'To Do'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Documents Section */}
                                {subTask.documents && subTask.documents.length > 0 && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Documents</h6>
                                    <div className="space-y-2">
                                      {subTask.documents.map((document) => (
                                        <div key={document.id} className="flex items-center space-x-3">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                          </svg>
                                          <span className="text-sm text-gray-700 flex-1">{document.name}</span>
                                          <div className="flex items-center space-x-2">
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="View document">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Share document">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes Section - Moved to bottom */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-sm font-semibold text-gray-900">Notes</h6>
                                    <button
                                      onClick={() => handleNotesEdit(step.id, subTask.id, subTask.notes || '')}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      {editingNotes === `${step.id}-${subTask.id}` ? 'Cancel' : 'Edit'}
                                    </button>
                                  </div>
                                  {editingNotes === `${step.id}-${subTask.id}` ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={notesValue}
                                        onChange={(e) => setNotesValue(e.target.value)}
                                        onKeyDown={(e) => handleNotesKeyPress(e, step.id, subTask.id)}
                                        className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Add notes for this sub-task..."
                                      />
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
                                        <button
                                          onClick={() => handleNotesSave(step.id, subTask.id)}
                                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded min-h-[3rem]">
                                      {subTask.notes || 'No notes added yet. Click Edit to add notes.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    )}
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

      {/* Desktop: Expanded Step Details */}
      {expandedStep && viewMode === 'progress' && (
        <div className="hidden md:block border-t border-gray-200 pt-4">
          {(() => {
            const step = steps.find(s => s.id === expandedStep);
            if (!step) return null;

            return (
              <div className="space-y-4">
                {/* Step Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className={`text-sm font-medium ${getStepColor(step)}`}>
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'in-progress' ? 'In Progress' : 'Pending'}
                      </span>
                      {step.estimatedDuration && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {step.estimatedDuration}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedStep(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Sub-tasks */}
                {step.subTasks && step.subTasks.length > 0 && (
                  <div>
                    <h5 className="text-md font-semibold text-gray-900 mb-4">Sub-tasks</h5>
                    <div className="space-y-3">
                      {step.subTasks.map((subTask) => {
                        const isCollapsed = collapsedSubTasks.has(subTask.id);
                        return (
                          <div key={subTask.id} className="bg-gray-50 rounded-lg p-4">
                            {/* Sub-task Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => {
                                    if (canToggleSubTask(step.id)) {
                                      const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
                                      handleSubTaskUpdate(step.id, subTask.id, newStatus);
                                    }
                                  }}
                                  disabled={!canToggleSubTask(step.id)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                                    canToggleSubTask(step.id) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                                  } ${
                                    subTask.status === 'completed' 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      subTask.status === 'completed' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  >
                                    {subTask.status === 'completed' && (
                                      <svg className="h-3 w-3 text-green-500 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    {subTask.status === 'pending' && (
                                      <svg className="h-3 w-3 text-gray-400 m-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </span>
                                </button>
                                <div className="flex-1">
                                  <h6 className="text-sm font-medium text-gray-900">{subTask.title}</h6>
                                  <p className="text-xs text-gray-600">{subTask.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {subTask.estimatedDuration && (
                                  <span className="text-xs text-gray-500">{subTask.estimatedDuration}</span>
                                )}
                                <span className={`text-xs font-medium ${
                                  subTask.status === 'completed' ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {subTask.status === 'completed' ? 'Complete' : 'Not Complete'}
                                </span>
                                <button
                                  onClick={() => toggleSubTaskCollapse(subTask.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  title={isCollapsed ? 'Expand details' : 'Collapse details'}
                                >
                                  <svg
                                    className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* Sub-task Details - Collapsible */}
                            {!isCollapsed && (
                              <div className="space-y-4">
                                {/* Deliverables Section */}
                                {subTask.deliverables && subTask.deliverables.length > 0 && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Deliverables</h6>
                                    <div className="space-y-2">
                                      {subTask.deliverables.map((deliverable) => (
                                        <div key={deliverable.id} className="flex items-center space-x-3">
                                          <button
                                            onClick={() => {
                                              // Toggle deliverable status
                                              const newStatus = deliverable.status === 'completed' ? 'pending' : 'completed';
                                              // Call the deliverable update handler
                                              onDeliverableUpdate?.(step.id, subTask.id, deliverable.id, newStatus);
                                            }}
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors hover:scale-110 ${
                                              deliverable.status === 'completed' 
                                                ? 'bg-green-500 border-green-500 hover:bg-green-600' 
                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                            }`}
                                          >
                                            {deliverable.status === 'completed' && (
                                              <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                          </button>
                                          <span className="text-sm text-gray-700 flex-1">{deliverable.title}</span>
                                          <span className={`text-xs italic ${
                                            deliverable.status === 'completed' ? 'text-green-600' : 'text-gray-500'
                                          }`}>
                                            {deliverable.status === 'completed' ? 'Completed' : 'To Do'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Documents Section */}
                                {subTask.documents && subTask.documents.length > 0 && (
                                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Documents</h6>
                                    <div className="space-y-2">
                                      {subTask.documents.map((document) => (
                                        <div key={document.id} className="flex items-center space-x-3">
                                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                          </svg>
                                          <span className="text-sm text-gray-700 flex-1">{document.name}</span>
                                          <div className="flex items-center space-x-2">
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="View document">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Share document">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes Section - Moved to bottom */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <h6 className="text-sm font-semibold text-gray-900">Notes</h6>
                                    <button
                                      onClick={() => handleNotesEdit(step.id, subTask.id, subTask.notes || '')}
                                      className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                      {editingNotes === `${step.id}-${subTask.id}` ? 'Cancel' : 'Edit'}
                                    </button>
                                  </div>
                                  {editingNotes === `${step.id}-${subTask.id}` ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={notesValue}
                                        onChange={(e) => setNotesValue(e.target.value)}
                                        onKeyDown={(e) => handleNotesKeyPress(e, step.id, subTask.id)}
                                        className="w-full text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Add notes for this sub-task..."
                                      />
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
                                        <button
                                          onClick={() => handleNotesSave(step.id, subTask.id)}
                                          className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded min-h-[3rem]">
                                      {subTask.notes || 'No notes added yet. Click Edit to add notes.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          </div>
        )}
      </div>

      {/* Confirmation Overlay */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Confirm Action
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {showConfirmation?.type === 'subtask' 
                  ? 'Are you sure you want to mark this sub-task as incomplete? This will affect the overall progress.'
                  : 'Are you sure you want to mark this step as incomplete? This will affect the overall progress.'
                }
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmationCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmationConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinearTaskFlow;