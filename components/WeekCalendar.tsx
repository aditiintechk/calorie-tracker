'use client'

import { useState } from 'react'

interface WeekCalendarProps {
	selectedDate: Date
	onDateSelect: (date: Date) => void
	onClose: () => void
}

export default function WeekCalendar({
	selectedDate,
	onDateSelect,
	onClose,
}: WeekCalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(
		new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
	)

	// Get the start of the week (Monday) for a given date
	const getWeekStart = (date: Date): Date => {
		const d = new Date(date)
		const day = d.getDay()
		const diff = d.getDate() - day + (day === 0 ? -6 : 1)
		return new Date(d.setDate(diff))
	}

	// Get all days in the month
	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const daysInMonth = lastDay.getDate()
		const startingDayOfWeek = firstDay.getDay()
		const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 // Monday = 0

		const days: (Date | null)[] = []
		// Add empty cells for days before the first day of the month
		for (let i = 0; i < adjustedStartingDay; i++) {
			days.push(null)
		}
		// Add all days of the month
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(new Date(year, month, i))
		}

		return days
	}

	const days = getDaysInMonth(currentMonth)
	const selectedWeekStart = getWeekStart(selectedDate)
	const today = new Date()
	const todayWeekStart = getWeekStart(today)

	const monthName = currentMonth.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	})

	const isDateInSelectedWeek = (date: Date | null): boolean => {
		if (!date) return false
		const weekStart = getWeekStart(date)
		return weekStart.getTime() === selectedWeekStart.getTime()
	}

	const isToday = (date: Date | null): boolean => {
		if (!date) return false
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		)
	}

	const handleDateClick = (date: Date) => {
		onDateSelect(date)
		onClose()
	}

	const goToPreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		)
	}

	const goToNextMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
		)
	}

	const goToToday = () => {
		const today = new Date()
		setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
		onDateSelect(today)
		onClose()
	}

	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div
				className='bg-white rounded-xl shadow-2xl w-full max-w-sm p-6'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className='flex items-center justify-between mb-4'>
					<button
						onClick={goToPreviousMonth}
						className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
						aria-label='Previous Month'
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
					<div className='flex items-center gap-2'>
						<h3 className='text-lg font-semibold text-[#1c1c1c]'>
							{monthName}
						</h3>
						<button
							onClick={goToToday}
							className='px-2 py-1 text-xs font-medium text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 rounded transition-colors'
						>
							Today
						</button>
					</div>
					<button
						onClick={goToNextMonth}
						className='p-2 rounded-lg hover:bg-gray-100 transition-colors'
						aria-label='Next Month'
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

				{/* Week Day Headers */}
				<div className='grid grid-cols-7 gap-1 mb-2'>
					{weekDays.map((day) => (
						<div
							key={day}
							className='text-center text-xs font-medium text-[#1c1c1c] opacity-70 py-1'
						>
							{day}
						</div>
					))}
				</div>

				{/* Calendar Grid */}
				<div className='grid grid-cols-7 gap-1'>
					{days.map((date, index) => {
						if (!date) {
							return (
								<div
									key={`empty-${index}`}
									className='aspect-square'
								></div>
							)
						}

						const inSelectedWeek = isDateInSelectedWeek(date)
						const isTodayDate = isToday(date)

						return (
							<button
								key={date.getTime()}
								onClick={() => handleDateClick(date)}
								className={`aspect-square rounded-lg text-sm font-medium transition-all ${
									inSelectedWeek
										? 'bg-gradient-to-br from-[#ffd6c0] via-[#ebd4ef] to-[#cfe4f8] text-[#1c1c1c] font-semibold'
										: isTodayDate
										? 'bg-gray-200 text-[#1c1c1c] font-semibold'
										: 'hover:bg-gray-100 text-[#1c1c1c]'
								}`}
							>
								{date.getDate()}
							</button>
						)
					})}
				</div>

				{/* Close Button */}
				<button
					onClick={onClose}
					className='mt-4 w-full px-4 py-2 text-sm font-medium text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
				>
					Close
				</button>
			</div>
		</div>
	)
}

