import { NextRequest, NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = Awaited<ReturnType<typeof createUserClient>>;

export async function GET() {
  try {
    const supabase = await createUserClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('GET /api/projects: Authentication error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from('projects_new')
      .select(`
        *,
        milestones (
          id,
          title,
          status,
          due_date,
          order_index
        ),
        tasks (
          id,
          title,
          status,
          priority,
          progress,
          due_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check for Authorization header first
    const authHeader = request.headers.get('authorization');
    let supabase;
    let user;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use the token from Authorization header
      const token = authHeader.substring(7);
      const tempSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user: tokenUser }, error: tokenError } = await tempSupabase.auth.getUser(token);
      
      if (tokenError || !tokenUser) {
        console.error('POST /api/projects: Token authentication error:', tokenError);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      user = tokenUser;
      supabase = tempSupabase;
    } else {
      // Fallback to cookie-based authentication
      supabase = await createUserClient();
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !cookieUser) {
        console.error('POST /api/projects: Cookie authentication error:', authError);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      user = cookieUser;
    }

    const body = await request.json();
    
    // Check if this is AI-generated project data
    if (body.phases && body.projectType) {
      return await createAIGeneratedProject(supabase, user.id, body);
    }
    
    // Handle regular project creation
    const { name, type, location, description, size_sqft, start_date, end_date, budget, workspace_id } = body;

    // Validate required fields
    if (!name || !workspace_id) {
      return NextResponse.json({ error: 'Name and workspace_id are required' }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from('projects_new')
      .insert({
        workspace_id,
        name,
        type,
        location,
        description,
        size_sqft,
        start_date,
        end_date,
        budget,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function createAIGeneratedProject(supabase: SupabaseClient, userId: string, projectData: {
  name: string;
  description: string;
  projectType: string;
  location: string;
  area: string;
  budget: string;
  finishLevel: string;
  estimatedCost: number;
  phases: Array<{
    id: string;
    name: string;
    status: string;
    tasks: Array<{
      id: string;
      name: string;
      status: string;
      assignee: string;
      subtasks: Array<{
        id: string;
        name: string;
        status: string;
      }>;
    }>;
  }>;
  status: string;
  progress: number;
}) {
  try {
    // Get user's workspace
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .single();
    
    if (!workspaceMember) {
      throw new Error('No workspace found for user');
    }

    // Create the main project
    const { data: project, error: projectError } = await supabase
      .from('projects_new')
      .insert({
        workspace_id: workspaceMember.workspace_id,
        name: projectData.name,
        type: projectData.projectType,
        location: projectData.location,
        description: projectData.description,
        budget: projectData.estimatedCost,
        created_by: userId,
        status: projectData.status,
        progress: projectData.progress,
        // Store AI-generated data in a JSON field
        ai_data: {
          area: projectData.area,
          finishLevel: projectData.finishLevel,
          phases: projectData.phases
        }
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating AI project:', projectError);
      console.error('Project data that failed:', projectData);
      return NextResponse.json({ 
        error: 'Failed to create AI project', 
        details: projectError.message 
      }, { status: 500 });
    }

    // Create milestones for each phase
    const milestones = [];
    for (let i = 0; i < projectData.phases.length; i++) {
      const phase = projectData.phases[i];
      const { data: milestone, error: milestoneError } = await supabase
        .from('milestones')
        .insert({
          project_id: project.id,
          title: phase.name,
          status: phase.status,
          order_index: i,
          due_date: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days per phase
        })
        .select()
        .single();

      if (milestoneError) {
        console.error('Error creating milestone:', milestoneError);
        continue;
      }

      milestones.push(milestone);

      // Create tasks for each phase
      for (let j = 0; j < phase.tasks.length; j++) {
        const task = phase.tasks[j];
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .insert({
            project_id: project.id,
            milestone_id: milestone.id,
            title: task.name,
            status: task.status,
            priority: 'medium',
            progress: 0,
            assignee: task.assignee,
            due_date: new Date(Date.now() + (i * 30 + j * 7) * 24 * 60 * 60 * 1000).toISOString() // 7 days per task
          })
          .select()
          .single();

        if (taskError) {
          console.error('Error creating task:', taskError);
          continue;
        }

        // Create subtasks
        for (let k = 0; k < task.subtasks.length; k++) {
          const subtask = task.subtasks[k];
          await supabase
            .from('tasks')
            .insert({
              project_id: project.id,
              milestone_id: milestone.id,
              parent_task_id: taskData.id,
              title: subtask.name,
              status: subtask.status,
              priority: 'low',
              progress: 0,
              assignee: task.assignee,
              due_date: new Date(Date.now() + (i * 30 + j * 7 + k * 2) * 24 * 60 * 60 * 1000).toISOString() // 2 days per subtask
            });
        }
      }
    }

    return NextResponse.json({ 
      project: {
        ...project,
        milestones,
        ai_generated: true
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating AI-generated project:', error);
    return NextResponse.json({ error: 'Failed to create AI-generated project' }, { status: 500 });
  }
}
