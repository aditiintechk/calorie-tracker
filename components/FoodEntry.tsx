interface Food {
	id: string
	name: string
	calories: number
	protein: number
	timestamp: number
}

interface FoodEntryProps {
	food: Food
	onClick: () => void
}

export default function FoodEntry({ food, onClick }: FoodEntryProps) {
	const formatDateTime = (timestamp: number) => {
		const date = new Date(timestamp)
		const today = new Date()
		const yesterday = new Date(today)
		yesterday.setDate(yesterday.getDate() - 1)

		// Check if it's today - show date and time
		if (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		) {
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			})
		}
		// Check if it's yesterday
		else if (
			date.getDate() === yesterday.getDate() &&
			date.getMonth() === yesterday.getMonth() &&
			date.getFullYear() === yesterday.getFullYear()
		) {
			return `Yesterday, ${date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			})}`
		}
		// Otherwise show full date and time
		else {
			return date.toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
			})
		}
	}

	return (
		<div
			onClick={onClick}
			className='rounded-lg p-4 flex justify-between items-center transition-shadow cursor-pointer active:scale-[0.98]'
		>
			<div className='flex-1'>
				<h3 className=' text-[#1c1c1c] text-[14px] w-[92%]'>
					{food.name}
				</h3>
				<p className='text-xs text-[#1c1c1c] opacity-70 mt-2'>
					{formatDateTime(food.timestamp)}
				</p>
			</div>
			<div className='flex items-center gap-3'>
				<span className='text-[#1c1c1c] opacity-70 font-bold text-base'>
					{food.calories} cal
				</span>
				<span className='text-[#1c1c1c] opacity-70 text-sm'>
					{food.protein.toFixed(1)}g
				</span>
			</div>
		</div>
	)
}
