'use client'

import { useState, useEffect } from 'react'

interface AddFoodModalProps {
	isOpen: boolean
	onClose: () => void
	onAdd: (name: string, calories: number, protein: number) => void
	onUpdate?: (
		id: string,
		name: string,
		calories: number,
		protein: number
	) => void
	onDelete?: (id: string) => void
	editFood?: {
		id: string
		name: string
		calories: number
		protein: number
	} | null
}

const AVAILABLE_TAGS = [
	'breakfast',
	'lunch',
	'snack',
	'dinner',
	'junk',
	'fasting',
	'sugar',
	'post-workout',
]

export default function AddFoodModal({
	isOpen,
	onClose,
	onAdd,
	onUpdate,
	onDelete,
	editFood,
}: AddFoodModalProps) {
	const [foodInputs, setFoodInputs] = useState<string[]>([''])
	const [calories, setCalories] = useState('')
	const [protein, setProtein] = useState('')
	const [selectedTags, setSelectedTags] = useState<string[]>([])
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

	const isEditMode = !!editFood

	useEffect(() => {
		if (isOpen) {
			if (editFood) {
				// Extract tags from name if they exist (tags are in brackets)
				const tagMatches = editFood.name.match(/\[([^\]]+)\]/g)
				let tags: string[] = []
				if (tagMatches) {
					tags = tagMatches.map((tag) =>
						tag.slice(1, -1).toLowerCase()
					)
					setSelectedTags(
						tags.filter((tag) => AVAILABLE_TAGS.includes(tag))
					)
				} else {
					setSelectedTags([])
				}

				// Remove tags from name and parse into inputs (split by &)
				const nameWithoutTags = editFood.name
					.replace(/\[([^\]]+)\]/g, '')
					.trim()
				const foodItems = nameWithoutTags
					.split(' & ')
					.filter((item) => item.trim())
				setFoodInputs(foodItems.length > 0 ? foodItems : [''])
				setCalories(editFood.calories.toString())
				setProtein(editFood.protein.toString())
			} else {
				setFoodInputs([''])
				setCalories('')
				setProtein('')
				setSelectedTags([])
			}
			setError(null)
			setCalculatedCalories(null)
			setCalculatedProtein(null)
			setBreakdown([])
		}
	}, [isOpen, editFood])

	const addFoodInput = () => {
		setFoodInputs([...foodInputs, ''])
	}

	const removeFoodInput = (index: number) => {
		if (foodInputs.length > 1) {
			setFoodInputs(foodInputs.filter((_, i) => i !== index))
		}
	}

	const updateFoodInput = (index: number, value: string) => {
		const newInputs = [...foodInputs]
		newInputs[index] = value
		setFoodInputs(newInputs)
	}

	const calculateCalories = async () => {
		// Filter out empty inputs and concatenate
		const nonEmptyInputs = foodInputs.filter((input) => input.trim())
		if (nonEmptyInputs.length === 0) {
			setError('Please enter at least one food item')
			return
		}

		// Concatenate all food inputs (without tags for calculation)
		const concatenatedDescription = nonEmptyInputs.join(' & ')

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
					mealDescription: concatenatedDescription,
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

	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag))
		} else {
			setSelectedTags([...selectedTags, tag])
		}
	}

	const formatFoodName = (items: string[], tags: string[]): string => {
		const foodName = items.filter((item) => item.trim()).join(' & ')
		if (tags.length > 0) {
			const tagString = tags.map((tag) => `[${tag}]`).join(' ')
			return `${foodName} ${tagString}`
		}
		return foodName
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const caloriesNum = parseInt(calories)
		const proteinNum = parseFloat(protein) || 0
		const nonEmptyInputs = foodInputs.filter((input) => input.trim())
		if (nonEmptyInputs.length > 0 && caloriesNum > 0) {
			const formattedName = formatFoodName(nonEmptyInputs, selectedTags)
			if (isEditMode && editFood && onUpdate) {
				onUpdate(editFood.id, formattedName, caloriesNum, proteinNum)
			} else {
				onAdd(formattedName, caloriesNum, proteinNum)
			}
		}
	}

	const handleDelete = () => {
		if (isEditMode && editFood && onDelete) {
			if (confirm('Are you sure you want to delete this entry?')) {
				onDelete(editFood.id)
			}
		}
	}

	if (!isOpen) return null

	return (
		<div className='rounded-lg p-4 mb-4 shadow-xl'>
			<form onSubmit={handleSubmit}>
				<div className='mb-3'>
					<label className='block text-xs font-medium text-[#1c1c1c] mb-1.5'>
						Food Items
					</label>
					<div className='space-y-2'>
						{foodInputs.map((input, index) => (
							<div
								key={index}
								className='flex gap-2 items-center'
							>
								<input
									type='text'
									value={input}
									onChange={(e) =>
										updateFoodInput(index, e.target.value)
									}
									placeholder={
										index === 0
											? 'e.g., 4 Idlis'
											: 'e.g., 100g Coconut Chutney'
									}
									className='flex-1 px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent outline-none text-[#1c1c1c] placeholder:text-gray-400 placeholder:text-sm'
									autoFocus={
										index === 0 && foodInputs.length === 1
									}
									disabled={isCalculating}
									autoComplete='off'
								/>
								{foodInputs.length > 1 && (
									<button
										type='button'
										onClick={() => removeFoodInput(index)}
										disabled={isCalculating}
										className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50'
										aria-label='Remove food item'
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
											<line
												x1='18'
												y1='6'
												x2='6'
												y2='18'
											/>
											<line
												x1='6'
												y1='6'
												x2='18'
												y2='18'
											/>
										</svg>
									</button>
								)}
							</div>
						))}
					</div>
					<button
						type='button'
						onClick={addFoodInput}
						disabled={isCalculating}
						className='mt-2 text-sm text-[#1c1c1c] hover:text-gray-600 font-medium flex items-center gap-1 disabled:opacity-50'
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
						>
							<line x1='12' y1='5' x2='12' y2='19' />
							<line x1='5' y1='12' x2='19' y2='12' />
						</svg>
						Add another food item
					</button>
				</div>

				{/* Calculate Button */}
				<div className='mb-3'>
					<button
						type='button'
						onClick={calculateCalories}
						disabled={
							isCalculating ||
							foodInputs.every((input) => !input.trim())
						}
						className='w-full px-4 py-2.5 text-sm bg-slate-700 hover:bg-slate-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
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
								Calculating...
							</>
						) : (
							<>🔥 Calculate Calories</>
						)}
					</button>
				</div>

				{/* Tags Section */}
				<div className='mb-3'>
					<label className='block text-xs font-medium text-[#1c1c1c] mb-2'>
						Tags
					</label>
					<div className='flex flex-wrap gap-2'>
						{AVAILABLE_TAGS.map((tag) => (
							<button
								key={tag}
								type='button'
								onClick={() => toggleTag(tag)}
								disabled={isCalculating}
								className={`px-5 py-2 text-xs font-medium rounded-xl transition-all ${
									selectedTags.includes(tag)
										? 'text-black'
										: 'bg-gray-200 text-gray-600 hover:bg-gray-300'
								} disabled:opacity-50`}
								style={
									selectedTags.includes(tag)
										? {
												background:
													'linear-gradient(135deg, #ffd6c0 0%, #ebd4ef 50%, #cfe4f8 100%)',
										  }
										: {}
								}
							>
								{tag}
							</button>
						))}
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
						{isEditMode ? 'Update' : 'Add'}
					</button>
					{isEditMode && onDelete && (
						<button
							type='button'
							onClick={handleDelete}
							className='px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors'
							disabled={isCalculating}
						>
							Delete
						</button>
					)}
				</div>
			</form>
		</div>
	)
}
