import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { checkRateLimit, getClientIP } from '@/lib/validation';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to convert Node.js Readable stream to a File-like object for OpenAI
async function toFile(stream: Readable, filename: string, mimetype: string): Promise<File> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const blob = new Blob(chunks, { type: mimetype });
  // Suppress TypeScript error for File constructor arguments, as it works in this environment
  // @ts-ignore
  return new File([blob], filename, { type: mimetype });
}


export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  // Rate limiting for audio transcription (more restrictive due to higher cost)
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(`transcribe-audio-${clientIP}`, 10, 60000); // 10 requests per minute
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const audioFormData = await req.formData();
    const audioFileFromFormData = audioFormData.get('audio') as File;

    if (!audioFileFromFormData || audioFileFromFormData.size === 0) {
      return NextResponse.json({ error: 'No audio file uploaded or file is empty' }, { status: 400 });
    }

    // Validate file size (max 25MB for audio files)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (audioFileFromFormData.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Audio file too large. Maximum size is 25MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg'];
    if (!allowedTypes.includes(audioFileFromFormData.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload an audio file (MP3, MP4, WAV, WebM, or OGG).' 
      }, { status: 400 });
    }

    // Log the received file details for debugging
    console.log(`[API /transcribe-audio] Received file: name='${audioFileFromFormData.name}', size=${audioFileFromFormData.size}, type='${audioFileFromFormData.type}'`);

    const whisperPrompt = "This audio describes food items for donation or request, including names like apples, rice, bread, milk, soup, pasta, chicken, beef, vegetables, fruits, and quantities like kilograms, pounds, pieces, items, boxes, cans. It may also include descriptions, pickup details, or reasons for need.";

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileFromFormData,
      model: 'whisper-1',
      prompt: whisperPrompt,
      language: "en" // Explicitly setting language can also help
    });

    const transcriptText = transcription.text;
    return NextResponse.json({ transcript: transcriptText });

  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    // Check if it's an OpenAI API error
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message, type: error.type }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Failed to transcribe audio', details: error.message }, { status: 500 });
  }
} 