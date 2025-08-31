import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { Buffer } from 'buffer';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get('image') as File;
  if (!file)
    return NextResponse.json({ error: 'No image provided' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const compressed = await sharp(buffer)
    .resize(512, 512)
    .jpeg({ quality: 80 })
    .toBuffer();

  return new NextResponse(new Uint8Array(compressed), {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="compressed.jpg"',
    },
  });
}
