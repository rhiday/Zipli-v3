import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    // AI features have been disabled for YC demo
    // Return a mock response for now
    console.info(
      'AI processing disabled - returning mock response for transcript:',
      transcript.substring(0, 50)
    );

    const mockResponse = {
      itemName: 'Food Item',
      quantity: 1,
      notes: 'No additional notes provided.',
    };

    return NextResponse.json(mockResponse);
  } catch (error: any) {
    console.error('Error processing request details:', error);
    return NextResponse.json(
      { error: 'Failed to process request details', details: error.message },
      { status: 500 }
    );
  }
}
