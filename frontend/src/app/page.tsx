'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    )
  }

  // If user is authenticated, redirect to dashboard automatically happens via middleware
  // This page should only show for unauthenticated users
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Professional Service
            <span className="text-blue-600"> Automation</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Streamline your professional services with intelligent automation. 
            Manage projects, optimize resources, and deliver exceptional client value.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg">
                Get started
              </Button>
            </Link>
            <Link href="/signin">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
            Powerful Features for Professional Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Streamline project workflows and track progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Automated project planning, resource allocation, and milestone tracking 
                  to keep your projects on time and on budget.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Optimization</CardTitle>
                <CardDescription>
                  Maximize team utilization and productivity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Intelligent resource matching based on skills, availability, and project requirements 
                  to optimize your team&apos;s capacity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Insights</CardTitle>
                <CardDescription>
                  Data-driven insights for better client outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Real-time analytics and reporting to measure project success and 
                  identify opportunities for improvement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to transform your professional services?</CardTitle>
              <CardDescription>
                Join thousands of professionals who trust PSA Agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start your free trial
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
