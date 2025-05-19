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
    const audioFormData = await req.formData();
    const audioFileFromFormData = audioFormData.get('audio') as File;

    if (!audioFileFromFormData || audioFileFromFormData.size === 0) {
      return NextResponse.json({ error: 'No audio file uploaded or file is empty' }, { status: 400 });
    }

    // Log the received file details for debugging
    console.log(`[API /transcribe-audio] Received file: name='${audioFileFromFormData.name}', size=${audioFileFromFormData.size}, type='${audioFileFromFormData.type}'`);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFileFromFormData,
      model: 'whisper-1',
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