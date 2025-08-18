import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import fs from 'fs';
import path from 'path';

// Load mock users data
const mockUsersPath = path.join(process.cwd(), 'mockData', 'users.json');
const mockUsers = JSON.parse(fs.readFileSync(mockUsersPath, 'utf8'));

export async function GET() {
  // Only run in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This route is only available in development' }, { status: 403 });
  }

  try {
    // Create test users
    const users = [
      {
        email: 'alice@example.com',
        password: 'testpass123',
        role: 'food_donor' as const,
        full_name: 'Alice Restaurant',
        organization_name: 'Alice\'s Restaurant',
      },
      {
        email: 'bob@example.com',
        password: 'testpass123',
        role: 'food_receiver' as const,
        full_name: 'Bob Charity',
        organization_name: 'Bob\'s Food Bank',
      },
      {
        email: 'helsinki@example.com',
        password: 'testpass123',
        role: 'city' as const,
        full_name: 'Helsinki Admin',
        organization_name: 'Helsinki',
      },
    ];

    for (const user of users) {
      console.log(`Creating user ${user.email}...`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError);
        throw authError;
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: user.email,
            role: user.role,
            full_name: user.full_name,
            organization_name: user.organization_name,
          });

        if (profileError) {
          console.error(`Error creating profile for ${user.email}:`, profileError);
          throw profileError;
        }
      }
    }

    return NextResponse.json({ message: 'Seed completed successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
} 