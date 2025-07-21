import React from "react";

interface AvatarGroupProps {
  avatars: string[];
  max?: number;
  badgeClass?: string;
}

export default function AvatarGroup({ avatars, max = 3, badgeClass = "bg-gray-200 text-gray-500" }: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const overflow = avatars.length - max;
  return (
    <div className="flex -space-x-2 items-center">
      {displayAvatars.map((src, i) => (
        <span key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 inline-block overflow-hidden">
          {src ? (
            <img src={src} alt="avatar" className="w-full h-full object-cover rounded-full" />
          ) : null}
        </span>
      ))}
      {overflow > 0 && (
        <span className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${badgeClass}`}>+{overflow}</span>
      )}
    </div>
  );
} 