import { NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';
import { generateDocumentContent } from '@/lib/ai-documents';
import { assertWithinCap, recordUsageEvent } from '@/lib/usage';

export async function POST(request: Request) {
  try {
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, type } = await request.json();

    if (!projectId || !type) {
      return NextResponse.json({ error: 'Missing projectId or type' }, { status: 400 });
    }

    // Verify user has access to this project
    const { data: project, error: projectError } = await supabase
      .from('projects_new')
      .select(`
        id,
        name,
        location,
        description,
        size_sqft,
        workspace_id
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check usage limits
    try {
      await assertWithinCap(project.workspace_id, 'generate_doc');
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 429 });
      }
      return NextResponse.json({ 
        error: 'Usage limit check failed' 
      }, { status: 500 });
    }

    // Generate document content using AI
    const documentContent = await generateDocumentContent({
      projectName: project.name,
      location: project.location,
      description: project.description || '',
      sizeSqft: project.size_sqft,
      type: type
    });

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        type: type,
        title: `${type === 'sow' ? 'Scope of Work' : 'Estimate'} - ${project.name}`,
        content_md: documentContent,
        created_by: user.id
      })
      .select()
      .single();

    if (documentError) {
      console.error('Error creating document:', documentError);
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }

    // Record usage event
    await recordUsageEvent(project.workspace_id, 'generate_doc', 1, { 
      document_id: document.id, 
      type: type 
    });

    return NextResponse.json({ 
      success: true, 
      documentId: document.id,
      message: 'Document generated successfully' 
    });

  } catch (error) {
    console.error('Error in document generation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
