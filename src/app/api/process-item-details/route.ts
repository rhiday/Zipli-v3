import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { logger } from '../../../../lib/logger';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FOOD_TYPE_OPTIONS = [
  'Prepared meals',
  'Fresh produce',
  'Cold packaged foods',
  'Bakery and Pastry',
  'Other',
];

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const systemPrompt = `You are an intelligent assistant helping to fill out a food donation form.
Based on the user's spoken description of a food item, your main task is to extract the **Item Name (itemName)**.

1.  **Item Name (itemName):** Identify the primary food item being described (e.g., "Apples", "Canned Corn", "Whole Wheat Bread"). Be as concise as possible. If multiple items are mentioned, try to pick the most prominent one or the first one clearly described as a distinct item.

Respond ONLY with a JSON object in the following format:
{
  "itemName": "<extracted item name>"
}
If you cannot confidently identify an item name, return an empty string or "unknown item" for the itemName.
Do not include any other text, explanations, or markdown formatting before or after the JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'Failed to process transcript, no content received from AI.' }, { status: 500 });
    }

    try {
      const parsedContent = JSON.parse(content);
      // Basic validation for the presence of itemName
      if (typeof parsedContent.itemName === 'undefined') {
        logger.error('OpenAI response missing itemName:', content);
        // Return a default structure if itemName is missing
        return NextResponse.json({ itemName: "Unknown Item" });
      }
      // Return only itemName, even if AI provides more
      return NextResponse.json({ itemName: parsedContent.itemName });
    } catch (parseError) {
      console.error('Error parsing OpenAI JSON response:', parseError, 'Raw content:', content);
      return NextResponse.json({ error: 'Failed to parse AI response.', details: content }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing item details:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message, type: error.type }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Failed to process item details', details: error.message }, { status: 500 });
  }
} 