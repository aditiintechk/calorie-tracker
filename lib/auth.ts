import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'users'

export interface AuthUser {
	userId: string
	username: string
}

/**
 * Get authenticated user from request cookies
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(
	request: NextRequest
): Promise<AuthUser | null> {
	try {
		const userId = request.cookies.get('userId')?.value

		if (!userId || !ObjectId.isValid(userId)) {
			return null
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		const user = await collection.findOne({ _id: new ObjectId(userId) })

		if (!user) {
			return null
		}

		return {
			userId: user._id.toString(),
			username: user.username,
		}
	} catch (error) {
		console.error('Error getting authenticated user:', error)
		return null
	}
}
