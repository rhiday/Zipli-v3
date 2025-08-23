import { NextRequest, NextResponse } from 'next/server';

const LOKALISE_API_TOKEN = process.env.LOKALISE_API_TOKEN;
const LOKALISE_PROJECT_ID = process.env.LOKALISE_PROJECT_ID;

export async function GET(request: NextRequest) {
  try {
    if (!LOKALISE_API_TOKEN || !LOKALISE_PROJECT_ID) {
      console.warn('Lokalise credentials not configured, using local files');
      return NextResponse.json(
        { error: 'Lokalise not configured' },
        { status: 501 }
      );
    }

    // Step 1: Create a download request
    const downloadResponse = await fetch(
      `https://api.lokalise.com/api2/projects/${LOKALISE_PROJECT_ID}/files/download`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Token': LOKALISE_API_TOKEN,
        },
        body: JSON.stringify({
          format: 'json',
          original_filenames: false,
          directory_prefix: '',
          indentation: '2sp',
          export_empty_as: 'base',
          export_sort: 'first_added',
          json_unescaped_slashes: true,
          replace_breaks: false,
        }),
      }
    );

    if (!downloadResponse.ok) {
      const errorData = await downloadResponse.text();
      console.error('Lokalise download request failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to request download' },
        { status: 500 }
      );
    }

    const downloadData = await downloadResponse.json();
    const bundleUrl = downloadData.bundle_url;

    // Step 2: Download the bundle
    const bundleResponse = await fetch(bundleUrl);
    if (!bundleResponse.ok) {
      console.error('Failed to download bundle from:', bundleUrl);
      return NextResponse.json(
        { error: 'Failed to download translations' },
        { status: 500 }
      );
    }

    // The bundle is a zip file, but for now we'll handle it differently
    // In production, you'd unzip and process the files

    // For now, return a structured response that matches our format
    // This is a placeholder - in production, parse the actual Lokalise response
    const translations = {
      en: await getLocalTranslations('en'),
      fi: await getLocalTranslations('fi'),
    };

    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error fetching translations from Lokalise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

// Helper function to get local translations as fallback
async function getLocalTranslations(language: string) {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const filePath = path.join(
      process.cwd(),
      'public',
      'locales',
      language,
      'translations.json'
    );
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read local translations for ${language}:`, error);
    return {};
  }
}

// Webhook endpoint for Lokalise updates
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();

    // Verify webhook is from Lokalise (implement signature verification in production)
    if (webhook.event === 'project.translation.updated') {
      // Trigger a re-fetch of translations
      // In production, you might want to invalidate cache here
      console.log('Translation updated in Lokalise, triggering sync...');

      // You could emit an event or update a cache here
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
