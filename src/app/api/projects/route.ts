import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
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
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
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
