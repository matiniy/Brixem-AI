'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getProjects } from '../actions';

interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  size_sqft?: number;
  type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  progress: number;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  color: string;
  createdAt: string;
  projectId?: string;
}

function DocumentsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Project Proposal',
      type: 'PDF',
      size: '2.3 MB',
      color: 'red',
      createdAt: '2024-01-15',
      projectId: '1'
    },
    {
      id: '2', 
      name: 'Contract Agreement',
      type: 'PDF',
      size: '1.8 MB',
      color: 'blue',
      createdAt: '2024-01-16',
      projectId: '1'
    },
    {
      id: '3',
      name: 'Progress Report',
      type: 'PDF', 
      size: '0.9 MB',
      color: 'green',
      createdAt: '2024-01-17',
      projectId: '1'
    },
    {
      id: '4',
      name: 'Scope of Works - Kitchen Renovation',
      type: 'PDF',
      size: '1.2 MB',
      color: 'purple',
      createdAt: '2024-01-18',
      projectId: '1'
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Check for project ID in URL params
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [searchParams, projects]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: Math.floor(Math.random() * 100)
      }));
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    window.location.href = `/dashboard/project/${projectId}`;
  };

  const handleGenerateDocument = () => {
    const newDocument = {
      id: Date.now().toString(),
      name: 'Generated Document',
      type: 'PDF',
      size: '1.5 MB',
      color: 'purple',
      createdAt: new Date().toISOString().split('T')[0],
      projectId: '1'
    };
    
    setDocuments(prev => [...prev, newDocument]);
    
    setToastMessage('✅ Document generated successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDocumentClick = (document: Document) => {
    // TODO: Implement document viewing/editing
    alert(`Opening document: ${document.name}`);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    setToastMessage('Document deleted successfully');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProject=""
        onProjectSelect={handleProjectSelect}
        onProjectCreate={() => {}}
        onProjectDelete={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Back to Project Button */}
                {currentProject && (
                  <button
                    onClick={() => router.push(`/dashboard/project/${currentProject.id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to {currentProject.name}
                  </button>
                )}
                
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {currentProject ? `${currentProject.name} - Documents` : 'Documents'}
                </h1>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleGenerateDocument}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Document
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full p-6 overflow-y-auto">
            {/* Breadcrumb Navigation */}
            {currentProject && (
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                <button
                  onClick={() => router.push('/dashboard/homeowner')}
                  className="hover:text-gray-700 transition"
                >
                  Dashboard
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button
                  onClick={() => router.push(`/dashboard/project/${currentProject.id}`)}
                  className="hover:text-gray-700 transition"
                >
                  {currentProject.name}
                </button>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">Documents</span>
              </nav>
            )}
            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleDocumentClick(document)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 bg-${document.color}-100 rounded-lg`}>
                      <svg className={`w-6 h-6 text-${document.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(document.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-100 transition"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{document.name}</h3>
                    <p className="text-sm text-gray-500">{document.type} • {document.size}</p>
                    <p className="text-xs text-gray-400 mt-1">Created {document.createdAt}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Click to open</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {documents.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                <p className="text-gray-500 mb-4">Generate your first document to get started</p>
                <button
                  onClick={handleGenerateDocument}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition"
                >
                  Generate Document
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transform transition-all duration-300 ease-in-out animate-bounce">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    }>
      <DocumentsPageContent />
    </Suspense>
  );
}
