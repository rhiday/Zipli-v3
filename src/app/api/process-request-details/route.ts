import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    const systemPrompt = `You are an intelligent assistant helping to fill out a food request form.
Based on the user's spoken description of what they need, your task is to extract key details.

1.  **Item Name (itemName):** A concise name for the item being requested (e.g., "Rice", "Apples", "Canned Soup").
2.  **Quantity (quantity):** The numerical amount of the item requested. If the user mentions a range, pick the lower number. If no specific number, try to infer or default to 1. Output as a number.
3.  **Notes (notes):** Any additional details, reasons for the request, or specific preferences mentioned by the user (e.g., "Urgently needed for a family of four.", "Preferably whole wheat bread.", "Any brand of canned soup is fine."). If no specific notes, use an empty string or a generic placeholder like "No additional notes.".

Respond ONLY with a JSON object in the following format:
{
  "itemName": "<extracted item name>",
  "quantity": <extracted quantity as a number>,
  "notes": "<extracted notes or reasons>"
}
Ensure quantity is a number. Do not include any other text, explanations, or markdown formatting before or after the JSON object. If a piece of information isn't clearly available, use a sensible default (e.g., quantity 1).`;

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
        typeof parsedContent.quantity !== 'number' || 
        typeof parsedContent.notes === 'undefined' // Notes can be an empty string
      ) {
        console.error('OpenAI response missing or has invalid types for key request fields:', content);
        // Attempt to provide sensible defaults
        const finalResponse = {
            itemName: parsedContent.itemName || "Unknown Item",
            quantity: typeof parsedContent.quantity === 'number' ? parsedContent.quantity : 1,
            notes: parsedContent.notes || "No additional notes provided.",
        };
        console.warn('Returning response with some defaults due to missing/invalid fields from AI for request:', finalResponse);
        return NextResponse.json(finalResponse);
      }
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Error parsing OpenAI JSON response for request:', parseError, 'Raw content:', content);
      return NextResponse.json({ error: 'Failed to parse AI response for request.', details: content }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing request details:', error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({ error: error.message, type: error.type }, { status: error.status || 500 });
    }
    return NextResponse.json({ error: 'Failed to process request details', details: error.message }, { status: 500 });
  }
} 