import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// Environment variables - in production, use process.env
const SUPABASE_URL = 'https://vqtfcdnrgotgrnwwuryo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxdGZjZG5yZ290Z3Jud3d1cnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTkwODM3NiwiZXhwIjoyMDYxNDg0Mzc2fQ.nqHBc5b9VkUXp2qM-87AdHyiczgTZr0wn2qiPUnf15U';
const SUPABASE_STORAGE_BUCKET = 'donations';
const OPENAI_API_KEY = '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';

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
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
    console.log(`Downloading image from: ${imageUrl}`);
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download image' },
        { status: 500 }
      );
    }
    
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    // Upload to Supabase
    const filePath = `dalle_${Date.now()}.png`;
    console.log(`Uploading to Supabase: ${filePath}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, imageBuffer, { contentType: 'image/png', upsert: true });
      
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      );
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
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