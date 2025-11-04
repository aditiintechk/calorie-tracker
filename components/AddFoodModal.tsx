'use client'

import { useState, useEffect } from 'react'

interface AddFoodModalProps {
	isOpen: boolean
	onClose: () => void
	onAdd: (name: string, calories: number, protein: number) => void
}

export default function AddFoodModal({
	isOpen,
	onClose,
	onAdd,
}: AddFoodModalProps) {
	const [mealDescription, setMealDescription] = useState('')
	const [calories, setCalories] = useState('')
	const [protein, setProtein] = useState('')
	const [isCalculating, setIsCalculating] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [calculatedCalories, setCalculatedCalories] = useState<number | null>(
		null
	)
	const [calculatedProtein, setCalculatedProtein] = useState<number | null>(
		null
	)
	const [breakdown, setBreakdown] = useState<
		Array<{
			item: string
			quantity: string
			calories: number
			protein: number
		}>
	>([])

	useEffect(() => {
		if (isOpen) {
			setMealDescription('')
			setCalories('')
			setProtein('')
			setError(null)
			setCalculatedCalories(null)
			setCalculatedProtein(null)
			setBreakdown([])
		}
	}, [isOpen])

	const calculateCalories = async () => {
		if (!mealDescription.trim()) {
			setError('Please enter a meal description')
			return
		}

		setIsCalculating(true)
		setError(null)
		setCalculatedCalories(null)
		setCalculatedProtein(null)
		setBreakdown([])

		try {
			const response = await fetch('/api/calculate-calories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					mealDescription: mealDescription.trim(),
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to calculate nutrition')
			}

			setCalculatedCalories(data.calories)
			setCalculatedProtein(data.protein)
			setCalories(data.calories.toString())
			setProtein(data.protein.toString())
			if (data.breakdown && Array.isArray(data.breakdown)) {
				setBreakdown(data.breakdown)
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Failed to calculate nutrition. Please try again.'
			)
		} finally {
			setIsCalculating(false)
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const caloriesNum = parseInt(calories)
		const proteinNum = parseFloat(protein) || 0
		if (mealDescription.trim() && caloriesNum > 0) {
			onAdd(mealDescription.trim(), caloriesNum, proteinNum)
		}
	}

	if (!isOpen) return null

	return (
		<div className='rounded-lg p-4 mb-4 shadow-xl'>
			<form onSubmit={handleSubmit}>
				<div className='mb-3'>
					<label
						htmlFor='meal'
						className='block text-xs font-medium text-[#1c1c1c] mb-1.5'
					>
						Describe Your Meal
					</label>
					<div className='flex'>
						<input
							type='text'
							id='meal'
							value={mealDescription}
							onChange={(e) => setMealDescription(e.target.value)}
							placeholder='4 Idlis & 100g Coconut Chutney'
							className='w-[80%] px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none text-[#1c1c1c] placeholder:text-gray-400 placeholder:text-sm'
							required
							autoFocus
							disabled={isCalculating}
							autoComplete='off'
						/>
						<button
							type='button'
							onClick={calculateCalories}
							disabled={isCalculating || !mealDescription.trim()}
							className='w-[18%] ml-auto px-3 py-2 text-sm bg-slate-700 hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
						>
							{isCalculating ? (
								<>
									<svg
										className='animate-spin h-4 w-4 text-white'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
								</>
							) : (
								<>🔥</>
							)}
						</button>
					</div>
				</div>

				{error && (
					<div className='mb-3 p-2 text-xs bg-red-50 border border-red-200 rounded-lg'>
						<p className='text-xs text-red-600'>{error}</p>
					</div>
				)}

				{calculatedCalories && calculatedProtein !== null && (
					<div className='mb-3 bg-gray-100 border border-gray-200 rounded-lg p-3'>
						{breakdown.length > 0 ? (
							<div>
								<div className='text-xs font-medium text-[#1c1c1c] mb-2'>
									Approximate Nutrition Breakdown
								</div>
								<div className='overflow-x-auto'>
									<table className='w-full text-xs'>
										<thead>
											<tr className='border-b border-gray-300'>
												<th className='text-left py-1.5 px-2 text-[#1c1c1c] font-medium'>
													Item
												</th>
												<th className='text-left py-1.5 px-2 text-[#1c1c1c] font-medium'>
													Quantity
												</th>
												<th className='text-right py-1.5 px-2 text-[#1c1c1c] font-medium'>
													Calories
												</th>
												<th className='text-right py-1.5 px-2 text-[#1c1c1c] font-medium'>
													Protein
												</th>
											</tr>
										</thead>
										<tbody>
											{breakdown.map((item, index) => (
												<tr
													key={index}
													className='border-b border-gray-200'
												>
													<td className='py-1.5 px-2 text-[#1c1c1c]'>
														{item.item}
													</td>
													<td className='py-1.5 px-2 text-[#1c1c1c] opacity-80'>
														{item.quantity}
													</td>
													<td className='py-1.5 px-2 text-right text-[#1c1c1c]'>
														{item.calories}
													</td>
													<td className='py-1.5 px-2 text-right text-[#1c1c1c]'>
														{item.protein.toFixed(
															1
														)}
													</td>
												</tr>
											))}
											<tr className='font-semibold'>
												<td
													colSpan={2}
													className='py-1.5 px-2 text-[#1c1c1c]'
												>
													Total (approx):
												</td>
												<td className='py-1.5 px-2 text-right text-[#1c1c1c]'>
													{calculatedCalories}
												</td>
												<td className='py-1.5 px-2 text-right text-[#1c1c1c]'>
													{calculatedProtein.toFixed(
														1
													)}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						) : (
							<p className='text-xs text-[#1c1c1c]'>
								Calculated:{' '}
								<span className='font-bold'>
									{calculatedCalories}
								</span>{' '}
								calories,{' '}
								<span className='font-bold'>
									{calculatedProtein.toFixed(1)}
								</span>{' '}
								g protein
							</p>
						)}
					</div>
				)}

				<div className='mb-3'>
					<div className='grid grid-cols-2 gap-2'>
						<div>
							<label
								htmlFor='calories'
								className='block text-xs font-medium text-[#1c1c1c] mb-1.5'
							>
								Calories (kcal)
							</label>
							<input
								type='number'
								id='calories'
								value={calories}
								onChange={(e) => setCalories(e.target.value)}
								placeholder='Enter calories'
								min='1'
								className='w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none text-[#1c1c1c] placeholder:text-gray-400 placeholder:text-sm'
								required
								disabled={isCalculating}
							/>
						</div>
						<div>
							<label
								htmlFor='protein'
								className='block text-xs font-medium text-[#1c1c1c] mb-1.5'
							>
								Protein (g)
							</label>
							<input
								type='number'
								id='protein'
								value={protein}
								onChange={(e) => setProtein(e.target.value)}
								placeholder='Enter protein'
								min='0'
								step='0.1'
								className='w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none text-[#1c1c1c] placeholder:text-gray-400 placeholder:text-sm'
								required
								disabled={isCalculating}
							/>
						</div>
					</div>
				</div>

				<div className='flex gap-2'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg text-[#1c1c1c] hover:bg-gray-50 font-medium transition-colors bg-white'
						disabled={isCalculating}
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={
							isCalculating ||
							!calories ||
							parseInt(calories) <= 0 ||
							protein === '' ||
							parseFloat(protein) < 0 ||
							isNaN(parseFloat(protein))
						}
						className='flex-1 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors'
					>
						Add
					</button>
				</div>
			</form>
		</div>
	)
}
