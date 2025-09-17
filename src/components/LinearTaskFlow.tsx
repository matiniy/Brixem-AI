'use client';

import React, { useState, useEffect } from 'react';

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
  deliverables?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
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
  onStepLock?: (stepId: string, locked: boolean) => void;
  onStepComplete?: (stepId: string) => void;
  onStepAdvance?: (currentStepId: string, nextStepId: string) => void;
}

const LinearTaskFlow: React.FC<LinearTaskFlowProps> = ({ 
  steps, 
  onStepClick,
  onSubTaskUpdate,
  onSubTaskNotesUpdate,
  onStepLock,
  onStepComplete,
  onStepAdvance
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set());
  const [collapsedSubTasks, setCollapsedSubTasks] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>('');
  const [lockedSteps, setLockedSteps] = useState<Set<string>>(new Set());

  // Check for auto-advancement on mount and when steps change
  useEffect(() => {
    console.log('Checking for auto-advancement on mount/update');
    steps.forEach(step => {
      if (step.status === 'in-progress' && areAllSubTasksCompleted(step)) {
        console.log('Found completed step on mount:', step.title);
        handleAutoAdvancement(step.id);
      }
    });
  }, [steps]);

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
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {/* Notification icon for incomplete sub-tasks */}
          {isPreviousStep && hasIncomplete && !isLocked && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );
    } else if (step.status === 'in-progress') {
      return (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 border-2 border-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-xs font-medium">{step.stepNumber}</span>
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
    setExpandedStep(expandedStep === stepId ? null : stepId);
    onStepClick?.(stepId);
  };

  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    onSubTaskUpdate?.(stepId, subTaskId, status);
    
    // Check for auto-advancement after a short delay to allow state updates
    setTimeout(() => {
      handleAutoAdvancement(stepId);
    }, 100);
  };

  const toggleStepCollapse = (stepId: string) => {
    setCollapsedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
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

  // Check if all sub-tasks in a step are completed
  const areAllSubTasksCompleted = (step: TaskStep) => {
    if (!step.subTasks || step.subTasks.length === 0) return false;
    return step.subTasks.every(subTask => subTask.status === 'completed');
  };

  // Handle auto-advancement when all sub-tasks are completed
  const handleAutoAdvancement = (stepId: string) => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <div className="text-sm text-gray-500">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </div>
      </div>

      {/* Responsive Progress Layout */}
      <div className="relative mb-6">
        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between">
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

                    {/* Step Title */}
                    <div className="mt-2 text-center max-w-24">
                      <h4 className={`text-xs font-medium leading-tight ${getStepColor(step)}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
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
            const isCollapsed = collapsedSteps.has(step.id);

            return (
              <div key={step.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Step Header - Always Visible */}
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleStepCollapse(step.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getStepIcon(step, steps.findIndex(s => s.id === step.id))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${getStepColor(step)}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
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
                    
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
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
                {!isCollapsed && (
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
                              <div className="mt-3 space-y-3">
                              {/* Sub-task Notes */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h6 className="text-xs font-semibold text-gray-700">Notes</h6>
                                  <button
                                    onClick={() => handleNotesEdit(step.id, subTask.id, subTask.notes || '')}
                                    className="text-xs text-blue-600 hover:text-blue-800"
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
                                      className="w-full text-xs text-gray-600 bg-white border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows={3}
                                      placeholder="Add notes for this sub-task..."
                                    />
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
                                      <button
                                        onClick={() => handleNotesSave(step.id, subTask.id)}
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded min-h-[2rem]">
                                    {subTask.notes || 'No notes added yet. Click Edit to add notes.'}
                                  </p>
                                )}
                              </div>

                              {/* Sub-task Cards */}
                              {(subTask.materials || subTask.requirements || subTask.deliverables) && (
                                <div className="grid grid-cols-1 gap-3">
                                  {subTask.materials && subTask.materials.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="text-xs font-semibold text-gray-900">Materials</h6>
                                        <div className="flex items-center space-x-1">
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <ul className="space-y-1">
                                        {subTask.materials.map((material, index) => (
                                          <li key={index} className="text-xs text-gray-600 flex items-center">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                            {material}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {subTask.requirements && subTask.requirements.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="text-xs font-semibold text-gray-900">Requirements</h6>
                                        <div className="flex items-center space-x-1">
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <ul className="space-y-1">
                                        {subTask.requirements.map((requirement, index) => (
                                          <li key={index} className="text-xs text-gray-600 flex items-center">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                            {requirement}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {subTask.deliverables && subTask.deliverables.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h6 className="text-xs font-semibold text-gray-900">Deliverables</h6>
                                        <div className="flex items-center space-x-1">
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </button>
                                          <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>
                                      <ul className="space-y-1">
                                        {subTask.deliverables.map((deliverable, index) => (
                                          <li key={index} className="text-xs text-gray-600 flex items-center">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                            {deliverable}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
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

      {/* Desktop: Expanded Step Details */}
      {expandedStep && (
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
                              <div className="space-y-3">
                                {/* Sub-task Notes */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <h6 className="text-xs font-semibold text-gray-700">Notes</h6>
                                    <button
                                      onClick={() => handleNotesEdit(step.id, subTask.id, subTask.notes || '')}
                                      className="text-xs text-blue-600 hover:text-blue-800"
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
                                        className="w-full text-xs text-gray-600 bg-white border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Add notes for this sub-task..."
                                      />
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">Ctrl+Enter to save, Esc to cancel</span>
                                        <button
                                          onClick={() => handleNotesSave(step.id, subTask.id)}
                                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-600 bg-white p-2 rounded min-h-[2rem]">
                                      {subTask.notes || 'No notes added yet. Click Edit to add notes.'}
                                    </p>
                                  )}
                                </div>

                                {/* Sub-task Cards */}
                                {(subTask.materials || subTask.requirements || subTask.deliverables) && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {subTask.materials && subTask.materials.length > 0 && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <h6 className="text-xs font-semibold text-gray-900">Materials</h6>
                                          <div className="flex items-center space-x-1">
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <ul className="space-y-1">
                                          {subTask.materials.map((material, index) => (
                                            <li key={index} className="text-xs text-gray-600 flex items-center">
                                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                              {material}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {subTask.requirements && subTask.requirements.length > 0 && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <h6 className="text-xs font-semibold text-gray-900">Requirements</h6>
                                          <div className="flex items-center space-x-1">
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <ul className="space-y-1">
                                          {subTask.requirements.map((requirement, index) => (
                                            <li key={index} className="text-xs text-gray-600 flex items-center">
                                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                              {requirement}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {subTask.deliverables && subTask.deliverables.length > 0 && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <h6 className="text-xs font-semibold text-gray-900">Deliverables</h6>
                                          <div className="flex items-center space-x-1">
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Add attachment">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="View documents">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                            </button>
                                            <button className="p-1 text-gray-400 hover:text-gray-600" title="Share">
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                              </svg>
                                            </button>
                                          </div>
                                        </div>
                                        <ul className="space-y-1">
                                          {subTask.deliverables.map((deliverable, index) => (
                                            <li key={index} className="text-xs text-gray-600 flex items-center">
                                              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                              {deliverable}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
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
  );
};

export default LinearTaskFlow;