import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'foods'

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
