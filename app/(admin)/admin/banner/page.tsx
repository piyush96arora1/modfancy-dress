import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BannerManagement } from '@/components/admin/BannerManagement'

export default async function AdminBannerPage() {
  const supabase = await createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userRole = user.user_metadata?.role
  if (userRole !== 'admin') {
    redirect('/')
  }

  // Fetch current banner settings
  const { data: bannerSettings } = await supabase
    .from('banner_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Banner Management</h1>
      </div>

      <BannerManagement initialSettings={bannerSettings || null} />
    </div>
  )
}

