import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Readable } from 'stream';

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
  // Suppress TypeScript error for 'File' constructor arguments, as it works in this environment
  // @ts-ignore
  return new File([blob], filename, { type: mimetype });
}


export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    
    // The OpenAI SDK expects a File object or a ReadStream.
    // For Next.js Edge Runtime or similar environments, directly passing the File from FormData is preferred.
    // If audioFile were a Node.js stream, we'd convert it. Since it's from FormData, it should be File-like.

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile, // Directly use the File object from FormData
      model: 'whisper-1',
    });

    return NextResponse.json({ transcript: transcription.text });

  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    // Check if it's an OpenAI API error
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message, type: error.type }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Failed to transcribe audio', details: error.message }, { status: 500 });
  }
} 