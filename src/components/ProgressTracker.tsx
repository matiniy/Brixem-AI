"use client";
import { useProjectStore } from "@/store/projectStore";

export default function ProgressTracker() {
  const { project, milestones } = useProjectStore();
  
  if (!project) return null;

  const total = milestones.length || 1;
  const done = milestones.filter(m => m.status === "done").length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="w-full rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Project Progress</h3>
        <span className="text-sm text-gray-600">{pct}% complete</span>
      </div>
      
      <div className="mt-3 h-2 w-full rounded-full bg-zinc-100">
        <div 
          className="h-2 rounded-full bg-zinc-900 transition-all duration-500" 
          style={{ width: `${pct}%` }} 
        />
      </div>
      
      <ol className="mt-4 flex flex-wrap gap-2">
        {milestones
          .sort((a, b) => a.order - b.order)
          .map((milestone) => (
            <li 
              key={milestone.id}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                milestone.status === "done" 
                  ? "bg-zinc-900 text-white border-zinc-900" 
                  : milestone.status === "doing" 
                    ? "bg-amber-50 border-amber-200 text-amber-900" 
                    : "bg-white border-zinc-200 text-zinc-600"
              }`}
            >
              {milestone.title}
            </li>
          ))}
      </ol>
    </div>
  );
}
