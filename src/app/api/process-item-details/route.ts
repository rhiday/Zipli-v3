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
Based on the user's spoken description of a food item, your task is to extract key details.

1.  **Item Name (itemName):** A concise name for the item (e.g., "Apples", "Canned Corn", "Whole Wheat Bread").
2.  **Description (description):** Any additional details like brand, specific type, or condition (e.g., "Organic Fuji apples", "Low sodium canned corn", "Freshly baked today"). If not specified, use an empty string.
3.  **Quantity (quantity):** The numerical amount of the item. If the user mentions a range, pick the lower number. If no specific number, try to infer or default to 1. Output as a number. The user understands this quantity is implicitly in kilograms (kg) if applicable, but you should only extract the number.
4.  **Food Type (foodType):** Categorize the item. Valid options are: "Produce", "Canned Goods", "Baked Goods", "Dairy", "Meat/Protein", "Frozen", "Meals", "Snacks", "Beverages", "Grains/Pasta", "Other". If unsure, default to "Other".

Respond ONLY with a JSON object in the following format:
{
  "itemName": "<extracted item name>",
  "description": "<extracted description>",
  "quantity": <extracted quantity as a number>,
  "foodType": "<extracted food type>"
}
Ensure quantity is a number. Do not include any other text, explanations, or markdown formatting before or after the JSON object.
If a piece of information isn't clearly available, use a sensible default (e.g., quantity 1, foodType "Other", empty string for description).`;

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
      // Basic validation for the presence of new fields
      if (
        !parsedContent.itemName ||
        typeof parsedContent.description === 'undefined' || // Can be empty string
        typeof parsedContent.quantity !== 'number' ||
        !parsedContent.foodType
      ) {
        logger.error('OpenAI response missing or has invalid types for key fields:', content);
        // Attempt to provide sensible defaults
        const finalResponse = {
            itemName: parsedContent.itemName || "Unknown Item",
            description: parsedContent.description || "No description provided.",
            quantity: typeof parsedContent.quantity === 'number' ? parsedContent.quantity : 1,
            foodType: parsedContent.foodType || "Other"
        };
        logger.warn('Returning response with some defaults due to missing/invalid fields from AI:', finalResponse);
        return NextResponse.json(finalResponse);
      }
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