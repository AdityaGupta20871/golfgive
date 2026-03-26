import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GolfGives — Play Golf. Change Lives.',
  description: 'Subscribe, submit your Stableford scores, and enter monthly prize draws while directly funding the charities that matter to you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
