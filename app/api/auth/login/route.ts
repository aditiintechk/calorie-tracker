import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'users'

export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json()

		if (!username || !password) {
			return NextResponse.json(
				{ error: 'Username and password are required' },
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
			console.error(
				`Login attempt failed: User not found - ${normalizedUsername}`
			)
			return NextResponse.json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			)
		}

		// Check if password field exists
		if (!user.password) {
			console.error(
				'Login attempt failed: User document missing password field'
			)
			return NextResponse.json(
				{ error: 'User account error. Please contact support.' },
				{ status: 500 }
			)
		}

		// Verify password
		const isValidPassword = await bcrypt.compare(password, user.password)

		if (!isValidPassword) {
			console.error('Login attempt failed: Invalid password')
			return NextResponse.json(
				{ error: 'Invalid username or password' },
				{ status: 401 }
			)
		}

		// Create session cookie
		const response = NextResponse.json(
			{
				message: 'Login successful',
				userId: user._id.toString(),
				username: user.username,
			},
			{ status: 200 }
		)

		// Set session cookie
		response.cookies.set('userId', user._id.toString(), {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
		})

		return response
	} catch (error) {
		console.error('Error logging in:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : 'Failed to login',
			},
			{ status: 500 }
		)
	}
}
