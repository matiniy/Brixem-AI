"use client";
import React, { useState } from "react";

interface OnboardingFlowProps {
  open: boolean;
  onClose: () => void;
  onComplete: (userData: any) => void;
}

export default function OnboardingFlow({ open, onClose, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    experience: "",
    goals: [] as string[]
  });

  const steps = [
    {
      title: "Welcome to Brixem! 🏠",
      subtitle: "Let's get to know you and your renovation goals",
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
            <span className="text-white font-bold text-3xl">B</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Your AI-Powered Construction Platform
          </h3>
          <p className="text-gray-600 mb-6">
            Brixem helps homeowners plan, manage, and execute renovation projects with AI-powered insights, 
            contractor recommendations, and project tracking tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">AI Planning</h4>
              <p className="text-sm text-gray-600">Get intelligent project recommendations and cost estimates</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Contractor Matching</h4>
              <p className="text-sm text-gray-600">Find qualified contractors based on your project needs</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Project Tracking</h4>
              <p className="text-sm text-gray-600">Monitor progress and manage your renovation timeline</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tell us about yourself",
      subtitle: "This helps us personalize your experience",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition"
              placeholder="Enter your email"
            />
          </div>
        </div>
      )
    },
    {
      title: "What's your renovation experience?",
      subtitle: "This helps us provide the right level of guidance",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: "first-time", label: "First-time homeowner", description: "New to renovations" },
            { value: "some-experience", label: "Some experience", description: "Done a few projects" },
            { value: "experienced", label: "Experienced", description: "Multiple renovations" },
            { value: "professional", label: "Professional", description: "Construction background" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setUserData(prev => ({ ...prev, experience: option.value }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                userData.experience === option.value
                  ? "border-[#23c6e6] bg-[#23c6e6]/5"
                  : "border-gray-200 hover:border-[#23c6e6]"
              }`}
            >
              <h4 className="font-semibold text-gray-900 mb-1">{option.label}</h4>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "What are your renovation goals?",
      subtitle: "Select all that apply",
      content: (
        <div className="space-y-3">
          {[
            "Increase home value",
            "Improve functionality",
            "Update outdated features",
            "Create more space",
            "Energy efficiency",
            "Modern aesthetics",
            "Accessibility improvements",
            "Fix structural issues"
          ].map((goal) => (
            <label key={goal} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#23c6e6] transition cursor-pointer">
              <input
                type="checkbox"
                checked={userData.goals.includes(goal)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setUserData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
                  } else {
                    setUserData(prev => ({ ...prev, goals: prev.goals.filter(g => g !== goal) }));
                  }
                }}
                className="w-4 h-4 text-[#23c6e6] border-gray-300 rounded focus:ring-[#23c6e6]"
              />
              <span className="text-gray-900">{goal}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Let's start your renovation journey",
      content: (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to Brixem, {userData.name}!
          </h3>
          <p className="text-gray-600 mb-6">
            Based on your experience and goals, we'll customize your dashboard and recommendations. 
            You're ready to start planning your renovation projects!
          </p>
          <div className="bg-gradient-to-r from-[#23c6e6]/10 to-[#4b1fa7]/10 rounded-lg p-4 border border-[#23c6e6]/20">
            <h4 className="font-semibold text-gray-900 mb-2">What's next?</h4>
            <ul className="text-sm text-gray-600 space-y-1 text-left">
              <li>• Create your first project</li>
              <li>• Get AI-powered recommendations</li>
              <li>• Connect with qualified contractors</li>
              <li>• Track your renovation progress</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({
        ...userData,
        id: `user_${Date.now()}`,
        role: "homeowner",
        onboardingComplete: true
      });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const getProgress = () => ((step + 1) / steps.length) * 100;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-[#23c6e6]">
              {Math.round(getProgress())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {steps[step].title}
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {steps[step].subtitle}
          </p>
          {steps[step].content}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={step === 0 && !userData.name && !userData.email}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {step === steps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
} 