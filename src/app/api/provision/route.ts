import { NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const supabase = await createUserClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // Create or update profile
    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          role: user.user_metadata?.role || 'homeowner'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
    }

    // Check if user already has a workspace
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!existingMember) {
      // Create personal workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          owner_id: user.id,
          name: 'My Home Projects'
        })
        .select()
        .single();

      if (workspaceError) {
        console.error('Error creating workspace:', workspaceError);
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
      }

      // Add user as workspace owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Error adding workspace member:', memberError);
        return NextResponse.json({ error: 'Failed to add workspace member' }, { status: 500 });
      }

      // Create default free subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions_new')
        .insert({
          workspace_id: workspace.id,
          plan: 'free',
          status: 'active'
        });

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        // Don't fail the whole request for subscription creation
      }
    }

    return NextResponse.json({ 
      ok: true, 
      message: 'User workspace provisioned successfully' 
    });

  } catch (error) {
    console.error('Provisioning error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
