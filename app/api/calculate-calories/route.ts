import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_KEY,
})

export async function POST(request: NextRequest) {
	try {
		const { mealDescription } = await request.json()

		if (!mealDescription || typeof mealDescription !== 'string') {
			return NextResponse.json(
				{ error: 'Meal description is required' },
				{ status: 400 }
			)
		}

		if (!process.env.OPENAI_KEY) {
			return NextResponse.json(
				{ error: 'OpenAI API key not configured' },
				{ status: 500 }
			)
		}

		const prompt = `For each food item in this meal/snack, look up its approximate nutritional values per 100g or per piece from standard Indian food composition data. 

Meal/Snack: ${mealDescription}

Provide a breakdown in this EXACT JSON format (no markdown, no code blocks):
{
  "items": [
    {
      "item": "food name",
      "quantity": "quantity description",
      "calories": number,
      "protein": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number
  }
}

Instructions:
1. Identify each food item and its quantity
2. Look up nutritional values per 100g or per standard serving from Indian food composition databases
3. Calculate calories and protein for each item based on the specified quantities
4. Include all items in the items array
5. Sum all calories and protein in the total object`

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content:
						'You are a nutrition expert specializing in Indian food composition data. You systematically calculate nutritional values by: (1) identifying each food item and quantity, (2) referencing standard Indian food composition values per 100g or per piece, (3) calculating per-item nutrition based on quantities, (4) providing a breakdown with totals. Respond with ONLY valid JSON in the exact format requested. No markdown, no code blocks, no explanations.',
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			temperature: 0.2,
			max_tokens: 500,
		})

		const responseText = completion.choices[0]?.message?.content?.trim()

		if (!responseText) {
			return NextResponse.json(
				{ error: 'No response from AI' },
				{ status: 500 }
			)
		}

		// Clean the response - remove markdown code blocks if present
		let cleanedText = responseText
		if (cleanedText.includes('```json')) {
			cleanedText = cleanedText
				.replace(/```json\n?/g, '')
				.replace(/```\n?/g, '')
		} else if (cleanedText.includes('```')) {
			cleanedText = cleanedText.replace(/```\n?/g, '')
		}
		cleanedText = cleanedText.trim()

		try {
			const breakdown = JSON.parse(cleanedText)

			if (
				!breakdown.items ||
				!Array.isArray(breakdown.items) ||
				!breakdown.total
			) {
				throw new Error('Invalid JSON structure')
			}

			const calories = parseInt(breakdown.total.calories, 10)
			const protein = parseFloat(breakdown.total.protein)

			if (!calories || isNaN(calories) || calories <= 0) {
				return NextResponse.json(
					{ error: 'Invalid calorie value received' },
					{ status: 500 }
				)
			}

			if (!protein || isNaN(protein) || protein < 0) {
				return NextResponse.json(
					{ error: 'Invalid protein value received' },
					{ status: 500 }
				)
			}

			return NextResponse.json({
				calories,
				protein,
				breakdown: breakdown.items,
			})
		} catch (parseError) {
			// Fallback: try to extract just totals if JSON parsing fails
			const match = responseText.match(/(\d+)[,\s]+(\d+\.?\d*)/)

			if (match) {
				const calories = parseInt(match[1], 10)
				const protein = parseFloat(match[2])

				if (
					calories &&
					!isNaN(calories) &&
					calories > 0 &&
					protein &&
					!isNaN(protein) &&
					protein >= 0
				) {
					return NextResponse.json({
						calories,
						protein,
						breakdown: [],
					})
				}
			}

			return NextResponse.json(
				{ error: 'Invalid response format from AI' },
				{ status: 500 }
			)
		}
	} catch (error) {
		console.error('Error calculating calories:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to calculate calories',
			},
			{ status: 500 }
		)
	}
}
