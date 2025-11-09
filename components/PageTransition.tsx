'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTransition({
	children,
}: {
	children: React.ReactNode
}) {
	const pathname = usePathname()
	const prevPathnameRef = useRef<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const isFirstRender = useRef(true)

	useEffect(() => {
		// Skip animation on initial mount
		if (isFirstRender.current) {
			isFirstRender.current = false
			prevPathnameRef.current = pathname
			return
		}

		// Only animate if pathname actually changed
		if (prevPathnameRef.current !== pathname && containerRef.current) {
			prevPathnameRef.current = pathname
			// Trigger animation by removing and re-adding the class
			containerRef.current.classList.remove('page-transition-enter')
			// Force reflow
			void containerRef.current.offsetWidth
			containerRef.current.classList.add('page-transition-enter')
		}
	}, [pathname])

	return (
		<div ref={containerRef} className='page-transition page-transition-enter'>
			{children}
		</div>
	)
}

