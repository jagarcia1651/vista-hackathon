import { createClient } from '@/utils/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-lg text-slate-600 mt-2">
            Welcome to your PSA Agent dashboard
          </p>
        </div>

        <DashboardClient userEmail={user?.email} userId={user?.id} />
      </div>
    </div>
  )
} 