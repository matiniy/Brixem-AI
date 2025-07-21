"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HomeownerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    projectType: "",
    location: ""
  });

  const steps = [
    {
      title: "Welcome to Brixem! 🏠",
      subtitle: "Let's get to know you and your renovation goals",
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
      title: "What type of project are you planning?",
      subtitle: "Select the type that best matches your renovation",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { value: "kitchen", label: "Kitchen Remodel", description: "Cabinets, countertops, appliances" },
            { value: "bathroom", label: "Bathroom Renovation", description: "Fixtures, tiles, plumbing" },
            { value: "basement", label: "Basement Finish", description: "Living space, storage, utilities" },
            { value: "addition", label: "Home Addition", description: "New rooms, extensions" },
            { value: "exterior", label: "Exterior Work", description: "Siding, roofing, windows" },
            { value: "landscaping", label: "Landscaping", description: "Yard, garden, hardscaping" },
            { value: "other", label: "Other", description: "Something else not listed here" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setUserData(prev => ({ ...prev, projectType: option.value }))}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                userData.projectType === option.value
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
      title: "Where is your project located?",
      subtitle: "Enter your project address or city",
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Location
          </label>
          <input
            type="text"
            value={userData.location}
            onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition"
            placeholder="Enter your project address or city"
          />
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
            You're ready to start planning your renovation projects!
          </p>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Directly redirect to dashboard after last step
      router.push("/dashboard/homeowner");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const getProgress = () => ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(90deg, #d1d1d1 0%, #c9c9c9 100%)' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
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
              className="w-full md:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 mb-2 md:mb-0"
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={
                (step === 0 && (!userData.name || !userData.email)) ||
                (step === 1 && !userData.projectType) ||
                (step === 2 && !userData.location)
              }
              className="w-full md:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {step === steps.length - 1 ? "Create Account" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 