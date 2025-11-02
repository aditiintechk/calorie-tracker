'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const [isLogin, setIsLogin] = useState(true)
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { user, loading: authLoading, login, register } = useAuth()
	const router = useRouter()

	// Redirect to home if already authenticated
	useEffect(() => {
		if (!authLoading && user) {
			router.push('/')
		}
	}, [user, authLoading, router])

	if (authLoading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-[#1c1c1c]'>Loading...</div>
			</div>
		)
	}

	if (user) {
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		if (isLogin) {
			const result = await login(username, password)
			if (result.success) {
				router.push('/')
			} else {
				setError(result.error || 'Invalid username or password')
			}
		} else {
			const result = await register(username, password)
			if (result.success) {
				router.push('/')
			} else {
				setError(
					result.error ||
						'Registration failed. Username may already exist.'
				)
			}
		}

		setLoading(false)
	}

	return (
		<div className='min-h-screen flex items-center justify-center px-10 py-6'>
			<div className='w-full max-w-md'>
				<div className='space-y-6'>
					<h1 className='text-xl font-bold font-sans text-[#1c1c1c] mb-2 text-center'>
						Calorie Tracker
					</h1>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label
								htmlFor='username'
								className='block text-sm font-medium text-[#1c1c1c] mb-2'
							>
								Username
							</label>
							<input
								id='username'
								type='text'
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								minLength={3}
								autoComplete='off'
								className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd6c0] text-[#1c1c1c] bg-white'
								placeholder='Enter your username'
								disabled={loading}
							/>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-[#1c1c1c] mb-2'
							>
								Password
							</label>
							<input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
								autoComplete='off'
								className='w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd6c0] text-[#1c1c1c] bg-white'
								placeholder='Enter your password'
								disabled={loading}
							/>
							{!isLogin && (
								<p className='text-xs text-[#1c1c1c] opacity-60 mt-1'>
									Password must be at least 6 characters
								</p>
							)}
						</div>

						{error && (
							<div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
								{error}
							</div>
						)}

						<button
							type='submit'
							disabled={loading}
							className='w-full py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-[#1c1c1c]'
							style={{
								background:
									'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
							}}
						>
							{loading
								? 'Please wait...'
								: isLogin
								? 'Login'
								: 'Create Account'}
						</button>
					</form>

					<div className='mt-6 text-center'>
						<button
							onClick={() => {
								setIsLogin(!isLogin)
								setError('')
								setUsername('')
								setPassword('')
							}}
							className='text-sm text-[#1c1c1c] opacity-70 hover:opacity-100 transition-opacity underline'
						>
							{isLogin
								? "Don't have an account? Sign up"
								: 'Already have an account? Login'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
