import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize clients with environment variables that are set in .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
const openai = new OpenAI();

export async function POST(request: Request) {
  try {
    // Make sure we have required environment variables
    if (!process.env.OPENAI_API_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Food name is required' },
        { status: 400 }
      );
    }

    // Generate DALL-E image
    console.log(`Generating DALL-E image for: ${name}`);
    const prompt = `create image of ${name}, natural and real style, in a setting so that it looks like placed on a restaurant table or a buffet. it will look like item is part of a buffet / table but the focus is stll on the item.`;
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'url',
    });

    if (!response.data || !response.data[0]?.url) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    const imageUrl = response.data[0].url;
    
    // Download the image
    console.log(`Downloading image from URL`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download image' },
        { status: 500 }
      );
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Compress and resize image to 512x512 JPEG
    const compressedBuffer = await sharp(imageBuffer)
      .resize(512, 512)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to Supabase
    const filePath = `dalle_${Date.now()}.jpg`;
    console.log(`Uploading to Supabase: ${filePath}`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'donations')
      .upload(filePath, compressedBuffer, { contentType: 'image/jpeg', upsert: true });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(process.env.SUPABASE_STORAGE_BUCKET || 'donations')
      .getPublicUrl(filePath);
      
    console.log(`Generated image URL: ${urlData.publicUrl}`);
    
    // Return the URL to the client
    return NextResponse.json({ url: urlData.publicUrl });
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 