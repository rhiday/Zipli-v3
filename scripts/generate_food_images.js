require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const { OpenAI } = require('openai');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');
const sharp = require('sharp');

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
  return `create image of ${item.name}, natural and real style, in a setting so that it looks like placed on a restaurant table or a buffet. it will look like item is part of a buffet / table but the focus is stll on the item.`;
}

async function generateImage(promptString) {
  console.log(`Using DALL-E prompt: "${promptString}"`);
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: promptString,
    n: 1,
    size: "1024x1024",
    response_format: "url",
  });
  return response.data[0].url;
}

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to download image');
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToSupabase(itemId, buffer) {
  // Compress and resize image to 512x512 JPEG
  const compressed = await sharp(buffer)
    .resize(512, 512, { fit: 'inside' })
    .jpeg({ quality: 80 })
    .toBuffer();
  const filePath = `${itemId}/dalle_${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filePath, compressed, { contentType: 'image/jpeg', upsert: true });
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
      const imageGenerationPrompt = makePrompt(item);
      const imageUrl = await generateImage(imageGenerationPrompt);
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