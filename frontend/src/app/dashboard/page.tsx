import { createClient } from '@/utils/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium">
              MOMENTUM ENGINEERING
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Say Hello to Your AI Dream Team
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Each agent is specialized, you can view their deliverables and assign actions they can take on your behalf.
          </p>
        </div>

        <DashboardClient userEmail={user?.email} userId={user?.id} />
      </div>
    </div>
  )
} 