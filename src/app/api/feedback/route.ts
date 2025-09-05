import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rating, category, comment, email, page_url } = body;

    // Validate required fields
    if (!rating || !category || !comment) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: rating, category, and comment are required',
        },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['bug', 'feature', 'general'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: bug, feature, general' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400 }
      );
    }

    // For server-side API routes, we'll allow anonymous feedback
    // and not try to get user authentication state
    const userId = null;

    // Insert feedback into database
    // Using type assertion since feedback table is not in current type definitions
    const { data, error } = await (supabase as any)
      .from('feedback')
      .insert({
        rating,
        category,
        comment,
        email: email || null,
        page_url: page_url || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        {
          error: 'Failed to save feedback',
          details: error.message || 'Unknown database error',
        },
        { status: 500 }
      );
    }

    // TODO: Optional - Send email notification to admin
    // You can implement this later using services like:
    // - Resend
    // - SendGrid
    // - Supabase Edge Functions
    //
    // Example structure:
    // await sendEmailNotification({
    //   to: 'ninja@nowastefutures.com',
    //   subject: `New ${category} feedback (${rating}/5 stars)`,
    //   body: `
    //     Rating: ${rating}/5 stars
    //     Category: ${category}
    //     Comment: ${comment}
    //     Email: ${email || 'Not provided'}
    //     Page: ${page_url || 'Not provided'}
    //     User ID: ${userId || 'Anonymous'}
    //   `
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully',
        id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint to retrieve feedback (for admin dashboard)
// Note: This is simplified for now - you may want to add proper admin authentication later
export async function GET(request: NextRequest) {
  try {
    // Get feedback with pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: feedback, error } = await (supabase as any)
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feedback,
      page,
      limit,
      total: feedback.length,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
