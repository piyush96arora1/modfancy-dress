import type { Metadata } from 'next'
import { TrackOrderClient } from '@/components/checkout/TrackOrderClient'

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Check the status of your Mod Fancy Dress order with your order number and mobile number.',
  robots: { index: false, follow: true },
}

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  return <TrackOrderClient initialOrder={order ?? ''} />
}
