"use client";
import React, { useState } from "react";

const mockFeasibility = {
  projectType: "Residential New Build",
  location: "Dubai, 00000",
  area: "2,500 sqft",
  siteCondition: "Urban",
  costRange: "$180,000 - $220,000",
  materialQuality: "Medium",
  riskFlags: [
    { type: "Budget Deviation", level: "High", message: "Material prices in this region are volatile." },
    { type: "Timeline", level: "Medium", message: "Permit approval may take 2-4 weeks." }
  ],
  summary: "This project is feasible based on your inputs. Material and labor costs are within typical ranges for Dubai. Consider contingency for price fluctuations and permit delays."
};

export default function FeasibilityPreview() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      // In real app, redirect to pricing/unlock or dashboard
      alert("Full estimate & schedule generation coming soon!");
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Feasibility Preview</h1>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Project Type</div>
              <div className="font-medium text-gray-900">{mockFeasibility.projectType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Location</div>
              <div className="font-medium text-gray-900">{mockFeasibility.location}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Area</div>
              <div className="font-medium text-gray-900">{mockFeasibility.area}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Site Condition</div>
              <div className="font-medium text-gray-900">{mockFeasibility.siteCondition}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Material Quality</div>
              <div className="font-medium text-gray-900">{mockFeasibility.materialQuality}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Cost Range</div>
              <div className="font-bold text-green-700 text-lg">{mockFeasibility.costRange}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">AI Summary</div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800">
              {mockFeasibility.summary}
            </div>
          </div>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Risk Flags</div>
            <ul className="space-y-2">
              {mockFeasibility.riskFlags.map((flag, i) => (
                <li key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${flag.level === "High" ? "border-red-300 bg-red-50" : flag.level === "Medium" ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
                  <span className={`font-bold ${flag.level === "High" ? "text-red-700" : flag.level === "Medium" ? "text-yellow-700" : "text-gray-700"}`}>{flag.type}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: flag.level === "High" ? "#fee2e2" : flag.level === "Medium" ? "#fef9c3" : "#f3f4f6", color: flag.level === "High" ? "#b91c1c" : flag.level === "Medium" ? "#b45309" : "#374151" }}>{flag.level}</span>
                  <span className="text-gray-700">{flag.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition text-lg disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Full Estimate & Schedule"}
        </button>
      </div>
    </div>
  );
} 