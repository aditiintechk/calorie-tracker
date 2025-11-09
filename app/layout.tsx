import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'
import PageTransition from '@/components/PageTransition'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Calorie Tracker',
	description: 'Track your daily calorie intake',
	manifest: '/manifest.json',
	themeColor: '#ffd6c0',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'Calorie Tracker',
	},
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
	},
	icons: {
		icon: [
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/favicon.ico', sizes: 'any' },
		],
		apple: [
			{
				url: '/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
			},
		],
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en'>
			<head>
				<link rel='icon' href='/favicon.ico' />
				<link rel='apple-touch-icon' href='/apple-touch-icon.png' />
				{/* iOS PWA Meta Tags */}
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='default'
				/>
				<meta
					name='apple-mobile-web-app-title'
					content='Calorie Tracker'
				/>
				{/* Android PWA Meta Tags */}
				<meta name='mobile-web-app-capable' content='yes' />
				<meta name='application-name' content='Calorie Tracker' />
			</head>
			<body className={`${inter.className} min-h-screen`}>
				<AuthProvider>
					<PageTransition>{children}</PageTransition>
				</AuthProvider>
			</body>
		</html>
	)
}
