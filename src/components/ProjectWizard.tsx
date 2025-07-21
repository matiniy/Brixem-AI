"use client";
import React, { useState } from "react";

interface ProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (projectData: ProjectData) => void;
}

interface ProjectData {
  type: string;
  scope: string;
  budget: string;
  timeline: string;
  location: string;
  description: string;
}

interface StepOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export default function ProjectWizard({ open, onClose, onComplete }: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    type: "",
    scope: "",
    budget: "",
    timeline: "",
    location: "",
    description: ""
  });

  const steps = [
    {
      title: "What type of project?",
      subtitle: "Let's start by understanding your renovation needs",
      options: [
        { value: "kitchen", label: "Kitchen Renovation", icon: "🏠" },
        { value: "bathroom", label: "Bathroom Remodel", icon: "🚿" },
        { value: "living-room", label: "Living Room Update", icon: "🛋️" },
        { value: "basement", label: "Basement Finish", icon: "🏠" },
        { value: "outdoor", label: "Outdoor/Deck", icon: "🌳" },
        { value: "other", label: "Other Project", icon: "🔧" }
      ] as StepOption[]
    },
    {
      title: "What's your budget range?",
      subtitle: "This helps us recommend the right contractors and materials",
      options: [
        { value: "under-10k", label: "Under $10,000", description: "Basic updates and repairs" },
        { value: "10k-25k", label: "$10,000 - $25,000", description: "Moderate renovations" },
        { value: "25k-50k", label: "$25,000 - $50,000", description: "Major renovations" },
        { value: "50k-100k", label: "$50,000 - $100,000", description: "Luxury upgrades" },
        { value: "over-100k", label: "$100,000+", description: "Complete home transformation" }
      ] as StepOption[]
    },
    {
      title: "What's your timeline?",
      subtitle: "When would you like to start and complete your project?",
      options: [
        { value: "asap", label: "ASAP (1-2 months)", description: "Ready to start immediately" },
        { value: "3-6-months", label: "3-6 months", description: "Planning phase" },
        { value: "6-12-months", label: "6-12 months", description: "Long-term planning" },
        { value: "flexible", label: "Flexible", description: "No specific deadline" }
      ] as StepOption[]
    },
    {
      title: "Where is your project located?",
      subtitle: "This helps us find local contractors and suppliers",
      input: true,
      placeholder: "Enter your city or zip code"
    },
    {
      title: "Tell us about your project",
      subtitle: "Describe your vision and any specific requirements",
      textarea: true,
      placeholder: "Describe your renovation goals, style preferences, and any specific features you want..."
    }
  ];

  const handleOptionSelect = (value: string) => {
    const field = step === 0 ? "type" : step === 1 ? "budget" : "timeline";
    setProjectData(prev => ({ ...prev, [field]: value }));
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleInputChange = (value: string) => {
    const field = step === 3 ? "location" : "description";
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    onComplete({
      ...projectData,
    });
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {steps[step].title}
          </h2>
          <p className="text-gray-600">
            {steps[step].subtitle}
          </p>
        </div>

        {/* Options Grid */}
        {steps[step].options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {steps[step].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-[#23c6e6] hover:shadow-lg transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  {option.icon && <span className="text-2xl">{option.icon}</span>}
                  <span className="font-semibold text-gray-900 group-hover:text-[#23c6e6] transition">
                    {option.label}
                  </span>
                </div>
                {option.description && (
                  <p className="text-sm text-gray-600">{option.description}</p>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Input Fields */}
        {steps[step].input && (
          <div className="mb-8">
            <input
              type="text"
              placeholder={steps[step].placeholder}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition"
            />
          </div>
        )}

        {steps[step].textarea && (
          <div className="mb-8">
            <textarea
              placeholder={steps[step].placeholder}
              onChange={(e) => handleInputChange(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#23c6e6] focus:ring-2 focus:ring-[#23c6e6]/20 transition resize-none"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Back
          </button>

          {step === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition"
            >
              Create Project
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!projectData[Object.keys(projectData)[step] as keyof ProjectData]}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>

        {/* AI Recommendation Preview */}
        {step === steps.length - 1 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-[#23c6e6]/10 to-[#4b1fa7]/10 rounded-lg border border-[#23c6e6]/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <span className="text-white text-xs">AI</span>
              </div>
              <span className="font-semibold text-gray-900">AI Recommendation</span>
            </div>
            <p className="text-sm text-gray-600">
              Based on your {projectData.type} project with a {projectData.budget} budget, 
              we'll recommend 3-5 qualified contractors and create a detailed project roadmap.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 