"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function Pricing() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("homeowner");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    localStorage.setItem("brixem_role", activeTab);
  }, [activeTab]);

  function handleMockPayment() {
    if (selectedPlan) {
      localStorage.setItem("brixem_plan", selectedPlan);
      setShowPayment(false);
      setTimeout(() => {
        // Check if user came from homeowner onboarding
        const userData = localStorage.getItem("brixem_user_data");
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData.role === "homeowner" && parsedUserData.onboardingComplete) {
            // Redirect to homeowner dashboard
            router.push("/dashboard/homeowner");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      }, 100);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Choose Your Plan
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Select the perfect plan for your construction project needs
          </p>
          
          {/* Role Tabs */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab("homeowner")}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    activeTab === "homeowner"
                      ? "bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Homeowners
                </button>
                <button
                  onClick={() => setActiveTab("consultant")}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    activeTab === "consultant"
                      ? "bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Consultants
                </button>
                <button
                  onClick={() => setActiveTab("contractor")}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    activeTab === "contractor"
                      ? "bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Contractors
                </button>
              </div>
            </div>
          </div>
          
          {/* Coming Soon Notice for non-homeowner tabs */}
          {activeTab !== "homeowner" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 sm:mb-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-800 font-medium">
                  {activeTab === "consultant" ? "Consultant" : "Contractor"} pricing coming soon! Currently showing Homeowner plans.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards - Only show for Homeowners */}
      {activeTab === "homeowner" && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Free Plan Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Free Plan</h2>
                <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Explore the basics. No credit card needed.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">1,000 Brixem Tokens to try key features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">1 active project slot</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm sm:text-base">Preview AI-generated documents (read-only)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm sm:text-base">Export documents (PDF/Word)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm sm:text-base">Access to contractor finder</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-sm sm:text-base">Scheduling or cost estimate tools</span>
                </div>
              </div>
              
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  Perfect for first-time users who want to explore Brixem's capabilities.
                </p>
              </div>
              
              <button 
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition text-sm sm:text-base"
                onClick={() => router.push(`/pricing/checkout?plan=free`)}
              >
                Get Started Free
              </button>
            </div>

            {/* Monthly Plan Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-[#23c6e6] relative hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  POPULAR
                </span>
              </div>
              
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Monthly Plan</h2>
                <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">$9.99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/month</span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Ideal for homeowners managing projects step by step.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">50,000 Brixem Tokens every month</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Up to 3 active project slots</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Full access to all tools: Document generation, Scheduling + cost estimation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Export documents (PDF/Word)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Editable templates (scope, contracts, etc.)</span>
                </div>
              </div>
              
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  Designed for ongoing users planning renovations, extensions, or fit-outs.
                </p>
              </div>
              
              <button 
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition text-sm sm:text-base"
                onClick={() => router.push(`/pricing/checkout?plan=monthly`)}
              >
                Get Started
              </button>
            </div>

            {/* One-Time Project Plan Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">One-Time Project Plan</h2>
                <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600 text-sm sm:text-base">/project</span>
                </div>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Everything you need for one complete project.
                </p>
              </div>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Unlimited Brixem Tokens for one full project</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">All premium tools unlocked: Scope of Works, Cost Estimation, Timeline, Contract generator (JCT, FIDIC, NEC4), Project readiness checklist</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Export unlimited documents</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base">Access compliance checkers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm sm:text-base flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Priority support during the project
                  </span>
                </div>
              </div>
              
              <button 
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition text-sm sm:text-base"
                onClick={() => router.push(`/pricing/checkout?plan=one-time-project`)}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Coming Soon Section for Consultants and Contractors */}
      {activeTab !== "homeowner" && (
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 sm:p-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                {activeTab === "consultant" ? "Consultant" : "Contractor"} Pricing Coming Soon!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
                We're working hard to bring you specialized pricing plans for {activeTab === "consultant" ? "consultants" : "contractors"}. 
                Sign up for our newsletter to be notified when these plans launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition text-sm sm:text-base">
                  Get Notified
                </button>
                <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-transparent text-gray-700 font-semibold hover:bg-gray-100 transition border-2 border-gray-300 text-sm sm:text-base">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Comparison */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make your construction projects successful
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">AI-Powered Planning</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Get intelligent project scoping, cost estimation, and timeline planning with our advanced AI.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Real-Time Collaboration</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Work seamlessly with your team, contractors, and stakeholders with live updates and communication.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Smart Scheduling</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Optimize your project timeline with intelligent scheduling that adapts to real-world conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-blue-50 leading-relaxed">
            Join thousands of construction professionals who've transformed their projects with Brixem
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white text-[#4b1fa7] font-semibold hover:bg-gray-50 transition text-sm sm:text-base">
              Start Free Trial
            </button>
            <button className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-transparent text-white font-semibold hover:bg-white/10 transition border-2 border-white text-sm sm:text-base">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 md:px-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-600">Yes, you can cancel your Brixem+ subscription at any time. You'll continue to have access until the end of your billing period.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise customers.</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial available?</h3>
              <p className="text-gray-600">Yes, you can try Brixem+ free for 14 days. No credit card required to start your trial.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mock Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button 
              onClick={() => setShowPayment(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mock Payment</h2>
              <p className="text-gray-600 mb-6">
                This is a demonstration payment flow. Click below to continue to your dashboard.
              </p>
              <button 
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition"
                onClick={handleMockPayment}
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 