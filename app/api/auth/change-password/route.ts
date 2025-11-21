import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'users'

// POST - Change password (for logged-in users)
export async function POST(request: NextRequest) {
	try {
		const user = await getAuthenticatedUser(request)

		if (!user) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			)
		}

		const { newPassword } = await request.json()

		if (!newPassword) {
			return NextResponse.json(
				{ error: 'New password is required' },
				{ status: 400 }
			)
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: 'Password must be at least 6 characters' },
				{ status: 400 }
			)
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Update password
		await collection.updateOne(
			{ _id: new ObjectId(user.userId) },
			{
				$set: {
					password: hashedPassword,
					passwordUpdatedAt: new Date(),
				},
			}
		)

		return NextResponse.json(
			{
				message: 'Password changed successfully',
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error changing password:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to change password',
			},
			{ status: 500 }
		)
	}
}

