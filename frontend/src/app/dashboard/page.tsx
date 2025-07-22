import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PSAChatbot } from '@/components/dashboard/PSAChatbot'

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Dashboard Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome</CardTitle>
                  <CardDescription>
                    You're successfully signed in!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Email: {user?.email}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    User ID: {user?.id}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                  <CardDescription>
                    Your current project portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-slate-600 mt-2">
                    Active projects this month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Utilization</CardTitle>
                  <CardDescription>
                    Current team capacity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">85%</div>
                  <p className="text-sm text-slate-600 mt-2">
                    Team utilization rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Pipeline</CardTitle>
                  <CardDescription>
                    Pending quotes and proposals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">$2.4M</div>
                  <p className="text-sm text-slate-600 mt-2">
                    Potential revenue this quarter
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Start building your professional service automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <ul className="space-y-2">
                    <li>Ask the PSA Agent about project planning</li>
                    <li>Get resource allocation recommendations</li>
                    <li>Generate quotes with AI assistance</li>
                    <li>Analyze team capacity and utilization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - PSA Chatbot */}
          <div>
            <PSAChatbot />
          </div>
        </div>
      </div>
    </div>
  )
} 