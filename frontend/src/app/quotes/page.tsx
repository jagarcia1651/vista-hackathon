'use client'

import { QuotesList } from '@/components/quotes/QuotesList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, Clock, FileText, ThumbsUp } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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

export default function QuotesPage() {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [staffers, setStaffers] = useState<Staffer[]>([])
  const [clientContacts, setClientContacts] = useState<ClientContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch all data in parallel
        const [quotesResult, projectsResult, staffersResult, clientContactsResult] = await Promise.all([
          supabase.from('quotes').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('project_id, project_name, client_id').order('project_name'),
          supabase.from('staffers').select('id, first_name, last_name, title').order('first_name'),
          supabase.from('client_contacts').select('client_contact_id, first_name, last_name, email, client_id').order('first_name')
        ])

        if (quotesResult.error) throw quotesResult.error
        
        setQuotes(quotesResult.data || [])
        setProjects(projectsResult.data || [])
        setStaffers(staffersResult.data || [])
        setClientContacts(clientContactsResult.data || [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshData = async () => {
    const { data: quotes } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (quotes) setQuotes(quotes)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    )
  }

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

  const getQuotesByStatus = (status: string) => quotes.filter(q => q.quote_status === status).length
  const totalQuotes = quotes.length
  const pendingQuotes = getQuotesByStatus('pending')
  const approvedQuotes = getQuotesByStatus('approved')
  const acceptedQuotes = getQuotesByStatus('accepted')

  const StatCard = ({ title, count, icon: Icon, color }: { title: string; count: number; icon: React.ComponentType<{ className?: string }>; color: string }) => (
    <Card className="p-6">
      <div className="flex justify-end mb-4">
        <div className={`text-2xl font-bold ${color}`}>
          {count}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm font-medium text-slate-600">{title}</span>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Quotes
            </h1>
            <p className="text-lg text-slate-600 mt-2">Create, edit, and manage project quotes</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Quotes" 
            count={totalQuotes} 
            icon={FileText} 
            color="text-slate-900" 
          />
          <StatCard 
            title="Pending" 
            count={pendingQuotes} 
            icon={Clock} 
            color="text-yellow-600" 
          />
          <StatCard 
            title="Approved" 
            count={approvedQuotes} 
            icon={ThumbsUp} 
            color="text-green-600" 
          />
          <StatCard 
            title="Accepted" 
            count={acceptedQuotes} 
            icon={CheckCircle} 
            color="text-blue-600" 
          />
        </div>

        {/* Quotes List */}
        {error ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-red-600 text-center">
                <p className="font-medium">Error loading quotes</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <QuotesList 
            quotes={quotes}
            projects={projects}
            staffers={staffers}
            clientContacts={clientContacts}
            onRefresh={refreshData}
          />
        )}
      </div>
    </div>
  )
}