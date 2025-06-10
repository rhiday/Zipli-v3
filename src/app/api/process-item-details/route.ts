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

    const systemPrompt = `You are an intelligent assistant helping to fill out a food donation form.\nYour job is to extract the following information from the user's spoken description, even if the input is complex, ambiguous, or in a language other than English (translate to English if needed):\n\n1. items: An array of food items being donated. For each item, extract:\n   - name: The name of the food item (e.g., \"Apples\", \"Whole Wheat Bread\"). If missing or unclear, respond with \"missing\".\n   - quantity: The amount in kilograms (e.g., \"5 kg\", \"2 kg\"). If the user mentions a different unit, try to convert to kg if possible; otherwise, respond with \"missing\".\n   - allergens: An array of allergens mentioned for the item (e.g., [\"gluten\", \"nuts\"]). If none are mentioned, use an empty array. If unclear, respond with \"missing\".\n\nIf the user speaks in a language other than English, translate all extracted fields to English.\nIf you cannot confidently extract a field, respond with \"missing\" for that field.\nIf the user mentions multiple items, extract each as a separate object in the items array.\nIf the input is ambiguous, do your best to infer the most likely values, but use \"missing\" if not confident.\n\nRespond ONLY with a JSON object in the following format (no extra text):\n{\n  \"items\": [\n    { \"name\": \"Apples\", \"quantity\": \"5 kg\", \"allergens\": [] },\n    { \"name\": \"missing\", \"quantity\": \"missing\", \"allergens\": \"missing\" }\n  ]\n}\n\nDo not include any explanations, markdown, or extra text—just the JSON object.`;

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
      // Basic validation for the presence of required fields
      if (!parsedContent.items || !Array.isArray(parsedContent.items)) {
        logger.error('OpenAI response missing items array:', content);
        return NextResponse.json({ error: 'Missing items array in AI response.' }, { status: 500 });
      }
      // Return the full parsed content as-is
      return NextResponse.json(parsedContent);
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