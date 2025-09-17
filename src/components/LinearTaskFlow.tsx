'use client';

import React, { useState } from 'react';

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedDuration?: string;
  assignedTo?: string;
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
}

const LinearTaskFlow: React.FC<LinearTaskFlowProps> = ({ 
  steps, 
  onStepClick,
  onSubTaskUpdate 
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set());

  const getStepIcon = (step: TaskStep) => {
    if (step.status === 'completed') {
      return (
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
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
                            {getStepIcon(step)}
                          </div>

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
                            {getStepIcon(step)}
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
                              {step.subTasks.map((subTask) => (
                                <div key={subTask.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => {
                                        const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
                                        handleSubTaskUpdate(step.id, subTask.id, newStatus);
                                      }}
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer ${
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
                                    <div>
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
                                      {subTask.status === 'completed' ? 'ON' : 'OFF'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Step Details */}
                          {step.details && (
                            <div className="mt-4 space-y-4">
                              {step.details.materials && step.details.materials.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-semibold text-gray-900 mb-2">Materials Required</h6>
                                  <ul className="space-y-1">
                                    {step.details.materials.map((material, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        {material}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {step.details.requirements && step.details.requirements.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h6>
                                  <ul className="space-y-1">
                                    {step.details.requirements.map((requirement, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        {requirement}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {step.details.deliverables && step.details.deliverables.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-semibold text-gray-900 mb-2">Deliverables</h6>
                                  <ul className="space-y-1">
                                    {step.details.deliverables.map((deliverable, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                        {deliverable}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {step.details.notes && (
                                <div>
                                  <h6 className="text-sm font-semibold text-gray-900 mb-2">Notes</h6>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{step.details.notes}</p>
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
                      {step.subTasks.map((subTask) => (
                        <div key={subTask.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                const newStatus = subTask.status === 'completed' ? 'pending' : 'completed';
                                handleSubTaskUpdate(step.id, subTask.id, newStatus);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer ${
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
                            <div>
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
                              {subTask.status === 'completed' ? 'ON' : 'OFF'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step Details */}
                {step.details && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {step.details.materials && step.details.materials.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Materials Required</h6>
                        <ul className="space-y-1">
                          {step.details.materials.map((material, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {material}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.details.requirements && step.details.requirements.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h6>
                        <ul className="space-y-1">
                          {step.details.requirements.map((requirement, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.details.deliverables && step.details.deliverables.length > 0 && (
                      <div>
                        <h6 className="text-sm font-semibold text-gray-900 mb-2">Deliverables</h6>
                        <ul className="space-y-1">
                          {step.details.deliverables.map((deliverable, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                              {deliverable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {step.details?.notes && (
                  <div>
                    <h6 className="text-sm font-semibold text-gray-900 mb-2">Notes</h6>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{step.details.notes}</p>
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
