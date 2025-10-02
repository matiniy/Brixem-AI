"use client";
import React, { useState } from "react";
import { Plus, MessageSquare, Users, Calendar, DollarSign, FileText, Menu, Paperclip, TrendingUp, CheckCircle, ArrowUp, Home, FolderOpen, CreditCard, Settings, Bell, Check, Award } from 'lucide-react';

export default function HomeownerDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole] = useState('homeowner');
  const [selectedProject, setSelectedProject] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const projects = [
    {
      id: 1,
      name: 'Kitchen Extension',
      type: 'Extension',
      status: 'In Progress',
      progress: 65,
      startDate: '2025-08-15',
      endDate: '2025-12-20',
      budget: 85000,
      spent: 45000,
      tasks: [
        { name: 'Foundation Work', status: 'done', progress: 100 },
        { name: 'Steel Frame Installation', status: 'in-progress', progress: 60 },
        { name: 'Roof Installation', status: 'todo', progress: 0, dependency: 'Steel Frame' },
        { name: 'Electrical Rough-in', status: 'todo', progress: 0 }
      ],
      documents: ['SOW', 'WBS', 'Schedule', 'Cost Estimate'],
      team: [
        { name: 'John Smith', role: 'Architect', status: 'active' },
        { name: 'BuildCo Ltd', role: 'Contractor', status: 'active' },
        { name: 'Sarah Johnson', role: 'Structural Engineer', status: 'reviewing' }
      ]
    },
    {
      id: 2,
      name: 'Loft Conversion',
      type: 'Loft',
      status: 'Planning',
      progress: 15,
      startDate: '2025-11-01',
      endDate: '2026-03-15',
      budget: 45000,
      spent: 6750,
      tasks: [],
      documents: ['Initial Plans'],
      team: []
    }
  ];

  const project = projects[selectedProject];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: Settings }
  ];

  const chatMessages = [
    { 
      type: 'ai', 
      text: "Hello Alex! 👋 I'm your Brixem AI assistant. How can I help you with your Kitchen Extension today?",
      timestamp: '9:00 AM'
    },
    { 
      type: 'user', 
      text: "What's the current status of my project?",
      timestamp: '9:15 AM'
    },
    { 
      type: 'ai', 
      text: "Your Kitchen Extension is 65% complete and on track! Here's what's happening:",
      timestamp: '9:15 AM',
      widget: 'status-card'
    }
  ];

  const suggestedQuestions = [
    "What's my budget status?",
    "Show project timeline",
    "Find contractors near me",
    "Download documents"
  ];

  const StatusWidget = () => (
    <div className="bg-white rounded-lg p-5 mt-4 border border-gray-100">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="w-12 h-12 aspect-square bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{project.progress}%</div>
          <div className="text-xs text-gray-500 mt-1">Complete</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 aspect-square bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">53%</div>
          <div className="text-xs text-gray-500 mt-1">Budget Used</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 aspect-square bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">2</div>
          <div className="text-xs text-gray-500 mt-1">Active Tasks</div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Phase</span>
          <span className="font-medium text-gray-900">Steel Frame Installation</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Next Milestone</span>
          <span className="font-medium text-gray-900">Roof Installation</span>
        </div>
      </div>
    </div>
  );

  // Projects Page
  const ProjectsPage = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">My Projects</h1>
          <p className="text-gray-500">Manage all your construction projects</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{proj.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{proj.type}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${proj.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {proj.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{proj.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Budget</span>
                <span className="font-medium text-gray-900">£{proj.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span className="font-medium text-gray-900">{proj.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team</span>
                <span className="font-medium text-gray-900">{proj.team.length} members</span>
              </div>
            </div>

            <button 
              onClick={() => { setSelectedProject(idx); setCurrentPage('dashboard'); }}
              className="w-full mt-4 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors text-sm font-medium"
            >
              View Project
            </button>
          </div>
        ))}

        {/* Create New Project Card */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 aspect-square bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Start New Project</h3>
          <p className="text-sm text-gray-500 text-center">Create a new construction project with AI assistance</p>
        </div>
      </div>
    </div>
  );

  // Payments Page
  const PaymentsPage = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Payments & Billing</h1>
        <p className="text-gray-500">Manage your subscription and payment methods</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Professional Plan</h2>
                </div>
                <p className="text-blue-100">Unlimited projects • AI Assistant • Team Collaboration</p>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Active</span>
            </div>
            
            <div className="flex items-baseline space-x-2 mb-6">
              <span className="text-5xl font-bold">£49</span>
              <span className="text-blue-100">/month</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Unlimited construction projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Advanced AI project assistant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Real-time team collaboration</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5" />
                <span>Priority customer support</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Manage Plan
              </button>
              <button className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Billing Summary</h3>
        <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Next billing date</div>
              <div className="font-semibold text-gray-900">Nov 2, 2025</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Amount due</div>
              <div className="font-semibold text-gray-900">£49.00</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Payment method</div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">•••• 4242</span>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors text-sm font-medium">
            Update Payment Method
          </button>
        </div>
      </div>
    </div>
  );

  // Profile Page
  const ProfilePage = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Profile Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    defaultValue="Alex"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    defaultValue="Thompson"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  defaultValue="alex.thompson@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+44 20 1234 5678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input 
                  type="text" 
                  defaultValue="Thompson Construction Ltd"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea 
                  rows={3}
                  defaultValue="123 Construction Way, London, UK"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-blue-600">AT</span>
              </div>
              <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors text-sm font-medium mb-2">
                Upload Photo
              </button>
              <button className="text-sm text-red-600 hover:text-red-700">
                Remove Photo
              </button>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Account Type</div>
                <div className="font-medium text-gray-900 capitalize">{userRole}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Member Since</div>
                <div className="font-medium text-gray-900">June 2024</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Current Plan</div>
                <div className="font-medium text-gray-900">Professional</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Page
  const DashboardPage = () => (
    <>
      {/* Clean Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
            <p className="text-gray-500">{project.type} • {project.startDate} - {project.endDate}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{project.progress}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Clean Chat Interface */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Minimal Chat Header */}
            <div className="border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-xs text-gray-500">Ask anything about your project</p>
              </div>
            </div>

            {/* Spacious Chat Messages */}
            <div className="h-[550px] overflow-y-auto px-6 py-6">
              <div className="space-y-6 max-w-3xl">
                {chatMessages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.type === 'ai' && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <MessageSquare className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3">
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{msg.text}</p>
                            {msg.widget === 'status-card' && <StatusWidget />}
                          </div>
                          <span className="text-xs text-gray-400 mt-2 ml-1 block">{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                    {msg.type === 'user' && (
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 flex flex-col items-end">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-lg">
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-2 mr-1 block">{msg.timestamp}</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-gray-700 font-medium text-xs">AT</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Suggested Questions */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-3">Suggested questions:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {suggestedQuestions.map((q, i) => (
                        <button 
                          key={i}
                          onClick={() => setChatInput(q)}
                          className="text-left px-4 py-3 bg-white border border-gray-200 hover:border-blue-600 hover:bg-blue-50 rounded-xl text-sm text-gray-700 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Input Area */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Project Stats */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium text-gray-900">£{project.spent.toLocaleString()} / £{project.budget.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${(project.spent / project.budget) * 100}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-green-600">On Track</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Members</span>
                  <span className="font-medium text-gray-900">{project.team.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Tasks</span>
                  <span className="font-medium text-gray-900">{project.tasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Documents</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Schedule</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Team</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Budget</span>
              </button>
            </div>
          </div>

          {/* Team */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team</h3>
            <div className="space-y-3">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Navigation */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Brixem</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Plus className="w-4 h-4 inline mr-1" />
                New Project
              </button>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center ml-2 cursor-pointer hover:bg-gray-200 transition-colors">
                <span className="text-gray-700 font-medium text-sm">AT</span>
              </div>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 space-y-1">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentPage(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'projects' && <ProjectsPage />}
        {currentPage === 'payments' && <PaymentsPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <span className="font-semibold text-gray-900">Brixem</span>
              </div>
              <p className="text-sm text-gray-600">Smarter construction management powered by AI</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">AI Assistant</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">API</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© 2025 Brixem. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 