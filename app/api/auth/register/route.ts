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

		if (username.length < 3) {
			return NextResponse.json(
				{ error: 'Username must be at least 3 characters' },
				{ status: 400 }
			)
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'Password must be at least 6 characters' },
				{ status: 400 }
			)
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		// Check if username already exists
		const existingUser = await collection.findOne({
			username: username.trim().toLowerCase(),
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: 'Username already exists' },
				{ status: 409 }
			)
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10)

		// Create user
		const result = await collection.insertOne({
			username: username.trim().toLowerCase(),
			password: hashedPassword,
			createdAt: new Date(),
		})

		// Create session cookie (simple approach using userId)
		const response = NextResponse.json(
			{
				message: 'User created successfully',
				userId: result.insertedId.toString(),
				username: username.trim(),
			},
			{ status: 201 }
		)

		// Set session cookie
		response.cookies.set('userId', result.insertedId.toString(), {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30, // 30 days
		})

		return response
	} catch (error) {
		console.error('Error registering user:', error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to register user',
			},
			{ status: 500 }
		)
	}
}
