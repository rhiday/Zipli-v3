require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const fetch = require('node-fetch');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'donations';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPENAI_API_KEY) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function getFoodItems() {
  const { data, error } = await supabase
    .from('food_items')
    .select('id, name, description, image_url');
  if (error) throw error;
  return data;
}

function makePrompt(item) {
  return `A high-quality, appetizing photo of ${item.name}. ${item.description || ''} Food photography, clean background.`;
}

async function generateImage(prompt) {
  const response = await openai.images.generate({
    prompt,
    n: 1,
    size: '512x512',
    response_format: 'url',
  });
  return response.data[0].url;
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabase(itemId, buffer) {
  const filePath = `${itemId}/dalle_${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, buffer, { contentType: 'image/png', upsert: true });
  if (error) throw error;
  return data.path;
}

async function getPublicUrl(filePath) {
  const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

async function updateImageUrl(itemId, url) {
  const { error } = await supabase
    .from('food_items')
    .update({ image_url: url })
    .eq('id', itemId);
  if (error) throw error;
}

(async () => {
  try {
    const items = await getFoodItems();
    for (const item of items) {
      if (item.image_url) {
        console.log(`Skipping ${item.name} (already has image)`);
        continue;
      }
      const prompt = makePrompt(item);
      console.log(`Generating image for: ${item.name}`);
      const imageUrl = await generateImage(prompt);
      const buffer = await downloadImage(imageUrl);
      const filePath = await uploadToSupabase(item.id, buffer);
      const publicUrl = await getPublicUrl(filePath);
      await updateImageUrl(item.id, publicUrl);
      console.log(`Updated ${item.name} with image: ${publicUrl}`);
    }
    console.log('All done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})(); 