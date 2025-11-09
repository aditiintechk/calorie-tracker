'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import WeekCalendar from '@/components/WeekCalendar'

interface Food {
	id: string
	name: string
	calories: number
	protein: number
	timestamp: number
}

export default function WeeklyInsights() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const [foods, setFoods] = useState<Food[]>([])
	// State to track which week is being viewed (defaults to current week)
	const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(new Date())
	const [showCalendar, setShowCalendar] = useState(false)

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

	// Helper function to get the start of the week (Monday) for a given date
	const getWeekStart = (date: Date): Date => {
		const d = new Date(date)
		const day = d.getDay()
		const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
		return new Date(d.setDate(diff))
	}

	// Helper function to get the end of the week (Sunday) for a given date
	const getWeekEnd = (date: Date): Date => {
		const weekStart = getWeekStart(date)
		const weekEnd = new Date(weekStart)
		weekEnd.setDate(weekEnd.getDate() + 6)
		weekEnd.setHours(23, 59, 59, 999)
		return weekEnd
	}

	// Get selected week (Monday to Sunday) based on selectedWeekDate
	const weekStart = getWeekStart(new Date(selectedWeekDate))
	const weekEnd = getWeekEnd(new Date(selectedWeekDate))

	// Set time to start of day for weekStart
	weekStart.setHours(0, 0, 0, 0)

	// Helper function to format week range for display
	const formatWeekRange = (start: Date, end: Date): string => {
		const startFormatted = start.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		})
		const endFormatted = end.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		})
		return `${startFormatted} - ${endFormatted}`
	}

	// Navigation functions
	const goToPreviousWeek = () => {
		const newDate = new Date(selectedWeekDate)
		newDate.setDate(newDate.getDate() - 7)
		setSelectedWeekDate(newDate)
	}

	const goToNextWeek = () => {
		const newDate = new Date(selectedWeekDate)
		newDate.setDate(newDate.getDate() + 7)
		setSelectedWeekDate(newDate)
	}

	const goToCurrentWeek = () => {
		setSelectedWeekDate(new Date())
	}

	const handleDateSelect = (date: Date) => {
		setSelectedWeekDate(date)
	}

	// Check if selected week is current week
	const today = new Date()
	const currentWeekStart = getWeekStart(today)
	const isCurrentWeek =
		weekStart.getTime() === currentWeekStart.getTime()

	// Filter foods for the current week
	const weekFoods = foods.filter((food) => {
		const foodDate = new Date(food.timestamp)
		return foodDate >= weekStart && foodDate <= weekEnd
	})

	// Helper function to get date key for grouping (YYYY-MM-DD format)
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
				weekday: 'short',
				month: 'short',
				day: 'numeric',
			})
		}
	}

	// Group foods by date
	const foodsByDate = weekFoods.reduce((acc, food) => {
		const dateKey = getDateKey(food.timestamp)
		if (!acc[dateKey]) {
			acc[dateKey] = []
		}
		acc[dateKey].push(food)
		return acc
	}, {} as Record<string, Food[]>)

	// Get all days of the week (Monday to Sunday)
	const weekDays: string[] = []
	for (let i = 0; i < 7; i++) {
		const date = new Date(weekStart)
		date.setDate(date.getDate() + i)
		weekDays.push(getDateKey(date.getTime()))
	}

	// Calculate weekly totals
	const weeklyCalories = weekFoods.reduce(
		(sum, food) => sum + food.calories,
		0
	)
	const weeklyProtein = weekFoods.reduce(
		(sum, food) => sum + food.protein,
		0
	)
	const dailyGoal = 1650
	const weeklyGoal = dailyGoal * 7

	// Calculate average daily calories
	const avgDailyCalories = weeklyCalories / 7

	// Calculate daily stats
	const dailyStats = weekDays.map((dateKey) => {
		const dayFoods = foodsByDate[dateKey] || []
		const dayCalories = dayFoods.reduce(
			(sum, food) => sum + food.calories,
			0
		)
		const dayProtein = dayFoods.reduce(
			(sum, food) => sum + food.protein,
			0
		)
		const overGoal = dayCalories - dailyGoal
		const isOverGoal = dayCalories > dailyGoal

		return {
			dateKey,
			dayCalories,
			dayProtein,
			overGoal,
			isOverGoal,
			formattedDate: formatDateHeader(dateKey),
		}
	})

	// Find days that went over the goal
	const overGoalDays = dailyStats.filter((day) => day.isOverGoal)

	// Calculate insights
	const daysOverGoal = overGoalDays.length
	const daysUnderGoal = dailyStats.filter((day) => !day.isOverGoal && day.dayCalories > 0).length

	// Get the day with highest calories
	const highestDay = dailyStats.reduce((max, day) =>
		day.dayCalories > max.dayCalories ? day : max
	)

	return (
		<main className='min-h-screen pb-20'>
			<div className='container mx-auto px-4 py-6 max-w-2xl'>
				{/* Back Button and Week Navigation */}
				<div className='mb-6 flex items-center justify-between'>
					<button
						onClick={() => router.push('/')}
						className='flex items-center gap-2 text-[#1c1c1c] hover:opacity-70 transition-opacity font-medium'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<polyline points='15 18 9 12 15 6' />
						</svg>
						Back
					</button>

					{/* Week Selector Button */}
					<button
						onClick={() => setShowCalendar(true)}
						className='px-4 py-2 text-sm font-medium text-[#1c1c1c] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='18'
							height='18'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
							<line x1='16' y1='2' x2='16' y2='6' />
							<line x1='8' y1='2' x2='8' y2='6' />
							<line x1='3' y1='10' x2='21' y2='10' />
						</svg>
						Select Week
					</button>
				</div>

				{/* Week Navigation and Info */}
				<div className='mb-6 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<button
							onClick={goToPreviousWeek}
							className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
							aria-label='Previous Week'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-[#1c1c1c]'
							>
								<polyline points='15 18 9 12 15 6' />
							</svg>
						</button>
						<button
							onClick={goToNextWeek}
							className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
							aria-label='Next Week'
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								width='20'
								height='20'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
								className='text-[#1c1c1c]'
							>
								<polyline points='9 18 15 12 9 6' />
							</svg>
						</button>
					</div>

					<div className='flex items-center gap-3'>
						<span className='text-sm font-medium text-[#1c1c1c]'>
							{formatWeekRange(weekStart, weekEnd)}
						</span>
						{!isCurrentWeek && (
							<button
								onClick={goToCurrentWeek}
								className='px-3 py-1.5 text-xs font-medium text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
							>
								This Week
							</button>
						)}
					</div>
				</div>

				{/* Weekly Summary Stats */}
				<div
					className='rounded-xl p-6 mb-6'
					style={{
						background:
							'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
					}}
				>
					<h2 className='text-xl font-bold text-black/90 mb-4'>
						Weekly Insights
					</h2>
					<div className='space-y-3 mb-6'>
						<div className='flex justify-between items-center'>
							<span className='text-black/90 font-medium'>
								Total Calories
							</span>
							<span className='text-black/90 font-semibold'>
								{weeklyCalories} / {weeklyGoal}
							</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-black/90 font-medium'>
								Average Daily Calories
							</span>
							<span className='text-black/90 font-semibold'>
								{avgDailyCalories.toFixed(0)}
							</span>
						</div>
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='text-center p-3 bg-white/30 rounded-lg backdrop-blur-sm'>
							<div className='text-2xl font-bold text-black/90'>
								{daysOverGoal}
							</div>
							<div className='text-xs text-black/90 opacity-70 mt-1'>
								Day{daysOverGoal !== 1 ? 's' : ''} Over Goal
							</div>
						</div>
						<div className='text-center p-3 bg-white/30 rounded-lg backdrop-blur-sm'>
							<div className='text-2xl font-bold text-black/90'>
								{daysUnderGoal}
							</div>
							<div className='text-xs text-black/90 opacity-70 mt-1'>
								Day{daysUnderGoal !== 1 ? 's' : ''} Under Goal
							</div>
						</div>
						<div className='text-center p-3 bg-white/30 rounded-lg backdrop-blur-sm'>
							<div className='text-2xl font-bold text-black/90'>
								{highestDay.dayCalories}
							</div>
							<div className='text-xs text-black/90 opacity-70 mt-1'>
								Highest Day
							</div>
						</div>
						<div className='text-center p-3 bg-white/30 rounded-lg backdrop-blur-sm'>
							<div className='text-2xl font-bold text-black/90'>
								{weeklyProtein.toFixed(0)}g
							</div>
							<div className='text-xs text-black/90 opacity-70 mt-1'>
								Total Protein
							</div>
						</div>
					</div>
				</div>

				{/* Days That Went Over Goal */}
				{overGoalDays.length > 0 && (
					<div className='bg-white rounded-xl p-5 shadow-sm'>
						<h2 className='text-lg font-semibold text-[#1c1c1c] mb-4'>
							Days You Exceeded Your Goal
						</h2>
						<div className='space-y-4'>
							{overGoalDays.map((day) => {
								const excess = day.overGoal
								const percentage = ((day.dayCalories / dailyGoal) * 100).toFixed(0)

								return (
									<div
										key={day.dateKey}
										className='border-l-4 border-red-500 pl-4 py-2'
									>
										<div className='flex justify-between items-start mb-1'>
											<span className='font-medium text-[#1c1c1c]'>
												{day.formattedDate}
											</span>
											<span className='text-red-600 font-semibold'>
												+{excess.toFixed(0)} cal
											</span>
										</div>
										<div className='text-sm text-[#1c1c1c] opacity-70'>
											{day.dayCalories} calories ({percentage}% of goal)
										</div>
										<div className='text-xs text-[#1c1c1c] opacity-60 mt-1'>
											{day.dayProtein.toFixed(1)}g protein
										</div>
									</div>
								)
							})}
						</div>
					</div>
				)}

				{/* Calendar Modal */}
				{showCalendar && (
					<WeekCalendar
						selectedDate={selectedWeekDate}
						onDateSelect={handleDateSelect}
						onClose={() => setShowCalendar(false)}
					/>
				)}
			</div>
		</main>
	)
}

