import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'users'

// POST - Reset password
export async function POST(request: NextRequest) {
	try {
		const { username, newPassword } = await request.json()

		if (!username || !newPassword) {
			return NextResponse.json(
				{ error: 'Username and new password are required' },
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

		// Find user by username
		const normalizedUsername = username.trim().toLowerCase()
		const user = await collection.findOne({
			username: normalizedUsername,
		})

		if (!user) {
			// Don't reveal if user exists for security
			return NextResponse.json(
				{ error: 'If the username exists, password has been reset.' },
				{ status: 200 }
			)
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(newPassword, 10)

		// Update password
		await collection.updateOne(
			{ _id: user._id },
			{
				$set: {
					password: hashedPassword,
					passwordUpdatedAt: new Date(),
				},
			}
		)

		return NextResponse.json(
			{
				message: 'Password reset successfully. You can now login with your new password.',
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error resetting password:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to reset password',
			},
			{ status: 500 }
		)
	}
}

