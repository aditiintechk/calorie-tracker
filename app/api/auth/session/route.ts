import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'

const DB_NAME = 'calorie-tracker'
const COLLECTION_NAME = 'users'

export async function GET(request: NextRequest) {
	try {
		const userId = request.cookies.get('userId')?.value

		if (!userId) {
			return NextResponse.json({ authenticated: false }, { status: 200 })
		}

		// Validate ObjectId format
		if (!ObjectId.isValid(userId)) {
			const response = NextResponse.json(
				{ authenticated: false },
				{ status: 200 }
			)
			response.cookies.set('userId', '', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 0,
			})
			return response
		}

		const client = await clientPromise
		const db = client.db(DB_NAME)
		const collection = db.collection(COLLECTION_NAME)

		const user = await collection.findOne({ _id: new ObjectId(userId) })

		if (!user) {
			// Invalid user ID, clear cookie
			const response = NextResponse.json(
				{ authenticated: false },
				{ status: 200 }
			)
			response.cookies.set('userId', '', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 0,
			})
			return response
		}

		return NextResponse.json(
			{
				authenticated: true,
				userId: user._id.toString(),
				username: user.username,
			},
			{ status: 200 }
		)
	} catch (error) {
		console.error('Error checking session:', error)
		return NextResponse.json({ authenticated: false }, { status: 200 })
	}
}
