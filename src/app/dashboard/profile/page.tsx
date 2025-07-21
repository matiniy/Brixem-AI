"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "Homeowner",
    location: "San Francisco, CA"
  });

  // Mock projects data for the sidebar
  const mockProjects = [
    {
      id: "1",
      name: "Kitchen Renovation",
      progress: 75,
      type: "renovation",
      status: "in-progress",
      budget: "$25,000 - $35,000",
      description: "Modern kitchen renovation with new cabinets and countertops",
      location: "San Francisco, CA",
      timeline: "8-12 weeks",
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      name: "Bathroom Remodel",
      progress: 45,
      type: "renovation",
      status: "planning",
      budget: "$15,000 - $25,000",
      description: "Complete bathroom remodel with new fixtures",
      location: "San Francisco, CA",
      timeline: "6-8 weeks",
      createdAt: "2024-02-01"
    }
  ];

  const [projects, setProjects] = useState(mockProjects);
  const [activeProject, setActiveProject] = useState("1");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
  };

  const handleProjectCreate = (project: any) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      progress: 0
    };
    setProjects(prev => [...prev, newProject]);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(projects[0]?.id || "");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        onProjectCreate={handleProjectCreate}
        onProjectDelete={handleProjectDelete}
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(!isMobileOpen)}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMobileOpen(!isMobileOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link href="/dashboard/homeowner" className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={user.phone}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={user.location}
                    onChange={(e) => setUser({...user, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#23c6e6] focus:border-transparent"
                  />
                </div>
                
                <div className="pt-4">
                  <button className="px-6 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-medium rounded-lg hover:opacity-90 transition">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 