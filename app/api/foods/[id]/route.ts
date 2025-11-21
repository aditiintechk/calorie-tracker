import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'foods'

// PATCH - Update a food entry by ID
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getAuthenticatedUser(request)

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params

		if (!id) {
			return NextResponse.json(
				{ error: 'Food ID is required' },
				{ status: 400 }
			)
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid food ID format' },
				{ status: 400 }
			)
		}

		const { name, calories, protein, timestamp } = await request.json()

		if (!name || !calories || protein === undefined) {
			return NextResponse.json(
				{ error: 'Name, calories, and protein are required' },
				{ status: 400 }
			)
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		// Prepare update object
		const updateData: {
			name: string
			calories: number
			protein: number
			datetime?: Date
		} = {
			name: name.trim(),
			calories: parseInt(calories),
			protein: parseFloat(protein),
		}

		// Update datetime if timestamp is provided
		if (timestamp) {
			updateData.datetime = new Date(timestamp)
		}

		// Only update if the food entry belongs to the authenticated user
		const result = await collection.updateOne(
			{
				_id: new ObjectId(id),
				userId: user.userId,
			},
			{
				$set: updateData,
			}
		)

		if (result.matchedCount === 0) {
			return NextResponse.json(
				{ error: 'Food entry not found' },
				{ status: 404 }
			)
		}

		// Return the updated food entry
		const updatedFood = await collection.findOne({
			_id: new ObjectId(id),
			userId: user.userId,
		})

		if (!updatedFood) {
			return NextResponse.json(
				{ error: 'Food entry not found after update' },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			id: updatedFood._id.toString(),
			name: updatedFood.name,
			calories: updatedFood.calories,
			protein: updatedFood.protein,
			timestamp: updatedFood.datetime.getTime(),
		})
	} catch (error) {
		console.error('Error updating food entry:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to update food entry',
			},
			{ status: 500 }
		)
	}
}

// DELETE - Delete a food entry by ID
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getAuthenticatedUser(request)

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { id } = await params

		if (!id) {
			return NextResponse.json(
				{ error: 'Food ID is required' },
				{ status: 400 }
			)
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(id)) {
			return NextResponse.json(
				{ error: 'Invalid food ID format' },
				{ status: 400 }
			)
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		// Only delete if the food entry belongs to the authenticated user
		const result = await collection.deleteOne({
			_id: new ObjectId(id),
			userId: user.userId,
		})

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{ error: 'Food entry not found' },
				{ status: 404 }
			)
		}

		return NextResponse.json(
			{ message: 'Food entry deleted successfully' },
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error deleting food entry:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to delete food entry',
			},
			{ status: 500 }
		)
	}
}
