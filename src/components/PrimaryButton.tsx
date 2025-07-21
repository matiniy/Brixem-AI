import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function PrimaryButton({ children, ...props }: Props) {
  return (
    <button
      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2DCAD8] to-[#36098E] text-white font-medium shadow hover:opacity-90 transition"
      {...props}
    >
      {children}
    </button>
  );
} 