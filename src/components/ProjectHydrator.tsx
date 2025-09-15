"use client";
import { useEffect } from "react";
import { useProjectStore, Project, Milestone, Task } from "@/store/projectStore";

interface ProjectHydratorProps {
  project: Project;
  milestones: Milestone[];
  tasks: Task[];
}

export function ProjectHydrator({ project, milestones, tasks }: ProjectHydratorProps) {
  const setAll = useProjectStore(s => s.setAll);
  
  useEffect(() => { 
    if (project) {
      setAll(project, milestones, tasks); 
    }
  }, [project, milestones, tasks, setAll]);
  
  return null;
}
