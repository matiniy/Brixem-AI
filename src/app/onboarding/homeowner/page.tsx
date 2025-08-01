"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { signUp } from "@/lib/supabase";

export default function HomeownerOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    projectType: "",
    location: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    {
      title: "Welcome to Brixem! 🏠",
      subtitle: "Let's get to know you and your renovation goals",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
              placeholder="Enter your email"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={userData.password}
                onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
                placeholder="Create a password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
                placeholder="Confirm your password"
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What type of project are you planning? 🏗️",
      subtitle: "This helps us tailor your experience",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type *
            </label>
            <select
              value={userData.projectType}
              onChange={(e) => setUserData(prev => ({ ...prev, projectType: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
            >
              <option value="">Select project type</option>
              <option value="kitchen">Kitchen Renovation</option>
              <option value="bathroom">Bathroom Remodel</option>
              <option value="living-room">Living Room</option>
              <option value="bedroom">Bedroom</option>
              <option value="basement">Basement</option>
              <option value="outdoor">Outdoor/Deck</option>
              <option value="whole-house">Whole House</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Location *
            </label>
            <input
              type="text"
              value={userData.location}
              onChange={(e) => setUserData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition text-gray-900"
              placeholder="City, State"
            />
          </div>
        </div>
      )
    }
  ];

  const validateStep = (stepIndex: number) => {
    const newErrors: Record<string, string> = {};
    
    if (stepIndex === 0) {
      if (!userData.firstName) newErrors.firstName = "First name is required";
      if (!userData.lastName) newErrors.lastName = "Last name is required";
      if (!userData.email) newErrors.email = "Email is required";
      if (!userData.password) newErrors.password = "Password is required";
      if (userData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    } else if (stepIndex === 1) {
      if (!userData.projectType) newErrors.projectType = "Project type is required";
      if (!userData.location) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step === steps.length - 1) {
      // Final step - create account
      await handleSignup();
    } else {
      setStep(step + 1);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const userDataForSignup = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'homeowner' as const,
        full_name: `${userData.firstName} ${userData.lastName}`,
        project_type: userData.projectType,
        location: userData.location
      };

      const result = await signUp(userData.email, userData.password, userDataForSignup);

      if (result.error) {
        if (result.error.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists' });
        } else if (result.error.message.includes('password')) {
          setErrors({ password: 'Password must be at least 6 characters' });
        } else {
          setErrors({ email: result.error.message });
        }
      } else {
        // Success - redirect to dashboard
        router.push('/dashboard/homeowner');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: 'An error occurred during signup. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep(Math.max(0, step - 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{steps[step].title}</h1>
              <span className="text-sm text-gray-500">{step + 1} of {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <p className="text-gray-600 mb-6">{steps[step].subtitle}</p>
            {steps[step].content}
          </div>

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              {Object.entries(errors).map(([field, message]) => (
                <p key={field} className="text-red-600 text-sm">{message}</p>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : step === steps.length - 1 ? (
                "Create Account"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 