import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'foods'

interface FoodEntry {
	name: string
	calories: number
	protein: number
	datetime: Date
	userId: string
}

// GET - Fetch all food entries for authenticated user
export async function GET(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request)

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		const foods = await collection
			.find({ userId: user.userId })
			.sort({ datetime: -1 }) // Sort by datetime descending (newest first)
			.toArray()

		// Convert MongoDB documents to frontend format
		const formattedFoods = foods.map((food) => ({
			id: food._id.toString(),
			name: food.name,
			calories: food.calories,
			protein: food.protein,
			timestamp: food.datetime.getTime(), // Convert Date to timestamp
		}))

		return NextResponse.json(formattedFoods)
	} catch (error) {
		console.error('Error fetching foods:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to fetch food entries',
			},
			{ status: 500 }
		)
	}
}

// POST - Add a new food entry
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request)

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { name, calories, protein } = await request.json()

		if (!name || !calories || protein === undefined) {
			return NextResponse.json(
				{ error: 'Name, calories, and protein are required' },
				{ status: 400 }
			)
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		const foodEntry: FoodEntry = {
			name: name.trim(),
			calories: parseInt(calories),
			protein: parseFloat(protein),
			datetime: new Date(),
			userId: user.userId,
		}

		const result = await collection.insertOne(foodEntry)

		// Return the created food entry
		const createdFood = {
			id: result.insertedId.toString(),
			name: foodEntry.name,
			calories: foodEntry.calories,
			protein: foodEntry.protein,
			timestamp: foodEntry.datetime.getTime(),
		}

		return NextResponse.json(createdFood, { status: 201 })
	} catch (error) {
		console.error('Error adding food entry:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to add food entry',
			},
			{ status: 500 }
		)
	}
}
