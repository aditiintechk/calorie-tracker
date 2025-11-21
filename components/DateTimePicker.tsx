'use client'

import { useState } from 'react'

interface DateTimePickerProps {
	selectedDate: Date
	onDateSelect: (date: Date) => void
	onClose: () => void
}

export default function DateTimePicker({
	selectedDate,
	onDateSelect,
	onClose,
}: DateTimePickerProps) {
	const [currentMonth, setCurrentMonth] = useState(
		new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
	)
	const [selectedHour, setSelectedHour] = useState(selectedDate.getHours())
	const [selectedMinute, setSelectedMinute] = useState(selectedDate.getMinutes())

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
	const today = new Date()

	const monthName = currentMonth.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	})

	const isSelected = (date: Date | null): boolean => {
		if (!date) return false
		return (
			date.getDate() === selectedDate.getDate() &&
			date.getMonth() === selectedDate.getMonth() &&
			date.getFullYear() === selectedDate.getFullYear()
		)
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
		const newDate = new Date(date)
		newDate.setHours(selectedHour, selectedMinute)
		onDateSelect(newDate)
	}

	const handleConfirm = () => {
		const newDate = new Date(selectedDate)
		newDate.setHours(selectedHour, selectedMinute)
		onDateSelect(newDate)
		onClose()
	}

	const handleHourChange = (hour: number) => {
		setSelectedHour(hour)
		const newDate = new Date(selectedDate)
		newDate.setHours(hour, selectedMinute)
		onDateSelect(newDate)
	}

	const handleMinuteChange = (minute: number) => {
		setSelectedMinute(minute)
		const newDate = new Date(selectedDate)
		newDate.setHours(selectedHour, minute)
		onDateSelect(newDate)
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
		const newDate = new Date(today)
		setSelectedHour(today.getHours())
		setSelectedMinute(today.getMinutes())
		newDate.setHours(today.getHours(), today.getMinutes())
		onDateSelect(newDate)
	}

	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

	return (
		<div 
			className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				onClose()
			}}
		>
			<div
				className='bg-white rounded-xl shadow-2xl w-full max-w-sm p-6'
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className='flex items-center justify-between mb-4'>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							goToPreviousMonth()
						}}
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
							type='button'
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								goToToday()
							}}
							className='px-2 py-1 text-xs font-medium text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 rounded transition-colors'
						>
							Today
						</button>
					</div>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							goToNextMonth()
						}}
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
				<div className='grid grid-cols-7 gap-1 mb-4'>
					{days.map((date, index) => {
						if (!date) {
							return (
								<div
									key={`empty-${index}`}
									className='aspect-square'
								></div>
							)
						}

						const isSelectedDate = isSelected(date)
						const isTodayDate = isToday(date)

						return (
							<button
								type='button'
								key={date.getTime()}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									handleDateClick(date)
								}}
								className={`aspect-square rounded-lg text-sm font-medium transition-all ${
									isSelectedDate
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

				{/* Time Picker */}
				<div className='mb-4'>
					<label className='block text-xs font-medium text-[#1c1c1c] mb-2'>
						Time
					</label>
					<div className='flex items-center gap-3 justify-center'>
						{/* Hours */}
						<div className='flex-1'>
							<div className='relative'>
								<div className='flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2 border border-gray-200'>
									<button
										type='button'
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleHourChange(
												selectedHour === 23 ? 0 : selectedHour + 1
											)
										}}
										className='p-1 hover:bg-gray-200 rounded transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-[#1c1c1c]'
										>
											<polyline points='18 15 12 9 6 15' />
										</svg>
									</button>
									<div className='w-full text-center text-lg font-semibold text-[#1c1c1c] py-1'>
										{String(selectedHour).padStart(2, '0')}
									</div>
									<button
										type='button'
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleHourChange(
												selectedHour === 0 ? 23 : selectedHour - 1
											)
										}}
										className='p-1 hover:bg-gray-200 rounded transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-[#1c1c1c]'
										>
											<polyline points='6 9 12 15 18 9' />
										</svg>
									</button>
								</div>
								<div className='text-center text-xs text-[#1c1c1c] opacity-60 mt-1'>
									Hour
								</div>
							</div>
						</div>

						{/* Separator */}
						<div className='text-2xl font-bold text-[#1c1c1c] opacity-30'>
							:
						</div>

						{/* Minutes */}
						<div className='flex-1'>
							<div className='relative'>
								<div className='flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2 border border-gray-200'>
									<button
										type='button'
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleMinuteChange(
												selectedMinute === 59 ? 0 : selectedMinute + 1
											)
										}}
										className='p-1 hover:bg-gray-200 rounded transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-[#1c1c1c]'
										>
											<polyline points='18 15 12 9 6 15' />
										</svg>
									</button>
									<div className='w-full text-center text-lg font-semibold text-[#1c1c1c] py-1'>
										{String(selectedMinute).padStart(2, '0')}
									</div>
									<button
										type='button'
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleMinuteChange(
												selectedMinute === 0 ? 59 : selectedMinute - 1
											)
										}}
										className='p-1 hover:bg-gray-200 rounded transition-colors'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											width='16'
											height='16'
											viewBox='0 0 24 24'
											fill='none'
											stroke='currentColor'
											strokeWidth='2'
											strokeLinecap='round'
											strokeLinejoin='round'
											className='text-[#1c1c1c]'
										>
											<polyline points='6 9 12 15 18 9' />
										</svg>
									</button>
								</div>
								<div className='text-center text-xs text-[#1c1c1c] opacity-60 mt-1'>
									Minute
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Buttons */}
				<div className='flex gap-2'>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							onClose()
						}}
						className='flex-1 px-4 py-2 text-sm font-medium text-[#1c1c1c] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
					>
						Cancel
					</button>
					<button
						type='button'
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							handleConfirm()
						}}
						className='flex-1 px-4 py-2 text-sm font-medium text-[#1c1c1c] rounded-lg transition-opacity'
						style={{
							background:
								'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
						}}
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	)
}

