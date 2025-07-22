'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// Load PSAChatbot dynamically to avoid SSR hydration issues
const PSAChatbot = dynamic(() => import('./PSAChatbot').then(mod => ({ default: mod.PSAChatbot })), {
  ssr: false,
  loading: () => (
    <Card className="h-[600px] flex items-center justify-center">
      <div className="text-slate-500">Loading PSA Agent...</div>
    </Card>
  )
})

interface DashboardClientProps {
  userEmail?: string
  userId?: string
}

export function DashboardClient({ userEmail, userId }: DashboardClientProps) {
  return (
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
                Email: {userEmail}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                User ID: {userId}
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
  )
} 