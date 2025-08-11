'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '../../actions';
import PrimaryButton from '@/components/PrimaryButton';

interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  size_sqft?: number;
  status: string;
  created_at: string;
  updated_at: string;
  workspaces: Array<{
    id: string;
    name: string;
  }>;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadProject = async () => {
    try {
      setIsLoading(true);
      const projectData = await getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      // Redirect to dashboard if project not found
      router.push('/dashboard/homeowner');
    } finally {
      setIsLoading(false);
    }
  };

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

  const handleGenerateDocuments = async () => {
    try {
      setIsGenerating(true);
      
      // Call the document generation API
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          type: 'sow'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }

      await response.json(); // Response is consumed but not used yet
      
      // Show success message and redirect to documents view
      alert('Documents generated successfully! You can now download your Scope of Work and Estimate.');
      
      // TODO: Redirect to documents view or show documents inline
      
    } catch (error) {
      console.error('Error generating documents:', error);
      alert('Failed to generate documents. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <button
            onClick={() => router.push('/dashboard/homeowner')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/homeowner')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              
              <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm rounded-full ${
                project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Overview</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <p className="text-gray-900">{project.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{project.location}</p>
                    </div>
                    {project.size_sqft && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <p className="text-gray-900">{project.size_sqft} sq ft</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <p className="text-gray-900 capitalize">{project.status}</p>
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                      <p className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                      <p className="text-gray-900">{new Date(project.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-4">
                <PrimaryButton
                  onClick={handleGenerateDocuments}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generate Scope & Estimate
                    </>
                  )}
                </PrimaryButton>

                <button
                  onClick={() => router.push('/dashboard/homeowner')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Edit Project
                </button>

                <button
                  onClick={() => router.push('/dashboard/homeowner')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  View Timeline
                </button>
              </div>

              {/* Workspace Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Workspace</h4>
                <p className="text-sm text-gray-900">{project.workspaces[0]?.name || 'Unknown'}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Next Steps</h3>
              <ol className="space-y-3 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">1</span>
                  <span>Generate your Scope of Work and Estimate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">2</span>
                  <span>Review and customize the generated documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">3</span>
                  <span>Download PDFs and share with contractors</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
