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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        <div className="text-sm text-gray-500">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </div>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="relative mb-6">
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

      {/* Expanded Step Details */}
      {expandedStep && (
        <div className="border-t border-gray-200 pt-4">
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
                                const newStatus = subTask.status === 'completed' ? 'pending' : 
                                                subTask.status === 'pending' ? 'in-progress' : 'completed';
                                handleSubTaskUpdate(step.id, subTask.id, newStatus);
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                subTask.status === 'completed' 
                                  ? 'bg-green-500 border-green-500' 
                                  : subTask.status === 'in-progress'
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {subTask.status === 'completed' && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {subTask.status === 'in-progress' && (
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              )}
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
                              subTask.status === 'completed' ? 'text-green-600' :
                              subTask.status === 'in-progress' ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                              {subTask.status === 'completed' ? 'Done' : 
                               subTask.status === 'in-progress' ? 'Active' : 'Pending'}
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
