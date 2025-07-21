"use client";
import React, { useState, useEffect } from "react";
import AuthModal from "@/components/AuthModal";
import { useRouter } from "next/navigation";

const initialState = {
  projectType: "",
  location: "",
  area: "",
  siteCondition: "urban",
  scopeType: "",
  areaSize: "",
  workType: "",
  units: "",
  floors: "",
  budget: "",
  materialQuality: "medium",
  upload: null as File | null,
  email: "",
  password: ""
};

const steps = [
  "Project Type",
  "Location & Area",
  "Project Scope",
  "Cost Preferences",
  "Upload Documents",
  "Account Creation"
];

export default function ContractorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialState);
  const [showAuth, setShowAuth] = useState(false);

  // ESC key support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, upload: e.target.files![0] }));
    }
  };

  const handleAuthSuccess = (userData: unknown) => {
    // TODO: Save contractor onboarding data and redirect to feasibility preview
    alert("Onboarding complete! Redirecting to feasibility preview...");
    // router.push("/contractor/feasibility-preview");
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(90deg, #d1d1d1 0%, #c9c9c9 100%)' }}>
      <div className="flex items-center justify-center py-12 min-h-screen">
        <div className="w-full max-w-2xl bg-gray-50 rounded-2xl shadow-2xl p-8 border border-gray-300 relative">
          {/* Close button */}
          <button
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close onboarding"
          >
            ×
          </button>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contractor Onboarding</h1>
            <div className="text-gray-500 text-sm mb-2">Step {step + 1} of {steps.length}: {steps[step]}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
            </div>
          </div>
          {/* Step Content */}
          {step === 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
              <div className="relative">
                <select
                  className="w-full px-5 py-3 pr-10 rounded-lg border border-gray-300 bg-white text-black appearance-none focus:outline-none focus:ring-2 focus:ring-[#23c6e6] focus:border-[#23c6e6] transition"
                  value={form.projectType}
                  onChange={e => handleChange("projectType", e.target.value)}
                >
                  <option value="" className="text-black bg-white">Select...</option>
                  <option value="residential" className="text-black bg-white">Residential</option>
                  <option value="commercial" className="text-black bg-white">Commercial</option>
                  <option value="fitout" className="text-black bg-white">Interior Fit-out</option>
                </select>
                {/* Custom chevron icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, Zip)</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.location}
                onChange={e => handleChange("location", e.target.value)}
                placeholder="e.g. Dubai, 00000"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft or sqm)</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.area}
                onChange={e => handleChange("area", e.target.value)}
                placeholder="e.g. 2500 sqft"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Condition</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-black"
                value={form.siteCondition}
                onChange={e => handleChange("siteCondition", e.target.value)}
              >
                <option value="urban" className="text-black bg-white">Urban</option>
                <option value="suburban" className="text-black bg-white">Suburban</option>
                <option value="remote" className="text-black bg-white">Remote</option>
              </select>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type of Work</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-black"
                value={form.workType}
                onChange={e => handleChange("workType", e.target.value)}
              >
                <option value="" className="text-black bg-white">Select...</option>
                <option value="newbuild" className="text-black bg-white">New Build</option>
                <option value="renovation" className="text-black bg-white">Renovation</option>
                <option value="extension" className="text-black bg-white">Extension</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Size (per unit, if applicable)</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.areaSize}
                onChange={e => handleChange("areaSize", e.target.value)}
                placeholder="e.g. 120 sqm"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Units</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.units}
                onChange={e => handleChange("units", e.target.value)}
                placeholder="e.g. 3"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Floors</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.floors}
                onChange={e => handleChange("floors", e.target.value)}
                placeholder="e.g. 2"
              />
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.budget}
                onChange={e => handleChange("budget", e.target.value)}
                placeholder="e.g. $100,000 - $200,000"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Material Quality</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-black"
                value={form.materialQuality}
                onChange={e => handleChange("materialQuality", e.target.value)}
              >
                <option value="low" className="text-black bg-white">Low</option>
                <option value="medium" className="text-black bg-white">Medium</option>
                <option value="high" className="text-black bg-white">High</option>
              </select>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Documents (optional)</label>
              <input
                type="file"
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                onChange={handleFile}
              />
              {form.upload && <div className="text-sm text-gray-600 mt-2">Uploaded: {form.upload.name}</div>}
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
                placeholder="Enter your email"
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-200"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
                placeholder="Create a password"
              />
            </div>
          )}
          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition"
              >
                Create Account & Continue
              </button>
            )}
          </div>
        </div>
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
} 