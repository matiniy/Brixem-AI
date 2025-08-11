'use client';

import { useState } from 'react';
import { PlusIcon, DocumentTextIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PrimaryButton } from './PrimaryButton';

interface ZeroStateProps {
  onCreateProject: () => void;
}

export function ZeroState({ onCreateProject }: ZeroStateProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateProject = () => {
    setIsLoading(true);
    onCreateProject();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12 text-center">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Brixem
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Your AI-powered construction planning assistant. Create your first project and let us help you generate professional scope of work documents and estimates.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="mb-12">
        <PrimaryButton
          onClick={handleCreateProject}
          disabled={isLoading}
          className="px-8 py-4 text-lg"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          {isLoading ? 'Creating...' : 'Start a New Project'}
        </PrimaryButton>
      </div>

      {/* Process Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mb-12">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Project Basics</h3>
          <p className="text-gray-600 text-sm text-center">
            Define your project scope, location, and requirements
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-gray-600 text-sm text-center">
            Get AI-generated scope of work and estimates
          </p>
        </div>

        <div className="flex flex-col items-center p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Export & Share</h3>
          <p className="text-gray-600 text-sm text-center">
            Download professional PDFs and share with contractors
          </p>
        </div>
      </div>

      {/* Secondary CTA */}
      <div className="text-center">
        <p className="text-gray-500 mb-4">Want to see how it works?</p>
        <button
          onClick={() => {
            // TODO: Implement sample project loading
            console.log('Load sample project');
          }}
          className="text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Load a Sample Project
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <div className="text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              Professional scope of work documents
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              Detailed cost estimates and timelines
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              PDF export for contractor sharing
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              AI-powered insights and recommendations
            </li>
          </ul>
        </div>

        <div className="text-left">
          <h3 className="font-semibold text-gray-900 mb-3">Perfect for:</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              Home renovations and remodels
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              Kitchen and bathroom updates
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              Basement finishing projects
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              Outdoor living spaces
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
