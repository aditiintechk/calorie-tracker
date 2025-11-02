interface CalorieSummaryProps {
	calories: number
	onLogout?: () => void
}

export default function CalorieSummary({
	calories,
	onLogout,
}: CalorieSummaryProps) {
	// Default daily goal (can be customized later)
	const dailyGoal = 1750

	const percentage = Math.min((calories / dailyGoal) * 100, 100)

	return (
		<div
			className='rounded-xl p-6 text-white relative'
			style={{
				background:
					'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
			}}
		>
			{onLogout && (
				<button
					onClick={onLogout}
					className='absolute top-2 right-2 text-black/70 hover:text-black/100 transition-opacity hidden'
					title='Logout'
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
						<path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
						<polyline points='16 17 21 12 16 7' />
						<line x1='21' y1='12' x2='9' y2='12' />
					</svg>
				</button>
			)}
			<div className='flex justify-between items-start mb-4'>
				<div>
					<p className='text-black/90 text-center text-md font-semibold'>
						{calories} / {dailyGoal} calories
					</p>
				</div>
			</div>

			<div className='mt-4'>
				<div className='flex justify-between text-sm mb-2'>
					<span className='text-black/90'>Progress</span>
					<span className='text-black/90'>
						{percentage.toFixed(0)}%
					</span>
				</div>
				<div className='w-full bg-white/30 rounded-full h-3 overflow-hidden'>
					<div
						className='bg-white h-3 rounded-full transition-all duration-300'
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		</div>
	)
}
