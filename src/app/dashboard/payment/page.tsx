"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [billingInfo, setBillingInfo] = useState({
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/25",
    cvv: "***",
    name: "John Doe",
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102"
  });

  const [subscription] = useState({
    plan: "Pro",
    price: "$29.99",
    period: "monthly",
    nextBilling: "March 15, 2024"
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
                <h1 className="text-xl font-semibold text-gray-900">Payment & Billing</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Payment Content */}
        <main className="flex-1 bg-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Subscription */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Current Subscription</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-gray-900">{subscription.plan}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price</span>
                    <span className="font-semibold text-gray-900">{subscription.price}/{subscription.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-semibold text-gray-900">{subscription.nextBilling}</span>
                  </div>
                  <div className="pt-4">
                    <button className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="text-[#23c6e6]"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Credit Card</p>
                      <p className="text-sm text-gray-600">{billingInfo.cardNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="radio"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                      className="text-[#23c6e6]"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">PayPal</p>
                      <p className="text-sm text-gray-600">john.doe@example.com</p>
                    </div>
                  </div>
                  
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition">
                    Add Payment Method
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Billing History</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">February 2024</p>
                      <p className="text-sm text-gray-600">Pro Plan - Monthly</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$29.99</p>
                      <p className="text-sm text-green-600">Paid</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">January 2024</p>
                      <p className="text-sm text-gray-600">Pro Plan - Monthly</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$29.99</p>
                      <p className="text-sm text-green-600">Paid</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">December 2023</p>
                      <p className="text-sm text-gray-600">Pro Plan - Monthly</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$29.99</p>
                      <p className="text-sm text-green-600">Paid</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 