'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

interface QuoteModalProps {
  mode: 'create' | 'edit'
  quote?: Quote
  projects: Project[]
  staffers: Staffer[]
  clientContacts: ClientContact[]
  onClose?: () => void
}

export function QuoteModal({ mode, quote, projects, staffers, clientContacts, onClose }: QuoteModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    project_id: quote?.project_id || '',
    quote_version_number: quote?.quote_version_number || 1,
    quote_status: quote?.quote_status || 'pending',
    approved_by_staffer_id: quote?.approved_by_staffer_id || '',
    accepted_by_client_contact_id: quote?.accepted_by_client_contact_id || ''
  })

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'create') {
        const { error } = await supabase
          .from('quotes')
          .insert([{
            project_id: formData.project_id || null,
            quote_version_number: formData.quote_version_number,
            quote_status: formData.quote_status,
            approved_by_staffer_id: formData.approved_by_staffer_id || null,
            accepted_by_client_contact_id: formData.accepted_by_client_contact_id || null
          }])

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('quotes')
          .update({
            project_id: formData.project_id || null,
            quote_version_number: formData.quote_version_number,
            quote_status: formData.quote_status,
            approved_by_staffer_id: formData.approved_by_staffer_id || null,
            accepted_by_client_contact_id: formData.accepted_by_client_contact_id || null,
            last_updated_at: new Date().toISOString()
          })
          .eq('quote_id', quote!.quote_id)

        if (error) throw error
      }

      setIsOpen(false)
      if (onClose) onClose()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const formatStafferName = (staffer: Staffer) => {
    const name = `${staffer.first_name || ''} ${staffer.last_name || ''}`.trim()
    return name || staffer.title
  }

  const formatContactName = (contact: ClientContact) => {
    return `${contact.first_name} ${contact.last_name} (${contact.email})`
  }

  if (mode === 'create') {
    return (
      <>
        <Button onClick={handleOpen}>Create Quote</Button>
                          {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Quote</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Project</label>
                    <select
                      value={formData.project_id}
                      onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a project (optional)</option>
                      {projects.map((project) => (
                        <option key={project.project_id} value={project.project_id}>
                          {project.project_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Version Number</label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quote_version_number}
                      onChange={(e) => setFormData({...formData, quote_version_number: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Status</label>
                    <select
                      value={formData.quote_status}
                      onChange={(e) => setFormData({...formData, quote_status: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Approved By (Staffer)</label>
                    <select
                      value={formData.approved_by_staffer_id}
                      onChange={(e) => setFormData({...formData, approved_by_staffer_id: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select approving staffer (optional)</option>
                      {staffers.map((staffer) => (
                        <option key={staffer.id} value={staffer.id}>
                          {formatStafferName(staffer)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">Client Contact</label>
                    <select
                      value={formData.accepted_by_client_contact_id}
                      onChange={(e) => setFormData({...formData, accepted_by_client_contact_id: e.target.value})}
                      className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select client contact (optional)</option>
                      {clientContacts.map((contact) => (
                        <option key={contact.client_contact_id} value={contact.client_contact_id}>
                          {formatContactName(contact)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Quote'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    )
  }

        // Edit mode
   return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a project (optional)</option>
                {projects.map((project) => (
                  <option key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Version Number</label>
              <Input
                type="number"
                min="1"
                value={formData.quote_version_number}
                onChange={(e) => setFormData({...formData, quote_version_number: parseInt(e.target.value) || 1})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Status</label>
              <select
                value={formData.quote_status}
                onChange={(e) => setFormData({...formData, quote_status: e.target.value})}
                className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Approved By (Staffer)</label>
              <select
                value={formData.approved_by_staffer_id}
                onChange={(e) => setFormData({...formData, approved_by_staffer_id: e.target.value})}
                className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select approving staffer (optional)</option>
                {staffers.map((staffer) => (
                  <option key={staffer.id} value={staffer.id}>
                    {formatStafferName(staffer)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Client Contact</label>
              <select
                value={formData.accepted_by_client_contact_id}
                onChange={(e) => setFormData({...formData, accepted_by_client_contact_id: e.target.value})}
                className="w-full h-10 px-3 border border-slate-300 rounded-md text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select client contact (optional)</option>
                {clientContacts.map((contact) => (
                  <option key={contact.client_contact_id} value={contact.client_contact_id}>
                    {formatContactName(contact)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Updating...' : 'Update Quote'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 