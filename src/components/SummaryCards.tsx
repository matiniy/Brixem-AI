"use client";
import { useProjectStore } from "@/store/projectStore";

export default function SummaryCards() {
  const { tasks, milestones } = useProjectStore();
  
  const next = milestones
    .filter(m => m.status !== "done")
    .sort((a, b) => a.order - b.order)[0];
  
  const today = tasks
    .filter(t => t.status !== "completed")
    .slice(0, 3);
  
  const blockers = tasks
    .filter(t => t.priority === "high" && t.status !== "completed")
    .slice(0, 2);

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border bg-white p-4 shadow-sm flex-1 min-w-[260px]">
      <div className="text-sm font-medium mb-2 text-gray-900">{title}</div>
      <div className="text-sm text-zinc-600">{children}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card title="Next milestone">
        {next ? (
          <div>
            <div className="font-medium text-zinc-900">{next.title}</div>
            <div className="text-xs mt-1 text-gray-500">
              {next.description || "Keep moving forward."}
            </div>
          </div>
        ) : (
          <div className="text-green-600 font-medium">All milestones done 🎉</div>
        )}
      </Card>
      
      <Card title="Today">
        <ul className="list-disc pl-4 space-y-1">
          {today.map(task => (
            <li key={task.id} className="text-zinc-800">
              {task.title}
            </li>
          ))}
          {today.length === 0 && (
            <li className="text-gray-500">Nothing pending. Ask the assistant for next steps.</li>
          )}
        </ul>
      </Card>
      
      <Card title="Blockers">
        <ul className="list-disc pl-4 space-y-1">
          {blockers.map(task => (
            <li key={task.id} className="text-zinc-800">
              {task.title}
            </li>
          ))}
          {blockers.length === 0 && (
            <li className="text-green-600">No blockers detected.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
