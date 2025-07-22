'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { DeleteQuoteModal } from './DeleteQuoteModal'
import { QuoteModal } from './QuoteModal'

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

interface QuotesListProps {
  quotes: Quote[]
  projects: Project[]
  staffers: Staffer[]
  clientContacts: ClientContact[]
  onRefresh?: () => Promise<void>
}

export function QuotesList({ quotes, projects, staffers, clientContacts, onRefresh }: QuotesListProps) {
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowEditModal(true)
  }

  const handleDelete = (quote: Quote) => {
    setSelectedQuote(quote)
    setShowDeleteModal(true)
  }

  const handleEditSuccess = async () => {
    setShowEditModal(false)
    setSelectedQuote(null)
    if (onRefresh) await onRefresh()
  }

  const handleDeleteSuccess = async () => {
    setShowDeleteModal(false)
    setSelectedQuote(null)
    if (onRefresh) await onRefresh()
  }

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.project_id === projectId)
    return project?.project_name || 'Unknown Project'
  }

  const getStafferName = (stafferId: string | null) => {
    if (!stafferId) return 'Not Assigned'
    const staffer = staffers.find(s => s.id === stafferId)
    return staffer ? `${staffer.first_name || ''} ${staffer.last_name || ''}`.trim() || staffer.title : 'Unknown Staffer'
  }

  const getClientContactName = (contactId: string | null) => {
    if (!contactId) return 'Not Assigned'
    const contact = clientContacts.find(c => c.client_contact_id === contactId)
    return contact ? `${contact.first_name} ${contact.last_name}` : 'Unknown Contact'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (quotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-slate-500">
            <h3 className="text-lg font-medium mb-2">No quotes found</h3>
            <p className="text-sm">Create your first quote to get started.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Quotes ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Version</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Approved By</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Client Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.quote_id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">
                        v{quote.quote_version_number}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900">
                        {getProjectName(quote.project_id)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.quote_status)}`}>
                        {quote.quote_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600 text-sm">
                        {getStafferName(quote.approved_by_staffer_id)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600 text-sm">
                        {getClientContactName(quote.accepted_by_client_contact_id)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-600 text-sm">
                        {formatDate(quote.created_at)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(quote)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(quote)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && selectedQuote && (
        <QuoteModal
          mode="edit"
          quote={selectedQuote}
          projects={projects}
          staffers={staffers}
          clientContacts={clientContacts}
          onClose={handleEditSuccess}
          onSuccess={onRefresh}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedQuote && (
        <DeleteQuoteModal
          quote={selectedQuote}
          onClose={handleDeleteSuccess}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
} 