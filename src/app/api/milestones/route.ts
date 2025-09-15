import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('milestones')
      .select(`
        *,
        tasks (
          id,
          title,
          status,
          priority
        )
      `)
      .order('order_index', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: milestones, error } = await query;

    if (error) {
      console.error('Error fetching milestones:', error);
      return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('Error in GET /api/milestones:', error);
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
    const { 
      project_id, 
      title, 
      description, 
      due_date, 
      order_index = 0
    } = body;

    // Validate required fields
    if (!project_id || !title) {
      return NextResponse.json({ error: 'project_id and title are required' }, { status: 400 });
    }

    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert({
        project_id,
        title,
        description,
        due_date,
        order_index,
        created_by: user.id,
        status: 'todo'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating milestone:', error);
      return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
    }

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/milestones:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
