import { QuoteModal } from '@/components/quotes/QuoteModal'
import { QuotesList } from '@/components/quotes/QuotesList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

interface Quote {
  quote_id: string
  project_id: string | null
  quote_version_number: number
  quote_status: string
  approved_by_staffer_id: string | null
  accepted_by_client_contact_id: string | null
  created_at: string
  last_updated_at: string
}

interface Project {
  project_id: string
  project_name: string
  client_id: string
}

interface Staffer {
  id: string
  first_name: string | null
  last_name: string | null
  title: string
}

interface ClientContact {
  client_contact_id: string
  first_name: string
  last_name: string
  email: string
  client_id: string
}

export default async function QuotesPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to manage quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch quotes with error handling
  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch related data for dropdowns
  const { data: projects } = await supabase
    .from('projects')
    .select('project_id, project_name, client_id')
    .order('project_name')

  const { data: staffers } = await supabase
    .from('staffers')
    .select('id, first_name, last_name, title')
    .order('first_name')

  const { data: clientContacts } = await supabase
    .from('client_contacts')
    .select('client_contact_id, first_name, last_name, email, client_id')
    .order('first_name')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Quote Management</h1>
              <p className="text-lg text-slate-600 mt-2">
                Create, edit, and manage project quotes
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
              <QuoteModal 
                mode="create"
                projects={projects || []}
                staffers={staffers || []}
                clientContacts={clientContacts || []}
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {quotes?.length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {quotes?.filter(q => q.quote_status === 'pending').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {quotes?.filter(q => q.quote_status === 'approved').length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {quotes?.filter(q => q.quote_status === 'accepted').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quotes List */}
        {quotesError ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-red-600 text-center">
                <p className="font-medium">Error loading quotes</p>
                <p className="text-sm mt-1">{quotesError.message}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <QuotesList 
            quotes={quotes || []}
            projects={projects || []}
            staffers={staffers || []}
            clientContacts={clientContacts || []}
          />
        )}
      </div>
    </div>
  )
}