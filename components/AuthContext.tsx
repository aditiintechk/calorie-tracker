'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
	userId: string
	username: string
}

interface AuthContextType {
	user: User | null
	loading: boolean
	login: (
		username: string,
		password: string
	) => Promise<{ success: boolean; error?: string }>
	register: (
		username: string,
		password: string
	) => Promise<{ success: boolean; error?: string }>
	logout: () => Promise<void>
	refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	const checkSession = async () => {
		try {
			const response = await fetch('/api/auth/session')
			const data = await response.json()

			if (data.authenticated) {
				setUser({
					userId: data.userId,
					username: data.username,
				})
			} else {
				setUser(null)
			}
		} catch (error) {
			console.error('Error checking session:', error)
			setUser(null)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		checkSession()
	}, [])

	const login = async (username: string, password: string) => {
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			})

			const data = await response.json()

			if (response.ok) {
				setUser({
					userId: data.userId,
					username: data.username,
				})
				return { success: true }
			} else {
				console.error('Login failed:', data.error)
				return { success: false, error: data.error || 'Login failed' }
			}
		} catch (error) {
			console.error('Error logging in:', error)
			return { success: false, error: 'Network error. Please try again.' }
		}
	}

	const register = async (username: string, password: string) => {
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			})

			const data = await response.json()

			if (response.ok) {
				setUser({
					userId: data.userId,
					username: data.username,
				})
				return { success: true }
			} else {
				return {
					success: false,
					error: data.error || 'Registration failed',
				}
			}
		} catch (error) {
			console.error('Error registering:', error)
			return { success: false, error: 'Network error. Please try again.' }
		}
	}

	const logout = async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
			})
			setUser(null)
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}

	const refreshSession = async () => {
		await checkSession()
	}

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout, refreshSession }}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
