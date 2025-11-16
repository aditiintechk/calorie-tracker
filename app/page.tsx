'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FoodEntry from '@/components/FoodEntry'
import CalorieSummary from '@/components/CalorieSummary'
import AddFoodModal from '@/components/AddFoodModal'
import { useAuth } from '@/components/AuthContext'

interface Food {
	id: string
	name: string
	calories: number
	protein: number
	timestamp: number
}

export default function Home() {
	const { user, loading, logout } = useAuth()
	const router = useRouter()
	const [foods, setFoods] = useState<Food[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editFood, setEditFood] = useState<Food | null>(null)

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!loading && !user) {
			router.push('/login')
		}
	}, [user, loading, router])

	// Load from MongoDB on mount (only when user is authenticated)
	useEffect(() => {
		if (!user) return // Don't fetch if no user

		const fetchFoods = async () => {
			try {
				const response = await fetch('/api/foods')
				if (response.ok) {
					const data = await response.json()
					setFoods(data)
				} else {
					console.error('Failed to fetch foods')
				}
			} catch (error) {
				console.error('Error fetching foods:', error)
			}
		}
		fetchFoods()
	}, [user])

	// Don't render if loading or not authenticated
	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<div className='relative w-16 h-16'>
						<div
							className='w-16 h-16 rounded-full border-4 border-transparent animate-spin'
							style={{
								borderTopColor: '#ffd6c0',
								borderRightColor: '#ebd4ef',
								borderBottomColor: '#cfe4f8',
								borderLeftColor: '#ffd6c0',
							}}
						></div>
					</div>
					<p className='text-[#1c1c1c] text-sm font-medium animate-pulse'>
						Loading...
					</p>
				</div>
			</div>
		)
	}

	if (!user) {
		return null
	}

	const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0)

	const addFood = async (name: string, calories: number, protein: number) => {
		try {
			const response = await fetch('/api/foods', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, calories, protein }),
			})

			if (response.ok) {
				const newFood = await response.json()
				setFoods([newFood, ...foods])
				setIsModalOpen(false)
			} else {
				const error = await response.json()
				console.error('Failed to add food:', error.error)
				alert('Failed to add food entry. Please try again.')
			}
		} catch (error) {
			console.error('Error adding food:', error)
			alert('Failed to add food entry. Please try again.')
		}
	}

	const handleEntryClick = (food: Food) => {
		setEditFood(food)
		setIsModalOpen(true)
	}

	const updateFood = async (
		id: string,
		name: string,
		calories: number,
		protein: number
	) => {
		try {
			const response = await fetch(`/api/foods/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, calories, protein }),
			})

			if (response.ok) {
				const updatedFood = await response.json()
				setFoods(
					foods.map((food) => (food.id === id ? updatedFood : food))
				)
				setIsModalOpen(false)
				setEditFood(null)
			} else {
				const error = await response.json()
				console.error('Failed to update food:', error.error)
				alert('Failed to update food entry. Please try again.')
			}
		} catch (error) {
			console.error('Error updating food:', error)
			alert('Failed to update food entry. Please try again.')
		}
	}

	const deleteFood = async (id: string) => {
		try {
			const response = await fetch(`/api/foods/${id}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				setFoods(foods.filter((food) => food.id !== id))
				setIsModalOpen(false)
				setEditFood(null)
			} else {
				const error = await response.json()
				console.error('Failed to delete food:', error.error)
				alert('Failed to delete food entry. Please try again.')
			}
		} catch (error) {
			console.error('Error deleting food:', error)
			alert('Failed to delete food entry. Please try again.')
		}
	}

	// Helper function to check if a timestamp is from today (user's local timezone)
	const isToday = (timestamp: number): boolean => {
		const today = new Date()
		const foodDate = new Date(timestamp)

		// Compare dates in user's local timezone
		const todayStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		)
		const foodDateStart = new Date(
			foodDate.getFullYear(),
			foodDate.getMonth(),
			foodDate.getDate()
		)

		return foodDateStart.getTime() === todayStart.getTime()
	}

	// Helper function to get date key for grouping (YYYY-MM-DD format in user's timezone)
	const getDateKey = (timestamp: number): string => {
		const date = new Date(timestamp)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	// Helper function to format date for display
	const formatDateHeader = (dateKey: string): string => {
		const [year, month, day] = dateKey.split('-')
		const date = new Date(
			parseInt(year),
			parseInt(month) - 1,
			parseInt(day)
		)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		const dateStart = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate()
		)
		const todayStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate()
		)
		const yesterdayStart = new Date(
			yesterday.getFullYear(),
			yesterday.getMonth(),
			yesterday.getDate()
		)

		if (dateStart.getTime() === todayStart.getTime()) {
			return 'Today'
		} else if (dateStart.getTime() === yesterdayStart.getTime()) {
			return 'Yesterday'
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		}
	}

	// Group foods by date
	const foodsByDate = foods.reduce((acc, food) => {
		const dateKey = getDateKey(food.timestamp)
		if (!acc[dateKey]) {
			acc[dateKey] = []
		}
		acc[dateKey].push(food)
		return acc
	}, {} as Record<string, Food[]>)

	// Sort date keys in descending order (newest first)
	const sortedDateKeys = Object.keys(foodsByDate).sort((a, b) =>
		b.localeCompare(a)
	)

	const todayFoods = foods.filter((food) => isToday(food.timestamp))
	const todayCalories = todayFoods.reduce(
		(sum, food) => sum + food.calories,
		0
	)

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	return (
		<main className=' min-h-screen pb-20'>
			<div className='container mx-auto px-4 py-6 max-w-2xl'>
				<CalorieSummary
					calories={todayCalories}
					onLogout={handleLogout}
				/>

				{/* Buttons Row */}
				<div className='mt-4 flex gap-2 text-[13px]'>
					<button
						onClick={() => router.push('/weekly-insights')}
						className='flex-1 text-black rounded-lg px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium'
						style={{
							background:
								'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
						}}
					>
						Weekly Insights
					</button>
					<button
						onClick={() => setIsModalOpen(true)}
						className='flex-1 text-black rounded-lg px-6 py-3 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center font-medium'
						style={{
							background:
								'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
						}}
					>
						Add Meal
					</button>
				</div>

				<div className='mt-8'>
					{isModalOpen && (
						<AddFoodModal
							isOpen={isModalOpen}
							onClose={() => {
								setIsModalOpen(false)
								setEditFood(null)
							}}
							onAdd={addFood}
							onUpdate={updateFood}
							onDelete={deleteFood}
							editFood={editFood}
						/>
					)}

					<div className='space-y-6'>
						{sortedDateKeys.map((dateKey, index) => {
							// Sort foods within each day by timestamp (newest first)
							const dayFoods = [...foodsByDate[dateKey]].sort(
								(a, b) => b.timestamp - a.timestamp
							)
							const dayCalories = dayFoods.reduce(
								(sum, food) => sum + food.calories,
								0
							)
							const dayProtein = dayFoods.reduce(
								(sum, food) => sum + food.protein,
								0
							)

							// Calculate percentage of daily goal (same as CalorieSummary)
							const dailyGoal = 1650
							const dayPercentage =
								(dayCalories / dailyGoal) * 100
							const isWithinGoal = dayCalories <= dailyGoal

							return (
								<div key={dateKey}>
									{/* Date Header with Total Calories and Protein */}
									<div className='mb-3 flex items-center justify-between px-3'>
										<h2 className='text-md font-semibold text-[#1c1c1c]'>
											{formatDateHeader(dateKey)}
										</h2>
										<div className='flex items-center gap-2 text-xs font-medium text-[#1c1c1c] opacity-70'>
											<span>
												<span
													className={
														isWithinGoal
															? 'text-green-600'
															: 'text-red-600'
													}
												>
													{dayCalories}
												</span>{' '}
												cal ({dayPercentage.toFixed(0)}
												%)
											</span>
											<span>•</span>
											<span>
												{dayProtein.toFixed(1)}g p
											</span>
										</div>
									</div>

									{/* Food Entries for this day */}
									<div className='space-y-3'>
										{dayFoods.map((food) => (
											<FoodEntry
												key={food.id}
												food={food}
												onClick={() =>
													handleEntryClick(food)
												}
											/>
										))}
									</div>

									{/* Horizontal Line Separator (not after last day) */}
									{index < sortedDateKeys.length - 1 && (
										<hr className='mt-6 border-t border-2' />
									)}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</main>
	)
}
