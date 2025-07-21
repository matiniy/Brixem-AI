"use client";
import React, { useState } from "react";
import ChatModal from "@/components/ChatModal";

const initialScope = {
  projectTitle: "Kitchen Renovation for Smith Residence",
  propertyInfo: {
    address: "123 Main St, San Francisco, CA",
    size: "1,200 sq ft",
    ownership: "Owner-occupied"
  },
  rooms: ["Kitchen"],
  objectives: [
    "Modernize kitchen layout",
    "Install new cabinets and countertops",
    "Upgrade appliances to energy-efficient models",
    "Improve lighting and ventilation"
  ],
  deliverables: [
    "Demolition of existing kitchen fixtures",
    "Installation of new cabinetry and countertops",
    "Plumbing and electrical upgrades",
    "Appliance installation",
    "Painting and finishing"
  ],
  timeline: "6-8 weeks",
  budget: "$25,000 - $35,000"
};

export default function ScopeSummaryPage() {
  const [scope, setScope] = useState(initialScope);
  const [editing, setEditing] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleDownload = () => {
    // Mock PDF download
    alert("PDF download coming soon!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Scope of Works Preview</h1>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-medium hover:opacity-90 transition"
          >
            Download PDF
          </button>
        </div>
        {/* Project Title */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Project Title</label>
          {editing === "projectTitle" ? (
            <input
              className="w-full px-3 py-2 border rounded-lg"
              value={scope.projectTitle}
              onChange={e => setScope(s => ({ ...s, projectTitle: e.target.value }))}
              onBlur={() => setEditing(null)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">{scope.projectTitle}</span>
              <button className="text-xs text-[#23c6e6] underline" onClick={() => setEditing("projectTitle")}>Edit</button>
            </div>
          )}
        </div>
        {/* Property Info */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Property Info</label>
          <div className="text-gray-900">
            {scope.propertyInfo.address} &middot; {scope.propertyInfo.size} &middot; {scope.propertyInfo.ownership}
          </div>
        </div>
        {/* Rooms */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Rooms</label>
          <div className="text-gray-900">{scope.rooms.join(", ")}</div>
        </div>
        {/* Objectives */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Objectives</label>
          <ul className="list-disc pl-6 text-gray-900">
            {scope.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
        {/* Deliverables */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Deliverables</label>
          <ul className="list-disc pl-6 text-gray-900">
            {scope.deliverables.map((del, i) => (
              <li key={i}>{del}</li>
            ))}
          </ul>
        </div>
        {/* Timeline & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Timeline</label>
            <div className="text-gray-900">{scope.timeline}</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Budget</label>
            <div className="text-gray-900">{scope.budget}</div>
          </div>
        </div>
        {/* AI & CTA */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-8">
          <button
            onClick={() => setShowChat(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold hover:opacity-90 transition"
          >
            Refine with AI
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Continue to Planning
          </button>
        </div>
      </div>
      <ChatModal open={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
} 