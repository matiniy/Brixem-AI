import React from "react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onSelectRole: (role: string) => void;
}

const roles = [
  { key: "homeowner", label: "Homeowner", desc: "Plan your renovation" },
  { key: "contractor", label: "Contractor", desc: "Quote faster. Win more jobs." },
  { key: "consultant", label: "Consultant", desc: "Support smarter decisions." },
];

export default function OnboardingModal({ open, onClose, onSelectRole }: OnboardingModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brixem-gray-400 hover:text-brixem-gray-700">✕</button>
        <h2 className="text-2xl font-bold mb-4 text-center text-brixem-gray-900">Welcome to Brixem</h2>
        <p className="mb-6 text-brixem-gray-700 text-center">Select your role to get started:</p>
        <div className="flex flex-col gap-4">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => onSelectRole(role.key)}
              className="w-full px-6 py-4 rounded-xl border border-brixem-primary/30 bg-brixem-gray-50 hover:bg-brixem-primary/10 text-left transition"
            >
              <div className="font-bold text-lg mb-1 text-brixem-gray-900">{role.label}</div>
              <div className="text-brixem-gray-700 text-sm">{role.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 