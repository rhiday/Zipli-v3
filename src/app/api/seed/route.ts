import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import fs from 'fs';
import path from 'path';

// Load mock users data
const mockUsersPath = path.join(process.cwd(), 'mockData', 'users.json');
const mockUsers = JSON.parse(fs.readFileSync(mockUsersPath, 'utf8'));

export async function GET() {
  try {
    // Clear warnings about JSON import type
    const users = mockUsers as Array<{
      email: string;
      password: string;
      role: string;
      full_name: string;
    }>;

    // Create users and their profiles
    for (const user of users) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('email')
        .eq('email', user.email)
        .single();

      if (!existingUser) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
        });

        if (authError) {
          console.error(`Error creating user ${user.email}:`, authError);
          continue;
        }

        if (authData.user) {
          // Create organization record
          const { error: orgError } = await supabase
            .from('organizations')
            .insert({
              id: authData.user.id,
              name: user.full_name,
              contact_person: user.full_name,
              contact_number: '123-456-7890',
              email: user.email,
              address: '123 Main St',
              created_by: authData.user.id,
            });

          if (orgError) {
            console.error(`Error creating organization for ${user.email}:`, orgError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded with mock users' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to seed database', error },
      { status: 500 }
    );
  }
} 